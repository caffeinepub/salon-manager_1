import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

const ADMIN_SESSION_KEY = "salon360_admin_session";
const ADMIN_EMAIL = "amitkrji498@gmail.com";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}salon360_salt`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "authenticated";
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

interface Props {
  onLoginSuccess: () => void;
}

// Design tokens
const BG = "oklch(0.09 0.005 60)";
const CARD = "oklch(0.13 0.008 60)";
const CARD_BORDER = "1px solid oklch(0.28 0.04 75 / 0.6)";
const GOLD = "oklch(0.78 0.12 80)";
const TEXT = "oklch(0.97 0.015 80)";
const MUTED = "oklch(0.55 0.04 80)";
const INPUT_BG = "oklch(0.17 0.012 60)";
const INPUT_BORDER = "1px solid oklch(0.32 0.06 78 / 0.5)";

export default function AdminLoginPage({ onLoginSuccess }: Props) {
  const { actor: backend } = useActor();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkPasswordSet() {
      if (!backend) return;
      try {
        const isSet = await (backend as any).adminPasswordIsSet();
        setIsFirstLogin(!isSet);
      } catch {
        setIsFirstLogin(false);
      }
    }
    checkPasswordSet();
  }, [backend]);

  const handleFirstLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== ADMIN_EMAIL) {
      toast.error("यह email Super Admin नहीं है");
      return;
    }
    if (password.length < 8) {
      toast.error("Password कम से कम 8 characters का होना चाहिए");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("दोनों passwords match नहीं हैं");
      return;
    }
    setLoading(true);
    try {
      const hash = await hashPassword(password);
      if (!backend) {
        toast.error("सर्वर से कनेक्शन नहीं हो पाया। पेज reload करें।");
        setLoading(false);
        return;
      }
      const ok = await (backend as any).adminSetPassword(email, hash);
      if (ok) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "authenticated");
        localStorage.setItem("salon360_admin_hash", hash);
        toast.success("Password set हो गया! Admin Panel खुल रहा है...");
        onLoginSuccess();
      } else {
        toast.error("Password set नहीं हुआ। दोबारा कोशिश करें।");
      }
    } catch {
      toast.error("कुछ गलत हुआ। दोबारा कोशिश करें।");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== ADMIN_EMAIL) {
      toast.error("यह email Super Admin नहीं है");
      return;
    }
    if (password.length < 8) {
      toast.error("Password कम से कम 8 characters का होना चाहिए");
      return;
    }
    setLoading(true);
    try {
      const hash = await hashPassword(password);
      if (!backend) {
        toast.error("सर्वर से कनेक्शन नहीं हो पाया। पेज reload करें।");
        setLoading(false);
        return;
      }
      const ok = await (backend as any).adminLogin(email, hash);
      if (ok) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "authenticated");
        localStorage.setItem("salon360_admin_hash", hash);
        toast.success("Login सफल! Admin Panel खुल रहा है...");
        onLoginSuccess();
      } else {
        toast.error("Email या Password गलत है");
      }
    } catch {
      toast.error("कुछ गलत हुआ। दोबारा कोशिश करें।");
    } finally {
      setLoading(false);
    }
  };

  const goldGradient =
    "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: BG }}
    >
      {/* Subtle salon watermark background */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-bold select-none"
          style={{ color: "oklch(0.78 0.12 80 / 0.03)", userSelect: "none" }}
        >
          ✂
        </div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 gold-glow"
            style={{ background: goldGradient }}
          >
            <Crown
              className="w-8 h-8"
              style={{ color: "oklch(0.09 0.005 60)" }}
            />
          </div>
          <h1 className="text-2xl font-bold font-display gold-gradient-text">
            Salon360Pro
          </h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            Super Admin Login
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: CARD, border: CARD_BORDER }}
        >
          {isFirstLogin ? (
            <>
              <div
                className="flex items-center gap-2 mb-5 p-3 rounded-xl"
                style={{
                  background: "oklch(0.78 0.12 80 / 0.1)",
                  border: "1px solid oklch(0.78 0.12 80 / 0.3)",
                }}
              >
                <Shield
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: GOLD }}
                />
                <p className="text-sm" style={{ color: TEXT }}>
                  पहली बार login — अपना password set करें
                </p>
              </div>
              <form onSubmit={handleFirstLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label style={{ color: MUTED }}>Email</Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: MUTED }}
                    />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      readOnly
                      style={{
                        background: INPUT_BG,
                        border: INPUT_BORDER,
                        color: TEXT,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: MUTED }}>
                    नया Password (कम से कम 8 characters)
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: MUTED }}
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="कम से कम 8 characters"
                      className="pl-9 pr-10"
                      style={{
                        background: INPUT_BG,
                        border: INPUT_BORDER,
                        color: TEXT,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: MUTED }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: MUTED }}>Password दोबारा डालें</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: MUTED }}
                    />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Password फिर से डालें"
                      className="pl-9 pr-10"
                      style={{
                        background: INPUT_BG,
                        border: INPUT_BORDER,
                        color: TEXT,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: MUTED }}
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full font-semibold gold-glow"
                  disabled={loading}
                  style={{
                    background: goldGradient,
                    color: "oklch(0.09 0.005 60)",
                    border: "none",
                  }}
                >
                  {loading ? "Password Set हो रहा है..." : "Password Set करें"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-5 gold-gradient-text">
                Admin Login
              </h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label style={{ color: MUTED }}>Email</Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: MUTED }}
                    />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      readOnly
                      style={{
                        background: INPUT_BG,
                        border: INPUT_BORDER,
                        color: TEXT,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: MUTED }}>Password</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: MUTED }}
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="अपना password डालें"
                      className="pl-9 pr-10"
                      style={{
                        background: INPUT_BG,
                        border: INPUT_BORDER,
                        color: TEXT,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: MUTED }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full font-semibold gold-glow"
                  disabled={loading}
                  style={{
                    background: goldGradient,
                    color: "oklch(0.09 0.005 60)",
                    border: "none",
                  }}
                >
                  {loading ? "Login हो रहा है..." : "Login करें"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p
          className="text-center text-xs mt-4"
          style={{ color: "oklch(0.35 0.03 70)" }}
        >
          सिर्फ Authorized Admin ही login कर सकते हैं
        </p>
      </div>
    </div>
  );
}
