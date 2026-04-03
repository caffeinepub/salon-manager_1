import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface SubRequest {
  id: string;
  ownerPhone: string;
  salonName: string;
  planName: string;
  planDays: number;
  status: "pending" | "approved" | "rejected";
  requestTime: number;
  screenshotBase64?: string;
}

const PLANS = [
  { name: "30 दिन", days: 30 },
  { name: "90 दिन", days: 90 },
  { name: "120 दिन", days: 120 },
  { name: "365 दिन", days: 365 },
];

interface Props {
  ownerPhone: string;
  salonName: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function SubscriptionPage({
  ownerPhone,
  salonName,
  onBack,
  onSuccess,
}: Props) {
  const [step, setStep] = useState<"plans" | "payment">("plans");
  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[0] | null>(
    null,
  );
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshot(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePaid = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const existing: SubRequest[] = JSON.parse(
        localStorage.getItem("salon360_sub_requests") || "[]",
      );
      const newReq: SubRequest = {
        id: Date.now().toString(),
        ownerPhone,
        salonName,
        planName: selectedPlan.name,
        planDays: selectedPlan.days,
        status: "pending",
        requestTime: Date.now(),
        screenshotBase64: screenshot ?? undefined,
      };
      localStorage.setItem(
        "salon360_sub_requests",
        JSON.stringify([...existing, newReq]),
      );
      toast.success("भुगतान अनुरोध भेज दिया गया! सत्यापन के बाद सदस्यता सक्रिय होगी।");
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const bg = "oklch(0.13 0.04 155)";
  const cardBg = "oklch(0.17 0.05 155)";
  const border = "1px solid oklch(0.26 0.06 155)";
  const selectedBorder = "2px solid oklch(0.52 0.18 145)";
  const selectedBg = "oklch(0.20 0.08 145)";
  const green = "oklch(0.52 0.18 145)";
  const textPrimary = "oklch(0.95 0.02 145)";
  const textSecondary = "oklch(0.65 0.05 145)";

  if (step === "plans") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: bg }}
        data-ocid="subscription.page"
      >
        {/* Header */}
        <header
          className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
          style={{
            background: "oklch(0.16 0.05 155)",
            borderBottom: border,
          }}
        >
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-lg"
            style={{ color: textSecondary }}
            data-ocid="subscription.close_button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold" style={{ color: textPrimary }}>
            सदस्यता चुनें
          </h1>
        </header>

        <main className="flex-1 p-4 max-w-lg mx-auto w-full">
          <p
            className="text-sm mb-5 text-center"
            style={{ color: textSecondary }}
          >
            अपना प्लान चुनें और जारी रखें
          </p>

          {/* Plan cards grid */}
          <div
            className="grid grid-cols-2 gap-3 mb-6"
            data-ocid="subscription.list"
          >
            {PLANS.map((plan, i) => {
              const isSelected = selectedPlan?.days === plan.days;
              return (
                <button
                  type="button"
                  key={plan.days}
                  onClick={() => setSelectedPlan(plan)}
                  data-ocid={`subscription.item.${i + 1}`}
                  className="rounded-2xl p-4 text-left transition-all duration-150"
                  style={{
                    background: isSelected ? selectedBg : cardBg,
                    border: isSelected ? selectedBorder : border,
                    boxShadow: isSelected
                      ? "0 0 0 3px oklch(0.52 0.18 145 / 0.18)"
                      : "none",
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span
                      className="text-lg font-bold"
                      style={{
                        color: isSelected
                          ? "oklch(0.72 0.18 145)"
                          : textPrimary,
                      }}
                    >
                      {plan.name}
                    </span>
                    <span className="text-xs" style={{ color: textSecondary }}>
                      {plan.days} दिन की सदस्यता
                    </span>
                    {isSelected && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle
                          className="w-4 h-4"
                          style={{ color: green }}
                        />
                        <span
                          className="text-xs font-medium"
                          style={{ color: green }}
                        >
                          चुना गया
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue button */}
          <Button
            onClick={() => setStep("payment")}
            disabled={!selectedPlan}
            className="w-full h-12 text-base font-semibold rounded-xl"
            style={{
              background: selectedPlan ? green : "oklch(0.26 0.04 155)",
              color: selectedPlan ? "white" : textSecondary,
              border: "none",
            }}
            data-ocid="subscription.primary_button"
          >
            जारी रखें →
          </Button>
        </main>
      </div>
    );
  }

  // Step 2: Payment
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: bg }}
      data-ocid="subscription.panel"
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{
          background: "oklch(0.16 0.05 155)",
          borderBottom: border,
        }}
      >
        <button
          type="button"
          onClick={() => setStep("plans")}
          className="p-1 rounded-lg"
          style={{ color: textSecondary }}
          data-ocid="subscription.cancel_button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold" style={{ color: textPrimary }}>
          भुगतान करें
        </h1>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {/* Selected plan summary */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: cardBg, border }}
          data-ocid="subscription.card"
        >
          <p className="text-xs mb-1" style={{ color: textSecondary }}>
            चुना गया प्लान
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: "oklch(0.72 0.18 145)" }}
          >
            {selectedPlan?.name}
          </p>
          <p className="text-sm mt-1" style={{ color: textSecondary }}>
            {selectedPlan?.days} दिन की सदस्यता
          </p>
        </div>

        {/* QR Code */}
        <div
          className="rounded-2xl p-5 mb-5 flex flex-col items-center"
          style={{ background: cardBg, border }}
        >
          <p
            className="text-sm font-semibold mb-4"
            style={{ color: textPrimary }}
          >
            UPI QR कोड
          </p>
          <div
            className="rounded-xl overflow-hidden p-1"
            style={{ background: "white" }}
          >
            <img
              src="/assets/upi-qr.png"
              alt="UPI QR Code"
              className="w-52 h-52 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <p
            className="text-xs text-center mt-3"
            style={{ color: textSecondary }}
          >
            यह QR कोड स्कैन करके भुगतान करें
          </p>
        </div>

        {/* Screenshot upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl py-3 mb-3 flex items-center justify-center gap-2 transition-all duration-150"
          style={{
            background: cardBg,
            border: screenshot ? "1px solid oklch(0.52 0.18 145)" : border,
            color: screenshot ? "oklch(0.72 0.18 145)" : textSecondary,
          }}
          data-ocid="subscription.upload_button"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">
            {screenshot ? "✅ स्क्रीनशॉट चुना गया" : "📸 स्क्रीनशॉट अपलोड करें"}
          </span>
        </button>

        {screenshot && (
          <div className="mb-4 rounded-xl overflow-hidden" style={{ border }}>
            <img
              src={screenshot}
              alt="भुगतान स्क्रीनशॉट"
              className="w-full max-h-40 object-contain"
              style={{ background: "oklch(0.10 0.02 155)" }}
            />
          </div>
        )}

        {/* I Have Paid button */}
        <Button
          onClick={handlePaid}
          disabled={submitting}
          className="w-full h-12 text-base font-semibold rounded-xl mb-6"
          style={{
            background: green,
            color: "white",
            border: "none",
          }}
          data-ocid="subscription.submit_button"
        >
          {submitting ? "भेज रहे हैं..." : "✅ मैंने भुगतान कर दिया"}
        </Button>

        <p className="text-xs text-center" style={{ color: textSecondary }}>
          भुगतान के बाद एडमिन द्वारा सत्यापन के बाद सदस्यता सक्रिय होगी।
        </p>
      </main>
    </div>
  );
}
