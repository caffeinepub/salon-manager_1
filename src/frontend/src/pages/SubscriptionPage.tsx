import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useGetPlanPricings,
  useSubmitSubscriptionRequest,
} from "../hooks/useQueries";

const DEFAULT_PLANS = [
  { planName: "30 दिन", planDays: 30, originalPrice: 399, discountPercent: 75 },
  { planName: "90 दिन", planDays: 90, originalPrice: 999, discountPercent: 75 },
  {
    planName: "120 दिन",
    planDays: 120,
    originalPrice: 1299,
    discountPercent: 77,
  },
  {
    planName: "365 दिन",
    planDays: 365,
    originalPrice: 3999,
    discountPercent: 75,
  },
];

function calcFinal(originalPrice: number, discountPercent: number) {
  const final = Math.round(originalPrice * (1 - discountPercent / 100));
  const savings = originalPrice - final;
  return { final, savings };
}

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
  const [step, setStep] = useState<"plans" | "payment" | "success">("plans");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingSince, setPendingSince] = useState<number | null>(null);
  const [countdown, setCountdown] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: backendPricings, isLoading: pricingsLoading } =
    useGetPlanPricings();
  const submitMutation = useSubmitSubscriptionRequest();

  // Merge backend pricings with defaults
  const plans = DEFAULT_PLANS.map((def) => {
    const found = backendPricings?.find((p) => p.planName === def.planName);
    if (found) {
      return {
        planName: found.planName,
        planDays: Number(found.planDays),
        originalPrice: found.originalPrice,
        discountPercent: found.discountPercent,
      };
    }
    return def;
  });

  const selectedPlan = selectedIdx !== null ? plans[selectedIdx] : null;

  // Countdown timer for success state
  useEffect(() => {
    if (!pendingSince) return;
    const update = () => {
      const elapsed = Date.now() - pendingSince;
      const twoHours = 2 * 60 * 60 * 1000;
      const remaining = Math.max(0, twoHours - elapsed);
      if (remaining === 0) {
        setCountdown("समय सीमा समाप्त — पुनः संपर्क करें");
        return;
      }
      const hrs = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      setCountdown(`${hrs} घंटे ${mins} मिनट बचे`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [pendingSince]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("स्क्रीनशॉट 3MB से छोटा होना चाहिए");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePaid = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    const { final, savings } = calcFinal(
      selectedPlan.originalPrice,
      selectedPlan.discountPercent,
    );
    try {
      await submitMutation.mutateAsync({
        ownerPhone,
        salonName,
        planName: selectedPlan.planName,
        planDays: selectedPlan.planDays,
        originalPrice: selectedPlan.originalPrice,
        discountPercent: selectedPlan.discountPercent,
        finalPrice: final,
        savings,
        screenshotBase64: screenshot ?? "",
      });
      const now = Date.now();
      setPendingSince(now);
      setStep("success");
    } catch (_err) {
      // Fallback to localStorage for resilience
      const existing = JSON.parse(
        localStorage.getItem("salon360_sub_requests") || "[]",
      );
      existing.push({
        id: Date.now().toString(),
        ownerPhone,
        salonName,
        planName: selectedPlan.planName,
        planDays: selectedPlan.planDays,
        originalPrice: selectedPlan.originalPrice,
        discountPercent: selectedPlan.discountPercent,
        finalPrice: final,
        savings,
        status: "pending",
        requestTime: Date.now(),
        screenshotBase64: screenshot ?? "",
      });
      localStorage.setItem("salon360_sub_requests", JSON.stringify(existing));
      const now = Date.now();
      setPendingSince(now);
      setStep("success");
      toast.warning("अनुरोध सेव हो गया (ऑफ़लाइन मोड)");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Styles ──────────────────────────────────────────────
  const bg = "oklch(0.13 0.04 155)";
  const cardBg = "oklch(0.17 0.05 155)";
  const border = "1px solid oklch(0.26 0.06 155)";
  const selectedBorder = "2px solid oklch(0.52 0.18 145)";
  const selectedBg = "oklch(0.20 0.08 145)";
  const green = "oklch(0.52 0.18 145)";
  const greenLight = "oklch(0.72 0.18 145)";
  const amber = "oklch(0.72 0.18 85)";
  const textPrimary = "oklch(0.95 0.02 145)";
  const textSecondary = "oklch(0.65 0.05 145)";

  // ── SUCCESS STATE ────────────────────────────────────────
  if (step === "success") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: bg }}
        data-ocid="subscription.success_state"
      >
        <div
          className="w-full max-w-sm rounded-3xl p-8 text-center"
          style={{ background: cardBg, border }}
        >
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: textPrimary }}>
            भुगतान अनुरोध भेज दिया!
          </h2>
          <p className="text-sm mb-6" style={{ color: textSecondary }}>
            एडमिन 2 घंटे में सत्यापित करेंगे
          </p>

          {/* Timer */}
          <div
            className="rounded-2xl p-4 mb-6 flex items-center justify-center gap-2"
            style={{
              background: "oklch(0.20 0.08 145)",
              border: selectedBorder,
            }}
          >
            <Clock className="w-4 h-4" style={{ color: greenLight }} />
            <span className="text-sm font-medium" style={{ color: greenLight }}>
              {countdown || "2 घंटे 0 मिनट बचे"}
            </span>
          </div>

          {selectedPlan &&
            (() => {
              const { final, savings } = calcFinal(
                selectedPlan.originalPrice,
                selectedPlan.discountPercent,
              );
              return (
                <div
                  className="rounded-xl p-3 mb-6 text-left space-y-1"
                  style={{ background: "oklch(0.15 0.04 155)", border }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{ color: greenLight }}
                  >
                    चुना गया प्लान
                  </p>
                  <p
                    className="font-bold text-base"
                    style={{ color: textPrimary }}
                  >
                    {selectedPlan.planName}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm line-through"
                      style={{ color: textSecondary }}
                    >
                      ₹{selectedPlan.originalPrice}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-bold"
                      style={{
                        background: "oklch(0.20 0.12 145)",
                        color: greenLight,
                      }}
                    >
                      {selectedPlan.discountPercent}% OFF
                    </span>
                    <span
                      className="text-base font-bold"
                      style={{ color: greenLight }}
                    >
                      ₹{final}
                    </span>
                  </div>
                  {savings > 0 && (
                    <p className="text-xs" style={{ color: amber }}>
                      ₹{savings} बचाए!
                    </p>
                  )}
                </div>
              );
            })()}

          <p className="text-xs mb-4" style={{ color: textSecondary }}>
            भुगतान सत्यापित होते ही सदस्यता स्वचालित रूप से सक्रिय होगी
          </p>
          <Button
            onClick={onSuccess}
            className="w-full h-11 rounded-xl font-semibold"
            style={{ background: green, color: "white", border: "none" }}
            data-ocid="subscription.close_button"
          >
            ठीक है
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP 1: PLAN SELECTION ───────────────────────────────
  if (step === "plans") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: bg }}
        data-ocid="subscription.page"
      >
        <header
          className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
          style={{ background: "oklch(0.16 0.05 155)", borderBottom: border }}
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
            सदस्यता प्लान चुनें
          </h1>
        </header>

        <main className="flex-1 p-4 max-w-lg mx-auto w-full">
          <p
            className="text-sm mb-5 text-center"
            style={{ color: textSecondary }}
          >
            अपना प्लान चुनें — अधिक दिन, अधिक बचत
          </p>

          {pricingsLoading ? (
            <div
              className="flex justify-center py-8"
              data-ocid="subscription.loading_state"
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: greenLight,
                  borderTopColor: "transparent",
                }}
              />
            </div>
          ) : (
            <div
              className="grid grid-cols-2 gap-3 mb-6"
              data-ocid="subscription.list"
            >
              {plans.map((plan, i) => {
                const isSelected = selectedIdx === i;
                const { final, savings } = calcFinal(
                  plan.originalPrice,
                  plan.discountPercent,
                );
                return (
                  <button
                    type="button"
                    key={plan.planName}
                    onClick={() => setSelectedIdx(i)}
                    data-ocid={`subscription.item.${i + 1}`}
                    className="rounded-2xl p-4 text-left transition-all duration-150 relative"
                    style={{
                      background: isSelected ? selectedBg : cardBg,
                      border: isSelected ? selectedBorder : border,
                      boxShadow: isSelected
                        ? "0 0 0 3px oklch(0.52 0.18 145 / 0.18)"
                        : "none",
                    }}
                  >
                    {/* Discount badge */}
                    {plan.discountPercent > 0 && (
                      <span
                        className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: green, color: "white" }}
                      >
                        {plan.discountPercent}% OFF
                      </span>
                    )}

                    <div className="flex flex-col gap-0.5 mt-2">
                      <span
                        className="text-base font-bold"
                        style={{ color: isSelected ? greenLight : textPrimary }}
                      >
                        {plan.planName}
                      </span>
                      {/* Original price strikethrough */}
                      {plan.discountPercent > 0 && (
                        <span
                          className="text-xs line-through"
                          style={{ color: textSecondary }}
                        >
                          ₹{plan.originalPrice}
                        </span>
                      )}
                      {/* Final price */}
                      <span
                        className="text-xl font-bold"
                        style={{ color: greenLight }}
                      >
                        ₹{final}
                      </span>
                      {/* Savings */}
                      {savings > 0 && (
                        <span className="text-xs" style={{ color: amber }}>
                          ₹{savings} बचाएं
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 mt-2">
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
                  </button>
                );
              })}
            </div>
          )}

          <Button
            onClick={() => setStep("payment")}
            disabled={selectedIdx === null}
            className="w-full h-12 text-base font-semibold rounded-xl"
            style={{
              background: selectedIdx !== null ? green : "oklch(0.26 0.04 155)",
              color: selectedIdx !== null ? "white" : textSecondary,
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

  // ── STEP 2: PAYMENT ─────────────────────────────────────
  const planForPayment = selectedPlan!;
  const { final: finalPrice, savings: planSavings } = calcFinal(
    planForPayment.originalPrice,
    planForPayment.discountPercent,
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: bg }}
      data-ocid="subscription.panel"
    >
      <header
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ background: "oklch(0.16 0.05 155)", borderBottom: border }}
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
          <p className="text-xs mb-2" style={{ color: textSecondary }}>
            चुना गया प्लान
          </p>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xl font-bold" style={{ color: greenLight }}>
                {planForPayment.planName}
              </p>
              <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
                {planForPayment.planDays} दिन की सदस्यता
              </p>
            </div>
            {planForPayment.discountPercent > 0 && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: green, color: "white" }}
              >
                {planForPayment.discountPercent}% OFF
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 space-y-1" style={{ borderTop: border }}>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: textSecondary }}>
                मूल कीमत
              </span>
              <span
                className="text-sm line-through"
                style={{ color: textSecondary }}
              >
                ₹{planForPayment.originalPrice}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: textSecondary }}>
                छूट
              </span>
              <span className="text-sm font-medium" style={{ color: amber }}>
                -{planForPayment.discountPercent}% (-₹{planSavings})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-semibold"
                style={{ color: textPrimary }}
              >
                देय राशि
              </span>
              <span className="text-lg font-bold" style={{ color: greenLight }}>
                ₹{finalPrice}
              </span>
            </div>
            {planSavings > 0 && (
              <p className="text-xs text-center pt-1" style={{ color: amber }}>
                🎉 आपने ₹{planSavings} बचाए!
              </p>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div
          className="rounded-2xl p-5 mb-5 flex flex-col items-center"
          style={{ background: cardBg, border }}
        >
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: textPrimary }}
          >
            UPI से भुगतान करें
          </p>
          <p
            className="text-xs mb-4 text-center"
            style={{ color: textSecondary }}
          >
            नीचे दिया QR कोड स्कैन करें
          </p>
          <div
            className="rounded-2xl overflow-hidden p-2"
            style={{ background: "white" }}
          >
            <img
              src="/assets/upi-qr.png"
              alt="Union Bank UPI QR Code"
              className="w-52 h-52 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <p
            className="text-xs text-center mt-3 font-medium"
            style={{ color: greenLight }}
          >
            Union Bank of India • UPI
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
            color: screenshot ? greenLight : textSecondary,
          }}
          data-ocid="subscription.upload_button"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">
            {screenshot ? "✅ स्क्रीनशॉट चुना गया" : "📸 भुगतान स्क्रीनशॉट अपलोड करें"}
          </span>
        </button>

        {screenshot && (
          <div className="mb-4 rounded-xl overflow-hidden" style={{ border }}>
            <img
              src={screenshot}
              alt="भुगतान स्क्रीनशॉट"
              className="w-full max-h-48 object-contain"
              style={{ background: "oklch(0.10 0.02 155)" }}
            />
          </div>
        )}

        {/* I Have Paid button */}
        <Button
          onClick={handlePaid}
          disabled={submitting}
          className="w-full h-12 text-base font-semibold rounded-xl mb-4"
          style={{ background: green, color: "white", border: "none" }}
          data-ocid="subscription.submit_button"
        >
          {submitting ? "भेज रहे हैं..." : "✅ मैंने भुगतान कर दिया"}
        </Button>

        <div
          className="rounded-xl p-3 flex items-start gap-2"
          style={{ background: "oklch(0.16 0.04 155)", border }}
        >
          <Clock
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            style={{ color: greenLight }}
          />
          <p className="text-xs" style={{ color: textSecondary }}>
            भुगतान के बाद एडमिन{" "}
            <span style={{ color: greenLight, fontWeight: 600 }}>2 घंटे</span> में
            सत्यापित करेंगे — सत्यापन के बाद सदस्यता स्वचालित रूप से सक्रिय होगी
          </p>
        </div>
      </main>
    </div>
  );
}
