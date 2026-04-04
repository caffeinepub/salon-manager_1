import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  type SalonWithId,
  type SubRequestType,
  type SubscriptionHistoryType,
  useAdminApproveSalon,
  useAdminApproveSubRequest,
  useAdminBackup,
  useAdminExpireOldSubRequests,
  useAdminGetAllPlanPricings,
  useAdminGetAllSalons,
  useAdminGetAllSubRequests,
  useAdminGetDashboardStats,
  useAdminGetDefaultTrialDays,
  useAdminGetPendingSalons,
  useAdminGetPendingSubRequests,
  useAdminGetRevenueStats,
  useAdminGetSubHistory,
  useAdminGetSubRequestEarnings,
  useAdminGetSubscriptionPrice,
  useAdminProcessTrialExpirations,
  useAdminRejectSalon,
  useAdminRejectSubRequest,
  useAdminResetOwnerPassword,
  useAdminRestore,
  useAdminSetDefaultTrialDays,
  useAdminSetPlanPricing,
  useAdminSetSalonActive,
  useAdminSetSalonSubscription,
  useAdminSetSalonTrialDays,
  useAdminSetSubscriptionPrice,
} from "../hooks/useQueries";
import {
  type RatingEntry,
  deleteRating,
  getRatings,
} from "./CustomerDashboard";

type Tab =
  | "dashboard"
  | "pending"
  | "salons"
  | "settings"
  | "revenue"
  | "subscription"
  | "reviews"
  | "backup"
  | "sub_requests";

// ────────────────────────────────────────────────────────────────
function formatRemainingTime(requestTimeNs: bigint): string {
  const requestMs = Number(requestTimeNs) / 1_000_000;
  const twoHours = 2 * 60 * 60 * 1000;
  const elapsed = Date.now() - requestMs;
  const remaining = Math.max(0, twoHours - elapsed);
  if (remaining === 0) return "समय सीमा समाप्त";
  const hrs = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  return `${hrs} घंटे ${mins} मिनट बचे`;
}

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  if (ms < 1000) return "—";
  return new Date(ms).toLocaleString("hi-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "pending")
    return (
      <Badge
        className="text-xs border"
        style={{
          background: "oklch(0.82 0.14 78 / 0.15)",
          color: "oklch(0.82 0.14 78)",
          borderColor: "oklch(0.82 0.14 78 / 0.4)",
        }}
      >
        ⏳ प्रतीक्षारत
      </Badge>
    );
  if (status === "approved")
    return (
      <Badge
        className="text-xs border"
        style={{
          background: "oklch(0.78 0.12 80 / 0.15)",
          color: "oklch(0.88 0.12 82)",
          borderColor: "oklch(0.78 0.12 80 / 0.4)",
        }}
      >
        ✅ स्वीकृत
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge
        className="text-xs border"
        style={{
          background: "oklch(0.577 0.245 27 / 0.15)",
          color: "oklch(0.7 0.2 27)",
          borderColor: "oklch(0.577 0.245 27 / 0.4)",
        }}
      >
        ❌ अस्वीकृत
      </Badge>
    );
  return (
    <Badge
      className="text-xs border"
      style={{
        background: "oklch(0.2 0.01 70)",
        color: "oklch(0.5 0.03 70)",
        borderColor: "oklch(0.3 0.02 70)",
      }}
    >
      ⏰ एक्सपायर्ड
    </Badge>
  );
}

