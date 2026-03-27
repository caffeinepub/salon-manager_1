import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Eye, EyeOff, Lock, Mail, Scissors, Shield } from "lucide-react";
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
        const isSet = await backend.adminPasswordIsSet();
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
      const ok = await backend.adminSetPassword(email, hash);
      if (ok) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "authenticated");
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
      const ok = await backend.adminLogin(email, hash);
      if (ok) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "authenticated");
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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "oklch(0.12 0.04 155)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "oklch(0.75 0.12 70)" }}
          >
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "oklch(0.95 0.02 145)" }}
          >
            Salon360
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.6 0.05 145)" }}>
            Super Admin Login
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "oklch(0.16 0.05 155)",
            border: "1px solid oklch(0.25 0.05 155)",
          }}
        >
          {isFirstLogin ? (
            <>
              <div
                className="flex items-center gap-2 mb-5 p-3 rounded-xl"
                style={{
                  background: "oklch(0.75 0.12 70 / 0.15)",
                  border: "1px solid oklch(0.75 0.12 70 / 0.3)",
                }}
              >
                <Shield
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: "oklch(0.75 0.12 70)" }}
                />
                <p className="text-sm" style={{ color: "oklch(0.9 0.05 145)" }}>
                  पहली बार login — अपना password set करें
                </p>
              </div>
              <form onSubmit={handleFirstLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label style={{ color: "oklch(0.75 0.05 145)" }}>Email</Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "oklch(0.5 0.05 145)" }}
                    />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      readOnly
                      style={{
                        background: "oklch(0.22 0.05 155)",
                        border: "1px solid oklch(0.32 0.05 155)",
                        color: "oklch(0.95 0.02 145)",
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: "oklch(0.75 0.05 145)" }}>
                    नया Password (कम से कम 8 characters)
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "oklch(0.5 0.05 145)" }}
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="कम से कम 8 characters"
                      className="pl-9 pr-10"
                      style={{
                        background: "oklch(0.22 0.05 155)",
                        border: "1px solid oklch(0.32 0.05 155)",
                        color: "oklch(0.95 0.02 145)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.5 0.05 145)" }}
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
                  <Label style={{ color: "oklch(0.75 0.05 145)" }}>
                    Password दोबारा डालें
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "oklch(0.5 0.05 145)" }}
                    />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Password फिर से डालें"
                      className="pl-9 pr-10"
                      style={{
                        background: "oklch(0.22 0.05 155)",
                        border: "1px solid oklch(0.32 0.05 155)",
                        color: "oklch(0.95 0.02 145)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.5 0.05 145)" }}
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
                  className="w-full font-semibold"
                  disabled={loading}
                  style={{ background: "oklch(0.75 0.12 70)", color: "white" }}
                >
                  {loading ? "Password Set हो रहा है..." : "Password Set करें"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2
                className="text-lg font-semibold mb-5"
                style={{ color: "oklch(0.95 0.02 145)" }}
              >
                Admin Login
              </h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label style={{ color: "oklch(0.75 0.05 145)" }}>Email</Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "oklch(0.5 0.05 145)" }}
                    />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      readOnly
                      style={{
                        background: "oklch(0.22 0.05 155)",
                        border: "1px solid oklch(0.32 0.05 155)",
                        color: "oklch(0.95 0.02 145)",
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label style={{ color: "oklch(0.75 0.05 145)" }}>
                    Password
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "oklch(0.5 0.05 145)" }}
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="अपना password डालें"
                      className="pl-9 pr-10"
                      style={{
                        background: "oklch(0.22 0.05 155)",
                        border: "1px solid oklch(0.32 0.05 155)",
                        color: "oklch(0.95 0.02 145)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.5 0.05 145)" }}
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
                  className="w-full font-semibold"
                  disabled={loading}
                  style={{ background: "oklch(0.52 0.18 145)", color: "white" }}
                >
                  {loading ? "Login हो रहा है..." : "Login करें"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p
          className="text-center text-xs mt-4"
          style={{ color: "oklch(0.4 0.04 155)" }}
        >
          सिर्फ Authorized Admin ही login कर सकते हैं
        </p>
      </div>
    </div>
  );
}
