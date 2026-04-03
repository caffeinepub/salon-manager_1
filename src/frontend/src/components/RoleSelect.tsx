import { Download, Scissors, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { AppRole } from "../App";

interface Props {
  onSelect: (role: AppRole) => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// SVG watermark — faint gold salon icons
function SalonWatermark() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Scissors top-right */}
      <g
        opacity="0.06"
        fill="none"
        stroke="oklch(0.78 0.12 80)"
        strokeWidth="2"
        transform="translate(290,60) rotate(25)"
      >
        <circle cx="0" cy="-20" r="10" />
        <circle cx="0" cy="20" r="10" />
        <line x1="8" y1="-14" x2="40" y2="50" />
        <line x1="-8" y1="-14" x2="-40" y2="50" />
        <line x1="8" y1="14" x2="40" y2="-50" />
        <line x1="-8" y1="14" x2="-40" y2="-50" />
      </g>
      {/* Comb middle-left */}
      <g
        opacity="0.05"
        fill="none"
        stroke="oklch(0.78 0.12 80)"
        strokeWidth="1.5"
        transform="translate(30,350)"
      >
        <rect x="-30" y="-8" width="60" height="16" rx="3" />
        <line x1="-20" y1="8" x2="-20" y2="28" />
        <line x1="-10" y1="8" x2="-10" y2="28" />
        <line x1="0" y1="8" x2="0" y2="28" />
        <line x1="10" y1="8" x2="10" y2="28" />
        <line x1="20" y1="8" x2="20" y2="28" />
      </g>
      {/* Razor bottom-right */}
      <g
        opacity="0.06"
        fill="none"
        stroke="oklch(0.78 0.12 80)"
        strokeWidth="1.5"
        transform="translate(330,580) rotate(-15)"
      >
        <rect x="-35" y="-8" width="70" height="16" rx="4" />
        <line x1="-35" y1="0" x2="-55" y2="0" />
        <line x1="35" y1="0" x2="55" y2="0" />
        <path d="M-25,-8 L25,-8 L35,0 L25,8 L-25,8 Z" opacity="0.5" />
      </g>
      {/* Hair silhouette center watermark */}
      <g
        opacity="0.04"
        fill="oklch(0.78 0.12 80)"
        transform="translate(200,420)"
      >
        <ellipse cx="0" cy="-40" rx="50" ry="65" />
        <path d="M-50,-40 Q-60,20 -30,80 L30,80 Q60,20 50,-40 Q30,-10 0,-15 Q-30,-10 -50,-40Z" />
      </g>
      {/* Small scissors bottom-left */}
      <g
        opacity="0.05"
        fill="none"
        stroke="oklch(0.78 0.12 80)"
        strokeWidth="1.5"
        transform="translate(50,650) rotate(-30) scale(0.7)"
      >
        <circle cx="0" cy="-20" r="10" />
        <circle cx="0" cy="20" r="10" />
        <line x1="8" y1="-14" x2="40" y2="50" />
        <line x1="-8" y1="-14" x2="-40" y2="50" />
        <line x1="8" y1="14" x2="40" y2="-50" />
        <line x1="-8" y1="14" x2="-40" y2="-50" />
      </g>
      {/* Decorative dots / sparkles */}
      <g fill="oklch(0.78 0.12 80)" opacity="0.08">
        <circle cx="360" cy="200" r="2" />
        <circle cx="340" cy="220" r="1" />
        <circle cx="375" cy="215" r="1" />
        <circle cx="70" cy="130" r="2" />
        <circle cx="55" cy="148" r="1" />
        <circle cx="85" cy="145" r="1" />
        <circle cx="180" cy="750" r="2" />
        <circle cx="220" cy="740" r="1.5" />
      </g>
    </svg>
  );
}