function SubRequestCard({
  req,
  idx,
  showActions,
}: {
  req: SubRequestType;
  idx: number;
  showActions: boolean;
}) {
  const approveMutation = useAdminApproveSubRequest();
  const rejectMutation = useAdminRejectSubRequest();

  return (
    <Card className="border" data-ocid={`sub_requests.item.${idx + 1}`}>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              {req.salonName}
            </p>
            <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
              फ़ोन: {req.ownerPhone}
            </p>
          </div>
          <StatusBadge status={req.status} />
        </div>

        {/* Plan details */}
        <div
          className="rounded-lg p-3 space-y-1"
          style={{
            background: "oklch(0.17 0.012 60)",
            border: "1px solid oklch(0.28 0.04 75 / 0.6)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
              प्लान
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {req.planName} ({Number(req.planDays)} दिन)
            </span>
          </div>
          {req.originalPrice > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.04 80)" }}
                >
                  मूल कीमत
                </span>
                <span
                  className="text-sm line-through"
                  style={{ color: "oklch(0.55 0.04 80)" }}
                >
                  ₹{req.originalPrice}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.04 80)" }}
                >
                  छूट
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.82 0.14 78)" }}
                >
                  -{req.discountPercent}%
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-1 mt-1">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.97 0.015 80)" }}
                >
                  देय राशि
                </span>
                <span className="text-base font-bold gold-gradient-text">
                  ₹{req.finalPrice}
                </span>
              </div>
              {req.savings > 0 && (
                <p className="text-xs" style={{ color: "oklch(0.82 0.14 78)" }}>
                  ₹{req.savings} की बचत
                </p>
              )}
            </>
          )}
        </div>

        <div
          className="text-xs space-y-0.5"
          style={{ color: "oklch(0.4 0.03 70)" }}
        >
          <p>अनुरोध समय: {formatDate(req.requestTime)}</p>
          {req.status === "pending" && (
            <p style={{ color: "oklch(0.82 0.14 78)", fontWeight: 600 }}>
              ≈ {formatRemainingTime(req.requestTime)}
            </p>
          )}
          {req.status === "approved" && req.approvedAt > 0n && (
            <p style={{ color: "oklch(0.88 0.12 82)" }}>
              स्वीकृत: {formatDate(req.approvedAt)}
            </p>
          )}
        </div>

        {req.screenshotBase64 && (
          <div>
            <p className="text-xs text-gray-500 mb-1">भुगतान स्क्रीनशॉट:</p>
            <img
              src={req.screenshotBase64}
              alt="screenshot"
              className="max-h-48 w-full rounded border object-contain"
              style={{ background: "oklch(0.17 0.012 60)" }}
            />
          </div>
        )}

        {showActions && req.status === "pending" && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={approveMutation.isPending || rejectMutation.isPending}
              onClick={() =>
                approveMutation.mutate(req.id, {
                  onSuccess: (ok) => {
                    if (ok)
                      toast.success(`${req.salonName} की सदस्यता स्वीकृत की गई`);
                    else toast.error("स्वीकृति नहीं हो पाई");
                  },
                  onError: () => toast.error("कोशिश करें"),
                })
              }
              data-ocid={`sub_requests.confirm_button.${idx + 1}`}
            >
              {approveMutation.isPending ? "..." : "✅ स्वीकृत करें"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              style={{
                background: "oklch(0.17 0.012 60)",
                border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                color: "oklch(0.97 0.015 80)",
              }}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              onClick={() =>
                rejectMutation.mutate(req.id, {
                  onSuccess: () =>
                    toast.success(`${req.salonName} का अनुरोध अस्वीकृत किया गया`),
                  onError: () => toast.error("कोशिश करें"),
                })
              }
              data-ocid={`sub_requests.delete_button.${idx + 1}`}
            >
              {rejectMutation.isPending ? "..." : "❌ अस्वीकृत"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SubHistoryTable({ history }: { history: SubscriptionHistoryType[] }) {
  if (history.length === 0) {
    return (
      <div
        className="text-center py-12"
        style={{ color: "oklch(0.55 0.04 80)" }}
        data-ocid="sub_requests.empty_state"
      >
        कोई सदस्यता इतिहास नहीं है
      </div>
    );
  }
  return (
    <div className="space-y-3" data-ocid="sub_requests.list">
      {history.map((h, idx) => (
        <div
          key={h.id.toString()}
          className="rounded-xl p-4 space-y-2"
          style={{
            background: "oklch(0.13 0.008 60)",
            border: "1px solid oklch(0.28 0.04 75 / 0.6)",
          }}
          data-ocid={`sub_requests.item.${idx + 1}`}
        >
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: "oklch(0.97 0.015 80)" }}
              >
                {h.salonName}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
                {h.ownerPhone}
              </p>
            </div>
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{
                background: "oklch(0.78 0.12 80 / 0.15)",
                color: "oklch(0.88 0.12 82)",
                border: "1px solid oklch(0.78 0.12 80 / 0.4)",
              }}
            >
              ✅ स्वीकृत
            </span>
          </div>
          <div
            className="rounded-lg p-3 space-y-1 text-xs"
            style={{
              background: "oklch(0.17 0.012 60)",
              border: "1px solid oklch(0.28 0.04 75 / 0.4)",
            }}
          >
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.55 0.04 80)" }}>प्लान</span>
              <span
                style={{ color: "oklch(0.97 0.015 80)" }}
                className="font-medium"
              >
                {h.planName} ({Number(h.planDays)} दिन)
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.55 0.04 80)" }}>देय राशि</span>
              <span
                className="font-bold"
                style={{ color: "oklch(0.88 0.12 82)" }}
              >
                ₹{h.finalPrice}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.55 0.04 80)" }}>शुरू</span>
              <span style={{ color: "oklch(0.97 0.015 80)" }}>
                {h.startDate > 0n ? formatDate(h.startDate) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.55 0.04 80)" }}>समाप्त</span>
              <span style={{ color: "oklch(0.97 0.015 80)" }}>
                {h.endDate > 0n ? formatDate(h.endDate) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "oklch(0.55 0.04 80)" }}>स्वीकृत</span>
              <span style={{ color: "oklch(0.82 0.14 78)" }}>
                {h.approvedAt > 0n ? formatDate(h.approvedAt) : "—"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SubscriptionRequestsTab() {
  const [subTab, setSubTab] = useState<"pending" | "all" | "history">(
    "pending",
  );
  const {
    data: pendingReqs = [],
    isLoading: pendingLoading,
    isError: pendingError,
  } = useAdminGetPendingSubRequests();
  const {
    data: allReqs = [],
    isLoading: allLoading,
    isError: allError,
  } = useAdminGetAllSubRequests();
  const {
    data: historyData = [],
    isLoading: historyLoading,
    isError: historyError,
  } = useAdminGetSubHistory();
  const expireMutation = useAdminExpireOldSubRequests();
  const prevCountRef = useRef(0);

  // Auto-expire on mount (run once)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  useEffect(() => {
    expireMutation.mutate();
  }, []);

  // Sound alert when new pending requests arrive
  useEffect(() => {
    if (pendingReqs.length > prevCountRef.current && prevCountRef.current > 0) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch {}
      toast.info(`🔔 नई सदस्यता अनुरोध! (${pendingReqs.length} लंबित)`);
    }
    prevCountRef.current = pendingReqs.length;
  }, [pendingReqs.length]);

  const isError =
    subTab === "pending"
      ? pendingError
      : subTab === "all"
        ? allError
        : historyError;
  const isLoading =
    subTab === "pending"
      ? pendingLoading
      : subTab === "all"
        ? allLoading
        : historyLoading;

  const errorBg = {
    background: "oklch(0.15 0.04 27 / 0.3)",
    border: "1px solid oklch(0.5 0.2 27 / 0.4)",
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div
        className="flex rounded-lg overflow-hidden"
        style={{ border: "1px solid oklch(0.28 0.04 75 / 0.6)" }}
      >
        {(["pending", "all", "history"] as const).map((tab, i) => {
          const labels = [
            `⏳ लंबित (${pendingReqs.length})`,
            `📜 सभी (${allReqs.length})`,
            `📚 इतिहास (${historyData.length})`,
          ];
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setSubTab(tab)}
              className="flex-1 py-2 text-xs font-medium transition-colors"
              style={{
                background:
                  subTab === tab
                    ? "oklch(0.78 0.12 80)"
                    : "oklch(0.17 0.012 60)",
                color:
                  subTab === tab
                    ? "oklch(0.09 0.005 60)"
                    : "oklch(0.55 0.04 80)",
                borderLeft:
                  i > 0 ? "1px solid oklch(0.28 0.04 75 / 0.6)" : "none",
              }}
              data-ocid="sub_requests.tab"
            >
              {labels[i]}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {isError && (
        <div
          className="rounded-lg p-4 text-center"
          style={errorBg}
          data-ocid="sub_requests.error_state"
        >
          <p style={{ color: "oklch(0.7 0.2 27)" }}>
            ❌ डेटा लोड नहीं हो सका। कृपया पेज reload करें।
          </p>
        </div>
      )}

      {!isError && isLoading && (
        <div
          className="py-8 text-center"
          data-ocid="sub_requests.loading_state"
        >
          <div
            className="inline-block w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{
              borderColor: "oklch(0.78 0.12 80)",
              borderTopColor: "transparent",
            }}
          />
          <p className="text-sm mt-2" style={{ color: "oklch(0.55 0.04 80)" }}>
            लोड हो रहा है...
          </p>
        </div>
      )}

      {!isError && !isLoading && subTab === "history" && (
        <SubHistoryTable history={historyData} />
      )}

      {!isError &&
        !isLoading &&
        subTab !== "history" &&
        (() => {
          const displayList = subTab === "pending" ? pendingReqs : allReqs;
          return displayList.length === 0 ? (
            <div
              className="text-center py-12"
              style={{ color: "oklch(0.55 0.04 80)" }}
              data-ocid="sub_requests.empty_state"
            >
              {subTab === "pending"
                ? "कोई लंबित अनुरोध नहीं है"
                : "कोई अनुरोध नहीं है"}
            </div>
          ) : (
            <div className="space-y-3" data-ocid="sub_requests.list">
              {displayList.map((req, idx) => (
                <SubRequestCard
                  key={req.id.toString()}
                  req={req}
                  idx={idx}
                  showActions={subTab === "pending"}
                />
              ))}
            </div>
          );
        })()}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
function PlanPricingEditor() {
  const { data: pricings = [], isLoading } = useAdminGetAllPlanPricings();
  const setPricingMutation = useAdminSetPlanPricing();

  const DEFAULT_PLAN_NAMES = ["30 दिन", "90 दिन", "120 दिन", "365 दिन"];
  const DEFAULT_DAYS = [30, 90, 120, 365];
  const DEFAULT_PRICES = [399, 999, 1299, 3999];

  // Local state for each plan's inputs
  const [inputs, setInputs] = useState<
    Record<string, { original: string; discount: string }>
  >(() => {
    const init: Record<string, { original: string; discount: string }> = {};
    for (const name of DEFAULT_PLAN_NAMES) {
      init[name] = { original: "", discount: "" };
    }
    return init;
  });

  const plans = DEFAULT_PLAN_NAMES.map((name, i) => {
    const found = pricings.find((p) => p.planName === name);
    return {
      planName: name,
      planDays: DEFAULT_DAYS[i],
      originalPrice: found ? found.originalPrice : DEFAULT_PRICES[i],
      discountPercent: found ? found.discountPercent : 75,
    };
  });

  const handleSave = async (planName: string) => {
    const inp = inputs[planName];
    const orig = Number(inp.original);
    const disc = Number(inp.discount);
    if (!orig || orig < 1) {
      toast.error("सही मूल कीमत डालें");
      return;
    }
    if (disc < 0 || disc > 100) {
      toast.error("छूट 0-100 के बीच होनी चाहिए");
      return;
    }
    try {
      await setPricingMutation.mutateAsync({
        planName,
        originalPrice: orig,
        discountPercent: disc,
      });
      toast.success(`${planName} की कीमत सेव हो गई`);
      setInputs((prev) => ({
        ...prev,
        [planName]: { original: "", discount: "" },
      }));
    } catch {
      toast.error("सेव नहीं हो पाया");
    }
  };

  if (isLoading)
    return (
      <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
        लोड हो रहा है...
      </p>
    );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">प्लान कीमत सेट करें</CardTitle>
      </CardHeader>
      <CardContent className="pb-4 space-y-4">
        <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
          प्रत्येक प्लान की मूल कीमत और छूट % सेट करें
        </p>
        {plans.map((plan) => {
          const inp = inputs[plan.planName];
          const previewOriginal = inp.original
            ? Number(inp.original)
            : plan.originalPrice;
          const previewDisc = inp.discount
            ? Number(inp.discount)
            : plan.discountPercent;
          const previewFinal = Math.round(
            previewOriginal * (1 - previewDisc / 100),
          );
          return (
            <div
              key={plan.planName}
              className="rounded-lg p-3 space-y-2"
              style={{
                border: "1px solid oklch(0.28 0.04 75 / 0.6)",
                background: "oklch(0.17 0.012 60)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-medium text-sm"
                  style={{ color: "oklch(0.97 0.015 80)" }}
                >
                  {plan.planName}
                </span>
                <div className="text-right">
                  <span
                    className="text-xs line-through"
                    style={{ color: "oklch(0.55 0.04 80)" }}
                  >
                    ₹{previewOriginal}
                  </span>
                  <span className="text-sm font-bold ml-2 gold-gradient-text">
                    ₹{previewFinal}
                  </span>
                  <span
                    className="text-xs ml-1"
                    style={{ color: "oklch(0.82 0.14 78)" }}
                  >
                    ({previewDisc}% OFF)
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500 block mb-1">
                    मूल कीमत (₹)
                  </p>
                  <Input
                    type="number"
                    placeholder={String(plan.originalPrice)}
                    value={inp.original}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        [plan.planName]: {
                          ...prev[plan.planName],
                          original: e.target.value,
                        },
                      }))
                    }
                    className="h-8 text-sm"
                    style={{
                      background: "oklch(0.17 0.012 60)",
                      border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                      color: "oklch(0.97 0.015 80)",
                    }}
                    data-ocid="settings.input"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 block mb-1">
                    छूट % (0-100)
                  </p>
                  <Input
                    type="number"
                    placeholder={String(plan.discountPercent)}
                    value={inp.discount}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        [plan.planName]: {
                          ...prev[plan.planName],
                          discount: e.target.value,
                        },
                      }))
                    }
                    className="h-8 text-sm"
                    style={{
                      background: "oklch(0.17 0.012 60)",
                      border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                      color: "oklch(0.97 0.015 80)",
                    }}
                    data-ocid="settings.input"
                  />
                </div>
              </div>
              <Button
                size="sm"
                className="w-full"
                disabled={
                  setPricingMutation.isPending ||
                  (!inp.original && !inp.discount)
                }
                onClick={() => handleSave(plan.planName)}
                data-ocid="settings.save_button"
              >
                {setPricingMutation.isPending
                  ? "सेव..."
                  : `${plan.planName} सेव करें`}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────
