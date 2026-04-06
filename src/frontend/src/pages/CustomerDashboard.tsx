import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  Scissors,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ErrorBoundary } from "../components/ErrorBoundary";
import SalonLoadingScreen from "../components/SalonLoadingScreen";
import { useActor } from "../hooks/useActor";
import {
  type AppointmentWithId,
  type SalonPhotoType,
  type SalonWithId,
  useBookAppointment,
  useGetAllActiveSalons,
  useGetMyAppointments,
  useGetMyCustomerProfile,
  useGetQueueInfo,
  useGetSalonPhotos,
  useGetSalonServices,
  useSaveCustomerProfile,
  useSavePushSubscription,
} from "../hooks/useQueries";

// ─── Rating localStorage helpers ───────────────────────────────────────────
export interface RatingEntry {
  appointmentId: string;
  salonId: string;
  salonName: string;
  customerPhone: string;
  stars: number;
  review: string;
  date: string;
}

const RATINGS_KEY = "salon_ratings";

export function getRatings(): RatingEntry[] {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRating(entry: RatingEntry) {
  const list = getRatings().filter(
    (r) => r.appointmentId !== entry.appointmentId,
  );
  list.push(entry);
  localStorage.setItem(RATINGS_KEY, JSON.stringify(list));
}

export function deleteRating(appointmentId: string) {
  const list = getRatings().filter((r) => r.appointmentId !== appointmentId);
  localStorage.setItem(RATINGS_KEY, JSON.stringify(list));
}

export function getAverageRating(salonId: string): {
  avg: number;
  count: number;
} {
  const list = getRatings().filter((r) => r.salonId === salonId);
  if (list.length === 0) return { avg: 0, count: 0 };
  const avg = list.reduce((s, r) => s + r.stars, 0) / list.length;
  return { avg: Math.round(avg * 10) / 10, count: list.length };
}

export function hasRated(appointmentId: string): boolean {
  return getRatings().some((r) => r.appointmentId === appointmentId);
}
// ───────────────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pending: "प्रतीक्षा",
  confirmed: "कन्फर्म",
  inprogress: "चल रहा",
  completed: "पूरा",
  cancelled: "रद्द",
};

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

interface Props {
  phone: string;
  onSwitchRole: () => void;
}