export default function RoleSelect({ onSelect }: Props) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      setInstalling(true);
      try {
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
          setInstallPrompt(null);
        }
      } finally {
        setInstalling(false);
      }
    } else {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 5000);
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-6 pb-28 overflow-hidden"
      style={{ background: "oklch(0.09 0.005 60)" }}
    >
      {/* Salon watermark background */}
      <SalonWatermark />

      {/* Radial gold glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 35%, oklch(0.78 0.12 80 / 0.07) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative text-center mb-12"
      >
        {/* Logo mark */}
        <div className="relative mx-auto mb-5 w-20 h-20">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
              boxShadow:
                "0 8px 32px oklch(0.78 0.12 80 / 0.4), 0 0 0 1px oklch(0.78 0.12 80 / 0.3)",
            }}
          >
            <Scissors
              className="w-10 h-10"
              style={{ color: "oklch(0.1 0.01 60)" }}
            />
          </div>
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              boxShadow: "0 0 48px oklch(0.78 0.12 80 / 0.2)",
            }}
          />
        </div>

        <h1
          className="font-display text-4xl font-bold tracking-tight"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.92 0.11 84) 0%, oklch(0.72 0.13 74) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Salon360Pro
        </h1>
        <p className="mt-2 text-sm" style={{ color: "oklch(0.6 0.05 78)" }}>
          भारत का #1 सैलून मैनेजमेंट प्लेटफ़ॉर्म
        </p>
        {/* Divider */}
        <div
          className="mt-4 mx-auto w-16 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.78 0.12 80 / 0.5), transparent)",
          }}
        />
      </motion.div>

      {/* Role Cards */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-md space-y-4"
      >
        <p
          className="text-center font-medium text-sm mb-5 tracking-widest uppercase"
          style={{ color: "oklch(0.55 0.05 78)" }}
        >
          आप कौन हैं?
        </p>

        {/* Salon Owner Card */}
        <button
          type="button"
          data-ocid="role_select.salon.button"
          onClick={() => onSelect("salon")}
          className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.16 0.015 60) 0%, oklch(0.14 0.01 60) 100%)",
            border: "1px solid oklch(0.45 0.08 78 / 0.5)",
            boxShadow:
              "0 4px 24px oklch(0.78 0.12 80 / 0.08), inset 0 1px 0 oklch(0.78 0.12 80 / 0.1)",
          }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
              boxShadow: "0 4px 16px oklch(0.78 0.12 80 / 0.3)",
            }}
          >
            <Scissors
              className="w-7 h-7"
              style={{ color: "oklch(0.1 0.01 60)" }}
            />
          </div>
          <div className="flex-1">
            <h2
              className="text-lg font-bold"
              style={{ color: "oklch(0.92 0.08 82)" }}
            >
              सैलून मालिक हूँ
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.55 0.04 75)" }}
            >
              अपॉइंटमेंट देखें, सेवाएं सेट करें, कमाई ट्रैक करें
            </p>
          </div>
          <div style={{ color: "oklch(0.6 0.08 78)" }}>›</div>
        </button>

        {/* Customer Card */}
        <button
          type="button"
          data-ocid="role_select.customer.button"
          onClick={() => onSelect("customer")}
          className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.16 0.015 60) 0%, oklch(0.14 0.01 60) 100%)",
            border: "1px solid oklch(0.3 0.03 70 / 0.5)",
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 oklch(0.5 0.04 80 / 0.08)",
          }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
            style={{
              background: "oklch(0.2 0.02 60)",
              border: "1px solid oklch(0.35 0.04 70 / 0.5)",
            }}
          >
            <User className="w-7 h-7" style={{ color: "oklch(0.7 0.08 78)" }} />
          </div>
          <div className="flex-1">
            <h2
              className="text-lg font-bold"
              style={{ color: "oklch(0.9 0.01 80)" }}
            >
              ग्राहक हूँ
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.5 0.02 70)" }}
            >
              अपॉइंटमेंट बुक करें, कतार में अपनी जगह देखें
            </p>
          </div>
          <div style={{ color: "oklch(0.45 0.03 70)" }}>›</div>
        </button>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative mt-10 text-xs text-center"
        style={{ color: "oklch(0.35 0.02 70)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white/60"
          style={{ color: "oklch(0.5 0.05 78)" }}
        >
          caffeine.ai
        </a>
      </motion.p>

      {/* Permanent Install Button */}
      {!isInstalled && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 z-50"
          style={{
            background:
              "linear-gradient(to top, oklch(0.07 0.005 60) 60%, transparent)",
          }}
        >
          {showHint && (
            <div
              className="text-center text-xs py-2 px-4 rounded-xl mb-2 max-w-md mx-auto"
              style={{
                background: "oklch(0.18 0.015 60)",
                border: "1px solid oklch(0.4 0.07 78 / 0.4)",
                color: "oklch(0.75 0.08 80)",
              }}
            >
              Chrome में <strong>⋮ menu</strong> → "Add to Home Screen" दबाएं
            </div>
          )}
          <motion.button
            type="button"
            data-ocid="role_select.install.button"
            onClick={handleInstall}
            disabled={installing}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-2 font-semibold text-sm py-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.88 0.12 82) 0%, oklch(0.68 0.13 74) 100%)",
              boxShadow: "0 4px 24px oklch(0.78 0.12 80 / 0.35)",
              color: "oklch(0.1 0.01 60)",
            }}
          >
            {installing ? (
              <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{installing ? "इंस्टॉल हो रहा है..." : "📲 ऐप इंस्टॉल करें"}</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}
