import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HttpAgent } from "@icp-sdk/core/agent";
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Clock,
  Edit,
  ImageIcon,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Scissors,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import OwnerEarningsGraph, {
  storeTodayEarnings,
} from "../components/OwnerEarningsGraph";
import SalonLoadingScreen from "../components/SalonLoadingScreen";
import SalonTimerWidget from "../components/SalonTimerWidget";
import StaffManager from "../components/StaffManager";
import { loadConfig } from "../config";
import type {
  AppointmentWithId,
  SalonPhotoType,
  SalonWithId,
  SubscriptionHistoryType,
} from "../hooks/useQueries";
import {
  useAddSalonService,
  useClearServiceSession,
  useDeleteSalonPhoto,
  useDeleteSalonService,
  useGetMySalon,
  useGetMySubHistory,
  useGetOwnerRevenueSummary,
  useGetSalonAppointmentsForDate,
  useGetSalonPhotos,
  useGetSalonServices,
  useStartServiceSession,
  useUpdateAppointmentStatus,
  useUpdateMySalon,
  useUploadSalonPhoto,
} from "../hooks/useQueries";
import { StorageClient } from "../utils/StorageClient";
import SubscriptionPage from "./SubscriptionPage";

const STATUS_LABELS: Record<string, string> = {
  pending: "प्रतीक्षा",
  confirmed: "कन्फर्म",
  inprogress: "चल रहा",
  completed: "पूरा",
  cancelled: "रद्द",
};

function getStatusStyle(status: string): React.CSSProperties {
  const styles: Record<string, React.CSSProperties> = {
    pending: {
      background: "oklch(0.82 0.14 78 / 0.15)",
      color: "oklch(0.82 0.14 78)",
      borderColor: "oklch(0.82 0.14 78 / 0.4)",
    },
    confirmed: {
      background: "oklch(0.78 0.12 80 / 0.12)",
      color: "oklch(0.78 0.12 80)",
      borderColor: "oklch(0.78 0.12 80 / 0.4)",
    },
    inprogress: {
      background: "oklch(0.7 0.15 295 / 0.15)",
      color: "oklch(0.75 0.15 295)",
      borderColor: "oklch(0.7 0.15 295 / 0.4)",
    },
    completed: {
      background: "oklch(0.62 0.15 145 / 0.15)",
      color: "oklch(0.7 0.15 145)",
      borderColor: "oklch(0.62 0.15 145 / 0.4)",
    },
    cancelled: {
      background: "oklch(0.577 0.245 27 / 0.15)",
      color: "oklch(0.7 0.2 27)",
      borderColor: "oklch(0.577 0.245 27 / 0.4)",
    },
  };
  return (
    styles[status] || {
      background: "oklch(0.2 0.01 70)",
      color: "oklch(0.5 0.03 70)",
      borderColor: "oklch(0.3 0.02 70)",
    }
  );
}

const STATUS_NEXT: Record<string, string> = {
  pending: "confirmed",
  confirmed: "inprogress",
  inprogress: "completed",
};

const STATUS_NEXT_LABEL: Record<string, string> = {
  pending: "कन्फर्म करें",
  confirmed: "शुरू करें",
  inprogress: "पूरा करें",
};

function getTodayString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function getTrialDaysRemaining(trialStartDate: bigint, trialDays = 7n) {
  const started = Number(trialStartDate) / 1_000_000;
  const elapsed = Math.floor((Date.now() - started) / (1000 * 60 * 60 * 24));
  return Math.max(0, Number(trialDays) - elapsed);
}

interface Props {
  phone: string;
  salonVerified?: boolean;
  onSwitchRole: () => void;
}

