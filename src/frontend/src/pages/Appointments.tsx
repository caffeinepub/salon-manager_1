import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Appointment,
  AppointmentStatus,
  useCreateAppointment,
  useDeleteAppointment,
  useGetAllAppointments,
  useIsAdmin,
} from "../hooks/useQueries";

const statusConfig: Record<
  AppointmentStatus,
  { label: string; color: string }
> = {
  [AppointmentStatus.pending]: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  [AppointmentStatus.confirmed]: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  [AppointmentStatus.completed]: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  [AppointmentStatus.cancelled]: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

const defaultForm: Appointment = {
  customerName: "",
  serviceName: "",
  staffName: "",
  date: "",
  time: "",
  status: AppointmentStatus.pending,
  notes: "",
  price: 0,
};

export default function Appointments() {
  const { data: appointments, isLoading } = useGetAllAppointments();
  const { data: isAdmin } = useIsAdmin();
  const createAppt = useCreateAppointment();
  const deleteAppt = useDeleteAppointment();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Appointment>(defaultForm);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = (appointments ?? []).filter((a) => {
    const matchStatus = filter === "all" || a.status === filter;
    const matchSearch = a.customerName
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppt.mutateAsync(form);
      toast.success("अपॉइंटमेंट बना दिया!");
      setOpen(false);
      setForm(defaultForm);
    } catch {
      toast.error("कुछ गलत हो गया।");
    }
  };

  const handleDelete = async (index: number) => {
    try {
      await deleteAppt.mutateAsync(BigInt(index + 1));
      toast.success("अपॉइंटमेंट हटा दिया।");
    } catch {
      toast.error("हटाने में समस्या हुई।");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-bold">अपॉइंटमेंट</h1>
          <p className="text-muted-foreground mt-1">सभी बुकिंग देखें और प्रबंधित करें</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="appointments.open_modal_button"
                className="rounded-full gap-2"
                style={{ background: "oklch(0.34 0.075 192)", color: "white" }}
              >
                <Plus className="w-4 h-4" /> नई बुकिंग
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-lg"
              data-ocid="appointments.dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  नई अपॉइंटमेंट
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>ग्राहक का नाम</Label>
                    <Input
                      data-ocid="appointments.input"
                      required
                      placeholder="Priya Sharma"
                      value={form.customerName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, customerName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>सेवा</Label>
                    <Input
                      required
                      placeholder="Hair Cut"
                      value={form.serviceName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, serviceName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>स्टाफ</Label>
                    <Input
                      required
                      placeholder="Meena Ji"
                      value={form.staffName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, staffName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>कीमत (₹)</Label>
                    <Input
                      type="number"
                      required
                      min={0}
                      placeholder="500"
                      value={form.price}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          price: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>तारीख</Label>
                    <Input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>समय</Label>
                    <Input
                      type="time"
                      required
                      value={form.time}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, time: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>स्थिति</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, status: v as AppointmentStatus }))
                    }
                  >
                    <SelectTrigger data-ocid="appointments.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AppointmentStatus).map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusConfig[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>नोट्स</Label>
                  <Textarea
                    data-ocid="appointments.textarea"
                    placeholder="कोई विशेष जानकारी..."
                    value={form.notes ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, notes: e.target.value }))
                    }
                    rows={2}
                  />
                </div>
                <Button
                  type="submit"
                  data-ocid="appointments.submit_button"
                  disabled={createAppt.isPending}
                  className="w-full rounded-full"
                  style={{
                    background: "oklch(0.34 0.075 192)",
                    color: "white",
                  }}
                >
                  {createAppt.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> सेव हो
                      रहा है...
                    </>
                  ) : (
                    "अपॉइंटमेंट बनाएं"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="appointments.search_input"
            placeholder="ग्राहक खोजें..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...Object.values(AppointmentStatus)].map((s) => (
            <button
              type="button"
              key={s}
              data-ocid={`appointments.${s}.tab`}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                filter === s
                  ? "border-transparent text-white"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
              style={
                filter === s ? { background: "oklch(0.34 0.075 192)" } : {}
              }
            >
              {s === "all"
                ? "सभी"
                : (statusConfig[s as AppointmentStatus]?.label ?? s)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="appointments.loading_state">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: "oklch(0.97 0.003 182)" }}
          data-ocid="appointments.empty_state"
        >
          <Calendar
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: "oklch(0.73 0.11 75)" }}
          />
          <p className="font-medium">कोई अपॉइंटमेंट नहीं मिली</p>
          <p className="text-sm text-muted-foreground mt-1">
            फ़िल्टर बदलें या नई बुकिंग करें।
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((appt, idx) => {
            const cfg = statusConfig[appt.status];
            const originalIndex = (appointments ?? []).indexOf(appt);
            return (
              <motion.div
                key={`${appt.customerName}-${appt.date}-${appt.time}`}
                data-ocid={`appointments.item.${idx + 1}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-background shadow-xs border"
                style={{ borderColor: "oklch(0.92 0.005 240)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0"
                  style={{
                    background: "oklch(0.93 0.035 75)",
                    color: "oklch(0.34 0.075 192)",
                  }}
                >
                  {appt.customerName[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 lg:grid-cols-4 gap-1">
                  <div>
                    <p className="font-medium text-sm truncate">
                      {appt.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Staff: {appt.staffName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">{appt.serviceName}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{appt.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">{appt.date}</p>
                    <p className="text-xs text-muted-foreground">{appt.time}</p>
                  </div>
                  <div className="flex items-center">
                    <Badge className={`text-xs border ${cfg.color}`}>
                      {cfg.label}
                    </Badge>
                  </div>
                </div>
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-ocid={`appointments.delete_button.${idx + 1}`}
                        className="text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="appointments.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>अपॉइंटमेंट हटाएं?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {appt.customerName} की अपॉइंटमेंट ({appt.date}) हमेशा के
                          लिए हट जाएगी।
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="appointments.cancel_button">
                          रद्द करें
                        </AlertDialogCancel>
                        <AlertDialogAction
                          data-ocid="appointments.confirm_button"
                          onClick={() => handleDelete(originalIndex)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          हटाएं
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
