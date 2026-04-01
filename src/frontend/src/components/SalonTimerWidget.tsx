import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlarmClock,
  CheckCircle,
  Clock,
  Loader2,
  Play,
  Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AppointmentWithId } from "../hooks/useQueries";
import {
  useClearServiceSession,
  useGetCurrentServiceSession,
  useGetPendingNotifications,
  useGetQueueScheduleForSalon,
  useMarkNotificationSent,
  useStartServiceSession,
} from "../hooks/useQueries";

interface Props {
  ownerPhone: string;
  salonId: bigint;
  todayAppointments: AppointmentWithId[];
  today: string;
}

function formatMMSS(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatHHMM(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const AUTO_START_DELAY_MS = 10 * 60 * 1000; // 10 minutes

export default function SalonTimerWidget({
  ownerPhone,
  salonId,
  todayAppointments,
  today,
}: Props) {
  const { data: session, isLoading: sessionLoading } =
    useGetCurrentServiceSession(salonId);
  const { data: schedule = [] } = useGetQueueScheduleForSalon(salonId, today);
  const { data: pendingNotifIds = [] } = useGetPendingNotifications(
    salonId,
    today,
  );

  const { mutate: startSession, isPending: starting } =
    useStartServiceSession(ownerPhone);
  const { mutate: clearSession, isPending: clearing } =
    useClearServiceSession(ownerPhone);
  const { mutate: markSent } = useMarkNotificationSent(ownerPhone);

  // Countdown states
  const [remaining, setRemaining] = useState<number>(0); // ms for active session
  const [autoCountdown, setAutoCountdown] = useState<number>(0); // ms until auto-start

  // Manual start form
  const [showStartForm, setShowStartForm] = useState(false);
  const [duration, setDuration] = useState("30");
  const [selectedApptId, setSelectedApptId] = useState<string>("");

  // Track sent notifications to avoid duplicates within the same session
  const sentNotifRef = useRef<Set<string>>(new Set());
  const autoStartFiredRef = useRef(false);

  const confirmedAppts = todayAppointments.filter(
    (a) => a.status === "confirmed",
  );
  const firstConfirmed = confirmedAppts[0] ?? null;

  // Set default selected appt when form opens
  useEffect(() => {
    if (showStartForm && confirmedAppts.length > 0 && !selectedApptId) {
      setSelectedApptId(confirmedAppts[0].id.toString());
    }
  }, [showStartForm, confirmedAppts, selectedApptId]);

  // Live countdown for active session
  useEffect(() => {
    if (!session) return;
    const endMs =
      Number(session.startTime) / 1_000_000 +
      Number(session.durationMinutes) * 60_000;
    const tick = () => setRemaining(Math.max(0, endMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  // Auto-start countdown
  useEffect(() => {
    if (session || !firstConfirmed) return;
    const createdMs = Number(firstConfirmed.createdAt) / 1_000_000;
    const autoStartAt = createdMs + AUTO_START_DELAY_MS;
    const tick = () => setAutoCountdown(Math.max(0, autoStartAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session, firstConfirmed]);

  // Auto-start logic: fire once when countdown hits 0
  useEffect(() => {
    if (session || !firstConfirmed || autoStartFiredRef.current) return;
    const createdMs = Number(firstConfirmed.createdAt) / 1_000_000;
    if (Date.now() - createdMs >= AUTO_START_DELAY_MS) {
      autoStartFiredRef.current = true;
      startSession(
        { appointmentId: firstConfirmed.id, durationMinutes: 30 },
        {
          onSuccess: () =>
            toast.success(
              `⏰ Auto-start: ${firstConfirmed.customerName} की सेवा शुरू हो गई`,
            ),
          onError: () => {},
        },
      );
    }
  }, [session, firstConfirmed, startSession]);

  // Reset auto-start flag when session changes
  useEffect(() => {
    if (!session) autoStartFiredRef.current = false;
  }, [session]);

  // Poll pending notifications and fire browser notifications
  useEffect(() => {
    if (pendingNotifIds.length === 0) return;
    for (const apptId of pendingNotifIds) {
      const key = apptId.toString();
      if (sentNotifRef.current.has(key)) continue;
      sentNotifRef.current.add(key);
      // Mark sent on backend
      markSent(apptId);
      // Show browser notification
      const msg = "⏰ आपकी बारी 20 मिनट में है। कृपया सैलून के लिए निकल जाइए!";
      if ("Notification" in window && Notification.permission === "granted") {
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.ready
            .then((reg) =>
              reg.showNotification("salon360Pro", {
                body: msg,
                icon: "/assets/generated/icon-192.dim_192x192.png",
                badge: "/assets/generated/icon-192.dim_192x192.png",
                tag: `notif-${key}`,
                requireInteraction: true,
              }),
            )
            .catch(() => {});
        } else {
          try {
            new Notification("salon360Pro", { body: msg }); // eslint-disable-line
          } catch {}
        }
      }
      toast.info(msg);
    }
  }, [pendingNotifIds, markSent]);

  // Only show widget when there are confirmed appointments or active session
  const hasSession = !!session;
  const hasConfirmed = confirmedAppts.length > 0;
  if (sessionLoading || (!hasSession && !hasConfirmed)) return null;

  const handleStart = () => {
    const apptId = BigInt(
      selectedApptId || (firstConfirmed?.id.toString() ?? "0"),
    );
    const mins = Math.max(1, Math.min(120, Number.parseInt(duration) || 30));
    startSession(
      { appointmentId: apptId, durationMinutes: mins },
      {
        onSuccess: () => {
          toast.success("✅ सेवा शुरू हो गई!");
          setShowStartForm(false);
        },
        onError: () => toast.error("सेवा शुरू नहीं हो पाई"),
      },
    );
  };

  const handleStop = () => {
    clearSession(undefined, {
      onSuccess: () => toast.success("✅ सेवा समाप्त हो गई"),
      onError: () => toast.error("कुछ गलत हुआ"),
    });
  };

  return (
    <Card
      className="mb-4"
      data-ocid="timer.card"
      style={{
        background: hasSession
          ? "oklch(0.16 0.06 155)"
          : "oklch(0.16 0.04 220)",
        border: hasSession
          ? "1px solid oklch(0.52 0.18 145)"
          : "1px solid oklch(0.4 0.1 220)",
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle
            className="text-base flex items-center gap-2"
            style={{ color: "oklch(0.95 0.02 145)" }}
          >
            <AlarmClock
              className="w-5 h-5"
              style={{
                color: hasSession
                  ? "oklch(0.52 0.18 145)"
                  : "oklch(0.65 0.15 220)",
              }}
            />
            सेवा टाइमर
          </CardTitle>
          {hasSession && (
            <Badge
              style={{
                background: "oklch(0.52 0.18 145 / 0.2)",
                color: "oklch(0.7 0.18 145)",
                border: "1px solid oklch(0.52 0.18 145 / 0.4)",
              }}
            >
              चल रहा है
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Session Countdown */}
        {hasSession && (
          <div className="text-center">
            <div
              className="text-5xl font-bold font-mono tracking-tight mb-1"
              style={{
                color:
                  remaining < 60000
                    ? "oklch(0.65 0.22 30)"
                    : "oklch(0.52 0.18 145)",
              }}
            >
              {formatMMSS(remaining)}
            </div>
            <p className="text-sm" style={{ color: "oklch(0.65 0.05 145)" }}>
              बचे हैं
            </p>
            <div
              className="mt-1 text-xs"
              style={{ color: "oklch(0.55 0.05 145)" }}
            >
              अवधि: {String(session!.durationMinutes)} मिनट
            </div>
            <Button
              size="sm"
              className="mt-3"
              disabled={clearing}
              onClick={handleStop}
              data-ocid="timer.delete_button"
              style={{ background: "oklch(0.45 0.18 30)", color: "white" }}
            >
              {clearing ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Square className="w-3 h-3 mr-1" />
              )}
              सेवा समाप्त करें
            </Button>
          </div>
        )}

        {/* No Active Session — show auto-start countdown + start button */}
        {!hasSession && hasConfirmed && (
          <div className="space-y-3">
            {autoCountdown > 0 ? (
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background: "oklch(0.18 0.06 220)",
                  border: "1px solid oklch(0.35 0.1 220)",
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock
                    className="w-4 h-4"
                    style={{ color: "oklch(0.65 0.15 220)" }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.75 0.12 220)" }}
                  >
                    ⏰ {formatMMSS(autoCountdown)} में auto-start होगा
                  </span>
                </div>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.08 220)" }}
                >
                  {firstConfirmed?.customerName} का इंतज़ार हो रहा है
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background: "oklch(0.16 0.06 35)",
                  border: "1px solid oklch(0.45 0.15 35)",
                }}
              >
                <CheckCircle
                  className="w-5 h-5 mx-auto mb-1"
                  style={{ color: "oklch(0.65 0.2 35)" }}
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.75 0.15 35)" }}
                >
                  Auto-start हो रहा है...
                </p>
              </div>
            )}

            {/* Start Button */}
            {!showStartForm ? (
              <Button
                className="w-full"
                onClick={() => setShowStartForm(true)}
                disabled={starting}
                data-ocid="timer.primary_button"
                style={{ background: "oklch(0.52 0.18 145)", color: "white" }}
              >
                <Play className="w-4 h-4 mr-2" />
                सेवा शुरू करें
              </Button>
            ) : (
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "oklch(0.18 0.05 155)",
                  border: "1px solid oklch(0.28 0.05 155)",
                }}
              >
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "oklch(0.65 0.05 145)" }}
                  >
                    ग्राहक चुनें
                  </Label>
                  <Select
                    value={selectedApptId}
                    onValueChange={setSelectedApptId}
                  >
                    <SelectTrigger
                      data-ocid="timer.select"
                      style={{
                        background: "oklch(0.22 0.05 155)",
                        border: "1px solid oklch(0.32 0.05 155)",
                        color: "oklch(0.95 0.02 145)",
                      }}
                    >
                      <SelectValue placeholder="ग्राहक चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {confirmedAppts.map((a) => (
                        <SelectItem
                          key={a.id.toString()}
                          value={a.id.toString()}
                        >
                          #{String(a.queueNumber)} {a.customerName} —{" "}
                          {a.serviceName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    className="text-xs mb-1 block"
                    style={{ color: "oklch(0.65 0.05 145)" }}
                  >
                    अवधि (मिनट में, 1–120)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    data-ocid="timer.input"
                    style={{
                      background: "oklch(0.22 0.05 155)",
                      border: "1px solid oklch(0.32 0.05 155)",
                      color: "oklch(0.95 0.02 145)",
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={starting || !selectedApptId}
                    onClick={handleStart}
                    data-ocid="timer.submit_button"
                    style={{
                      background: "oklch(0.52 0.18 145)",
                      color: "white",
                    }}
                  >
                    {starting ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : null}
                    शुरू करें
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowStartForm(false)}
                    data-ocid="timer.cancel_button"
                    style={{ color: "oklch(0.6 0.05 145)" }}
                  >
                    रद्द
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Queue Schedule */}
        {schedule.length > 0 && (
          <div>
            <p
              className="text-xs font-medium mb-2"
              style={{ color: "oklch(0.6 0.05 145)" }}
            >
              आगे की Queue
            </p>
            <div className="space-y-1.5">
              {schedule.slice(0, 5).map((entry, i) => (
                <div
                  key={entry.appointmentId.toString()}
                  className="flex items-center justify-between text-xs px-3 py-2 rounded-lg"
                  data-ocid={`timer.item.${i + 1}`}
                  style={{
                    background: "oklch(0.20 0.04 155)",
                    border: "1px solid oklch(0.26 0.04 155)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold"
                      style={{ color: "oklch(0.52 0.18 145)" }}
                    >
                      #{String(entry.queueNumber)}
                    </span>
                    <span style={{ color: "oklch(0.8 0.04 145)" }}>
                      {entry.customerName}
                    </span>
                    <span style={{ color: "oklch(0.55 0.04 145)" }}>
                      — {entry.serviceName}
                    </span>
                  </div>
                  <span
                    className="font-mono"
                    style={{ color: "oklch(0.65 0.05 145)" }}
                  >
                    ~{formatHHMM(entry.estimatedStartTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
