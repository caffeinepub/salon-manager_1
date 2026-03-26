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
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  type AppointmentWithId,
  type SalonWithId,
  useBookAppointment,
  useGetAllActiveSalons,
  useGetMyAppointments,
  useGetMyCustomerProfile,
  useGetQueueInfo,
  useGetSalonServices,
  useSaveCustomerProfile,
} from "../hooks/useQueries";

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
  onSwitchRole: () => void;
}

export default function CustomerDashboard({ onSwitchRole }: Props) {
  const { clear } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } =
    useGetMyCustomerProfile();

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  if (profileLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.12 0.04 155)" }}
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "oklch(0.52 0.18 145)" }}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <ProfileSetupForm
        onLogout={() => {
          clear();
          onSwitchRole();
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.12 0.04 155)" }}
    >
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{
          background: "oklch(0.16 0.05 155)",
          borderBottom: "1px solid oklch(0.25 0.05 155)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.52 0.18 145)" }}
          >
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <div>
            <p
              className="font-bold text-sm"
              style={{ color: "oklch(0.95 0.02 145)" }}
            >
              Salon360
            </p>
            <p className="text-xs" style={{ color: "oklch(0.6 0.05 145)" }}>
              नमस्ते, {profile.name}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clear();
            onSwitchRole();
          }}
          data-ocid="customer.close_button"
          style={{ color: "oklch(0.6 0.05 145)" }}
        >
          <LogOut className="w-4 h-4 mr-1" />
          बाहर
        </Button>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <Tabs defaultValue="salons">
          <TabsList
            className="w-full mb-4"
            style={{ background: "oklch(0.18 0.05 155)" }}
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
            <SalonListTab profile={profile} />
          </TabsContent>

          <TabsContent value="bookings">
            <MyBookingsTab />
          </TabsContent>
        </Tabs>
      </main>

      <footer
        className="text-center py-4 text-xs"
        style={{ color: "oklch(0.45 0.04 155)" }}
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

function ProfileSetupForm({ onLogout }: { onLogout: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const { mutate, isPending } = useSaveCustomerProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("नाम और फ़ोन जरूरी है");
      return;
    }
    mutate(form, {
      onSuccess: () => toast.success("प्रोफ़ाइल सेव हो गई!"),
      onError: () => toast.error("कुछ गलत हुआ"),
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.12 0.04 155)" }}
    >
      <header
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: "oklch(0.16 0.05 155)",
          borderBottom: "1px solid oklch(0.25 0.05 155)",
        }}
      >
        <div className="flex items-center gap-2">
          <Scissors
            className="w-5 h-5"
            style={{ color: "oklch(0.52 0.18 145)" }}
          />
          <span className="font-bold" style={{ color: "oklch(0.95 0.02 145)" }}>
            Salon360
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          style={{ color: "oklch(0.6 0.05 145)" }}
        >
          <LogOut className="w-4 h-4 mr-1" />
          बाहर
        </Button>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <Card
          className="w-full max-w-md"
          style={{
            background: "oklch(0.18 0.05 155)",
            border: "1px solid oklch(0.28 0.05 155)",
          }}
        >
          <CardHeader>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{ background: "oklch(0.52 0.18 145 / 0.2)" }}
            >
              <Star
                className="w-6 h-6"
                style={{ color: "oklch(0.52 0.18 145)" }}
              />
            </div>
            <CardTitle
              className="text-center"
              style={{ color: "oklch(0.95 0.02 145)" }}
            >
              अपनी जानकारी भरें
            </CardTitle>
            <p
              className="text-center text-sm"
              style={{ color: "oklch(0.6 0.05 145)" }}
            >
              सैलून बुक करने के लिए
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label
                  className="text-sm"
                  style={{ color: "oklch(0.75 0.05 145)" }}
                >
                  आपका नाम *
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="अपना पूरा नाम"
                  data-ocid="profile.input"
                  style={{
                    background: "oklch(0.22 0.05 155)",
                    border: "1px solid oklch(0.32 0.05 155)",
                    color: "oklch(0.95 0.02 145)",
                  }}
                />
              </div>
              <div>
                <Label
                  className="text-sm"
                  style={{ color: "oklch(0.75 0.05 145)" }}
                >
                  मोबाइल नंबर *
                </Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="9876543210"
                  type="tel"
                  data-ocid="profile.input"
                  style={{
                    background: "oklch(0.22 0.05 155)",
                    border: "1px solid oklch(0.32 0.05 155)",
                    color: "oklch(0.95 0.02 145)",
                  }}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
                data-ocid="profile.submit_button"
                style={{ background: "oklch(0.52 0.18 145)", color: "white" }}
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

