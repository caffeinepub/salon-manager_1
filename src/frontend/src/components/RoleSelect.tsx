import { Scissors, User } from "lucide-react";
import { motion } from "motion/react";
import type { AppRole } from "../App";

interface Props {
  onSelect: (role: AppRole) => void;
}

export default function RoleSelect({ onSelect }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.22 0.05 155) 0%, oklch(0.35 0.12 155) 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "oklch(0.52 0.18 145)" }}
        >
          <Scissors className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-4xl font-bold text-white">Salon360</h1>
        <p className="mt-2 text-white/70 text-base">
          भारत का #1 सैलून मैनेजमेंट प्लेटफ़ॉर्म
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md space-y-4"
      >
        <p className="text-center text-white/80 font-medium mb-6 text-lg">
          आप कौन हैं?
        </p>

        <button
          type="button"
          data-ocid="role_select.salon.button"
          onClick={() => onSelect("salon")}
          className="w-full p-6 rounded-2xl flex items-center gap-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={{
            background: "oklch(0.52 0.18 145)",
            boxShadow: "0 8px 32px oklch(0.52 0.18 145 / 0.4)",
          }}
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/20">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">सैलून मालिक हूँ</h2>
            <p className="text-white/80 text-sm mt-1">
              अपने सैलून को मैनेज करें, अपॉइंटमेंट देखें, सेवाएं सेट करें
            </p>
          </div>
        </button>

        <button
          type="button"
          data-ocid="role_select.customer.button"
          onClick={() => onSelect("customer")}
          className="w-full p-6 rounded-2xl flex items-center gap-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={{
            background: "white",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.94 0.03 145)" }}
          >
            <User
              className="w-7 h-7"
              style={{ color: "oklch(0.52 0.18 145)" }}
            />
          </div>
          <div>
            <h2
              className="text-xl font-bold"
              style={{ color: "oklch(0.15 0.025 160)" }}
            >
              ग्राहक हूँ
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: "oklch(0.5 0.02 160)" }}
            >
              अपॉइंटमेंट बुक करें, कतार में अपनी जगह देखें
            </p>
          </div>
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 text-white/40 text-xs text-center"
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white/60"
        >
          caffeine.ai
        </a>
      </motion.p>
    </div>
  );
}
