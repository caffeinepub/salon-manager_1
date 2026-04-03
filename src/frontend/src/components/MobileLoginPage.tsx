import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Loader2, Phone, Scissors } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppRole } from "../App";

interface Props {
  role: AppRole | null;
  onChangeRole?: () => void;
  onLoginSuccess: (phone: string) => void;
}

const roleLabels: Record<AppRole, { title: string; subtitle: string }> = {
  salon: {
    title: "सैलून मालिक लॉगिन",
    subtitle: "अपने सैलून को मैनेज करने के लिए मोबाइल नंबर डालें",
  },
  customer: {
    title: "ग्राहक लॉगिन",
    subtitle: "अपॉइंटमेंट बुक करने के लिए मोबाइल नंबर डालें",
  },
};

export default function MobileLoginPage({
  role,
  onChangeRole,
  onLoginSuccess,
}: Props) {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const info = role
    ? roleLabels[role]
    : { title: "Salon360Pro लॉगिन", subtitle: "मोबाइल नंबर से लॉगिन करें" };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, "");
    if (clean.length !== 10) {
      toast.error("10 अंकों का सही मोबाइल नंबर डालें");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(clean);
    }, 500);
  };

  const GOLD = "oklch(0.78 0.12 80)";
  const BG = "oklch(0.09 0.005 60)";
  const TEXT = "oklch(0.97 0.015 80)";
  const MUTED = "oklch(0.55 0.04 80)";

  return (
    <div className="min-h-screen flex" style={{ background: BG }}>
      {/* Left panel — desktop only */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{
          background: "oklch(0.11 0.01 70)",
          borderRight: "1px solid oklch(0.28 0.04 75 / 0.4)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center gold-glow"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
            }}
          >
            <Scissors
              className="w-5 h-5"
              style={{ color: "oklch(0.1 0.01 60)" }}
            />
          </div>
          <span className="font-display text-xl font-semibold gold-gradient-text">
            Salon360Pro
          </span>
        </div>
        <div className="space-y-6">
          <h1
            className="font-display text-5xl font-bold leading-tight"
            style={{ color: TEXT }}
          >
            भारत का
            <br />
            <span className="gold-gradient-text">स्मार्ट सैलून</span>
            <br />
            प्लेटफ़ॉर्म
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: MUTED }}>
            50+ सैलून, हजारों ग्राहक — सब एक जगह। अपॉइंटमेंट, Queue, सेवाएं — सब आसान।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {["A", "B", "C", "D"].map((l) => (
              <div
                key={l}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
                  color: "oklch(0.1 0.01 60)",
                }}
              >
                {l}
              </div>
            ))}
          </div>
          <span className="ml-2 text-sm" style={{ color: MUTED }}>
            1000+ सैलून मालिकों का भरोसा
          </span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center gold-glow"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
              }}
            >
              <Scissors
                className="w-5 h-5"
                style={{ color: "oklch(0.1 0.01 60)" }}
              />
            </div>
            <span className="font-display text-xl font-semibold gold-gradient-text">
              Salon360Pro
            </span>
          </div>

          {onChangeRole && (
            <button
              type="button"
              onClick={onChangeRole}
              className="flex items-center gap-1 text-sm transition-colors"
              style={{ color: MUTED }}
              data-ocid="auth.link"
            >
              <ChevronLeft className="w-4 h-4" />
              वापस जाएं
            </button>
          )}

          <div>
            <h2
              className="font-display text-3xl font-bold"
              style={{ color: TEXT }}
            >
              {info.title}
            </h2>
            <p className="mt-2" style={{ color: MUTED }}>
              {info.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-6 rounded-2xl space-y-5 card-dark">
              <div className="space-y-2">
                <p
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.75 0.08 80)" }}
                >
                  मोबाइल नंबर
                </p>
                <div className="relative">
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm font-medium"
                    style={{ color: GOLD }}
                  >
                    <Phone className="w-4 h-4" />
                    <span>+91</span>
                  </div>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="10 अंकों का नंबर"
                    required
                    autoFocus
                    data-ocid="auth.input"
                    className="pl-16 h-12 text-base rounded-xl"
                    style={{
                      background: "oklch(0.17 0.012 60)",
                      border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                      color: TEXT,
                    }}
                  />
                </div>
                <p className="text-xs" style={{ color: MUTED }}>
                  जैसे: 9876543210 — बिना 0 या +91 के
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || phone.replace(/\D/g, "").length !== 10}
                data-ocid="auth.primary_button"
                className="w-full h-12 text-base rounded-full font-semibold gold-glow"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
                  color: "oklch(0.09 0.005 60)",
                  border: "none",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    लॉगिन हो रहा है...
                  </>
                ) : (
                  "लॉगिन करें"
                )}
              </Button>
            </div>
          </form>

          <p
            className="text-xs text-center"
            style={{ color: "oklch(0.4 0.03 70)" }}
          >
            लॉगिन करके आप हमारी सेवा की शर्तों से सहमत होते हैं।
          </p>
        </div>
      </div>
    </div>
  );
}
