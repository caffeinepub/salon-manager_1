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
import {
  Clock,
  IndianRupee,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Service,
  useCreateService,
  useDeleteService,
  useGetAllServices,
  useIsAdmin,
} from "../hooks/useQueries";

const defaultForm: Service = {
  name: "",
  duration: BigInt(30),
  price: 0,
  description: "",
};

export default function Services() {
  const { data: services, isLoading } = useGetAllServices();
  const { data: isAdmin } = useIsAdmin();
  const createService = useCreateService();
  const deleteService = useDeleteService();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Service>(defaultForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createService.mutateAsync(form);
      toast.success("सेवा जोड़ी गई!");
      setOpen(false);
      setForm(defaultForm);
    } catch {
      toast.error("कुछ गलत हो गया।");
    }
  };

  const handleDelete = async (index: number) => {
    try {
      await deleteService.mutateAsync(BigInt(index + 1));
      toast.success("सेवा हटाई गई।");
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
          <h1 className="font-display text-3xl font-bold">सेवाएं</h1>
          <p className="text-muted-foreground mt-1">
            सैलून की सभी सेवाएं प्रबंधित करें
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="services.open_modal_button"
                className="rounded-full gap-2"
                style={{ background: "oklch(0.34 0.075 192)", color: "white" }}
              >
                <Plus className="w-4 h-4" /> नई सेवा
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" data-ocid="services.dialog">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  नई सेवा
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>सेवा का नाम</Label>
                  <Input
                    data-ocid="services.input"
                    required
                    placeholder="Hair Cut & Style"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>समय (मिनट)</Label>
                    <Input
                      type="number"
                      required
                      min={1}
                      placeholder="45"
                      value={Number(form.duration)}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          duration: BigInt(e.target.value || 0),
                        }))
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
                </div>
                <div className="space-y-1.5">
                  <Label>विवरण</Label>
                  <Textarea
                    data-ocid="services.textarea"
                    placeholder="सेवा का विवरण..."
                    value={form.description ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    rows={2}
                  />
                </div>
                <Button
                  type="submit"
                  data-ocid="services.submit_button"
                  disabled={createService.isPending}
                  className="w-full rounded-full"
                  style={{
                    background: "oklch(0.34 0.075 192)",
                    color: "white",
                  }}
                >
                  {createService.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> सेव...
                    </>
                  ) : (
                    "सेवा जोड़ें"
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
          data-ocid="services.loading_state"
        >
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (services ?? []).length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: "oklch(0.97 0.003 182)" }}
          data-ocid="services.empty_state"
        >
          <Sparkles
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: "oklch(0.73 0.11 75)" }}
          />
          <p className="font-medium">अभी कोई सेवा नहीं है</p>
          <p className="text-sm text-muted-foreground mt-1">पहली सेवा जोड़ें।</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(services ?? []).map((s, idx) => (
            <motion.div
              key={s.name}
              data-ocid={`services.item.${idx + 1}`}
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
                      data-ocid={`services.delete_button.${idx + 1}`}
                      className="absolute top-3 right-3 text-destructive hover:text-destructive h-8 w-8"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="services.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle>सेवा हटाएं?</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{s.name}" हमेशा के लिए हट जाएगी।
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="services.cancel_button">
                        रद्द करें
                      </AlertDialogCancel>
                      <AlertDialogAction
                        data-ocid="services.confirm_button"
                        onClick={() => handleDelete(idx)}
                        className="bg-destructive text-destructive-foreground"
                      >
                        हटाएं
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "oklch(0.93 0.03 182)" }}
              >
                <Sparkles
                  className="w-6 h-6"
                  style={{ color: "oklch(0.34 0.075 192)" }}
                />
              </div>
              <h3 className="font-semibold mb-2 pr-8">{s.name}</h3>
              {s.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {s.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-auto">
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock
                    className="w-4 h-4"
                    style={{ color: "oklch(0.73 0.11 75)" }}
                  />
                  <span>{Number(s.duration)} min</span>
                </div>
                <div
                  className="flex items-center gap-1 text-sm font-semibold"
                  style={{ color: "oklch(0.34 0.075 192)" }}
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{s.price.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
