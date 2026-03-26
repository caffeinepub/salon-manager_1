import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Scissors,
  Store,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddSalonService,
  useDeleteSalonService,
  useGetMySalon,
  useGetSalonAppointmentsForDate,
  useGetSalonServices,
  useRegisterSalon,
  useUpdateAppointmentStatus,
  useUpdateMySalon,
} from "../hooks/useQueries";

const STATUS_LABELS: Record<string, string> = {
  pending: "प्रतीक्षा",
  confirmed: "कन्फर्म",
  inprogress: "चल रहा",
  completed: "पूरा",
  cancelled: "रद्द",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  inprogress: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

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

function getTrialDaysRemaining(trialStartDate: bigint) {
  const started = Number(trialStartDate) / 1_000_000;
  const elapsed = Math.floor((Date.now() - started) / (1000 * 60 * 60 * 24));
  return Math.max(0, 7 - elapsed);
}

interface Props {
  onSwitchRole: () => void;
}

export default function SalonOwnerDashboard({ onSwitchRole }: Props) {
  const { clear } = useInternetIdentity();
  const { data: salon, isLoading: salonLoading } = useGetMySalon();
  const today = getTodayString();

  if (salonLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.12 0.04 155)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "oklch(0.52 0.18 145)" }}
          />
          <p className="text-sm" style={{ color: "oklch(0.75 0.05 145)" }}>
            लोड हो रहा है...
          </p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <RegisterSalonForm
        onSwitchRole={onSwitchRole}
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
      {/* Header */}
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
              {salon.name}
            </p>
            <p className="text-xs" style={{ color: "oklch(0.6 0.05 145)" }}>
              {salon.city}
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
          data-ocid="salon.close_button"
          style={{ color: "oklch(0.6 0.05 145)" }}
        >
          <LogOut className="w-4 h-4 mr-1" />
          बाहर
        </Button>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <Tabs defaultValue="queue">
          <TabsList
            className="w-full mb-4"
            style={{ background: "oklch(0.18 0.05 155)" }}
          >
            <TabsTrigger value="queue" className="flex-1" data-ocid="salon.tab">
              आज की Queue
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="flex-1"
              data-ocid="salon.tab"
            >
              सेवाएं
            </TabsTrigger>
            <TabsTrigger value="info" className="flex-1" data-ocid="salon.tab">
              जानकारी
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            <QueueTab salonId={salon.id} today={today} />
          </TabsContent>

          <TabsContent value="services">
            <ServicesTab salonId={salon.id} />
          </TabsContent>

          <TabsContent value="info">
            <InfoTab salon={salon} />
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