function SalonListTab({
  profile,
}: { profile: { name: string; phone: string } }) {
  const { data: salons = [], isLoading } = useGetAllActiveSalons();
  const [selectedSalon, setSelectedSalon] = useState<SalonWithId | null>(null);

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-12"
        data-ocid="salons.loading_state"
      >
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "oklch(0.52 0.18 145)" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold" style={{ color: "oklch(0.95 0.02 145)" }}>
        नजदीकी सैलून ({salons.length})
      </h2>

      {salons.length === 0 ? (
        <div className="text-center py-12" data-ocid="salons.empty_state">
          <Scissors
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.4 0.05 155)" }}
          />
          <p style={{ color: "oklch(0.6 0.05 145)" }}>अभी कोई सैलून उपलब्ध नहीं</p>
        </div>
      ) : (
        salons.map((salon, idx) => (
          <button
            key={salon.id.toString()}
            type="button"
            className="w-full rounded-xl p-4 cursor-pointer transition-all hover:opacity-90 active:scale-98 text-left"
            data-ocid={`salons.item.${idx + 1}`}
            onClick={() => setSelectedSalon(salon)}
            style={{
              background: "oklch(0.18 0.05 155)",
              border: "1px solid oklch(0.28 0.05 155)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.52 0.18 145 / 0.2)" }}
                >
                  <Scissors
                    className="w-5 h-5"
                    style={{ color: "oklch(0.52 0.18 145)" }}
                  />
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "oklch(0.95 0.02 145)" }}
                  >
                    {salon.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin
                      className="w-3 h-3"
                      style={{ color: "oklch(0.6 0.05 145)" }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.6 0.05 145)" }}
                    >
                      {salon.city}
                    </p>
                  </div>
                  {salon.address && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.5 0.04 155)" }}
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
                    style={{ color: "oklch(0.52 0.18 145)" }}
                  >
                    <Phone className="w-3 h-3 inline mr-0.5" />
                    {salon.phone}
                  </span>
                )}
                <ChevronRight
                  className="w-4 h-4"
                  style={{ color: "oklch(0.4 0.05 155)" }}
                />
              </div>
            </div>
          </button>
        ))
      )}

      {selectedSalon && (
        <BookingModal
          salon={selectedSalon}
          customerName={profile.name}
          customerPhone={profile.phone}
          onClose={() => setSelectedSalon(null)}
        />
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
  const { mutate: book, isPending: booking } = useBookAppointment();
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [booked, setBooked] = useState<{
    appointmentId: bigint;
    queueNum: number;
  } | null>(null);

  const handleBook = () => {
    if (!selectedService) {
      toast.error("सेवा चुनें");
      return;
    }
    book(
      {
        salonId: salon.id,
        customerName,
        customerPhone,
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
          background: "oklch(0.18 0.05 155)",
          border: "1px solid oklch(0.28 0.05 155)",
        }}
        data-ocid="booking.dialog"
      >
        <DialogHeader>
          <DialogTitle style={{ color: "oklch(0.95 0.02 145)" }}>
            {salon.name}
          </DialogTitle>
        </DialogHeader>

        {booked ? (
          <div className="text-center py-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "oklch(0.52 0.18 145 / 0.2)" }}
            >
              <CheckCircle
                className="w-8 h-8"
                style={{ color: "oklch(0.52 0.18 145)" }}
              />
            </div>
            <p
              className="text-lg font-bold mb-1"
              style={{ color: "oklch(0.95 0.02 145)" }}
            >
              बुकिंग हो गई! 🎉
            </p>
            <p className="text-sm" style={{ color: "oklch(0.6 0.05 145)" }}>
              आपकी अपॉइंटमेंट {date} को है
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: "oklch(0.52 0.18 145)" }}
            >
              "मेरी बुकिंग" में queue नंबर देखें
            </p>
            <Button
              className="mt-4 w-full"
              onClick={onClose}
              data-ocid="booking.close_button"
              style={{ background: "oklch(0.52 0.18 145)", color: "white" }}
            >
              ठीक है
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label
                className="text-sm mb-2 block"
                style={{ color: "oklch(0.75 0.05 145)" }}
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
                  background: "oklch(0.22 0.05 155)",
                  border: "1px solid oklch(0.32 0.05 155)",
                  color: "oklch(0.95 0.02 145)",
                }}
              />
            </div>
            <div>
              <Label
                className="text-sm mb-2 block"
                style={{ color: "oklch(0.75 0.05 145)" }}
              >
                सेवा चुनें
              </Label>
              {servicesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: "oklch(0.52 0.18 145)" }}
                  />
                </div>
              ) : services.length === 0 ? (
                <p className="text-sm" style={{ color: "oklch(0.6 0.05 145)" }}>
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
                            ? "oklch(0.52 0.18 145 / 0.2)"
                            : "oklch(0.22 0.05 155)",
                        border: `1px solid ${selectedService === svc.name ? "oklch(0.52 0.18 145)" : "oklch(0.32 0.05 155)"}`,
                      }}
                    >
                      <div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: "oklch(0.95 0.02 145)" }}
                        >
                          {svc.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.6 0.05 145)" }}
                        >
                          {String(svc.durationMinutes)} मिनट
                        </p>
                      </div>
                      <span
                        className="font-bold"
                        style={{ color: "oklch(0.52 0.18 145)" }}
                      >
                        ₹{svc.price}
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
                style={{ color: "oklch(0.6 0.05 145)" }}
              >
                रद्द
              </Button>
              <Button
                onClick={handleBook}
                className="flex-1"
                disabled={booking || !selectedService}
                data-ocid="booking.primary_button"
                style={{ background: "oklch(0.52 0.18 145)", color: "white" }}
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
}: { appt: AppointmentWithId; salons: SalonWithId[] }) {
  const salonName = salons.find((s) => s.id === appt.salonId)?.name || "सैलून";
  const isActive =
    appt.status === "confirmed" ||
    appt.status === "inprogress" ||
    appt.status === "pending";
  const { data: queueInfo } = useGetQueueInfo(isActive ? appt.id : null);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!queueInfo || !isActive || notifiedRef.current) return;
    const ahead = Number(queueInfo[1]);
    if (ahead <= 1 && Notification.permission === "granted") {
      notifiedRef.current = true;
      new Notification("Salon360", {
        body: `आपका नंबर आने वाला है! (${salonName})`,
        icon: "/assets/generated/icon-192.dim_192x192.png",
      });
    }
  }, [queueInfo, isActive, salonName]);

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "oklch(0.18 0.05 155)",
        border: "1px solid oklch(0.28 0.05 155)",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p
            className="font-semibold text-sm"
            style={{ color: "oklch(0.95 0.02 145)" }}
          >
            {salonName}
          </p>
          <p className="text-xs" style={{ color: "oklch(0.6 0.05 145)" }}>
            {appt.serviceName} • {appt.date}
          </p>
        </div>
        <Badge
          className="text-xs"
          style={{
            background:
              appt.status === "completed"
                ? "oklch(0.52 0.18 145 / 0.2)"
                : appt.status === "cancelled"
                  ? "oklch(0.577 0.245 27.325 / 0.2)"
                  : "oklch(0.75 0.12 70 / 0.2)",
            color:
              appt.status === "completed"
                ? "oklch(0.52 0.18 145)"
                : appt.status === "cancelled"
                  ? "oklch(0.577 0.245 27.325)"
                  : "oklch(0.75 0.12 70)",
            border: "none",
          }}
        >
          {STATUS_LABELS[appt.status] || appt.status}
        </Badge>
      </div>
      {isActive && queueInfo && (
        <div
          className="rounded-lg p-2 mt-2 flex items-center gap-2"
          style={{ background: "oklch(0.52 0.18 145 / 0.1)" }}
        >
          <Clock
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "oklch(0.52 0.18 145)" }}
          />
          <p className="text-xs" style={{ color: "oklch(0.75 0.1 145)" }}>
            आप नंबर <strong>{String(queueInfo[0])}</strong> पर हैं
            {Number(queueInfo[1]) > 0 && ` • ${Number(queueInfo[1])} लोग पहले`}
          </p>
        </div>
      )}
    </div>
  );
}