export default function SalonOwnerDashboard({ phone, onSwitchRole }: Props) {
  const {
    data: salon,
    isLoading: salonLoading,
    isFetching: salonRefreshing,
    isFetched: salonFetched,
    isError: salonError,
    refetch: refetchSalon,
  } = useGetMySalon(phone);
  const today = getTodayString();
  const { data: todayAppts = [] } = useGetSalonAppointmentsForDate(
    phone,
    salon?.id ?? null,
    today,
  );
  const { data: earnings } = useGetOwnerRevenueSummary(phone);
  const [nullRetryCount, setNullRetryCount] = useState(0);
  const [showSubscription, setShowSubscription] = useState(false);
  // 12 retries x 10s = 2 minutes total wait for ICP cold start
  const MAX_NULL_RETRIES = 12;

  // Notification: track seen pending appointment IDs
  const seenPendingRef = useRef<Set<string>>(new Set());
  // Mutation for handling notification actions (confirm/reject from notification)
  const { mutate: updateStatusMutation } = useUpdateAppointmentStatus(phone);

  // Request notification permission + register owner context with SW
  useEffect(() => {
    if (!salon) return;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "OWNER_LOGIN",
        salonId: salon.id.toString(),
        phone,
      });
    }

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === "NOTIFICATION_ACTION") {
        const { action, appointmentId } = event.data;
        if (!appointmentId) return;
        try {
          const apptIdBig = BigInt(appointmentId);
          if (action === "confirm") {
            updateStatusMutation({
              appointmentId: apptIdBig,
              newStatus: "confirmed",
              salonId: salon.id,
              date: today,
            });
          } else if (action === "reject") {
            updateStatusMutation({
              appointmentId: apptIdBig,
              newStatus: "cancelled",
              salonId: salon.id,
              date: today,
            });
          }
        } catch (e) {
          console.error("SW message handler error", e);
        }
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleSwMessage);
    }

    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleSwMessage);
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "OWNER_LOGOUT",
          });
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salon, phone, today, updateStatusMutation]);

  // Show browser notification for new pending appointments
  useEffect(() => {
    if (!todayAppts || !salon) return;
    if (
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    )
      return;

    for (const appt of todayAppts) {
      const status = appt.status;
      if (status !== "pending") continue;
      const idStr = appt.id.toString();
      if (seenPendingRef.current.has(idStr)) continue;
      seenPendingRef.current.add(idStr);

      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "NEW_BOOKING_NOTIFY",
          appointmentId: idStr,
          customerName: appt.customerName || "ग्राहक",
          serviceName: appt.serviceName || "सेवा",
          date: appt.date || new Date().toLocaleDateString("hi-IN"),
        });
      }
    }
  }, [todayAppts, salon]);

  // Auto-retry when backend returns null (cold start returns null, not error)
  useEffect(() => {
    if (
      salonFetched &&
      !salonLoading &&
      !salonRefreshing &&
      !salon &&
      !salonError &&
      nullRetryCount < MAX_NULL_RETRIES
    ) {
      const timer = setTimeout(() => {
        setNullRetryCount((c) => c + 1);
        refetchSalon();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [
    salonFetched,
    salonLoading,
    salonRefreshing,
    salon,
    salonError,
    nullRetryCount,
    refetchSalon,
  ]);

  // Backend error — show reload screen
  if (salonError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.09 0.005 60)" }}
      >
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <AlertCircle
            className="w-10 h-10"
            style={{ color: "oklch(0.577 0.245 27.325)" }}
          />
          <p
            className="text-lg font-semibold"
            style={{ color: "oklch(0.97 0.015 80)" }}
          >
            डेटा लोड नहीं हो पाया
          </p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
            कृपया पेज reload करें
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: "oklch(0.78 0.12 80)" }}
          >
            पेज Reload करें
          </button>
        </div>
      </div>
    );
  }

  // No salon found after all retries — show simple reload screen (user is already authenticated)
  if (
    salonFetched &&
    !salonLoading &&
    !salonRefreshing &&
    !salon &&
    !salonError &&
    nullRetryCount >= MAX_NULL_RETRIES
  ) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "oklch(0.09 0.005 60)" }}
      >
        <header
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: "oklch(0.13 0.008 60)",
            borderBottom: "1px solid oklch(0.28 0.04 75 / 0.6)",
          }}
        >
          <div className="flex items-center gap-2">
            <Scissors
              className="w-5 h-5"
              style={{ color: "oklch(0.78 0.12 80)" }}
            />
            <span
              className="font-bold"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              Salon360
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwitchRole}
            data-ocid="salon.close_button"
            style={{ color: "oklch(0.55 0.04 80)" }}
          >
            <LogOut className="w-4 h-4 mr-1" />
            बाहर
          </Button>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <RefreshCw
              className="w-10 h-10 mx-auto"
              style={{ color: "oklch(0.78 0.12 80)" }}
            />
            <p style={{ color: "oklch(0.97 0.015 80)" }}>डेटा लोड नहीं हो पाया</p>
            <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
              आप पहले से लॉगिन हैं। पेज reload करें।
            </p>
            <button
              type="button"
              onClick={() => {
                setNullRetryCount(0);
                refetchSalon();
              }}
              className="px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: "oklch(0.78 0.12 80)" }}
            >
              दोबारा लोड करें
            </button>
            <button
              type="button"
              onClick={onSwitchRole}
              className="block text-sm mt-2 mx-auto"
              style={{ color: "oklch(0.55 0.04 80)" }}
            >
              लॉगआउट
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Still waiting for first fetch OR retrying null — show shell with inline loading skeleton
  if (!salon) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "oklch(0.09 0.005 60)" }}
      >
        <header
          className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
          style={{
            background: "oklch(0.13 0.008 60)",
            borderBottom: "1px solid oklch(0.28 0.04 75 / 0.6)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.78 0.12 80)" }}
            >
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <div>
              <div
                className="h-3.5 w-28 rounded animate-pulse mb-1"
                style={{ background: "oklch(0.28 0.04 75 / 0.6)" }}
              />
              <div
                className="h-2.5 w-16 rounded animate-pulse"
                style={{ background: "oklch(0.22 0.03 70)" }}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwitchRole}
            data-ocid="salon.close_button"
            style={{ color: "oklch(0.55 0.04 80)" }}
          >
            <LogOut className="w-4 h-4 mr-1" />
            बाहर
          </Button>
        </header>
        <main className="max-w-2xl mx-auto p-4 flex flex-col items-center justify-center gap-4 pt-24">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "oklch(0.78 0.12 80)" }}
          />
          <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
            {nullRetryCount > 0
              ? `सर्वर से कनेक्ट हो रहा है... (कोशिश ${nullRetryCount}/${MAX_NULL_RETRIES})`
              : "आपका सैलून लोड हो रहा है..."}
          </p>
        </main>
      </div>
    );
  }

  // Pending admin approval
  if (salon.pendingApproval) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(0.09 0.005 60)" }}
      >
        <div className="max-w-sm w-full text-center space-y-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "oklch(0.82 0.14 78 / 0.12)" }}
          >
            <Clock
              className="w-8 h-8"
              style={{ color: "oklch(0.82 0.14 78)" }}
            />
          </div>
          <h2
            className="text-xl font-bold"
            style={{ color: "oklch(0.97 0.015 80)" }}
          >
            अनुमोदन प्रतीक्षा में
          </h2>
          <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
            आपकी दुकान <strong>{salon.name}</strong> का पंजीकरण सफलतापूर्वक हो गया
            है। Admin की मंजूरी का इंतज़ार है। मंजूरी मिलने के बाद आपका 7-दिन का ट्रायल शुरू
            होगा।
          </p>
          <div
            className="rounded-lg p-3"
            style={{
              background: "oklch(0.82 0.14 78 / 0.1)",
              border: "1px solid oklch(0.82 0.14 78 / 0.3)",
            }}
          >
            <p className="text-xs" style={{ color: "oklch(0.82 0.14 78)" }}>
              आमतौर पर 24 घंटे के अंदर मंजूरी मिलती है।
            </p>
          </div>
          <Button variant="outline" onClick={onSwitchRole}>
            <LogOut className="w-4 h-4 mr-2" />
            लॉगआउट
          </Button>
        </div>
      </div>
    );
  }

  // Inactive salon
  if (!salon.isActive) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "oklch(0.09 0.005 60)" }}
      >
        <div className="max-w-sm w-full text-center space-y-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "oklch(0.577 0.245 27 / 0.15)" }}
          >
            <AlertCircle
              className="w-8 h-8"
              style={{ color: "oklch(0.7 0.2 27)" }}
            />
          </div>
          <h2
            className="text-xl font-bold"
            style={{ color: "oklch(0.97 0.015 80)" }}
          >
            दुकान निष्क्रिय
          </h2>
          <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
            आपकी दुकान <strong>{salon.name}</strong> निष्क्रिय है। ट्रायल समाप्त हो
            गया है या Admin ने निष्क्रिय किया है।
          </p>
          <div
            className="rounded-lg p-3"
            style={{
              background: "oklch(0.577 0.245 27 / 0.1)",
              border: "1px solid oklch(0.577 0.245 27 / 0.3)",
            }}
          >
            <p className="text-xs" style={{ color: "oklch(0.7 0.2 27)" }}>
              सदस्यता के लिए Admin से संपर्क करें।
            </p>
          </div>
          <Button variant="outline" onClick={onSwitchRole}>
            <LogOut className="w-4 h-4 mr-2" />
            लॉगआउट
          </Button>
        </div>
      </div>
    );
  }

  // Active salon — show full dashboard
  if (showSubscription) {
    return (
      <SubscriptionPage
        ownerPhone={phone}
        salonName={salon.name}
        onBack={() => setShowSubscription(false)}
        onSuccess={() => setShowSubscription(false)}
      />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.09 0.005 60)" }}
    >
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{
          background: "oklch(0.13 0.008 60)",
          borderBottom: "1px solid oklch(0.28 0.04 75 / 0.6)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.78 0.12 80)" }}
          >
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <div>
            <p
              className="font-bold text-sm"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              {salon.name}
            </p>
            <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
              {salon.city}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowSubscription(true)}
            data-ocid="subscription.open_modal_button"
            style={{
              background: "oklch(0.78 0.12 80)",
              color: "white",
              fontSize: "0.75rem",
            }}
          >
            सदस्यता
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwitchRole}
            data-ocid="salon.close_button"
            style={{ color: "oklch(0.55 0.04 80)" }}
          >
            <LogOut className="w-4 h-4 mr-1" />
            बाहर
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {/* Quick earnings summary - moved to Earnings tab */}
        {earnings && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className="rounded-xl p-3"
              style={{
                background: "oklch(0.17 0.012 60)",
                border: "1px solid oklch(0.28 0.04 75 / 0.6)",
              }}
            >
              <p
                className="text-xs mb-1"
                style={{ color: "oklch(0.55 0.04 80)" }}
              >
                कुल आमदनी
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.78 0.12 80)" }}
              >
                ₹{earnings.totalEarnings.toFixed(0)}
              </p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{
                background: "oklch(0.17 0.012 60)",
                border: "1px solid oklch(0.28 0.04 75 / 0.6)",
              }}
            >
              <p
                className="text-xs mb-1"
                style={{ color: "oklch(0.55 0.04 80)" }}
              >
                इस माह
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.78 0.12 80)" }}
              >
                ₹{earnings.monthlyEarnings.toFixed(0)}
              </p>
            </div>
          </div>
        )}

        <SalonTimerWidget
          ownerPhone={phone}
          salonId={salon.id}
          todayAppointments={todayAppts}
          today={today}
        />

        <Tabs defaultValue="queue">
          <div className="overflow-x-auto">
            <TabsList
              className="w-full mb-4 flex min-w-max"
              style={{ background: "oklch(0.17 0.012 60)" }}
            >
              <TabsTrigger
                value="queue"
                className="flex-1 text-xs"
                data-ocid="salon.tab"
              >
                Queue
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="flex-1 text-xs"
                data-ocid="salon.tab"
              >
                सेवाएं
              </TabsTrigger>
              <TabsTrigger
                value="earnings"
                className="flex-1 text-xs"
                data-ocid="salon.tab"
              >
                कमाई
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="flex-1 text-xs"
                data-ocid="salon.tab"
              >
                स्टाफ
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="flex-1 text-xs"
                data-ocid="salon.tab"
              >
                जानकारी
              </TabsTrigger>
              <TabsTrigger
                value="sub_history"
                className="flex-1 text-xs"
                data-ocid="salon.tab"
              >
                इतिहास
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="flex-1 text-xs"
                data-ocid="salon.tab"
              >
                📸 फोटो
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="queue">
            <QueueTab phone={phone} salonId={salon.id} today={today} />
          </TabsContent>

          <TabsContent value="services">
            <ServicesTab phone={phone} salonId={salon.id} />
          </TabsContent>

          <TabsContent value="earnings">
            <EarningsTab
              phone={phone}
              salonId={salon.id}
              todayAppts={todayAppts}
              earnings={earnings}
            />
          </TabsContent>

          <TabsContent value="staff">
            <StaffManager salonId={salon.id} />
          </TabsContent>

          <TabsContent value="info">
            <InfoTab phone={phone} salon={salon} />
          </TabsContent>

          <TabsContent value="sub_history">
            <OwnerSubHistoryTab phone={phone} />
          </TabsContent>

          <TabsContent value="photos">
            <PhotoGalleryTab phone={phone} salonId={salon.id} />
          </TabsContent>
        </Tabs>
      </main>

      <footer
        className="text-center py-4 text-xs"
        style={{ color: "oklch(0.4 0.03 70)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

function EarningsTab({
  phone: _phone,
  salonId,
  todayAppts,
  earnings,
}: {
  phone: string;
  salonId: bigint;
  todayAppts: AppointmentWithId[];
  earnings:
    | {
        totalEarnings: number;
        monthlyEarnings: number;
        totalAppointments: bigint;
        completedAppointments: bigint;
      }
    | undefined;
}) {
  const { data: services = [] } = useGetSalonServices(salonId);

  // Store today's earnings in localStorage whenever appointments or services are loaded
  if (todayAppts.length > 0 && services.length > 0) {
    storeTodayEarnings(
      salonId,
      todayAppts,
      services.map((s) => ({ name: s.name, price: s.price })),
    );
  }

  if (!earnings) {
    return (
      <div
        className="text-center py-10"
        style={{ color: "oklch(0.55 0.04 80)" }}
      >
        लोड हो रहा है...
      </div>
    );
  }

  return (
    <OwnerEarningsGraph
      salonId={salonId}
      totalEarnings={earnings.totalEarnings}
      monthlyEarnings={earnings.monthlyEarnings}
      totalAppointments={Number(earnings.totalAppointments)}
      completedAppointments={Number(earnings.completedAppointments)}
      todayAppts={todayAppts}
    />
  );
}

function QueueTab({
  phone,
  salonId,
  today,
}: { phone: string; salonId: bigint; today: string }) {
  const {
    data: appointments = [],
    isLoading,
    refetch,
  } = useGetSalonAppointmentsForDate(phone, salonId, today);
  const { mutate: updateStatus, isPending } = useUpdateAppointmentStatus(phone);
  const { mutate: startSession } = useStartServiceSession(phone);
  const { mutate: clearSession } = useClearServiceSession(phone);

  const sorted = [...appointments].sort(
    (a, b) => Number(a.queueNumber) - Number(b.queueNumber),
  );

  if (isLoading) {
    return (
      <div data-ocid="queue.loading_state">
        <SalonLoadingScreen compact />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold" style={{ color: "oklch(0.97 0.015 80)" }}>
          आज की अपॉइंटमेंट ({sorted.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          data-ocid="queue.secondary_button"
          style={{ color: "oklch(0.78 0.12 80)" }}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12" data-ocid="queue.empty_state">
          <Clock
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.4 0.03 70)" }}
          />
          <p style={{ color: "oklch(0.55 0.04 80)" }}>आज कोई अपॉइंटमेंट नहीं</p>
        </div>
      ) : (
        sorted.map((appt, idx) => (
          <div
            key={appt.id.toString()}
            className="rounded-xl p-4"
            data-ocid={`queue.item.${idx + 1}`}
            style={{
              background: "oklch(0.17 0.012 60)",
              border: "1px solid oklch(0.28 0.04 75 / 0.6)",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{
                    background: "oklch(0.78 0.12 80 / 0.12)",
                    color: "oklch(0.78 0.12 80)",
                  }}
                >
                  #{String(appt.queueNumber)}
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "oklch(0.97 0.015 80)" }}
                  >
                    {appt.customerName}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.04 80)" }}
                  >
                    {appt.serviceName} • {appt.customerPhone}
                  </p>
                </div>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full border font-medium"
                style={getStatusStyle(appt.status)}
              >
                {STATUS_LABELS[appt.status] || appt.status}
              </span>
            </div>
            {STATUS_NEXT[appt.status] && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  disabled={isPending}
                  data-ocid="queue.primary_button"
                  onClick={() => {
                    const nextStatus = STATUS_NEXT[appt.status];
                    updateStatus(
                      {
                        appointmentId: appt.id,
                        newStatus: nextStatus,
                        salonId,
                        date: today,
                      },
                      {
                        onSuccess: () => {
                          toast.success("स्टेटस बदल गया");
                          if (nextStatus === "inprogress") {
                            startSession(
                              { appointmentId: appt.id, durationMinutes: 30 },
                              { onError: () => {} },
                            );
                          } else if (nextStatus === "completed") {
                            clearSession(undefined, { onError: () => {} });
                          }
                        },
                        onError: () => toast.error("कुछ गलत हुआ"),
                      },
                    );
                  }}
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
                    color: "oklch(0.09 0.005 60)",
                    border: "none",
                  }}
                >
                  {STATUS_NEXT_LABEL[appt.status]}
                </Button>
                {appt.status !== "cancelled" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={isPending}
                    data-ocid="queue.delete_button"
                    onClick={() =>
                      updateStatus(
                        {
                          appointmentId: appt.id,
                          newStatus: "cancelled",
                          salonId,
                          date: today,
                        },
                        {
                          onSuccess: () => toast.success("रद्द कर दिया"),
                          onError: () => toast.error("कुछ गलत हुआ"),
                        },
                      )
                    }
                    style={{
                      borderColor: "oklch(0.577 0.245 27.325)",
                      color: "oklch(0.577 0.245 27.325)",
                    }}
                  >
                    रद्द करें
                  </Button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function ServicesTab({ phone, salonId }: { phone: string; salonId: bigint }) {
  const { data: services = [], isLoading } = useGetSalonServices(salonId);
  const { mutate: addService, isPending: adding } = useAddSalonService(phone);
  const { mutate: deleteService, isPending: deleting } =
    useDeleteSalonService(phone);
  const [form, setForm] = useState({ name: "", price: "", duration: "" });
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("नाम और दाम जरूरी है");
      return;
    }
    addService(
      {
        salonId,
        name: form.name,
        price: Number(form.price),
        durationMinutes: BigInt(form.duration || 30),
      },
      {
        onSuccess: () => {
          toast.success("सेवा जोड़ दी गई");
          setForm({ name: "", price: "", duration: "" });
          setShowForm(false);
        },
        onError: () => toast.error("कुछ गलत हुआ"),
      },
    );
  };

  if (isLoading) {
    return (
      <div data-ocid="services.loading_state">
        <SalonLoadingScreen compact />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold" style={{ color: "oklch(0.97 0.015 80)" }}>
          सेवाएं ({services.length})
        </h2>
        <Button
          size="sm"
          onClick={() => setShowForm((s) => !s)}
          data-ocid="services.primary_button"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
            color: "oklch(0.09 0.005 60)",
            border: "none",
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          नई सेवा
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-xl p-4 space-y-3"
          style={{
            background: "oklch(0.17 0.012 60)",
            border: "1px solid oklch(0.28 0.04 75 / 0.6)",
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label
                className="text-xs"
                style={{ color: "oklch(0.65 0.07 80)" }}
              >
                सेवा का नाम
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="जैसे: बाल काटना"
                data-ocid="services.input"
                style={{
                  background: "oklch(0.17 0.012 60)",
                  border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                  color: "oklch(0.97 0.015 80)",
                }}
              />
            </div>
            <div>
              <Label
                className="text-xs"
                style={{ color: "oklch(0.65 0.07 80)" }}
              >
                दाम (₹)
              </Label>
              <Input
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="150"
                type="number"
                data-ocid="services.input"
                style={{
                  background: "oklch(0.17 0.012 60)",
                  border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                  color: "oklch(0.97 0.015 80)",
                }}
              />
            </div>
            <div>
              <Label
                className="text-xs"
                style={{ color: "oklch(0.65 0.07 80)" }}
              >
                समय (मिनट)
              </Label>
              <Input
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: e.target.value }))
                }
                placeholder="30"
                type="number"
                data-ocid="services.input"
                style={{
                  background: "oklch(0.17 0.012 60)",
                  border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                  color: "oklch(0.97 0.015 80)",
                }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={adding}
              data-ocid="services.submit_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
                color: "oklch(0.09 0.005 60)",
                border: "none",
              }}
            >
              {adding ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : null}
              जोड़ें
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(false)}
              style={{ color: "oklch(0.55 0.04 80)" }}
            >
              रद्द
            </Button>
          </div>
        </form>
      )}

      {services.length === 0 ? (
        <div className="text-center py-10" data-ocid="services.empty_state">
          <Scissors
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.4 0.03 70)" }}
          />
          <p style={{ color: "oklch(0.55 0.04 80)" }}>कोई सेवा नहीं जोड़ी गई</p>
          <p className="text-sm mt-1" style={{ color: "oklch(0.4 0.03 70)" }}>
            ऊपर "नई सेवा" पर टैप करें
          </p>
        </div>
      ) : (
        services.map((svc, idx) => (
          <div
            key={svc.id.toString()}
            className="rounded-xl p-3 flex items-center justify-between"
            data-ocid={`services.item.${idx + 1}`}
            style={{
              background: "oklch(0.17 0.012 60)",
              border: "1px solid oklch(0.28 0.04 75 / 0.6)",
            }}
          >
            <div>
              <p
                className="font-medium text-sm"
                style={{ color: "oklch(0.97 0.015 80)" }}
              >
                {svc.name}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
                ₹{svc.price} • {String(svc.durationMinutes)} मिनट
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                deleteService(
                  { salonId, serviceId: svc.id },
                  {
                    onSuccess: () => toast.success("सेवा हटा दी"),
                    onError: () => toast.error("कुछ गलत हुआ"),
                  },
                )
              }
              disabled={deleting}
              data-ocid={`services.delete_button.${idx + 1}`}
              style={{ color: "oklch(0.577 0.245 27.325)" }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}

function InfoTab({
  phone,
  salon,
}: {
  phone: string;
  salon: SalonWithId;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: salon.name,
    address: salon.address,
    salonPhone: salon.phone,
    city: salon.city,
  });
  const { mutate: update, isPending } = useUpdateMySalon(phone);

  const trialDays = getTrialDaysRemaining(
    salon.trialStartDate,
    salon.trialDays,
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    update(
      {
        name: form.name,
        address: form.address,
        salonPhone: form.salonPhone,
        city: form.city,
      },
      {
        onSuccess: () => {
          toast.success("जानकारी सेव हो गई");
          setEditing(false);
        },
        onError: () => toast.error("कुछ गलत हुआ"),
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Trial/Subscription status */}
      <div
        className="rounded-xl p-4"
        style={{
          background:
            trialDays > 0
              ? "oklch(0.78 0.12 80 / 0.1)"
              : salon.subscriptionActive
                ? "oklch(0.78 0.12 80 / 0.1)"
                : "oklch(0.577 0.245 27.325 / 0.15)",
          border: `1px solid ${
            trialDays > 0
              ? "oklch(0.78 0.12 80 / 0.4)"
              : salon.subscriptionActive
                ? "oklch(0.78 0.12 80 / 0.4)"
                : "oklch(0.577 0.245 27.325 / 0.4)"
          }`,
        }}
      >
        <div className="flex items-center gap-2">
          {trialDays > 0 ? (
            <>
              <CheckCircle
                className="w-5 h-5"
                style={{ color: "oklch(0.78 0.12 80)" }}
              />
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.97 0.015 80)" }}
                >
                  फ्री ट्रायल चल रहा है
                </p>
                <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
                  {trialDays} दिन बाकी
                </p>
              </div>
            </>
          ) : salon.subscriptionActive ? (
            <>
              <CheckCircle
                className="w-5 h-5"
                style={{ color: "oklch(0.78 0.12 80)" }}
              />
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.97 0.015 80)" }}
                >
                  सब्स्क्रिप्शन सक्रिय
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle
                className="w-5 h-5"
                style={{ color: "oklch(0.577 0.245 27.325)" }}
              />
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.97 0.015 80)" }}
                >
                  ट्रायल खत्म
                </p>
                <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
                  एडमिन से सब्स्क्रिप्शन लें
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Salon info card */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "oklch(0.17 0.012 60)",
          border: "1px solid oklch(0.28 0.04 75 / 0.6)",
        }}
      >
        {!editing ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3
                className="font-semibold"
                style={{ color: "oklch(0.97 0.015 80)" }}
              >
                सैलून की जानकारी
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(true)}
                data-ocid="info.edit_button"
                style={{ color: "oklch(0.78 0.12 80)" }}
              >
                <Edit className="w-4 h-4 mr-1" />
                बदलें
              </Button>
            </div>
            <div className="space-y-2">
              {[
                { label: "नाम", val: salon.name },
                { label: "शहर", val: salon.city },
                { label: "पता", val: salon.address },
                { label: "फ़ोन", val: salon.phone },
              ].map(({ label, val }) => (
                <div key={label} className="flex gap-2 text-sm">
                  <span style={{ color: "oklch(0.55 0.04 80)", minWidth: 60 }}>
                    {label}:
                  </span>
                  <span style={{ color: "oklch(0.97 0.015 80)" }}>
                    {val || "—"}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <h3
              className="font-semibold mb-2"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              जानकारी बदलें
            </h3>
            {[
              { key: "name", label: "नाम", placeholder: "सैलून का नाम" },
              { key: "city", label: "शहर", placeholder: "शहर" },
              { key: "address", label: "पता", placeholder: "पूरा पता" },
              { key: "salonPhone", label: "फ़ोन", placeholder: "फ़ोन नंबर" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <Label
                  className="text-xs"
                  style={{ color: "oklch(0.65 0.07 80)" }}
                >
                  {label}
                </Label>
                <Input
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  placeholder={placeholder}
                  data-ocid="info.input"
                  style={{
                    background: "oklch(0.17 0.012 60)",
                    border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                    color: "oklch(0.97 0.015 80)",
                  }}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                data-ocid="info.save_button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
                  color: "oklch(0.09 0.005 60)",
                  border: "none",
                }}
              >
                {isPending ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : null}
                सेव करें
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditing(false)}
                data-ocid="info.cancel_button"
                style={{ color: "oklch(0.55 0.04 80)" }}
              >
                रद्द
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Owner Subscription History Tab
// ──────────────────────────────────────────────────────────────────────────────
function OwnerSubHistoryTab({ phone }: { phone: string }) {
  const { data: history = [], isLoading, isError } = useGetMySubHistory(phone);

  const BORDER = "1px solid oklch(0.28 0.04 75 / 0.6)";
  const CARD_BG = "oklch(0.13 0.008 60)";
  const CARD_RAISED = "oklch(0.17 0.012 60)";
  const GOLD = "oklch(0.78 0.12 80)";
  const GOLD_LIGHT = "oklch(0.88 0.12 82)";
  const TEXT = "oklch(0.97 0.015 80)";
  const MUTED = "oklch(0.55 0.04 80)";

  function formatTs(ns: bigint): string {
    const ms = Number(ns) / 1_000_000;
    if (ms < 1000) return "—";
    return new Date(ms).toLocaleDateString("hi-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (isLoading) {
    return (
      <div className="py-10 text-center" data-ocid="sub_history.loading_state">
        <div
          className="inline-block w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: GOLD, borderTopColor: "transparent" }}
        />
        <p className="text-sm mt-2" style={{ color: MUTED }}>
          इतिहास लोड हो रहा है...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="rounded-xl p-4 text-center mt-4"
        style={{
          background: "oklch(0.15 0.04 27 / 0.3)",
          border: "1px solid oklch(0.5 0.2 27 / 0.4)",
        }}
        data-ocid="sub_history.error_state"
      >
        <p style={{ color: "oklch(0.7 0.2 27)" }}>
          ❌ इतिहास लोड नहीं हो सका। पेज reload करें।
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div
        className="text-center py-14"
        style={{ color: MUTED }}
        data-ocid="sub_history.empty_state"
      >
        <p className="text-4xl mb-2">📋</p>
        <p className="font-medium">कोई सदस्यता इतिहास नहीं है</p>
        <p className="text-xs mt-1" style={{ color: "oklch(0.4 0.03 70)" }}>
          सदस्यता approve होने के बाद यहाँ दिखेगी
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="sub_history.list">
      <p className="text-xs font-semibold" style={{ color: MUTED }}>
        मेरी सदस्यता इतिहास ({history.length})
      </p>
      {history.map((h: SubscriptionHistoryType, idx: number) => (
        <div
          key={h.id.toString()}
          className="rounded-2xl p-4"
          style={{ background: CARD_BG, border: BORDER }}
          data-ocid={`sub_history.item.${idx + 1}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-base font-bold" style={{ color: GOLD_LIGHT }}>
                {h.planName}
              </p>
              <p className="text-xs" style={{ color: MUTED }}>
                {Number(h.planDays)} दिन की सदस्यता
              </p>
            </div>
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{
                background: "oklch(0.78 0.12 80 / 0.15)",
                color: GOLD_LIGHT,
                border: `1px solid ${GOLD} / 0.4`,
              }}
            >
              ✅ स्वीकृत
            </span>
          </div>
          <div
            className="rounded-xl p-3 space-y-1.5 text-xs"
            style={{ background: CARD_RAISED, border: BORDER }}
          >
            <div className="flex justify-between">
              <span style={{ color: MUTED }}>भुगतान राशि</span>
              <span className="font-bold text-sm" style={{ color: GOLD_LIGHT }}>
                ₹{h.finalPrice}
              </span>
            </div>
            {h.savings > 0 && (
              <div className="flex justify-between">
                <span style={{ color: MUTED }}>बचाई गई राशि</span>
                <span style={{ color: "oklch(0.82 0.14 78)" }}>
                  ₹{h.savings}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span style={{ color: MUTED }}>शुरू तारीख</span>
              <span style={{ color: TEXT }}>
                {h.startDate > 0n ? formatTs(h.startDate) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: MUTED }}>समाप्ति तारीख</span>
              <span style={{ color: TEXT }}>
                {h.endDate > 0n ? formatTs(h.endDate) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: MUTED }}>approved</span>
              <span style={{ color: GOLD }}>
                {h.approvedAt > 0n ? formatTs(h.approvedAt) : "—"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Photo Gallery Tab — Owner can upload 1–10 photos
// ──────────────────────────────────────────────────────────────────────────────
const MAX_PHOTOS = 10;

async function uploadImageToStorage(file: File): Promise<string> {
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(() => {});
  }
  const storageClient = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { hash } = await storageClient.putFile(bytes);
  return storageClient.getDirectURL(hash);
}

function PhotoGalleryTab({
  phone,
  salonId,
}: { phone: string; salonId: bigint }) {
  const { data: photos = [], isLoading } = useGetSalonPhotos(salonId);
  const { mutate: uploadPhoto, isPending: uploading } =
    useUploadSalonPhoto(phone);
  const { mutate: deletePhoto, isPending: deleting } =
    useDeleteSalonPhoto(phone);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordHash =
    typeof window !== "undefined"
      ? (localStorage.getItem(`salon360_owner_hash_${phone}`) ?? "")
      : "";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("सिर्फ image files upload करें");
      return;
    }
    if (photos.length >= MAX_PHOTOS) {
      toast.error(`अधिकतम ${MAX_PHOTOS} फोटो allowed हैं`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("फोटो 5MB से कम होनी चाहिए");
      return;
    }
    // Reset input
    e.target.value = "";

    try {
      setUploadProgress(0);
      const url = await uploadImageToStorage(file);
      setUploadProgress(80);
      uploadPhoto(
        { passwordHash, url },
        {
          onSuccess: () => {
            setUploadProgress(null);
            toast.success("फोटो upload हो गई!");
          },
          onError: (err) => {
            setUploadProgress(null);
            toast.error(`फोटो save नहीं हो सकी: ${err.message}`);
          },
        },
      );
    } catch (err: any) {
      setUploadProgress(null);
      toast.error(`Upload failed: ${err?.message ?? "अज्ञात error"}`);
    }
  };

  const handleDelete = (photo: SalonPhotoType) => {
    if (!confirm("यह फोटो हटा दें?")) return;
    deletePhoto(
      { passwordHash, photoId: photo.id },
      {
        onSuccess: () => toast.success("फोटो हटा दी गई"),
        onError: () => toast.error("फोटो नहीं हटा सकी"),
      },
    );
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        data-ocid="photos.loading_state"
      >
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "oklch(0.78 0.12 80)" }}
        />
        <span className="ml-2 text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
          फोटो लोड हो रही हैं...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="font-semibold"
            style={{ color: "oklch(0.97 0.015 80)" }}
          >
            दुकान की फोटो
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.55 0.04 80)" }}
          >
            {photos.length}/{MAX_PHOTOS} फोटो
          </p>
        </div>
        {photos.length < MAX_PHOTOS && (
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || uploadProgress !== null}
            data-ocid="photos.upload_button"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
              color: "oklch(0.09 0.005 60)",
              border: "none",
            }}
          >
            {uploading || uploadProgress !== null ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Camera className="w-4 h-4 mr-1" />
            )}
            {uploading || uploadProgress !== null
              ? "Upload हो रहा है..."
              : "फोटो जोड़ें"}
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          data-ocid="photos.dropzone"
        />
      </div>

      {/* Upload progress */}
      {uploadProgress !== null && (
        <div
          className="rounded-xl p-3"
          style={{
            background: "oklch(0.17 0.012 60)",
            border: "1px solid oklch(0.78 0.12 80 / 0.3)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Loader2
              className="w-4 h-4 animate-spin"
              style={{ color: "oklch(0.78 0.12 80)" }}
            />
            <span className="text-xs" style={{ color: "oklch(0.78 0.12 80)" }}>
              फोटो upload हो रही है...
            </span>
          </div>
          <div
            className="w-full rounded-full h-1.5"
            style={{ background: "oklch(0.28 0.04 75 / 0.4)" }}
          >
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${uploadProgress}%`,
                background:
                  "linear-gradient(90deg, oklch(0.88 0.12 82), oklch(0.68 0.13 74))",
              }}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && uploadProgress === null && (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: "oklch(0.17 0.012 60)",
            border: "1px dashed oklch(0.32 0.06 78 / 0.5)",
          }}
          data-ocid="photos.empty_state"
        >
          <ImageIcon
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.4 0.03 70)" }}
          />
          <p
            className="font-medium text-sm"
            style={{ color: "oklch(0.65 0.07 80)" }}
          >
            कोई फोटो नहीं है
          </p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.4 0.03 70)" }}>
            "फोटो जोड़ें" दबाकर अपनी दुकान की फोटो upload करें
          </p>
          <p className="text-xs mt-1" style={{ color: "oklch(0.4 0.03 70)" }}>
            Customers आपकी दुकान की फोटो देख सकेंगे
          </p>
        </div>
      )}

      {/* Photos grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3" data-ocid="photos.list">
          {(photos as SalonPhotoType[]).map((photo, idx) => (
            <div
              key={photo.id.toString()}
              className="relative rounded-xl overflow-hidden"
              style={{
                border: "1px solid oklch(0.28 0.04 75 / 0.6)",
                aspectRatio: "1/1",
              }}
              data-ocid={`photos.item.${idx + 1}`}
            >
              <img
                src={photo.url}
                alt={`सैलून ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                disabled={deleting}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                data-ocid={`photos.delete_button.${idx + 1}`}
                style={{
                  background: "oklch(0.577 0.245 27 / 0.85)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}

          {/* Add more slot */}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || uploadProgress !== null}
              className="rounded-xl flex flex-col items-center justify-center gap-2 transition-opacity hover:opacity-80"
              style={{
                border: "1px dashed oklch(0.32 0.06 78 / 0.5)",
                background: "oklch(0.17 0.012 60)",
                aspectRatio: "1/1",
              }}
              data-ocid="photos.upload_button"
            >
              <Camera
                className="w-6 h-6"
                style={{ color: "oklch(0.55 0.04 80)" }}
              />
              <span
                className="text-xs"
                style={{ color: "oklch(0.55 0.04 80)" }}
              >
                जोड़ें
              </span>
            </button>
          )}
        </div>
      )}

      {/* Info note */}
      <div
        className="rounded-xl p-3 text-xs"
        style={{
          background: "oklch(0.78 0.12 80 / 0.06)",
          border: "1px solid oklch(0.78 0.12 80 / 0.2)",
          color: "oklch(0.65 0.07 80)",
        }}
      >
        💡 ये फोटो customers को दिखती हैं जब वे आपका सैलून open करते हैं। Max{" "}
        {MAX_PHOTOS} फोटो allowed हैं।
      </div>
    </div>
  );
}