export default function CustomerDashboard({ phone, onSwitchRole }: Props) {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: profile, isLoading: profileLoading } =
    useGetMyCustomerProfile(phone);
  const [profileSaved, setProfileSaved] = useState(false);
  const [savedProfileName, setSavedProfileName] = useState<string>("");

  const { mutate: savePushSub } = useSavePushSubscription();

  useEffect(() => {
    if (!("Notification" in window)) return;
    const doSubscribe = async () => {
      if (Notification.permission === "default") {
        await Notification.requestPermission().catch(() => {});
      }
      if (Notification.permission !== "granted") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        const sub =
          existing ??
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBkYIAgAJALeV3pcuogE",
          }));
        if (!sub) return;
        const p256dhKey = sub.getKey("p256dh");
        const authKey = sub.getKey("auth");
        if (!p256dhKey || !authKey) return;
        const toBase64 = (buf: ArrayBuffer) => {
          const bytes = new Uint8Array(buf);
          let bin = "";
          for (let i = 0; i < bytes.byteLength; i++)
            bin += String.fromCharCode(bytes[i]);
          return btoa(bin);
        };
        savePushSub({
          phone,
          endpoint: sub.endpoint,
          p256dh: toBase64(p256dhKey),
          auth: toBase64(authKey),
        });
      } catch {
        // Push not supported or denied — silently skip
      }
    };
    doSubscribe();
  }, [phone, savePushSub]);

  // Polling: check if any appointment is within 20 minutes (queue wait <= 20 min)
  const { actor: actorForPoll } = useActor();
  useEffect(() => {
    if (!actorForPoll) return;
    const checkQueue = async () => {
      try {
        const appts = (await (actorForPoll as any).getMyAppointmentsByPhone(
          phone,
        )) as Array<any>;
        const active = appts.filter(
          (a: any) => a.status === "confirmed" || a.status === "inprogress",
        );
        for (const appt of active) {
          const info = (await actorForPoll.getQueueInfo(appt.id)) as [
            bigint,
            bigint,
          ];
          const waitMinutes = Number(info[1]);
          if (waitMinutes <= 20 && waitMinutes > 0) {
            toast.info(
              "⏰ आपकी बारी 20 मिनट में है! सैलून के लिए निकलने की तैयारी करें",
              { id: `queue-reminder-${appt.id.toString()}`, duration: 8000 },
            );
          }
        }
      } catch {
        // silently ignore polling errors
      }
    };
    const id = setInterval(checkQueue, 60000);
    return () => clearInterval(id);
  }, [phone, actorForPoll]);

  // Wait for actor before deciding if profile exists — prevent false "profile missing" flash
  const actorReady = !!actor && !actorFetching;

  // Profile confirmed missing (not loading, actor ready) — show setup form
  if (actorReady && !profileLoading && !profile && !profileSaved) {
    return (
      <ProfileSetupForm
        phone={phone}
        onLogout={onSwitchRole}
        onProfileSaved={(name: string) => {
          setProfileSaved(true);
          setSavedProfileName(name);
        }}
      />
    );
  }

  const effectiveProfile =
    profile ??
    (profileSaved && savedProfileName
      ? { name: savedProfileName, phone, createdAt: BigInt(0) }
      : null);

  const effectiveProfileName = effectiveProfile?.name ?? "";

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
              Salon360
            </p>
            {effectiveProfileName ? (
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
                नमस्ते, {effectiveProfileName}
              </p>
            ) : (
              <div
                className="h-2.5 w-20 rounded animate-pulse mt-0.5"
                style={{ background: "oklch(0.22 0.03 70)" }}
              />
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSwitchRole}
          data-ocid="customer.close_button"
          style={{ color: "oklch(0.55 0.04 80)" }}
        >
          <LogOut className="w-4 h-4 mr-1" />
          बाहर
        </Button>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <Tabs defaultValue="salons">
          <TabsList
            className="w-full mb-4"
            style={{ background: "oklch(0.17 0.012 60)" }}
          >
            <TabsTrigger
              value="salons"
              className="flex-1"
              data-ocid="customer.tab"
            >
              सैलून चुनें
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex-1"
              data-ocid="customer.tab"
            >
              मेरी बुकिंग
            </TabsTrigger>
          </TabsList>

          <TabsContent value="salons">
            <ErrorBoundary>
              <SalonListTab
                phone={phone}
                profile={
                  effectiveProfile ?? { name: effectiveProfileName, phone }
                }
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="bookings">
            <ErrorBoundary>
              <MyBookingsTab phone={phone} />
            </ErrorBoundary>
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

function ProfileSetupForm({
  phone,
  onLogout,
  onProfileSaved,
}: {
  phone: string;
  onLogout: () => void;
  onProfileSaved?: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const { mutate, isPending } = useSaveCustomerProfile(phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("नाम जरूरी है");
      return;
    }
    mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          toast.success("प्रोफ़ाइल सेव हो गई!");
          onProfileSaved?.(name.trim());
        },
        onError: () => toast.error("कुछ गलत हुआ"),
      },
    );
  };

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
          <span className="font-bold" style={{ color: "oklch(0.97 0.015 80)" }}>
            Salon360
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          style={{ color: "oklch(0.55 0.04 80)" }}
        >
          <LogOut className="w-4 h-4 mr-1" />
          बाहर
        </Button>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card
          className="w-full max-w-md"
          style={{
            background: "oklch(0.17 0.012 60)",
            border: "1px solid oklch(0.28 0.04 75 / 0.6)",
          }}
        >
          <CardHeader>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{ background: "oklch(0.78 0.12 80 / 0.12)" }}
            >
              <Star
                className="w-6 h-6"
                style={{ color: "oklch(0.78 0.12 80)" }}
              />
            </div>
            <CardTitle
              className="text-center"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              अपना नाम भरें
            </CardTitle>
            <p
              className="text-center text-sm"
              style={{ color: "oklch(0.55 0.04 80)" }}
            >
              सैलून बुक करने के लिए
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label
                  className="text-sm"
                  style={{ color: "oklch(0.65 0.07 80)" }}
                >
                  आपका नाम *
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="अपना पूरा नाम"
                  data-ocid="profile.input"
                  style={{
                    background: "oklch(0.17 0.012 60)",
                    border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                    color: "oklch(0.97 0.015 80)",
                  }}
                />
              </div>
              <div>
                <Label
                  className="text-sm"
                  style={{ color: "oklch(0.65 0.07 80)" }}
                >
                  मोबाइल नंबर
                </Label>
                <Input
                  value={phone}
                  disabled
                  data-ocid="profile.input"
                  style={{
                    background: "oklch(0.17 0.012 60)",
                    border: "1px solid oklch(0.28 0.04 75 / 0.6)",
                    color: "oklch(0.55 0.04 80)",
                  }}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                data-ocid="profile.submit_button"
                style={{ background: "oklch(0.78 0.12 80)", color: "white" }}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isPending ? "सेव हो रहा है..." : "आगे बढ़ें"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Rating Popup ────────────────────────────────────────────────────────────