function MyBookingsTab() {
  const { data: appointments = [], isLoading } = useGetMyAppointments();
  const { data: salons = [] } = useGetAllActiveSalons();

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-12"
        data-ocid="bookings.loading_state"
      >
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "oklch(0.52 0.18 145)" }}
        />
      </div>
    );
  }

  const sorted = [...appointments].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold" style={{ color: "oklch(0.95 0.02 145)" }}>
          मेरी बुकिंग ({sorted.length})
        </h2>
        <div
          className="flex items-center gap-1 text-xs"
          style={{ color: "oklch(0.52 0.18 145)" }}
        >
          <Bell className="w-3 h-3" />
          <span>नोटिफिकेशन चालू</span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12" data-ocid="bookings.empty_state">
          <Calendar
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.4 0.05 155)" }}
          />
          <p style={{ color: "oklch(0.6 0.05 145)" }}>कोई बुकिंग नहीं है</p>
          <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.04 155)" }}>
            "सैलून चुनें" टैब से बुक करें
          </p>
        </div>
      ) : (
        sorted.map((appt, idx) => (
          <div key={appt.id.toString()} data-ocid={`bookings.item.${idx + 1}`}>
            <AppointmentCard appt={appt} salons={salons} />
          </div>
        ))
      )}
    </div>
  );
}
