import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface SalonLoadingScreenProps {
  message?: string;
  compact?: boolean;
}

export default function SalonLoadingScreen({
  message = "आपका सैलून तैयार हो रहा है...",
  compact = false,
}: SalonLoadingScreenProps) {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <motion.img
          src="/assets/generated/salon-loading-cartoon.dim_400x400.png"
          alt="सैलून लोड हो रहा है"
          className="w-[120px] h-[120px] object-contain"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        <Loader2
          className="w-5 h-5 animate-spin"
          style={{ color: "oklch(0.78 0.12 80)" }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "oklch(0.09 0.005 60)" }}
    >
      <motion.div
        className="flex flex-col items-center gap-4 px-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.img
          src="/assets/generated/salon-loading-cartoon.dim_400x400.png"
          alt="सैलून लोड हो रहा है"
          className="w-[260px] max-w-[70vw] h-auto object-contain drop-shadow-md"
          animate={{ y: [0, -6, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 2.2,
            ease: "easeInOut",
          }}
        />
        <p className="text-base font-medium gold-gradient-text">{message}</p>
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "oklch(0.78 0.12 80)" }}
        />
      </motion.div>
    </div>
  );
}
