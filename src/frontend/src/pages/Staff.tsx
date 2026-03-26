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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Mail,
  Phone,
  Plus,
  Star,
  Trash2,
  UserCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Staff,
  useCreateStaff,
  useDeleteStaff,
  useGetAllStaff,
  useIsAdmin,
} from "../hooks/useQueries";

const defaultForm: Staff = {
  name: "",
  role: "",
  specialty: "",
  phone: "",
  email: "",
};

export default function StaffPage() {
  const { data: staff, isLoading } = useGetAllStaff();
  const { data: isAdmin } = useIsAdmin();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Staff>(defaultForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff.mutateAsync(form);
      toast.success("स्टाफ जोड़ा गया!");
      setOpen(false);
      setForm(defaultForm);
    } catch {
      toast.error("कुछ गलत हो गया।");
    }
  };

  const handleDelete = async (index: number) => {
    try {
      await deleteStaff.mutateAsync(BigInt(index + 1));
      toast.success("स्टाफ हटाया गया।");
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
          <h1 className="font-display text-3xl font-bold">स्टाफ</h1>
          <p className="text-muted-foreground mt-1">
            टीम के सभी सदस्यों की जानकारी
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="staff.open_modal_button"
                className="rounded-full gap-2"
                style={{ background: "oklch(0.34 0.075 192)", color: "white" }}
              >
                <Plus className="w-4 h-4" /> नया स्टाफ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" data-ocid="staff.dialog">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  नया स्टाफ सदस्य
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>पूरा नाम</Label>
                  <Input
                    data-ocid="staff.input"
                    required
                    placeholder="Meena Sharma"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>भूमिका (Role)</Label>
                    <Input
                      required
                      placeholder="Hairstylist"
                      value={form.role}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, role: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>विशेषता</Label>
                    <Input
                      placeholder="Bridal Makeup"
                      value={form.specialty}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, specialty: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>फ़ोन</Label>
                    <Input
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>ईमेल</Label>
                    <Input
                      type="email"
                      placeholder="meena@salon.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  data-ocid="staff.submit_button"
                  disabled={createStaff.isPending}
                  className="w-full rounded-full"
                  style={{
                    background: "oklch(0.34 0.075 192)",
                    color: "white",
                  }}
                >
                  {createStaff.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> सेव...
                    </>
                  ) : (
                    "स्टाफ जोड़ें"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {isLoading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-ocid="staff.loading_state"
        >
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : (staff ?? []).length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: "oklch(0.97 0.003 182)" }}
          data-ocid="staff.empty_state"
        >
          <UserCheck
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: "oklch(0.73 0.11 75)" }}
          />
          <p className="font-medium">अभी कोई स्टाफ नहीं है</p>
          <p className="text-sm text-muted-foreground mt-1">
            पहला स्टाफ सदस्य जोड़ें।
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(staff ?? []).map((s, idx) => (
            <motion.div
              key={s.name}
              data-ocid={`staff.item.${idx + 1}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-background rounded-2xl p-5 shadow-card border relative"
              style={{ borderColor: "oklch(0.92 0.005 240)" }}
            >
              {isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-ocid={`staff.delete_button.${idx + 1}`}
                      className="absolute top-3 right-3 text-destructive hover:text-destructive h-8 w-8"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="staff.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle>स्टाफ हटाएं?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {s.name} को हटाया जाएगा।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="staff.cancel_button">
                        रद्द करें
                      </AlertDialogCancel>
                      <AlertDialogAction
                        data-ocid="staff.confirm_button"
                        onClick={() => handleDelete(idx)}
                        className="bg-destructive text-destructive-foreground"
                      >
                        हटाएं
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                  style={{
                    background: "oklch(0.93 0.035 75)",
                    color: "oklch(0.34 0.075 192)",
                  }}
                >
                  {s.name[0]?.toUpperCase()}
                </div>
                <div className="pr-8">
                  <h3 className="font-semibold">{s.name}</h3>
                  <p
                    className="text-sm"
                    style={{ color: "oklch(0.34 0.075 192)" }}
                  >
                    {s.role}
                  </p>
                </div>
              </div>
              {s.specialty && (
                <div className="flex items-center gap-2 mb-3">
                  <Star
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.73 0.11 75)" }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {s.specialty}
                  </span>
                </div>
              )}
              <div
                className="space-y-1.5 pt-3 border-t"
                style={{ borderColor: "oklch(0.92 0.005 240)" }}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{s.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{s.email || "—"}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
