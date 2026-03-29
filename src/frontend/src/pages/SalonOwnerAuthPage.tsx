import {
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Scissors,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

type Mode = "login" | "register" | "set_password" | "pending" | "success";

interface Props {
  onBack: () => void;
  onLoginSuccess: (phone: string) => void;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}salon360_salt`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const BG = "oklch(0.12 0.04 155)";
const CARD = "oklch(0.18 0.05 155)";
const BORDER = "1px solid oklch(0.28 0.05 155)";
const ACCENT = "oklch(0.52 0.18 145)";
const TEXT = "oklch(0.95 0.02 145)";
const MUTED = "oklch(0.6 0.05 145)";
const INPUT_BG = "oklch(0.22 0.05 155)";
const INPUT_BORDER = "1px solid oklch(0.32 0.05 155)";

function FieldLabel({
  htmlFor,
  children,
}: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium"
      style={{ color: MUTED }}
    >
      {children}
    </label>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  ocid,
  readOnly,
}: {
  id: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  ocid?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      data-ocid={ocid}
      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
      style={{
        background: readOnly ? "oklch(0.20 0.05 155)" : INPUT_BG,
        border: INPUT_BORDER,
        color: TEXT,
      }}
    />
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  ocid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ocid?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-ocid={ocid}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-10"
          style={{ background: INPUT_BG, border: INPUT_BORDER, color: TEXT }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
          style={{ color: MUTED }}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function PhoneField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>मोबाइल नंबर</FieldLabel>
      <div
        className="flex rounded-xl overflow-hidden"
        style={{ border: INPUT_BORDER }}
      >
        <span
          className="px-3 py-3 text-sm flex items-center flex-shrink-0"
          style={{ background: "oklch(0.20 0.05 155)", color: MUTED }}
        >
          +91
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={value}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder={placeholder ?? "10 अंकों का नंबर"}
          data-ocid="salon_auth.input"
          className="flex-1 px-3 py-3 text-sm outline-none"
          style={{ background: INPUT_BG, color: TEXT }}
        />
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full max-w-md mx-auto rounded-2xl p-6 space-y-5"
      style={{ background: CARD, border: BORDER }}
    >
      {children}
    </div>
  );
}

function ActionButton({
  loading,
  label,
  loadingLabel,
  ocid,
  onClick,
  type = "submit",
}: {
  loading: boolean;
  label: string;
  loadingLabel?: string;
  ocid?: string;
  onClick?: () => void;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      disabled={loading}
      data-ocid={ocid}
      onClick={onClick}
      className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
      style={{ background: ACCENT }}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? (loadingLabel ?? label) : label}
    </button>
  );
}

function LinkBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm underline-offset-2 hover:underline"
      style={{ color: ACCENT }}
    >
      {children}
    </button>
  );
}

export default function SalonOwnerAuthPage({ onBack, onLoginSuccess }: Props) {
  const { actor } = useActor();
  const [mode, setMode] = useState<Mode>("login");

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regPhone, setRegPhone] = useState("");
  const [regName, setRegName] = useState("");
  const [regServices, setRegServices] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const [spPassword, setSpPassword] = useState("");
  const [spConfirm, setSpConfirm] = useState("");
  const [spPhone, setSpPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [pendingSalonName, setPendingSalonName] = useState("");

  async function waitForActor() {
    if (actor) return actor;
    const start = Date.now();
    while (Date.now() - start < 45000) {
      await new Promise((r) => setTimeout(r, 2000));
      if (actor) return actor;
    }
    throw new Error("सर्वर से कनेक्ट नहीं हो पाया। पेज रीलोड करें।");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const phone = loginPhone.trim();
    if (!/^\d{10}$/.test(phone)) {
      toast.error("सही 10 अंकों का मोबाइल नंबर डालें");
      return;
    }
    if (loginPassword.length < 6) {
      toast.error("पासवर्ड कम से कम 6 अक्षर का होना चाहिए");
      return;
    }
    setLoading(true);
    try {
      const a = await waitForActor();
      if (typeof (a as any).salonOwnerLogin !== "function") {
        toast.error("Backend function not available. Please rebuild backend.");
        setLoading(false);
        return;
      }
      const hash = await hashPassword(loginPassword);
      const result = (await (a as any).salonOwnerLogin(phone, hash)) as [
        string,
        any,
      ];
      console.log("[SalonOwner Login] Backend response:", result);
      const [status, salonRaw] = result;
      const salon = Array.isArray(salonRaw)
        ? salonRaw.length > 0
          ? salonRaw[0]
          : null
        : salonRaw;

      switch (status) {
        case "approved":
          toast.success("लॉगिन सफल! डैशबोर्ड खुल रहा है...");
          onLoginSuccess(phone);
          break;
        case "pending":
          setPendingSalonName(salon?.name ?? "");
          setMode("pending");
          break;
        case "wrong_password":
          toast.error("पासवर्ड गलत है");
          break;
        case "not_found":
          toast.error("यह नंबर रजिस्टर नहीं है");
          break;
        case "inactive":
          toast.error(
            `आपकी दुकान ${salon?.name ?? ""} निष्क्रिय है। Admin से संपर्क करें।`,
          );
          break;
        case "no_password":
          setSpPhone(phone);
          setMode("set_password");
          break;
        default:
          toast.error("कुछ गलत हुआ, दोबारा कोशिश करें");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "कुछ गलत हुआ, दोबारा कोशिश करें");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const phone = regPhone.trim();
    if (!/^\d{10}$/.test(phone)) {
      toast.error("सही 10 अंकों का मोबाइल नंबर डालें");
      return;
    }
    if (!regName.trim()) {
      toast.error("सैलून का नाम डालें");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("पासवर्ड कम से कम 6 अक्षर का होना चाहिए");
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error("दोनों पासवर्ड मेल नहीं खाते");
      return;
    }
    setLoading(true);
    try {
      const a = await waitForActor();
      if (typeof (a as any).salonOwnerRegisterV2 !== "function") {
        toast.error("Backend function not available. Please rebuild backend.");
        setLoading(false);
        return;
      }
      const hash = await hashPassword(regPassword);
      const parsedServices = regServices
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const result = (await (a as any).salonOwnerRegisterV2(
        phone,
        regName.trim(),
        parsedServices,
        hash,
      )) as string;
      console.log("[SalonOwner Register] Backend response:", result);

      switch (result) {
        case "ok":
          setPendingSalonName(regName.trim());
          setMode("success");
          break;
        case "already_registered":
          toast.error("यह नंबर पहले से रजिस्टर है। लॉगिन करें।");
          setMode("login");
          setLoginPhone(phone);
          break;
        case "limit_reached":
          toast.error("अभी नया सैलून नहीं जुड़ सकता। Admin से संपर्क करें।");
          break;
        default:
          toast.error("रजिस्ट्रेशन नहीं हो पाया, दोबारा कोशिश करें");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "रजिस्ट्रेशन नहीं हो पाया, दोबारा कोशिश करें");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (spPassword.length < 6) {
      toast.error("पासवर्ड कम से कम 6 अक्षर का होना चाहिए");
      return;
    }
    if (spPassword !== spConfirm) {
      toast.error("दोनों पासवर्ड मेल नहीं खाते");
      return;
    }
    setLoading(true);
    try {
      const a = await waitForActor();
      if (typeof (a as any).salonOwnerSetPassword !== "function") {
        toast.error("Backend function not available. Please rebuild backend.");
        setLoading(false);
        return;
      }
      const hash = await hashPassword(spPassword);
      const ok = (await (a as any).salonOwnerSetPassword(
        spPhone,
        hash,
      )) as boolean;
      console.log("[SalonOwner SetPassword] Backend response:", ok);
      if (ok) {
        toast.success("पासवर्ड सेट हो गया! डैशबोर्ड खुल रहा है...");
        onLoginSuccess(spPhone);
      } else {
        toast.error("पासवर्ड सेट नहीं हो पाया");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "कुछ गलत हुआ, दोबारा कोशिश करें");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-8 px-4"
      style={{ background: BG }}
    >
      {/* Brand header */}
      <div className="flex items-center gap-2 mb-8">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: ACCENT }}
        >
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold" style={{ color: TEXT }}>
          Salon360
        </span>
      </div>

      {/* LOGIN MODE */}
      {mode === "login" && (
        <Card>
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold" style={{ color: TEXT }}>
              सैलून मालिक लॉगिन
            </h1>
            <p className="text-sm" style={{ color: MUTED }}>
              अपना रजिस्टर्ड नंबर और पासवर्ड डालें
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <PhoneField
              id="login-phone"
              value={loginPhone}
              onChange={setLoginPhone}
              placeholder="10 अंकों का नंबर"
            />

            <PasswordField
              id="login-password"
              label="पासवर्ड"
              value={loginPassword}
              onChange={setLoginPassword}
              placeholder="कम से कम 6 अक्षर"
              ocid="salon_auth.input"
            />

            <ActionButton
              loading={loading}
              label="लॉगिन करें"
              loadingLabel="लॉगिन हो रहा है..."
              ocid="salon_auth.submit_button"
            />
          </form>

          <div className="text-center space-y-2 pt-1">
            <p className="text-sm" style={{ color: MUTED }}>
              नया सैलून?{" "}
              <LinkBtn onClick={() => setMode("register")}>
                यहाँ रजिस्टर करें
              </LinkBtn>
            </p>
            <button
              type="button"
              onClick={onBack}
              data-ocid="salon_auth.cancel_button"
              className="text-sm"
              style={{ color: MUTED }}
            >
              ← वापस जाएं
            </button>
          </div>
        </Card>
      )}

      {/* REGISTER MODE */}
      {mode === "register" && (
        <Card>
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold" style={{ color: TEXT }}>
              नया सैलून रजिस्टर करें
            </h1>
            <p className="text-sm" style={{ color: MUTED }}>
              Admin की मंजूरी के बाद लॉगिन कर पाएंगे
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <PhoneField
              id="reg-phone"
              value={regPhone}
              onChange={setRegPhone}
              placeholder="10 अंकों का अनोखा नंबर"
            />

            <div className="space-y-1.5">
              <FieldLabel htmlFor="reg-name">सैलून का नाम</FieldLabel>
              <TextInput
                id="reg-name"
                value={regName}
                onChange={setRegName}
                placeholder="जैसे: राज हेयर सैलून"
                ocid="salon_auth.input"
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="reg-services">सेवाएं</FieldLabel>
              <textarea
                id="reg-services"
                value={regServices}
                onChange={(e) => setRegServices(e.target.value)}
                placeholder="अल्पविराम से अलग करें, जैसे: बाल काटना, शेव, फेशियल"
                rows={2}
                data-ocid="salon_auth.textarea"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: INPUT_BG,
                  border: INPUT_BORDER,
                  color: TEXT,
                }}
              />
              <p className="text-xs" style={{ color: "oklch(0.5 0.04 155)" }}>
                comma (,) से अलग करें
              </p>
            </div>

            <PasswordField
              id="reg-password"
              label="पासवर्ड"
              value={regPassword}
              onChange={setRegPassword}
              placeholder="कम से कम 6 अक्षर"
              ocid="salon_auth.input"
            />

            <PasswordField
              id="reg-confirm"
              label="पासवर्ड दोबारा"
              value={regConfirm}
              onChange={setRegConfirm}
              placeholder="पासवर्ड दोबारा डालें"
              ocid="salon_auth.input"
            />

            <ActionButton
              loading={loading}
              label="रजिस्टर करें"
              loadingLabel="रजिस्टर हो रहा है..."
              ocid="salon_auth.submit_button"
            />
          </form>

          <div className="text-center space-y-2 pt-1">
            <p className="text-sm" style={{ color: MUTED }}>
              पहले से account है?{" "}
              <LinkBtn onClick={() => setMode("login")}>लॉगिन करें</LinkBtn>
            </p>
            <button
              type="button"
              onClick={onBack}
              data-ocid="salon_auth.cancel_button"
              className="text-sm"
              style={{ color: MUTED }}
            >
              ← वापस जाएं
            </button>
          </div>
        </Card>
      )}

      {/* SET PASSWORD MODE */}
      {mode === "set_password" && (
        <Card>
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold" style={{ color: TEXT }}>
              पासवर्ड सेट करें
            </h1>
            <p className="text-sm" style={{ color: MUTED }}>
              आपका सैलून पहले से रजिस्टर है। एक बार पासवर्ड सेट करें।
            </p>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="sp-phone">मोबाइल नंबर</FieldLabel>
              <TextInput id="sp-phone" value={spPhone} readOnly />
            </div>

            <PasswordField
              id="sp-password"
              label="नया पासवर्ड"
              value={spPassword}
              onChange={setSpPassword}
              placeholder="कम से कम 6 अक्षर"
              ocid="salon_auth.input"
            />

            <PasswordField
              id="sp-confirm"
              label="पासवर्ड दोबारा"
              value={spConfirm}
              onChange={setSpConfirm}
              placeholder="पासवर्ड दोबारा डालें"
              ocid="salon_auth.input"
            />

            <ActionButton
              loading={loading}
              label="पासवर्ड सेट करें"
              loadingLabel="सेट हो रहा है..."
              ocid="salon_auth.submit_button"
            />
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-sm"
              style={{ color: MUTED }}
            >
              ← वापस जाएं
            </button>
          </div>
        </Card>
      )}

      {/* PENDING MODE */}
      {mode === "pending" && (
        <Card>
          <div className="text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: "oklch(0.75 0.18 85 / 0.15)" }}
            >
              <Clock
                className="w-8 h-8"
                style={{ color: "oklch(0.75 0.18 85)" }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: TEXT }}>
                अनुमोदन प्रतीक्षा में
              </h2>
              <p className="text-sm mt-2" style={{ color: MUTED }}>
                आपकी दुकान{" "}
                <strong style={{ color: "oklch(0.85 0.08 145)" }}>
                  {pendingSalonName}
                </strong>{" "}
                का रजिस्ट्रेशन हो गया है। Admin की मंजूरी का इंतज़ार है।
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-sm"
              style={{
                background: "oklch(0.75 0.18 85 / 0.1)",
                border: "1px solid oklch(0.75 0.18 85 / 0.3)",
                color: "oklch(0.78 0.14 85)",
              }}
            >
              आमतौर पर 24 घंटे में मंजूरी मिलती है
            </div>
            <button
              type="button"
              onClick={() => setMode("login")}
              data-ocid="salon_auth.cancel_button"
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{
                background: "oklch(0.22 0.05 155)",
                color: MUTED,
                border: BORDER,
              }}
            >
              ← वापस जाएं
            </button>
          </div>
        </Card>
      )}

      {/* SUCCESS MODE (after registration) */}
      {mode === "success" && (
        <Card>
          <div className="text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: "oklch(0.52 0.18 145 / 0.15)" }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: ACCENT }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: TEXT }}>
                रजिस्ट्रेशन सफल!
              </h2>
              <p className="text-sm mt-2" style={{ color: MUTED }}>
                आपकी दुकान{" "}
                <strong style={{ color: "oklch(0.85 0.08 145)" }}>
                  {pendingSalonName}
                </strong>{" "}
                रजिस्टर हो गई है। Admin की मंजूरी के बाद आप लॉगिन कर पाएंगे।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMode("login")}
              data-ocid="salon_auth.primary_button"
              className="w-full py-3.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: ACCENT }}
            >
              लॉगिन करें
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