function RatingPopup({
  appointmentId,
  salonId,
  salonName,
  customerPhone,
  onClose,
}: {
  appointmentId: string;
  salonId: string;
  salonName: string;
  customerPhone: string;
  onClose: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = () => {
    if (stars === 0) {
      toast.error("कृपया स्टार रेटिंग दें");
      return;
    }
    saveRating({
      appointmentId,
      salonId,
      salonName,
      customerPhone,
      stars,
      review: review.trim(),
      date: new Date().toISOString(),
    });
    toast.success("रेटिंग दी गई!");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        data-ocid="rating.dialog"
        style={{
          background: "oklch(0.17 0.012 60)",
          border: "1px solid oklch(0.28 0.04 75 / 0.6)",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "oklch(0.97 0.015 80)" }}>
            रेटिंग दें
          </DialogTitle>
          <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
            {salonName}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Stars */}
          <div>
            <p
              className="text-sm mb-2"
              style={{ color: "oklch(0.65 0.07 80)" }}
            >
              आपका अनुभव कैसा रहा?
            </p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  data-ocid="rating.toggle"
                  onClick={() => setStars(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className="w-8 h-8"
                    style={{
                      color:
                        n <= (hovered || stars)
                          ? "oklch(0.82 0.14 78)"
                          : "oklch(0.35 0.04 155)",
                      fill:
                        n <= (hovered || stars)
                          ? "oklch(0.82 0.14 78)"
                          : "transparent",
                      transition: "color 0.15s, fill 0.15s",
                    }}
                  />
                </button>
              ))}
            </div>
            {stars > 0 && (
              <p
                className="text-center text-xs mt-1"
                style={{ color: "oklch(0.82 0.14 78)" }}
              >
                {["बहुत बुरा", "बुरा", "ठीक है", "अच्छा", "बहुत अच्छा"][stars - 1]}
              </p>
            )}
          </div>

          {/* Review text */}
          <div>
            <Label className="text-sm" style={{ color: "oklch(0.65 0.07 80)" }}>
              समीक्षा (वैकल्पिक)
            </Label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="अपना अनुभव लिखें..."
              rows={3}
              maxLength={300}
              data-ocid="rating.textarea"
              style={{
                background: "oklch(0.17 0.012 60)",
                border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                color: "oklch(0.97 0.015 80)",
                marginTop: "4px",
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              data-ocid="rating.cancel_button"
              style={{ color: "oklch(0.55 0.04 80)" }}
            >
              बाद में
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              data-ocid="rating.submit_button"
              style={{ background: "oklch(0.78 0.12 80)", color: "white" }}
            >
              जमा करें
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function SalonListTab({
  phone,
  profile,
}: { phone: string; profile: { name: string; phone: string } }) {
  const { data: salons = [], isLoading } = useGetAllActiveSalons();
  const [selectedSalon, setSelectedSalon] = useState<SalonWithId | null>(null);
  // re-render when ratings change
  const [, forceUpdate] = useState(0);

  if (isLoading) {
    return (
      <div data-ocid="salons.loading_state">
        <SalonLoadingScreen compact />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold" style={{ color: "oklch(0.97 0.015 80)" }}>
        नज़दीकी सैलून ({salons.length})
      </h2>

      {salons.length === 0 ? (
        <div className="text-center py-12" data-ocid="salons.empty_state">
          <Scissors
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.4 0.03 70)" }}
          />
          <p style={{ color: "oklch(0.55 0.04 80)" }}>अभी कोई सैलून उपलब्ध नहीं</p>
        </div>
      ) : (
        salons.map((salon, idx) => {
          const { avg, count } = getAverageRating(salon.id.toString());
          const isTopRated = avg >= 4.5 && count >= 1;
          return (
            <button
              key={salon.id.toString()}
              type="button"
              className="w-full rounded-xl p-4 cursor-pointer transition-all hover:opacity-90 active:scale-98 text-left"
              data-ocid={`salons.item.${idx + 1}`}
              onClick={() => setSelectedSalon(salon)}
              style={{
                background: "oklch(0.17 0.012 60)",
                border: "1px solid oklch(0.28 0.04 75 / 0.6)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.78 0.12 80 / 0.12)" }}
                  >
                    <Scissors
                      className="w-5 h-5"
                      style={{ color: "oklch(0.78 0.12 80)" }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "oklch(0.97 0.015 80)" }}
                      >
                        {salon.name}
                      </p>
                      {isTopRated && (
                        <Badge
                          className="text-xs px-1.5 py-0"
                          style={{
                            background: "oklch(0.82 0.14 78 / 0.15)",
                            color: "oklch(0.82 0.14 78)",
                            border: "1px solid oklch(0.72 0.18 85 / 0.3)",
                          }}
                        >
                          🏆 टॉप रेटेड
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin
                        className="w-3 h-3"
                        style={{ color: "oklch(0.55 0.04 80)" }}
                      />
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.55 0.04 80)" }}
                      >
                        {salon.city}
                      </p>
                    </div>
                    {/* Rating display */}
                    {count > 0 ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className="text-xs"
                          style={{ color: "oklch(0.82 0.14 78)" }}
                        >
                          {Array.from({ length: 5 }, (_, i) =>
                            i < Math.round(avg) ? "★" : "☆",
                          ).join("")}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "oklch(0.65 0.07 80)" }}
                        >
                          {avg} ({count} समीक्षाएं)
                        </span>
                      </div>
                    ) : (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.4 0.03 70)" }}
                      >
                        अभी कोई रेटिंग नहीं
                      </p>
                    )}
                    {salon.address && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.45 0.03 70)" }}
                      >
                        {salon.address}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {salon.phone && (
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.78 0.12 80)" }}
                    >
                      <Phone className="w-3 h-3 inline mr-0.5" />
                      {salon.phone}
                    </span>
                  )}
                  <ChevronRight
                    className="w-4 h-4"
                    style={{ color: "oklch(0.4 0.03 70)" }}
                  />
                </div>
              </div>
            </button>
          );
        })
      )}

      {selectedSalon && (
        <ErrorBoundary>
          <BookingModal
            salon={selectedSalon}
            customerPhone={phone}
            customerName={profile.name}
            onClose={() => {
              setSelectedSalon(null);
              forceUpdate((n) => n + 1);
            }}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

function BookingModal({
  salon,
  customerName,
  customerPhone,
  onClose,
}: {
  salon: SalonWithId;
  customerName: string;
  customerPhone: string;
  onClose: () => void;
}) {
  const { data: services = [], isLoading: servicesLoading } =
    useGetSalonServices(salon.id);
  const { mutate: book, isPending: booking } =
    useBookAppointment(customerPhone);
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [booked, setBooked] = useState<{
    appointmentId: bigint;
    queueNum: number;
  } | null>(null);

  const handleBook = () => {
    if (!date) {
      toast.error("तारीख चुनें");
      return;
    }
    if (!selectedService) {
      toast.error("सेवा चुनें");
      return;
    }
    book(
      {
        salonId: salon.id,
        customerName,
        serviceName: selectedService,
        date,
      },
      {
        onSuccess: (id) => {
          setBooked({ appointmentId: id, queueNum: 0 });
          toast.success("अपॉइंटमेंट बुक हो गई!");
        },
        onError: () => toast.error("बुकिंग नहीं हो सकी, दोबारा कोशिश करें"),
      },
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        style={{
          background: "oklch(0.17 0.012 60)",
          border: "1px solid oklch(0.28 0.04 75 / 0.6)",
        }}
        data-ocid="booking.dialog"
      >
        <DialogHeader>
          <DialogTitle style={{ color: "oklch(0.97 0.015 80)" }}>
            {salon.name}
          </DialogTitle>
        </DialogHeader>

        <SalonPhotoGallery salonId={salon.id} />

        {booked ? (
          <div className="text-center py-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "oklch(0.78 0.12 80 / 0.12)" }}
            >
              <CheckCircle
                className="w-8 h-8"
                style={{ color: "oklch(0.78 0.12 80)" }}
              />
            </div>
            <p
              className="text-lg font-bold mb-1"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              बुकिंग हो गई! ༼
            </p>
            <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
              आपकी अपॉइंटमेंट {date} को है
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: "oklch(0.78 0.12 80)" }}
            >
              "मेरी बुकिंग" में queue नंबर देखें
            </p>
            <Button
              className="mt-4 w-full"
              onClick={onClose}
              data-ocid="booking.close_button"
              style={{ background: "oklch(0.78 0.12 80)", color: "white" }}
            >
              ठीक है
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label
                className="text-sm mb-2 block"
                style={{ color: "oklch(0.65 0.07 80)" }}
              >
                तारीख चुनें
              </Label>
              <Input
                type="date"
                value={date}
                min={getTodayString()}
                onChange={(e) => setDate(e.target.value)}
                data-ocid="booking.input"
                style={{
                  background: "oklch(0.17 0.012 60)",
                  border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                  color: "oklch(0.97 0.015 80)",
                }}
              />
            </div>
            <div>
              <Label
                className="text-sm mb-2 block"
                style={{ color: "oklch(0.65 0.07 80)" }}
              >
                सेवा चुनें
              </Label>
              {servicesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: "oklch(0.78 0.12 80)" }}
                  />
                </div>
              ) : services.length === 0 ? (
                <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
                  इस सैलून में कोई सेवा नहीं है अभी
                </p>
              ) : (
                <div className="space-y-2">
                  {services.map((svc) => (
                    <button
                      key={svc.id.toString()}
                      type="button"
                      className="w-full rounded-lg p-3 cursor-pointer flex items-center justify-between text-left"
                      data-ocid="booking.select"
                      onClick={() => setSelectedService(svc.name)}
                      style={{
                        background:
                          selectedService === svc.name
                            ? "oklch(0.78 0.12 80 / 0.12)"
                            : "oklch(0.17 0.012 60)",
                        border: `1px solid ${
                          selectedService === svc.name
                            ? "oklch(0.78 0.12 80)"
                            : "oklch(0.32 0.06 78 / 0.5)"
                        }`,
                      }}
                    >
                      <div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: "oklch(0.97 0.015 80)" }}
                        >
                          {svc.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.55 0.04 80)" }}
                        >
                          {String(svc.durationMinutes)} मिनट
                        </p>
                      </div>
                      <span
                        className="font-bold"
                        style={{ color: "oklch(0.78 0.12 80)" }}
                      >
                        ₹{Number(svc.price)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1"
                data-ocid="booking.cancel_button"
                style={{ color: "oklch(0.55 0.04 80)" }}
              >
                रद्द
              </Button>
              <Button
                onClick={handleBook}
                className="flex-1"
                disabled={booking || !selectedService}
                data-ocid="booking.primary_button"
                style={{ background: "oklch(0.78 0.12 80)", color: "white" }}
              >
                {booking ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {booking ? "बुक हो रहा है..." : "बुक करें"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AppointmentCard({
  appt,
  salons,
  customerPhone,
}: { appt: AppointmentWithId; salons: SalonWithId[]; customerPhone: string }) {
  const salon = salons.find((s) => s.id === appt.salonId);
  const salonName = salon?.name || "सैलून";
  const salonId = appt.salonId.toString();
  const isActive =
    appt.status === "confirmed" ||
    appt.status === "inprogress" ||
    appt.status === "pending";
  const { data: queueInfo } = useGetQueueInfo(isActive ? appt.id : null);
  const notifiedRef = useRef(false);
  const [showRating, setShowRating] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(() =>
    hasRated(appt.id.toString()),
  );

  useEffect(() => {
    if (!queueInfo || !isActive || notifiedRef.current) return;
    const ahead = Number(queueInfo[1]);
    if (ahead <= 1 && Notification.permission === "granted") {
      notifiedRef.current = true;
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready
          .then((reg) => {
            reg.showNotification("💈 salon360Pro", {
              body: `आपकी बारी आने वाली है! (${salonName})`,
              icon: "/assets/generated/icon-192.dim_192x192.png",
              badge: "/assets/generated/icon-192.dim_192x192.png",
              tag: "customer-turn-notification",
              requireInteraction: true,
              silent: false,
            } as NotificationOptions);
          })
          .catch(() => {});
      } else if ("Notification" in window) {
        try {
          new Notification("💈 salon360Pro", {
            body: `आपकी बारी आने वाली है! (${salonName})`,
            icon: "/assets/generated/icon-192.dim_192x192.png",
          });
        } catch {
          // Notification not supported
        }
      }
    }
  }, [queueInfo, isActive, salonName]);

  return (
    <>
      <div
        className="rounded-xl p-4"
        style={{
          background: "oklch(0.17 0.012 60)",
          border: "1px solid oklch(0.28 0.04 75 / 0.6)",
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p
              className="font-semibold text-sm"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              {salonName}
            </p>
            <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
              {appt.serviceName} • {appt.date}
            </p>
          </div>
          <Badge
            className="text-xs"
            style={{
              background:
                appt.status === "completed"
                  ? "oklch(0.78 0.12 80 / 0.12)"
                  : appt.status === "cancelled"
                    ? "oklch(0.577 0.245 27.325 / 0.2)"
                    : "oklch(0.78 0.12 80 / 0.12)",
              color:
                appt.status === "completed"
                  ? "oklch(0.78 0.12 80)"
                  : appt.status === "cancelled"
                    ? "oklch(0.577 0.245 27.325)"
                    : "oklch(0.78 0.12 80)",
              border: "none",
            }}
          >
            {STATUS_LABELS[appt.status] || appt.status}
          </Badge>
        </div>
        {isActive && queueInfo && (
          <div
            className="rounded-lg p-2 mt-2 flex items-center gap-2"
            style={{ background: "oklch(0.78 0.12 80 / 0.08)" }}
          >
            <Clock
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "oklch(0.78 0.12 80)" }}
            />
            <p className="text-xs" style={{ color: "oklch(0.78 0.12 80)" }}>
              आप नंबर <strong>{String(queueInfo[0])}</strong> पर हैं
              {Number(queueInfo[1]) > 0 && ` • ${Number(queueInfo[1])} लोग पहले`}
            </p>
          </div>
        )}

        {/* Rating section for completed appointments */}
        {appt.status === "completed" && (
          <div
            className="mt-3 pt-3"
            style={{ borderTop: "1px solid oklch(0.25 0.04 155)" }}
          >
            {alreadyRated ? (
              <p className="text-xs" style={{ color: "oklch(0.78 0.12 80)" }}>
                ✓ रेटिंग दी गई
              </p>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowRating(true)}
                data-ocid="bookings.toggle"
                className="text-xs h-7 px-3"
                style={{
                  background: "oklch(0.82 0.18 85 / 0.12)",
                  color: "oklch(0.82 0.14 78)",
                  border: "1px solid oklch(0.72 0.18 85 / 0.25)",
                }}
              >
                ⭐ रेटिंग दें
              </Button>
            )}
          </div>
        )}
      </div>

      {showRating && (
        <RatingPopup
          appointmentId={appt.id.toString()}
          salonId={salonId}
          salonName={salonName}
          customerPhone={customerPhone}
          onClose={() => {
            setShowRating(false);
            setAlreadyRated(hasRated(appt.id.toString()));
          }}
        />
      )}
    </>
  );
}

function MyBookingsTab({ phone }: { phone: string }) {
  const { data: appointments = [], isLoading } = useGetMyAppointments(phone);
  const { data: salons = [] } = useGetAllActiveSalons();

  if (isLoading) {
    return (
      <div data-ocid="bookings.loading_state">
        <SalonLoadingScreen compact />
      </div>
    );
  }

  const sorted = [...appointments].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold" style={{ color: "oklch(0.97 0.015 80)" }}>
          मेरी बुकिंग ({sorted.length})
        </h2>
        <div
          className="flex items-center gap-1 text-xs"
          style={{ color: "oklch(0.78 0.12 80)" }}
        >
          <Bell className="w-3 h-3" />
          <span>नोटिफ़िकेशन चालू</span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12" data-ocid="bookings.empty_state">
          <Calendar
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.4 0.03 70)" }}
          />
          <p style={{ color: "oklch(0.55 0.04 80)" }}>कोई बुकिंग नहीं है</p>
          <p className="text-sm mt-1" style={{ color: "oklch(0.4 0.03 70)" }}>
            "सैलून चुनें" टैब से बुक करें
          </p>
        </div>
      ) : (
        sorted.map((appt, idx) => (
          <div key={appt.id.toString()} data-ocid={`bookings.item.${idx + 1}`}>
            <AppointmentCard
              appt={appt}
              salons={salons}
              customerPhone={phone}
            />
          </div>
        ))
      )}
    </div>
  );
}

// ─── Salon Photo Gallery (customer view) ───────────────────────────────────
function SalonPhotoGallery({ salonId }: { salonId: bigint }) {
  const { data: photos = [] } = useGetSalonPhotos(salonId);

  if (!photos || photos.length === 0) return null;

  return (
    <div className="mb-2">
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {(photos as SalonPhotoType[]).map((photo, idx) => (
          <div
            key={photo.id.toString()}
            className="flex-shrink-0 rounded-xl overflow-hidden"
            style={{
              width: "160px",
              height: "120px",
              scrollSnapAlign: "start",
              border: "1px solid oklch(0.28 0.04 75 / 0.5)",
            }}
          >
            <img
              src={photo.url}
              alt={`सैलून ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      <p className="text-xs mt-1" style={{ color: "oklch(0.4 0.03 70)" }}>
        {photos.length} फोटो
      </p>
    </div>
  );
}