function RegisterSalonForm({
  onLogout,
}: { onSwitchRole?: () => void; onLogout: () => void }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    city: "",
  });
  const { mutate, isPending } = useRegisterSalon();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.city) {
      toast.error("नाम और शहर जरूरी है");
      return;
    }
    mutate(form, {
      onSuccess: () => toast.success("सैलून रजिस्टर हो गया!"),
      onError: () => toast.error("कुछ गलत हुआ, दोबारा कोशिश करें"),
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
              <Store
                className="w-6 h-6"
                style={{ color: "oklch(0.52 0.18 145)" }}
              />
            </div>
            <CardTitle
              className="text-center"
              style={{ color: "oklch(0.95 0.02 145)" }}
            >
              अपना सैलून रजिस्टर करें
            </CardTitle>
            <p
              className="text-center text-sm"
              style={{ color: "oklch(0.6 0.05 145)" }}
            >
              7 दिन का फ्री ट्रायल शुरू होगा
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label
                  className="text-sm"
                  style={{ color: "oklch(0.75 0.05 145)" }}
                >
                  सैलून का नाम *
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="जैसे: राज हेयर सैलून"
                  data-ocid="salon.input"
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
                  शहर *
                </Label>
                <Input
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                  placeholder="जैसे: मुंबई, दिल्ली"
                  data-ocid="salon.input"
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
                  पता
                </Label>
                <Input
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="दुकान का पूरा पता"
                  data-ocid="salon.input"
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
                  फ़ोन नंबर
                </Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="9876543210"
                  type="tel"
                  data-ocid="salon.input"
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
                data-ocid="salon.submit_button"
                style={{ background: "oklch(0.52 0.18 145)", color: "white" }}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isPending ? "रजिस्टर हो रहा है..." : "रजिस्टर करें"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QueueTab({ salonId, today }: { salonId: bigint; today: string }) {
  const {
    data: appointments = [],
    isLoading,
    refetch,
  } = useGetSalonAppointmentsForDate(salonId, today);
  const { mutate: updateStatus, isPending } = useUpdateAppointmentStatus();

  const sorted = [...appointments].sort(
    (a, b) => Number(a.queueNumber) - Number(b.queueNumber),
  );

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        data-ocid="queue.loading_state"
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
      <div className="flex items-center justify-between">
        <h2 className="font-semibold" style={{ color: "oklch(0.95 0.02 145)" }}>
          आज की अपॉइंटमेंट ({sorted.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          data-ocid="queue.secondary_button"
          style={{ color: "oklch(0.52 0.18 145)" }}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12" data-ocid="queue.empty_state">
          <Clock
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.4 0.05 155)" }}
          />
          <p style={{ color: "oklch(0.6 0.05 145)" }}>आज कोई अपॉइंटमेंट नहीं</p>
        </div>
      ) : (
        sorted.map((appt, idx) => (
          <div
            key={appt.id.toString()}
            className="rounded-xl p-4"
            data-ocid={`queue.item.${idx + 1}`}
            style={{
              background: "oklch(0.18 0.05 155)",
              border: "1px solid oklch(0.28 0.05 155)",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{
                    background: "oklch(0.52 0.18 145 / 0.2)",
                    color: "oklch(0.52 0.18 145)",
                  }}
                >
                  #{String(appt.queueNumber)}
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "oklch(0.95 0.02 145)" }}
                  >
                    {appt.customerName}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.6 0.05 145)" }}
                  >
                    {appt.serviceName} • {appt.customerPhone}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[appt.status] || "bg-gray-100 text-gray-800"}`}
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
                  onClick={() =>
                    updateStatus(
                      {
                        appointmentId: appt.id,
                        newStatus: STATUS_NEXT[appt.status],
                        salonId,
                        date: today,
                      },
                      {
                        onSuccess: () => toast.success("स्टेटस बदल गया"),
                        onError: () => toast.error("कुछ गलत हुआ"),
                      },
                    )
                  }
                  style={{ background: "oklch(0.52 0.18 145)", color: "white" }}
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

function ServicesTab({ salonId }: { salonId: bigint }) {
  const { data: services = [], isLoading } = useGetSalonServices(salonId);
  const { mutate: addService, isPending: adding } = useAddSalonService();
  const { mutate: deleteService, isPending: deleting } =
    useDeleteSalonService();
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
      <div
        className="flex justify-center py-12"
        data-ocid="services.loading_state"
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
      <div className="flex items-center justify-between">
        <h2 className="font-semibold" style={{ color: "oklch(0.95 0.02 145)" }}>
          सेवाएं ({services.length})
        </h2>
        <Button
          size="sm"
          onClick={() => setShowForm((s) => !s)}
          data-ocid="services.primary_button"
          style={{ background: "oklch(0.52 0.18 145)", color: "white" }}
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
            background: "oklch(0.18 0.05 155)",
            border: "1px solid oklch(0.28 0.05 155)",
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label
                className="text-xs"
                style={{ color: "oklch(0.75 0.05 145)" }}
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
                  background: "oklch(0.22 0.05 155)",
                  border: "1px solid oklch(0.32 0.05 155)",
                  color: "oklch(0.95 0.02 145)",
                }}
              />
            </div>
            <div>
              <Label
                className="text-xs"
                style={{ color: "oklch(0.75 0.05 145)" }}
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
                  background: "oklch(0.22 0.05 155)",
                  border: "1px solid oklch(0.32 0.05 155)",
                  color: "oklch(0.95 0.02 145)",
                }}
              />
            </div>
            <div>
              <Label
                className="text-xs"
                style={{ color: "oklch(0.75 0.05 145)" }}
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
                  background: "oklch(0.22 0.05 155)",
                  border: "1px solid oklch(0.32 0.05 155)",
                  color: "oklch(0.95 0.02 145)",
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
              style={{ background: "oklch(0.52 0.18 145)", color: "white" }}
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
              style={{ color: "oklch(0.6 0.05 145)" }}
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
            style={{ color: "oklch(0.4 0.05 155)" }}
          />
          <p style={{ color: "oklch(0.6 0.05 145)" }}>कोई सेवा नहीं जोड़ी गई</p>
          <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.04 155)" }}>
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
              background: "oklch(0.18 0.05 155)",
              border: "1px solid oklch(0.28 0.05 155)",
            }}
          >
            <div>
              <p
                className="font-medium text-sm"
                style={{ color: "oklch(0.95 0.02 145)" }}
              >
                {svc.name}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.6 0.05 145)" }}>
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
  salon,
}: {
  salon: NonNullable<ReturnType<typeof useGetMySalon>["data"]> extends infer T
    ? T
    : never;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: salon.name,
    address: salon.address,
    phone: salon.phone,
    city: salon.city,
  });
  const { mutate: update, isPending } = useUpdateMySalon();

  const trialDays = getTrialDaysRemaining(salon.trialStartDate);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    update(form, {
      onSuccess: () => {
        toast.success("जानकारी सेव हो गई");
        setEditing(false);
      },
      onError: () => toast.error("कुछ गलत हुआ"),
    });
  };

  return (
    <div className="space-y-4">
      {/* Trial/Subscription status */}
      <div
        className="rounded-xl p-4"
        style={{
          background:
            trialDays > 0
              ? "oklch(0.52 0.18 145 / 0.15)"
              : salon.subscriptionActive
                ? "oklch(0.52 0.18 145 / 0.15)"
                : "oklch(0.577 0.245 27.325 / 0.15)",
          border: `1px solid ${trialDays > 0 ? "oklch(0.52 0.18 145 / 0.4)" : salon.subscriptionActive ? "oklch(0.52 0.18 145 / 0.4)" : "oklch(0.577 0.245 27.325 / 0.4)"}`,
        }}
      >
        <div className="flex items-center gap-2">
          {trialDays > 0 ? (
            <>
              <CheckCircle
                className="w-5 h-5"
                style={{ color: "oklch(0.52 0.18 145)" }}
              />
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.95 0.02 145)" }}
                >
                  फ्री ट्रायल चल रहा है
                </p>
                <p className="text-xs" style={{ color: "oklch(0.6 0.05 145)" }}>
                  {trialDays} दिन बाकी
                </p>
              </div>
            </>
          ) : salon.subscriptionActive ? (
            <>
              <CheckCircle
                className="w-5 h-5"
                style={{ color: "oklch(0.52 0.18 145)" }}
              />
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.95 0.02 145)" }}
                >
                  सब्सक्रिप्शन सक्रिय
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
                  style={{ color: "oklch(0.95 0.02 145)" }}
                >
                  ट्रायल खत्म
                </p>
                <p className="text-xs" style={{ color: "oklch(0.6 0.05 145)" }}>
                  एडमिन से सब्सक्रिप्शन लें
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
          background: "oklch(0.18 0.05 155)",
          border: "1px solid oklch(0.28 0.05 155)",
        }}
      >
        {!editing ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3
                className="font-semibold"
                style={{ color: "oklch(0.95 0.02 145)" }}
              >
                सैलून की जानकारी
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(true)}
                data-ocid="info.edit_button"
                style={{ color: "oklch(0.52 0.18 145)" }}
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
                  <span style={{ color: "oklch(0.6 0.05 145)", minWidth: 60 }}>
                    {label}:
                  </span>
                  <span style={{ color: "oklch(0.9 0.02 145)" }}>
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
              style={{ color: "oklch(0.95 0.02 145)" }}
            >
              जानकारी बदलें
            </h3>
            {[
              { key: "name", label: "नाम", placeholder: "सैलून का नाम" },
              { key: "city", label: "शहर", placeholder: "शहर" },
              { key: "address", label: "पता", placeholder: "पूरा पता" },
              { key: "phone", label: "फ़ोन", placeholder: "फ़ोन नंबर" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <Label
                  className="text-xs"
                  style={{ color: "oklch(0.75 0.05 145)" }}
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
                    background: "oklch(0.22 0.05 155)",
                    border: "1px solid oklch(0.32 0.05 155)",
                    color: "oklch(0.95 0.02 145)",
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
                style={{ background: "oklch(0.52 0.18 145)", color: "white" }}
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
                style={{ color: "oklch(0.6 0.05 145)" }}
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