function getTrialStatus(salon: SalonWithId) {
  if (salon.pendingApproval)
    return { label: "अनुमोदन हेतु", variant: "secondary" as const };
  if (!salon.isActive)
    return { label: "निष्क्रिय", variant: "destructive" as const };
  if (salon.subscriptionActive)
    return { label: "सदस्यता सक्रिय", variant: "default" as const };
  const trialEndMs =
    Number(salon.trialStartDate) / 1_000_000 +
    Number(salon.trialDays) * 86400 * 1000;
  const now = Date.now();
  if (now > trialEndMs)
    return { label: "ट्रायल समाप्त", variant: "destructive" as const };
  const daysLeft = Math.ceil((trialEndMs - now) / (86400 * 1000));
  return { label: `ट्रायल (${daysLeft} दिन बाकी)`, variant: "outline" as const };
}

function StarDisplay({ stars }: { stars: number }) {
  return (
    <span style={{ color: "oklch(0.72 0.18 85)", letterSpacing: "1px" }}>
      {Array.from({ length: 5 }, (_, i) => (i < stars ? "★" : "☆")).join("")}
    </span>
  );
}

function ReviewsTab() {
  const [ratings, setRatings] = useState<RatingEntry[]>(() => getRatings());

  const handleDelete = (appointmentId: string) => {
    deleteRating(appointmentId);
    setRatings(getRatings());
  };

  if (ratings.length === 0) {
    return (
      <div className="text-center py-16" data-ocid="reviews.empty_state">
        <p className="text-4xl mb-3">⭐</p>
        <p style={{ color: "oklch(0.55 0.04 80)", fontWeight: 500 }}>
          कोई समीक्षा नहीं
        </p>
        <p className="text-sm " style={{ color: "oklch(0.4 0.03 70)" }}>
          ग्राहकों की समीक्षाएं यहाँ दिखेंगी
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
        कुल {ratings.length} समीक्षाएं
      </p>
      {ratings.map((entry, idx) => (
        <Card key={entry.appointmentId} data-ocid={`reviews.item.${idx + 1}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-semibold text-sm"
                    style={{ color: "oklch(0.97 0.015 80)" }}
                  >
                    {entry.salonName}
                  </span>
                  <StarDisplay stars={entry.stars} />
                </div>
                {entry.review && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: "oklch(0.97 0.015 80)" }}
                  >
                    {entry.review}
                  </p>
                )}
                <div
                  className="flex items-center gap-2 mt-2 text-xs"
                  style={{ color: "oklch(0.4 0.03 70)" }}
                >
                  <span>📱 {entry.customerPhone}</span>
                  <span>•</span>
                  <span>
                    {new Date(entry.date).toLocaleDateString("hi-IN")}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(entry.appointmentId)}
                data-ocid={`reviews.delete_button.${idx + 1}`}
                className="flex-shrink-0 text-xs h-7"
              >
                हटाएं
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const MONTHS_HI = [
  "जन",
  "फ़र",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुल",
  "अग",
  "सित",
  "अक्ट",
  "नव",
  "दिस",
];

function SubscriptionIncomeTab({
  allSalons,
  subscriptionPrice,
}: { allSalons: SalonWithId[]; subscriptionPrice: number }) {
  const { data: earnings } = useAdminGetSubRequestEarnings();
  const activeSubs = allSalons.filter(
    (s) => s.subscriptionActive && !s.pendingApproval,
  );
  const totalIncome = activeSubs.length * subscriptionPrice;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthlyData = useMemo(() => {
    return MONTHS_HI.map((month, idx) => ({
      month,
      income: idx === currentMonth ? activeSubs.length * subscriptionPrice : 0,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubs.length, subscriptionPrice, currentMonth]);

  const yearlyIncome = activeSubs.length * subscriptionPrice * 12;

  const cardBase = "rounded-xl p-4";
  const cardBaseStyle = {
    background: "oklch(0.13 0.008 60)",
    border: "1px solid oklch(0.28 0.04 75 / 0.6)",
  };

  // Backend earnings from approved subscription requests
  const backendTotal = earnings ? earnings[0] : 0;
  const backendMonthly = earnings ? earnings[1] : 0;
  const backendCount = earnings ? Number(earnings[2]) : 0;

  return (
    <div className="space-y-4">
      {/* Backend earnings from sub requests */}
      {(backendTotal > 0 || backendCount > 0) && (
        <div
          className="rounded-xl p-4"
          style={{
            background: "oklch(0.78 0.12 80 / 0.08)",
            border: "1px solid oklch(0.78 0.12 80 / 0.3)",
          }}
        >
          <p
            className="text-sm font-semibold mb-3"
            style={{ color: "oklch(0.88 0.12 82)" }}
          >
            💰 सदस्यता अनुरोधों से आय
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs" style={{ color: "oklch(0.78 0.12 80)" }}>
                कुल आय
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.88 0.12 82)" }}
              >
                ₹{backendTotal.toLocaleString("hi-IN")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs" style={{ color: "oklch(0.78 0.12 80)" }}>
                इस माह
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.88 0.12 82)" }}
              >
                ₹{backendMonthly.toLocaleString("hi-IN")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs" style={{ color: "oklch(0.78 0.12 80)" }}>
                स्वीकृत
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.88 0.12 82)" }}
              >
                {backendCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={cardBase} style={cardBaseStyle}>
          <p className="text-xs text-gray-500 mb-1">कुल सक्रिय सदस्यताएं</p>
          <p
            className="text-2xl font-bold"
            style={{ color: "oklch(0.78 0.12 80)" }}
          >
            {activeSubs.length}
          </p>
        </div>
        <div className={cardBase} style={cardBaseStyle}>
          <p className="text-xs text-gray-500 mb-1">सदस्यता मूल्य</p>
          <p
            className="text-2xl font-bold"
            style={{ color: "oklch(0.88 0.12 82)" }}
          >
            ₹{subscriptionPrice}/माह
          </p>
        </div>
        <div className={cardBase} style={cardBaseStyle}>
          <p className="text-xs text-gray-500 mb-1">इस माह आय (अनुमानित)</p>
          <p className="text-2xl font-bold text-green-700">
            ₹{totalIncome.toLocaleString("hi-IN")}
          </p>
        </div>
        <div className={cardBase} style={cardBaseStyle}>
          <p className="text-xs text-gray-500 mb-1">वार्षिक आय (अनुमानित)</p>
          <p className="text-2xl font-bold text-purple-600">
            ₹{yearlyIncome.toLocaleString("hi-IN")}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className={cardBase} style={cardBaseStyle}>
        <p className="text-sm font-semibold text-gray-800 mb-3">
          मासिक सब्स्क्रिप्शन आय ({currentYear})
        </p>
        {activeSubs.length === 0 ? (
          <p
            className="text-sm text-center py-4"
            style={{ color: "oklch(0.55 0.04 80)" }}
          >
            अभी कोई सक्रिय सदस्यता नहीं
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={monthlyData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.22 0.02 70)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "oklch(0.55 0.04 80)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.55 0.04 80)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                }
              />
              <Tooltip
                formatter={(v: number) => [`₹${v}`, "आय"]}
                contentStyle={{
                  background: "oklch(0.13 0.008 60)",
                  border: "1px solid oklch(0.28 0.04 75 / 0.6)",
                  color: "oklch(0.97 0.015 80)",
                }}
              />
              <Bar
                dataKey="income"
                fill="oklch(0.78 0.12 80)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        <p className="text-xs text-gray-400 mt-2 text-center">
          * अनुमानित आय — वर्तमान सक्रिय सदस्यताओं पर आधारित
        </p>
      </div>

      {/* Active subscriptions list */}
      <div className={cardBase} style={cardBaseStyle}>
        <p className="text-sm font-semibold text-gray-800 mb-3">
          सक्रिय सदस्यताएं ({activeSubs.length})
        </p>
        {activeSubs.length === 0 ? (
          <p className="text-sm" style={{ color: "oklch(0.4 0.03 70)" }}>
            कोई सक्रिय सदस्यता नहीं
          </p>
        ) : (
          <div
            className="divide-y"
            style={{ borderColor: "oklch(0.22 0.03 70)" }}
          >
            {activeSubs.map((s) => (
              <div
                key={s.id.toString()}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.97 0.015 80)" }}
                  >
                    {s.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.04 80)" }}
                  >
                    {s.city} • {s.phone}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  ₹{subscriptionPrice}/माह
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BackupTab() {
  const backupMutation = useAdminBackup();
  const restoreMutation = useAdminRestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    try {
      const data = await backupMutation.mutateAsync();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `salon360-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("बैकअप सफलतापूर्वक डाउनलोड हो गया!");
    } catch {
      toast.error("बैकअप में समस्या आई। दोबारा कोशिश करें।");
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const convertIds = (arr: any[]) =>
        arr.map((item) => {
          const out: any = {};
          for (const [k, v] of Object.entries(item)) {
            out[k] = typeof v === "string" && /^\d+$/.test(v) ? BigInt(v) : v;
          }
          return out;
        });
      const ownerMap = (data.ownerMap as [string, string][]).map(
        ([phone, id]) => [phone, BigInt(id)] as [string, bigint],
      );
      const nextIds: [bigint, bigint, bigint] = [
        BigInt(data.nextIds[0]),
        BigInt(data.nextIds[1]),
        BigInt(data.nextIds[2]),
      ];
      await restoreMutation.mutateAsync({
        salons: convertIds(data.salons),
        services: convertIds(data.services),
        appointments: convertIds(data.appointments),
        customers: data.customers,
        ownerMap,
        nextIds,
      });
      toast.success("डेटा सफलतापूर्वक रिस्टोर हो गया!");
    } catch {
      toast.error("रिस्टोर में समस्या आई। सही JSON फ़ाइल चुनें।");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">डेटा बैकअप</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
            सभी सैलून, सेवाएं, अपॉइंटमेंट और ग्राहकों का पूरा डेटा JSON फ़ाइल में डाउनलोड
            होगा।
          </p>
          <Button
            onClick={handleBackup}
            disabled={backupMutation.isPending}
            className="w-full"
            data-ocid="backup.primary_button"
          >
            {backupMutation.isPending
              ? "बैकअप हो रहा है..."
              : "⬇️ Backup Data डाउनलोड करें"}
          </Button>
          {backupMutation.isPending && (
            <p
              className="text-xs text-gray-500 text-center"
              data-ocid="backup.loading_state"
            >
              पूरा डेटा लोड हो रहा है, इंतज़ार करें...
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">डेटा रिस्टोर</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-red-600 font-medium">
            ⚠️ सावधान: रिस्टोर करने पर मौजूदा सारा डेटा हट जाएगा।
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleRestoreFile}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={restoreMutation.isPending}
            className="w-full border-red-300 text-red-700 hover:bg-red-50"
            data-ocid="backup.upload_button"
          >
            {restoreMutation.isPending
              ? "रिस्टोर हो रहा है..."
              : "⬆️ Restore Data (JSON अपलोड करें)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
export default function AdminPanel({ onLogout }: { onLogout?: () => void }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [trialDaysInput, setTrialDaysInput] = useState("");
  const [priceInput, setPriceInput] = useState("");

  const { data: stats, isLoading: statsLoading } = useAdminGetDashboardStats();
  const { data: pendingSalons = [], isLoading: pendingLoading } =
    useAdminGetPendingSalons();
  const { data: allSalons = [], isLoading: salonsLoading } =
    useAdminGetAllSalons();
  const { data: defaultTrialDays } = useAdminGetDefaultTrialDays();
  const { data: subscriptionPrice } = useAdminGetSubscriptionPrice();
  const { data: pendingSubReqs = [] } = useAdminGetPendingSubRequests();

  const approveMutation = useAdminApproveSalon();
  const rejectMutation = useAdminRejectSalon();
  const setActiveMutation = useAdminSetSalonActive();
  const setSubMutation = useAdminSetSalonSubscription();
  const setTrialDaysMutation = useAdminSetDefaultTrialDays();
  const setPriceMutation = useAdminSetSubscriptionPrice();
  const processExpMutation = useAdminProcessTrialExpirations();
  const { data: revenueStats, isLoading: revenueLoading } =
    useAdminGetRevenueStats();

  const statCards = [
    {
      label: "कुल दुकानें",
      value: stats ? Number(stats.total) : "—",
      color: "oklch(0.78 0.12 80)",
    },
    {
      label: "सक्रिय दुकानें",
      value: stats ? Number(stats.active) : "—",
      color: "oklch(0.88 0.12 82)",
    },
    {
      label: "समाप्त/निष्क्रिय",
      value: stats ? Number(stats.expired) : "—",
      color: "oklch(0.7 0.2 27)",
    },
    {
      label: "लंबित अनुमोदन",
      value: stats ? Number(stats.pending) : "—",
      color: "oklch(0.82 0.14 78)",
    },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "डैशबोर्ड" },
    { id: "pending", label: `अनुमोदन (${pendingSalons.length})` },
    {
      id: "sub_requests",
      label: `सदस्यता${pendingSubReqs.length > 0 ? ` (${pendingSubReqs.length})` : ""}`,
    },
    { id: "salons", label: "सभी दुकानें" },
    { id: "settings", label: "सेटिंग" },
    { id: "revenue", label: "रेवेन्यू" },
    { id: "reviews", label: "समीक्षाएं" },
    { id: "subscription", label: "सब्स्क्रिप्शन आय" },
    { id: "backup", label: "बैकअप" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.09 0.005 60)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between sticky top-0 z-10"
        style={{
          background: "oklch(0.13 0.008 60)",
          borderBottom: "1px solid oklch(0.28 0.04 75 / 0.6)",
        }}
      >
        <div>
          <h1 className="text-lg font-bold gold-gradient-text">
            Salon360Pro Admin
          </h1>
          <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
            सुपर एडमिन पैनल
          </p>
        </div>
        {onLogout && (
          <Button variant="outline" size="sm" onClick={onLogout}>
            लॉगआउट
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div
        className="px-4 flex gap-0 overflow-x-auto"
        style={{
          background: "oklch(0.13 0.008 60)",
          borderBottom: "1px solid oklch(0.28 0.04 75 / 0.6)",
        }}
      >
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors"
            style={{
              borderBottomColor:
                tab === t.id ? "oklch(0.78 0.12 80)" : "transparent",
              color:
                tab === t.id ? "oklch(0.78 0.12 80)" : "oklch(0.55 0.04 80)",
            }}
            data-ocid={"admin.tab"}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        className="p-4 max-w-2xl mx-auto space-y-4"
        style={{ background: "oklch(0.09 0.005 60)" }}
      >
        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((s) => (
                <Card key={s.label}>
                  <CardContent className="pt-4 pb-3">
                    <div
                      className="text-3xl font-bold"
                      style={{ color: s.color }}
                    >
                      {statsLoading ? "..." : s.value}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: "oklch(0.55 0.04 80)" }}
                    >
                      {s.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pending sub requests notification */}
            {pendingSubReqs.length > 0 && (
              <Card
                className=""
                style={{
                  background: "oklch(0.78 0.12 80 / 0.07)",
                  border: "1px solid oklch(0.78 0.12 80 / 0.3)",
                }}
              >
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <p
                      className="text-sm"
                      style={{ color: "oklch(0.85 0.12 80)" }}
                    >
                      ⏳{" "}
                      <span className="font-bold">{pendingSubReqs.length}</span>{" "}
                      सदस्यता अनुरोध लंबित हैं
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab("sub_requests")}
                      className="text-xs text-amber-700 underline font-medium"
                    >
                      देखें
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription price summary on dashboard */}
            <Card className="border-blue-100 bg-blue-50">
              <CardContent className="pt-4 pb-3">
                <p className="text-sm text-blue-800">
                  सदस्यता मूल्य:{" "}
                  <span className="font-bold text-blue-900">
                    ₹{subscriptionPrice ?? 149}/माह
                  </span>
                  <button
                    type="button"
                    onClick={() => setTab("settings")}
                    className="ml-2 text-xs text-blue-600 underline"
                  >
                    बदलें
                  </button>
                </p>
              </CardContent>
            </Card>

            {/* Process Expirations */}
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-sm text-gray-700 mb-3">
                  एक्सपायर हुए ट्रायल/सदस्यता को निष्क्रिय करें
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    processExpMutation.mutate(undefined, {
                      onSuccess: () =>
                        toast.success("एक्सपायर दुकानें निष्क्रिय हो गईं"),
                    })
                  }
                  disabled={processExpMutation.isPending}
                >
                  {processExpMutation.isPending
                    ? "चल रहा है..."
                    : "ट्रायल एक्सपायर चेक करें"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Pending Tab */}
        {tab === "pending" && (
          <>
            <h2
              className="text-base font-semibold"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              अनुमोदन हेतु दुकानें
            </h2>
            {pendingLoading ? (
              <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
                लोड हो रहा है...
              </p>
            ) : pendingSalons.length === 0 ? (
              <div
                className="text-center py-12"
                style={{ color: "oklch(0.55 0.04 80)" }}
                data-ocid="pending.empty_state"
              >
                कोई लंबित अनुमोदन नहीं
              </div>
            ) : (
              pendingSalons.map((salon, idx) => (
                <Card
                  key={salon.id.toString()}
                  data-ocid={`pending.item.${idx + 1}`}
                >
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className="font-semibold"
                          style={{ color: "oklch(0.97 0.015 80)" }}
                        >
                          {salon.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.55 0.04 80)" }}
                        >
                          {salon.city} • {salon.phone}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          मालिक: {salon.ownerPhone}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          data-ocid={`pending.delete_button.${idx + 1}`}
                          onClick={() =>
                            rejectMutation.mutate(salon.id, {
                              onSuccess: () => toast.success("दुकान अस्वीकृत"),
                            })
                          }
                          disabled={rejectMutation.isPending}
                        >
                          अस्वीकार
                        </Button>
                        <Button
                          size="sm"
                          data-ocid={`pending.confirm_button.${idx + 1}`}
                          onClick={() =>
                            approveMutation.mutate(salon.id, {
                              onSuccess: () =>
                                toast.success("दुकान स्वीकृत हो गई!"),
                            })
                          }
                          disabled={approveMutation.isPending}
                        >
                          स्वीकृत करें
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}

        {/* All Salons Tab */}
        {tab === "salons" && (
          <>
            <h2
              className="text-base font-semibold"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              सभी दुकानें ({allSalons.length})
            </h2>
            {salonsLoading ? (
              <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
                लोड हो रहा है...
              </p>
            ) : allSalons.length === 0 ? (
              <div
                className="text-center py-12"
                style={{ color: "oklch(0.55 0.04 80)" }}
                data-ocid="salons.empty_state"
              >
                कोई दुकान नहीं
              </div>
            ) : (
              allSalons.map((salon, idx) => (
                <SalonManageCard
                  key={salon.id.toString()}
                  salon={salon}
                  idx={idx}
                  setActiveMutation={setActiveMutation}
                  setSubMutation={setSubMutation}
                />
              ))
            )}
          </>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <>
            <h2
              className="text-base font-semibold"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              सेटिंग
            </h2>

            {/* Subscription Price */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">सदस्यता मूल्य (₹/माह)</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-gray-500 mb-2">
                  वर्तमान: ₹{subscriptionPrice ?? 149}/माह
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="नई कीमत (जैसे 199)"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    data-ocid="settings.input"
                    className="flex-1"
                    style={{
                      background: "oklch(0.17 0.012 60)",
                      border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                      color: "oklch(0.97 0.015 80)",
                    }}
                  />
                  <Button
                    size="sm"
                    data-ocid="settings.save_button"
                    onClick={() => {
                      const p = Number(priceInput);
                      if (!p || p < 1) {
                        toast.error("सही कीमत डालें");
                        return;
                      }
                      setPriceMutation.mutate(p, {
                        onSuccess: () => {
                          toast.success(`✅ कीमत ₹${p}/माह सेव हो गई!`);
                          setPriceInput("");
                        },
                        onError: (err) => {
                          console.error("Subscription price save error:", err);
                          toast.error("कीमत सेव नहीं हो पाई। दोबारा कोशिश करें।");
                        },
                      });
                    }}
                    disabled={setPriceMutation.isPending}
                  >
                    {setPriceMutation.isPending ? "सेव..." : "सेव करें"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plan Pricing Editor */}
            <PlanPricingEditor />

            {/* Default Trial Days */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">डिफ़ॉल्ट ट्रायल अवधि</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-gray-500 mb-2">
                  वर्तमान: {defaultTrialDays ?? 7} दिन
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="ट्रायल दिन (जैसे 14)"
                    value={trialDaysInput}
                    onChange={(e) => setTrialDaysInput(e.target.value)}
                    data-ocid="settings.input"
                    className="flex-1"
                    style={{
                      background: "oklch(0.17 0.012 60)",
                      border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                      color: "oklch(0.97 0.015 80)",
                    }}
                  />
                  <Button
                    size="sm"
                    data-ocid="settings.save_button"
                    onClick={() => {
                      const d = Number(trialDaysInput);
                      if (!d || d < 1) {
                        alert("सही दिन डालें");
                        return;
                      }
                      setTrialDaysMutation.mutate(d, {
                        onSuccess: () => {
                          alert(`डिय़ॉल्ट ट्रायल ${d} दिन हो गया`);
                          setTrialDaysInput("");
                        },
                      });
                    }}
                    disabled={setTrialDaysMutation.isPending}
                  >
                    {setTrialDaysMutation.isPending ? "सेव..." : "सेव करें"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Revenue Tab */}
        {tab === "revenue" && (
          <>
            <h2
              className="text-base font-semibold"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              रेवेन्यू
            </h2>
            {revenueLoading ? (
              <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
                लोड हो रहा है...
              </p>
            ) : !revenueStats ? (
              <p className="text-sm" style={{ color: "oklch(0.55 0.04 80)" }}>
                डेटा उपलब्ध नहीं
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="pt-4 pb-3">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "oklch(0.88 0.12 82)" }}
                      >
                        ₹{revenueStats.totalRevenue.toLocaleString("hi-IN")}
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: "oklch(0.55 0.04 80)" }}
                      >
                        कुल रेवेन्यू
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-3">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "oklch(0.78 0.12 80)" }}
                      >
                        ₹{revenueStats.monthlyRevenue.toLocaleString("hi-IN")}
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: "oklch(0.55 0.04 80)" }}
                      >
                        इस माह
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">दुकानवार रेवेन्यू</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pb-2">
                    {revenueStats.perSalon.length === 0 ? (
                      <p className="text-sm text-gray-400 px-4 py-3">
                        अभी कोई रेवेन्यू नहीं
                      </p>
                    ) : (
                      <div className="divide-y">
                        {revenueStats.perSalon.map(
                          ([salonId, salonName, revenue]) => (
                            <div
                              key={String(salonId)}
                              className="flex items-center justify-between px-4 py-3"
                            >
                              <span className="text-sm text-gray-800 font-medium">
                                {salonName}
                              </span>
                              <span
                                className="text-sm font-semibold"
                                style={{ color: "oklch(0.88 0.12 82)" }}
                              >
                                ₹{revenue.toLocaleString("hi-IN")}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {/* Reviews Tab */}
        {tab === "reviews" && (
          <>
            <h2
              className="text-base font-semibold"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              ग्राहक समीक्षाएं
            </h2>
            <ReviewsTab />
          </>
        )}

        {/* Subscription Income Tab */}
        {tab === "subscription" && (
          <>
            <h2
              className="text-base font-semibold"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              सब्स्क्रिप्शन आय
            </h2>
            <SubscriptionIncomeTab
              allSalons={allSalons}
              subscriptionPrice={subscriptionPrice ?? 149}
            />
          </>
        )}

        {/* Backup Tab */}
        {tab === "backup" && (
          <>
            <h2
              className="text-base font-semibold"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              डेटा बैकअप और रिस्टोर
            </h2>
            <BackupTab />
          </>
        )}

        {/* Subscription Requests Tab */}
        {tab === "sub_requests" && (
          <>
            <h2
              className="text-base font-semibold"
              style={{ color: "oklch(0.97 0.015 80)" }}
            >
              सदस्यता अनुरोध
            </h2>
            <SubscriptionRequestsTab />
          </>
        )}
      </div>
    </div>
  );
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}salon360_salt`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function TrialDaysSaveButton({
  salonId,
  salonName,
  trialDays,
  setTrialDays,
  idx,
}: {
  salonId: bigint;
  salonName: string;
  trialDays: string;
  setTrialDays: (v: string) => void;
  idx: number;
}) {
  const setTrialDaysMutation = useAdminSetSalonTrialDays();
  return (
    <Button
      size="sm"
      data-ocid={`salons.save_button.${idx + 1}`}
      disabled={setTrialDaysMutation.isPending}
      onClick={() => {
        const d = Number(trialDays);
        if (!d || d < 1) {
          toast.error("सही दिन डालें");
          return;
        }
        setTrialDaysMutation.mutate(
          { salonId, days: BigInt(d) },
          {
            onSuccess: () => {
              toast.success(`${salonName} के लिए ट्रायल ${d} दिन सेट हो गए`);
              setTrialDays("");
            },
            onError: (err) => {
              console.error("Trial days save error:", err);
              toast.error("ट्रायल दिन सेव नहीं हो पाए। दोबारा कोशिश करें।");
            },
          },
        );
      }}
    >
      {setTrialDaysMutation.isPending ? "सेव..." : "सेव"}
    </Button>
  );
}

function SalonManageCard({
  salon,
  idx,
  setActiveMutation,
  setSubMutation,
}: {
  salon: SalonWithId;
  idx: number;
  setActiveMutation: ReturnType<typeof useAdminSetSalonActive>;
  setSubMutation: ReturnType<typeof useAdminSetSalonSubscription>;
}) {
  const trialStatus = getTrialStatus(salon);
  const [subStart, setSubStart] = useState("");
  const [subEnd, setSubEnd] = useState("");
  const [trialDays, setTrialDays] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const resetPasswordMutation = useAdminResetOwnerPassword();

  return (
    <Card data-ocid={`salons.item.${idx + 1}`}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className="font-semibold"
                style={{ color: "oklch(0.97 0.015 80)" }}
              >
                {salon.name}
              </p>
              <Badge variant={trialStatus.variant} className="text-xs">
                {trialStatus.label}
              </Badge>
            </div>
            <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
              {salon.city} • {salon.phone}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant={salon.isActive ? "destructive" : "default"}
              data-ocid={`salons.toggle.${idx + 1}`}
              onClick={() =>
                setActiveMutation.mutate(
                  { salonId: salon.id, active: !salon.isActive },
                  {
                    onSuccess: () =>
                      toast.success(
                        salon.isActive
                          ? "दुकान निष्क्रिय हो गई"
                          : "दुकान सक्रिय हो गई",
                      ),
                  },
                )
              }
              disabled={setActiveMutation.isPending}
            >
              {salon.isActive ? "निष्क्रिय करें" : "सक्रिय करें"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              data-ocid={`salons.edit_button.${idx + 1}`}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "बंद करें" : "सेटिंग"}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 pt-3 border-t">
            {/* Subscription dates */}
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "oklch(0.55 0.04 80)" }}
              >
                सदस्यता तारीखें
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    className="text-xs"
                    style={{ color: "oklch(0.4 0.03 70)" }}
                  >
                    शुरू
                    <input
                      type="date"
                      value={subStart}
                      onChange={(e) => setSubStart(e.target.value)}
                      data-ocid={`salons.input.${idx + 1}`}
                      className="w-full text-xs rounded px-2 py-1 mt-0.5 block"
                      style={{
                        background: "oklch(0.17 0.012 60)",
                        border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                        color: "oklch(0.97 0.015 80)",
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label
                    className="text-xs"
                    style={{ color: "oklch(0.4 0.03 70)" }}
                  >
                    समाप्ति
                    <input
                      type="date"
                      value={subEnd}
                      onChange={(e) => setSubEnd(e.target.value)}
                      data-ocid={`salons.input.${idx + 1}`}
                      className="w-full text-xs rounded px-2 py-1 mt-0.5 block"
                      style={{
                        background: "oklch(0.17 0.012 60)",
                        border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                        color: "oklch(0.97 0.015 80)",
                      }}
                    />
                  </label>
                </div>
              </div>
              <Button
                size="sm"
                className="mt-2 w-full"
                data-ocid={`salons.save_button.${idx + 1}`}
                onClick={() => {
                  if (!subStart || !subEnd) {
                    toast.error("दोनों तारीखें भरें");
                    return;
                  }
                  setSubMutation.mutate(
                    { salonId: salon.id, active: true },
                    { onSuccess: () => toast.success("सदस्यता सक्रिय हो गई") },
                  );
                }}
                disabled={setSubMutation.isPending}
              >
                सदस्यता सेव करें
              </Button>
            </div>

            {/* Trial days */}
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "oklch(0.55 0.04 80)" }}
              >
                ट्रायल दिन बदलें
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="दिन"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  data-ocid={`salons.input.${idx + 1}`}
                  className="flex-1 h-8 text-sm"
                  style={{
                    background: "oklch(0.17 0.012 60)",
                    border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                    color: "oklch(0.97 0.015 80)",
                  }}
                />
                <TrialDaysSaveButton
                  salonId={salon.id}
                  salonName={salon.name}
                  trialDays={trialDays}
                  setTrialDays={setTrialDays}
                  idx={idx}
                />
              </div>
              {salon.trialStartDate > 0n && (
                <p className="text-xs " style={{ color: "oklch(0.4 0.03 70)" }}>
                  ट्रायल शुरू:{" "}
                  {new Date(
                    Number(salon.trialStartDate) / 1_000_000,
                  ).toLocaleDateString("hi-IN")}
                  {" • "}
                  अवधि: {Number(salon.trialDays)} दिन
                </p>
              )}
            </div>

            {/* Password Reset */}
            <div>
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "oklch(0.55 0.04 80)" }}
              >
                पासवर्ड Reset करें
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="नया पासवर्ड (कम से कम 6 अक्षर)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 h-8 text-sm"
                  style={{
                    background: "oklch(0.17 0.012 60)",
                    border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                    color: "oklch(0.97 0.015 80)",
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  style={{
                    borderColor: "oklch(0.78 0.12 80 / 0.5)",
                    color: "oklch(0.78 0.12 80)",
                  }}
                  disabled={
                    resetPasswordMutation.isPending || newPassword.length < 6
                  }
                  onClick={async () => {
                    if (newPassword.length < 6) {
                      toast.error("पासवर्ड कम से कम 6 अक्षर का होना चाहिए");
                      return;
                    }
                    try {
                      const hash = await hashPassword(newPassword);
                      const ok = await resetPasswordMutation.mutateAsync({
                        ownerPhone: salon.ownerPhone,
                        newPasswordHash: hash,
                      });
                      if (ok) {
                        toast.success(`${salon.name} का पासवर्ड reset हो गया!`);
                        setNewPassword("");
                      } else {
                        toast.error("Owner नहीं मिला — पासवर्ड reset नहीं हुआ");
                      }
                    } catch {
                      toast.error("पासवर्ड reset नहीं हो पाया");
                    }
                  }}
                >
                  {resetPasswordMutation.isPending ? "..." : "Reset"}
                </Button>
              </div>
              <p className="text-xs " style={{ color: "oklch(0.4 0.03 70)" }}>
                Owner: {salon.ownerPhone}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
