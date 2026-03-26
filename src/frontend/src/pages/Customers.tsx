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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail, Phone, Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Customer,
  useCreateCustomer,
  useDeleteCustomer,
  useGetAllCustomers,
  useIsAdmin,
} from "../hooks/useQueries";

const defaultForm: Customer = { name: "", phone: "", email: "", notes: "" };

export default function Customers() {
  const { data: customers, isLoading } = useGetAllCustomers();
  const { data: isAdmin } = useIsAdmin();
  const createCustomer = useCreateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Customer>(defaultForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer.mutateAsync(form);
      toast.success("ग्राहक जोड़ा गया!");
      setOpen(false);
      setForm(defaultForm);
    } catch {
      toast.error("कुछ गलत हो गया।");
    }
  };

  const handleDelete = async (index: number) => {
    try {
      await deleteCustomer.mutateAsync(BigInt(index + 1));
      toast.success("ग्राहक हटाया गया।");
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
          <h1 className="font-display text-3xl font-bold">ग्राहक</h1>
          <p className="text-muted-foreground mt-1">सभी ग्राहकों की जानकारी</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="customers.open_modal_button"
                className="rounded-full gap-2"
                style={{ background: "oklch(0.34 0.075 192)", color: "white" }}
              >
                <Plus className="w-4 h-4" /> नया ग्राहक
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" data-ocid="customers.dialog">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  नया ग्राहक
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>पूरा नाम</Label>
                  <Input
                    data-ocid="customers.input"
                    required
                    placeholder="Priya Sharma"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                      placeholder="priya@email.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>नोट्स</Label>
                  <Textarea
                    data-ocid="customers.textarea"
                    placeholder="ग्राहक के बारे में कोई नोट..."
                    value={form.notes ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, notes: e.target.value }))
                    }
                    rows={2}
                  />
                </div>
                <Button
                  type="submit"
                  data-ocid="customers.submit_button"
                  disabled={createCustomer.isPending}
                  className="w-full rounded-full"
                  style={{
                    background: "oklch(0.34 0.075 192)",
                    color: "white",
                  }}
                >
                  {createCustomer.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> सेव...
                    </>
                  ) : (
                    "ग्राहक जोड़ें"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="customers.loading_state">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (customers ?? []).length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: "oklch(0.97 0.003 182)" }}
          data-ocid="customers.empty_state"
        >
          <Users
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: "oklch(0.73 0.11 75)" }}
          />
          <p className="font-medium">अभी कोई ग्राहक नहीं है</p>
          <p className="text-sm text-muted-foreground mt-1">पहला ग्राहक जोड़ें।</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(customers ?? []).map((c, idx) => (
            <motion.div
              key={`${c.name}-${c.phone}`}
              data-ocid={`customers.item.${idx + 1}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-background rounded-2xl p-5 shadow-card border"
              style={{ borderColor: "oklch(0.92 0.005 240)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-base"
                    style={{
                      background: "oklch(0.93 0.035 75)",
                      color: "oklch(0.34 0.075 192)",
                    }}
                  >
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{c.name}</p>
                  </div>
                </div>
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-ocid={`customers.delete_button.${idx + 1}`}
                        className="text-destructive hover:text-destructive -mt-1 -mr-1 h-8 w-8"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="customers.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>ग्राहक हटाएं?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {c.name} की सारी जानकारी हट जाएगी।
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="customers.cancel_button">
                          रद्द करें
                        </AlertDialogCancel>
                        <AlertDialogAction
                          data-ocid="customers.confirm_button"
                          onClick={() => handleDelete(idx)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          हटाएं
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{c.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{c.email || "—"}</span>
                </div>
                {c.notes && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {c.notes}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
