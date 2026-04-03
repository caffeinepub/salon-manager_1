import { r as reactExports, j as jsxRuntimeExports, B as Button, I as Input, u as ue } from "./index-BjBahTrm.js";
import { u as useAdminGetDashboardStats, a as useAdminGetPendingSalons, b as useAdminGetAllSalons, c as useAdminGetDefaultTrialDays, d as useAdminGetSubscriptionPrice, e as useAdminGetPendingSubRequests, f as useAdminApproveSalon, g as useAdminRejectSalon, h as useAdminSetSalonActive, i as useAdminSetSalonSubscription, j as useAdminSetDefaultTrialDays, k as useAdminSetSubscriptionPrice, l as useAdminProcessTrialExpirations, m as useAdminGetRevenueStats, C as Card, n as CardContent, o as CardHeader, p as CardTitle, q as useAdminResetOwnerPassword, B as Badge, r as useAdminGetAllPlanPricings, s as useAdminSetPlanPricing, t as useAdminGetSubRequestEarnings, v as useAdminBackup, w as useAdminRestore, x as useAdminGetAllSubRequests, y as useAdminExpireOldSubRequests, z as useAdminApproveSubRequest, A as useAdminRejectSubRequest } from "./tabs-kunlmpH-.js";
import { getRatings, deleteRating } from "./CustomerDashboard-Cp62wwQa.js";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Bar } from "./BarChart-BpZvxPzh.js";
import "./clock-Bdt9b--6.js";
function formatRemainingTime(requestTimeNs) {
  const requestMs = Number(requestTimeNs) / 1e6;
  const twoHours = 2 * 60 * 60 * 1e3;
  const elapsed = Date.now() - requestMs;
  const remaining = Math.max(0, twoHours - elapsed);
  if (remaining === 0) return "समय सीमा समाप्त";
  const hrs = Math.floor(remaining / 36e5);
  const mins = Math.floor(remaining % 36e5 / 6e4);
  return `${hrs} घंटे ${mins} मिनट बचे`;
}
function formatDate(ns) {
  const ms = Number(ns) / 1e6;
  if (ms < 1e3) return "—";
  return new Date(ms).toLocaleString("hi-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function StatusBadge({ status }) {
  if (status === "pending")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-100 text-amber-800 border-amber-300 text-xs", children: "⏳ प्रतीक्षारत" });
  if (status === "approved")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800 border-green-300 text-xs", children: "✅ स्वीकृत" });
  if (status === "rejected")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-800 border-red-300 text-xs", children: "❌ अस्वीकृत" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-gray-100 text-gray-500 border-gray-200 text-xs", children: "⏰ एक्सपायर्ड" });
}
function SubRequestCard({
  req,
  idx,
  showActions
}) {
  const approveMutation = useAdminApproveSubRequest();
  const rejectMutation = useAdminRejectSubRequest();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border", "data-ocid": `sub_requests.item.${idx + 1}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: req.salonName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
          "फ़ोन: ",
          req.ownerPhone
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: req.status })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg p-3 bg-gray-50 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "प्लान" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-gray-800", children: [
          req.planName,
          " (",
          Number(req.planDays),
          " दिन)"
        ] })
      ] }),
      req.originalPrice > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "मूल कीमत" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm line-through text-gray-400", children: [
            "₹",
            req.originalPrice
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "छूट" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-orange-600 font-medium", children: [
            "-",
            req.discountPercent,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-1 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-700", children: "देय राशि" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-base font-bold text-green-700", children: [
            "₹",
            req.finalPrice
          ] })
        ] }),
        req.savings > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600", children: [
          "₹",
          req.savings,
          " की बचत"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-400 space-y-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "अनुरोध समय: ",
        formatDate(req.requestTime)
      ] }),
      req.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-amber-600 font-medium", children: [
        "≈ ",
        formatRemainingTime(req.requestTime)
      ] }),
      req.status === "approved" && req.approvedAt > 0n && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-600", children: [
        "स्वीकृत: ",
        formatDate(req.approvedAt)
      ] })
    ] }),
    req.screenshotBase64 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "भुगतान स्क्रीनशॉट:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: req.screenshotBase64,
          alt: "screenshot",
          className: "max-h-48 w-full rounded border object-contain bg-gray-50"
        }
      )
    ] }),
    showActions && req.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          className: "flex-1 bg-green-600 hover:bg-green-700 text-white",
          disabled: approveMutation.isPending || rejectMutation.isPending,
          onClick: () => approveMutation.mutate(req.id, {
            onSuccess: (ok) => {
              if (ok)
                ue.success(`${req.salonName} की सदस्यता स्वीकृत की गई`);
              else ue.error("स्वीकृति नहीं हो पाई");
            },
            onError: () => ue.error("कोशिश करें")
          }),
          "data-ocid": `sub_requests.confirm_button.${idx + 1}`,
          children: approveMutation.isPending ? "..." : "✅ स्वीकृत करें"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          variant: "destructive",
          className: "flex-1",
          disabled: approveMutation.isPending || rejectMutation.isPending,
          onClick: () => rejectMutation.mutate(req.id, {
            onSuccess: () => ue.success(`${req.salonName} का अनुरोध अस्वीकृत किया गया`),
            onError: () => ue.error("कोशिश करें")
          }),
          "data-ocid": `sub_requests.delete_button.${idx + 1}`,
          children: rejectMutation.isPending ? "..." : "❌ अस्वीकृत"
        }
      )
    ] })
  ] }) });
}
function SubscriptionRequestsTab() {
  const [subTab, setSubTab] = reactExports.useState("pending");
  const { data: pendingReqs = [], isLoading: pendingLoading } = useAdminGetPendingSubRequests();
  const { data: allReqs = [], isLoading: allLoading } = useAdminGetAllSubRequests();
  const expireMutation = useAdminExpireOldSubRequests();
  reactExports.useEffect(() => {
    expireMutation.mutate();
  }, []);
  const displayList = subTab === "pending" ? pendingReqs : allReqs;
  const isLoading = subTab === "pending" ? pendingLoading : allLoading;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex rounded-lg overflow-hidden border border-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setSubTab("pending"),
          className: `flex-1 py-2 text-sm font-medium transition-colors ${subTab === "pending" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`,
          "data-ocid": "sub_requests.tab",
          children: [
            "⏳ लंबित (",
            pendingReqs.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setSubTab("history"),
          className: `flex-1 py-2 text-sm font-medium transition-colors border-l ${subTab === "history" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`,
          "data-ocid": "sub_requests.tab",
          children: [
            "📜 इतिहास (",
            allReqs.length,
            ")"
          ]
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "py-8 text-center",
        "data-ocid": "sub_requests.loading_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block w-5 h-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-2", children: "लोड हो रहा है..." })
        ]
      }
    ) : displayList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "text-center py-12 text-gray-400",
        "data-ocid": "sub_requests.empty_state",
        children: subTab === "pending" ? "कोई लंबित अनुरोध नहीं है" : "कोई इतिहास नहीं है"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "sub_requests.list", children: displayList.map((req, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      SubRequestCard,
      {
        req,
        idx,
        showActions: subTab === "pending"
      },
      req.id.toString()
    )) })
  ] });
}
function PlanPricingEditor() {
  const { data: pricings = [], isLoading } = useAdminGetAllPlanPricings();
  const setPricingMutation = useAdminSetPlanPricing();
  const DEFAULT_PLAN_NAMES = ["30 दिन", "90 दिन", "120 दिन", "365 दिन"];
  const DEFAULT_DAYS = [30, 90, 120, 365];
  const DEFAULT_PRICES = [399, 999, 1299, 3999];
  const [inputs, setInputs] = reactExports.useState(() => {
    const init = {};
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
      discountPercent: found ? found.discountPercent : 75
    };
  });
  const handleSave = async (planName) => {
    const inp = inputs[planName];
    const orig = Number(inp.original);
    const disc = Number(inp.discount);
    if (!orig || orig < 1) {
      ue.error("सही मूल कीमत डालें");
      return;
    }
    if (disc < 0 || disc > 100) {
      ue.error("छूट 0-100 के बीच होनी चाहिए");
      return;
    }
    try {
      await setPricingMutation.mutateAsync({
        planName,
        originalPrice: orig,
        discountPercent: disc
      });
      ue.success(`${planName} की कीमत सेव हो गई`);
      setInputs((prev) => ({
        ...prev,
        [planName]: { original: "", discount: "" }
      }));
    } catch {
      ue.error("सेव नहीं हो पाया");
    }
  };
  if (isLoading)
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "लोड हो रहा है..." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "प्लान कीमत सेट करें" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pb-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "प्रत्येक प्लान की मूल कीमत और छूट % सेट करें" }),
      plans.map((plan) => {
        const inp = inputs[plan.planName];
        const previewOriginal = inp.original ? Number(inp.original) : plan.originalPrice;
        const previewDisc = inp.discount ? Number(inp.discount) : plan.discountPercent;
        const previewFinal = Math.round(
          previewOriginal * (1 - previewDisc / 100)
        );
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "border rounded-lg p-3 space-y-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-800", children: plan.planName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400 line-through", children: [
                    "₹",
                    previewOriginal
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-green-700 ml-2", children: [
                    "₹",
                    previewFinal
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-orange-500 ml-1", children: [
                    "(",
                    previewDisc,
                    "% OFF)"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 block mb-1", children: "मूल कीमत (₹)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "number",
                      placeholder: String(plan.originalPrice),
                      value: inp.original,
                      onChange: (e) => setInputs((prev) => ({
                        ...prev,
                        [plan.planName]: {
                          ...prev[plan.planName],
                          original: e.target.value
                        }
                      })),
                      className: "h-8 text-sm",
                      "data-ocid": "settings.input"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 block mb-1", children: "छूट % (0-100)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "number",
                      placeholder: String(plan.discountPercent),
                      value: inp.discount,
                      onChange: (e) => setInputs((prev) => ({
                        ...prev,
                        [plan.planName]: {
                          ...prev[plan.planName],
                          discount: e.target.value
                        }
                      })),
                      className: "h-8 text-sm",
                      "data-ocid": "settings.input"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  className: "w-full",
                  disabled: setPricingMutation.isPending || !inp.original && !inp.discount,
                  onClick: () => handleSave(plan.planName),
                  "data-ocid": "settings.save_button",
                  children: setPricingMutation.isPending ? "सेव..." : `${plan.planName} सेव करें`
                }
              )
            ]
          },
          plan.planName
        );
      })
    ] })
  ] });
}
function getTrialStatus(salon) {
  if (salon.pendingApproval)
    return { label: "अनुमोदन हेतु", variant: "secondary" };
  if (!salon.isActive)
    return { label: "निष्क्रिय", variant: "destructive" };
  if (salon.subscriptionActive)
    return { label: "सदस्यता सक्रिय", variant: "default" };
  const trialEndMs = Number(salon.trialStartDate) / 1e6 + Number(salon.trialDays) * 86400 * 1e3;
  const now = Date.now();
  if (now > trialEndMs)
    return { label: "ट्रायल समाप्त", variant: "destructive" };
  const daysLeft = Math.ceil((trialEndMs - now) / (86400 * 1e3));
  return { label: `ट्रायल (${daysLeft} दिन बाकी)`, variant: "outline" };
}
function StarDisplay({ stars }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "oklch(0.72 0.18 85)", letterSpacing: "1px" }, children: Array.from({ length: 5 }, (_, i) => i < stars ? "★" : "☆").join("") });
}
function ReviewsTab() {
  const [ratings, setRatings] = reactExports.useState(() => getRatings());
  const handleDelete = (appointmentId) => {
    deleteRating(appointmentId);
    setRatings(getRatings());
  };
  if (ratings.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16", "data-ocid": "reviews.empty_state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl mb-3", children: "⭐" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 font-medium", children: "कोई समीक्षा नहीं" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 mt-1", children: "ग्राहकों की समीक्षाएं यहाँ दिखेंगी" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
      "कुल ",
      ratings.length,
      " समीक्षाएं"
    ] }),
    ratings.map((entry, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { "data-ocid": `reviews.item.${idx + 1}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-gray-800", children: entry.salonName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StarDisplay, { stars: entry.stars })
        ] }),
        entry.review && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 mt-1", children: entry.review }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2 text-xs text-gray-400", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "📱 ",
            entry.customerPhone
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(entry.date).toLocaleDateString("hi-IN") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          variant: "destructive",
          onClick: () => handleDelete(entry.appointmentId),
          "data-ocid": `reviews.delete_button.${idx + 1}`,
          className: "flex-shrink-0 text-xs h-7",
          children: "हटाएं"
        }
      )
    ] }) }) }, entry.appointmentId))
  ] });
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
  "दिस"
];
function SubscriptionIncomeTab({
  allSalons,
  subscriptionPrice
}) {
  const { data: earnings } = useAdminGetSubRequestEarnings();
  const activeSubs = allSalons.filter(
    (s) => s.subscriptionActive && !s.pendingApproval
  );
  const totalIncome = activeSubs.length * subscriptionPrice;
  const now = /* @__PURE__ */ new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthlyData = reactExports.useMemo(() => {
    return MONTHS_HI.map((month, idx) => ({
      month,
      income: idx === currentMonth ? activeSubs.length * subscriptionPrice : 0
    }));
  }, [activeSubs.length, subscriptionPrice, currentMonth]);
  const yearlyIncome = activeSubs.length * subscriptionPrice * 12;
  const cardBase = "rounded-xl p-4 bg-white border border-gray-100 shadow-sm";
  const backendTotal = earnings ? earnings[0] : 0;
  const backendMonthly = earnings ? earnings[1] : 0;
  const backendCount = earnings ? Number(earnings[2]) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    (backendTotal > 0 || backendCount > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-green-800 mb-3", children: "💰 सदस्यता अनुरोधों से आय" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600", children: "कुल आय" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-green-800", children: [
            "₹",
            backendTotal.toLocaleString("hi-IN")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600", children: "इस माह" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-green-800", children: [
            "₹",
            backendMonthly.toLocaleString("hi-IN")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600", children: "स्वीकृत" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-green-800", children: backendCount })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cardBase, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "कुल सक्रिय सदस्यताएं" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-blue-600", children: activeSubs.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cardBase, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "सदस्यता मूल्य" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-green-600", children: [
          "₹",
          subscriptionPrice,
          "/माह"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cardBase, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "इस माह आय (अनुमानित)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-green-700", children: [
          "₹",
          totalIncome.toLocaleString("hi-IN")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cardBase, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "वार्षिक आय (अनुमानित)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-purple-600", children: [
          "₹",
          yearlyIncome.toLocaleString("hi-IN")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cardBase, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-gray-800 mb-3", children: [
        "मासिक सब्स्क्रिप्शन आय (",
        currentYear,
        ")"
      ] }),
      activeSubs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 text-center py-4", children: "अभी कोई सक्रिय सदस्यता नहीं" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 160, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        BarChart,
        {
          data: monthlyData,
          margin: { top: 4, right: 4, left: -20, bottom: 0 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              XAxis,
              {
                dataKey: "month",
                tick: { fontSize: 10, fill: "#6b7280" },
                axisLine: false,
                tickLine: false
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              YAxis,
              {
                tick: { fontSize: 10, fill: "#6b7280" },
                axisLine: false,
                tickLine: false,
                tickFormatter: (v) => v >= 1e3 ? `${(v / 1e3).toFixed(1)}k` : String(v)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => [`₹${v}`, "आय"] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "income", fill: "#3b82f6", radius: [4, 4, 0, 0] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-2 text-center", children: "* अनुमानित आय — वर्तमान सक्रिय सदस्यताओं पर आधारित" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cardBase, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-gray-800 mb-3", children: [
        "सक्रिय सदस्यताएं (",
        activeSubs.length,
        ")"
      ] }),
      activeSubs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400", children: "कोई सक्रिय सदस्यता नहीं" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: activeSubs.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center justify-between py-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-800", children: s.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
                s.city,
                " • ",
                s.phone
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-green-600", children: [
              "₹",
              subscriptionPrice,
              "/माह"
            ] })
          ]
        },
        s.id.toString()
      )) })
    ] })
  ] });
}
function BackupTab() {
  const backupMutation = useAdminBackup();
  const restoreMutation = useAdminRestore();
  const fileInputRef = reactExports.useRef(null);
  const handleBackup = async () => {
    try {
      const data = await backupMutation.mutateAsync();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `salon360-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      ue.success("बैकअप सफलतापूर्वक डाउनलोड हो गया!");
    } catch {
      ue.error("बैकअप में समस्या आई। दोबारा कोशिश करें।");
    }
  };
  const handleRestoreFile = async (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const convertIds = (arr) => arr.map((item) => {
        const out = {};
        for (const [k, v] of Object.entries(item)) {
          out[k] = typeof v === "string" && /^\d+$/.test(v) ? BigInt(v) : v;
        }
        return out;
      });
      const ownerMap = data.ownerMap.map(
        ([phone, id]) => [phone, BigInt(id)]
      );
      const nextIds = [
        BigInt(data.nextIds[0]),
        BigInt(data.nextIds[1]),
        BigInt(data.nextIds[2])
      ];
      await restoreMutation.mutateAsync({
        salons: convertIds(data.salons),
        services: convertIds(data.services),
        appointments: convertIds(data.appointments),
        customers: data.customers,
        ownerMap,
        nextIds
      });
      ue.success("डेटा सफलतापूर्वक रिस्टोर हो गया!");
    } catch {
      ue.error("रिस्टोर में समस्या आई। सही JSON फ़ाइल चुनें।");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "डेटा बैकअप" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "सभी सैलून, सेवाएं, अपॉइंटमेंट और ग्राहकों का पूरा डेटा JSON फ़ाइल में डाउनलोड होगा।" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleBackup,
            disabled: backupMutation.isPending,
            className: "w-full",
            "data-ocid": "backup.primary_button",
            children: backupMutation.isPending ? "बैकअप हो रहा है..." : "⬇️ Backup Data डाउनलोड करें"
          }
        ),
        backupMutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "text-xs text-gray-500 text-center",
            "data-ocid": "backup.loading_state",
            children: "पूरा डेटा लोड हो रहा है, इंतज़ार करें..."
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "डेटा रिस्टोर" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 font-medium", children: "⚠️ सावधान: रिस्टोर करने पर मौजूदा सारा डेटा हट जाएगा।" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: ".json",
            className: "hidden",
            onChange: handleRestoreFile
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: () => {
              var _a;
              return (_a = fileInputRef.current) == null ? void 0 : _a.click();
            },
            disabled: restoreMutation.isPending,
            className: "w-full border-red-300 text-red-700 hover:bg-red-50",
            "data-ocid": "backup.upload_button",
            children: restoreMutation.isPending ? "रिस्टोर हो रहा है..." : "⬆️ Restore Data (JSON अपलोड करें)"
          }
        )
      ] })
    ] })
  ] });
}
function AdminPanel({ onLogout }) {
  const [tab, setTab] = reactExports.useState("dashboard");
  const [trialDaysInput, setTrialDaysInput] = reactExports.useState("");
  const [priceInput, setPriceInput] = reactExports.useState("");
  const { data: stats, isLoading: statsLoading } = useAdminGetDashboardStats();
  const { data: pendingSalons = [], isLoading: pendingLoading } = useAdminGetPendingSalons();
  const { data: allSalons = [], isLoading: salonsLoading } = useAdminGetAllSalons();
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
  const { data: revenueStats, isLoading: revenueLoading } = useAdminGetRevenueStats();
  const statCards = [
    {
      label: "कुल दुकानें",
      value: stats ? Number(stats.total) : "—",
      color: "text-blue-600"
    },
    {
      label: "सक्रिय दुकानें",
      value: stats ? Number(stats.active) : "—",
      color: "text-green-600"
    },
    {
      label: "समाप्त/निष्क्रिय",
      value: stats ? Number(stats.expired) : "—",
      color: "text-red-600"
    },
    {
      label: "लंबित अनुमोदन",
      value: stats ? Number(stats.pending) : "—",
      color: "text-yellow-600"
    }
  ];
  const tabs = [
    { id: "dashboard", label: "डैशबोर्ड" },
    { id: "pending", label: `अनुमोदन (${pendingSalons.length})` },
    {
      id: "sub_requests",
      label: `सदस्यता${pendingSubReqs.length > 0 ? ` (${pendingSubReqs.length})` : ""}`
    },
    { id: "salons", label: "सभी दुकानें" },
    { id: "settings", label: "सेटिंग" },
    { id: "revenue", label: "रेवेन्यू" },
    { id: "reviews", label: "समीक्षाएं" },
    { id: "subscription", label: "सब्स्क्रिप्शन आय" },
    { id: "backup", label: "बैकअप" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-gray-900", children: "Salon360Pro Admin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "सुपर एडमिन पैनल" })
      ] }),
      onLogout && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: onLogout, children: "लॉगआउट" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b px-4 flex gap-0 overflow-x-auto", children: tabs.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setTab(t.id),
        className: `px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`,
        "data-ocid": "admin.tab",
        children: t.label
      },
      t.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 max-w-2xl mx-auto space-y-4", children: [
      tab === "dashboard" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: statCards.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-3xl font-bold ${s.color}`, children: statsLoading ? "..." : s.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500 mt-1", children: s.label })
        ] }) }, s.label)) }),
        pendingSubReqs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-amber-200 bg-amber-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-amber-800", children: [
            "⏳",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: pendingSubReqs.length }),
            " ",
            "सदस्यता अनुरोध लंबित हैं"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setTab("sub_requests"),
              className: "text-xs text-amber-700 underline font-medium",
              children: "देखें"
            }
          )
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-blue-100 bg-blue-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800", children: [
          "सदस्यता मूल्य:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-blue-900", children: [
            "₹",
            subscriptionPrice ?? 149,
            "/माह"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setTab("settings"),
              className: "ml-2 text-xs text-blue-600 underline",
              children: "बदलें"
            }
          )
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 mb-3", children: "एक्सपायर हुए ट्रायल/सदस्यता को निष्क्रिय करें" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => processExpMutation.mutate(void 0, {
                onSuccess: () => alert("एक्सपायर दुकानें निष्क्रिय हो गईं")
              }),
              disabled: processExpMutation.isPending,
              children: processExpMutation.isPending ? "चल रहा है..." : "ट्रायल एक्सपायर चेक करें"
            }
          )
        ] }) })
      ] }),
      tab === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "अनुमोदन हेतु दुकानें" }),
        pendingLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm", children: "लोड हो रहा है..." }) : pendingSalons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "text-center py-12 text-gray-400",
            "data-ocid": "pending.empty_state",
            children: "कोई लंबित अनुमोदन नहीं"
          }
        ) : pendingSalons.map((salon, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            "data-ocid": `pending.item.${idx + 1}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: salon.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
                  salon.city,
                  " • ",
                  salon.phone
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-0.5", children: [
                  "मालिक: ",
                  salon.ownerPhone
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "text-red-600 border-red-200 hover:bg-red-50",
                    "data-ocid": `pending.delete_button.${idx + 1}`,
                    onClick: () => rejectMutation.mutate(salon.id, {
                      onSuccess: () => alert("दुकान अस्वीकृत")
                    }),
                    disabled: rejectMutation.isPending,
                    children: "अस्वीकार"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    "data-ocid": `pending.confirm_button.${idx + 1}`,
                    onClick: () => approveMutation.mutate(salon.id, {
                      onSuccess: () => alert("दुकान स्वीकृत हो गई!")
                    }),
                    disabled: approveMutation.isPending,
                    children: "स्वीकृत करें"
                  }
                )
              ] })
            ] }) })
          },
          salon.id.toString()
        ))
      ] }),
      tab === "salons" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-semibold text-gray-800", children: [
          "सभी दुकानें (",
          allSalons.length,
          ")"
        ] }),
        salonsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm", children: "लोड हो रहा है..." }) : allSalons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "text-center py-12 text-gray-400",
            "data-ocid": "salons.empty_state",
            children: "कोई दुकान नहीं"
          }
        ) : allSalons.map((salon, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          SalonManageCard,
          {
            salon,
            idx,
            setActiveMutation,
            setSubMutation
          },
          salon.id.toString()
        ))
      ] }),
      tab === "settings" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "सेटिंग" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "सदस्यता मूल्य (₹/माह)" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mb-2", children: [
              "वर्तमान: ₹",
              subscriptionPrice ?? 149,
              "/माह"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  placeholder: "नई कीमत (जैसे 199)",
                  value: priceInput,
                  onChange: (e) => setPriceInput(e.target.value),
                  "data-ocid": "settings.input",
                  className: "flex-1"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  "data-ocid": "settings.save_button",
                  onClick: () => {
                    const p = Number(priceInput);
                    if (!p || p < 1) {
                      alert("सही कीमत डालें");
                      return;
                    }
                    setPriceMutation.mutate(p, {
                      onSuccess: () => {
                        alert(`कीमत ₹${p}/माह हो गई`);
                        setPriceInput("");
                      }
                    });
                  },
                  disabled: setPriceMutation.isPending,
                  children: setPriceMutation.isPending ? "सेव..." : "सेव करें"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PlanPricingEditor, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "डिफ़ॉल्ट ट्रायल अवधि" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mb-2", children: [
              "वर्तमान: ",
              defaultTrialDays ?? 7,
              " दिन"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  placeholder: "ट्रायल दिन (जैसे 14)",
                  value: trialDaysInput,
                  onChange: (e) => setTrialDaysInput(e.target.value),
                  "data-ocid": "settings.input",
                  className: "flex-1"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  "data-ocid": "settings.save_button",
                  onClick: () => {
                    const d = Number(trialDaysInput);
                    if (!d || d < 1) {
                      alert("सही दिन डालें");
                      return;
                    }
                    setTrialDaysMutation.mutate(d, {
                      onSuccess: () => {
                        alert(`डिय़ॉल्ट ट्रायल ${d} दिन हो गया`);
                        setTrialDaysInput("");
                      }
                    });
                  },
                  disabled: setTrialDaysMutation.isPending,
                  children: setTrialDaysMutation.isPending ? "सेव..." : "सेव करें"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      tab === "revenue" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "रेवेन्यू" }),
        revenueLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm", children: "लोड हो रहा है..." }) : !revenueStats ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-400 text-sm", children: "डेटा उपलब्ध नहीं" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-green-600", children: [
                "₹",
                revenueStats.totalRevenue.toLocaleString("hi-IN")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500 mt-1", children: "कुल रेवेन्यू" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [
                "₹",
                revenueStats.monthlyRevenue.toLocaleString("hi-IN")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500 mt-1", children: "इस माह" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "दुकानवार रेवेन्यू" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 pb-2", children: revenueStats.perSalon.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 px-4 py-3", children: "अभी कोई रेवेन्यू नहीं" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: revenueStats.perSalon.map(
              ([salonId, salonName, revenue]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center justify-between px-4 py-3",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-800 font-medium", children: salonName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-green-700", children: [
                      "₹",
                      revenue.toLocaleString("hi-IN")
                    ] })
                  ]
                },
                String(salonId)
              )
            ) }) })
          ] })
        ] })
      ] }),
      tab === "reviews" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "ग्राहक समीक्षाएं" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewsTab, {})
      ] }),
      tab === "subscription" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "सब्स्क्रिप्शन आय" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SubscriptionIncomeTab,
          {
            allSalons,
            subscriptionPrice: subscriptionPrice ?? 149
          }
        )
      ] }),
      tab === "backup" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "डेटा बैकअप और रिस्टोर" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BackupTab, {})
      ] }),
      tab === "sub_requests" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "सदस्यता अनुरोध" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionRequestsTab, {})
      ] })
    ] })
  ] });
}
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}salon360_salt`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
function SalonManageCard({
  salon,
  idx,
  setActiveMutation,
  setSubMutation
}) {
  const trialStatus = getTrialStatus(salon);
  const [subStart, setSubStart] = reactExports.useState("");
  const [subEnd, setSubEnd] = reactExports.useState("");
  const [trialDays, setTrialDays] = reactExports.useState("");
  const [expanded, setExpanded] = reactExports.useState(false);
  const [newPassword, setNewPassword] = reactExports.useState("");
  const resetPasswordMutation = useAdminResetOwnerPassword();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { "data-ocid": `salons.item.${idx + 1}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 pb-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: salon.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: trialStatus.variant, className: "text-xs", children: trialStatus.label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
          salon.city,
          " • ",
          salon.phone
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: salon.isActive ? "destructive" : "default",
            "data-ocid": `salons.toggle.${idx + 1}`,
            onClick: () => setActiveMutation.mutate(
              { salonId: salon.id, active: !salon.isActive },
              {
                onSuccess: () => alert(
                  salon.isActive ? "दुकान निष्क्रिय हो गई" : "दुकान सक्रिय हो गई"
                )
              }
            ),
            disabled: setActiveMutation.isPending,
            children: salon.isActive ? "निष्क्रिय करें" : "सक्रिय करें"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: "outline",
            "data-ocid": `salons.edit_button.${idx + 1}`,
            onClick: () => setExpanded((v) => !v),
            children: expanded ? "बंद करें" : "सेटिंग"
          }
        )
      ] })
    ] }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3 pt-3 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-600 mb-1", children: "सदस्यता तारीखें" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs text-gray-400", children: [
            "शुरू",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: subStart,
                onChange: (e) => setSubStart(e.target.value),
                "data-ocid": `salons.input.${idx + 1}`,
                className: "w-full text-xs border rounded px-2 py-1 mt-0.5 block"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs text-gray-400", children: [
            "समाप्ति",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: subEnd,
                onChange: (e) => setSubEnd(e.target.value),
                "data-ocid": `salons.input.${idx + 1}`,
                className: "w-full text-xs border rounded px-2 py-1 mt-0.5 block"
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            className: "mt-2 w-full",
            "data-ocid": `salons.save_button.${idx + 1}`,
            onClick: () => {
              if (!subStart || !subEnd) {
                alert("दोनों तारीखें भरें");
                return;
              }
              setSubMutation.mutate(
                { salonId: salon.id, active: true },
                { onSuccess: () => alert("सदस्यता सक्रिय हो गई") }
              );
            },
            disabled: setSubMutation.isPending,
            children: "सदस्यता सेव करें"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-600 mb-1", children: "ट्रायल दिन बदलें" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              placeholder: "दिन",
              value: trialDays,
              onChange: (e) => setTrialDays(e.target.value),
              "data-ocid": `salons.input.${idx + 1}`,
              className: "flex-1 h-8 text-sm"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              "data-ocid": `salons.save_button.${idx + 1}`,
              onClick: () => {
                const d = Number(trialDays);
                if (!d || d < 1) {
                  alert("सही दिन डालें");
                  return;
                }
                alert(`${salon.name} के लिए ट्रायल ${d} दिन सेट करें`);
              },
              children: "सेव"
            }
          )
        ] }),
        salon.trialStartDate > 0n && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
          "ट्रायल शुरू:",
          " ",
          new Date(
            Number(salon.trialStartDate) / 1e6
          ).toLocaleDateString("hi-IN"),
          " • ",
          "अवधि: ",
          Number(salon.trialDays),
          " दिन"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-gray-600 mb-1", children: "पासवर्ड Reset करें" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "password",
              placeholder: "नया पासवर्ड (कम से कम 6 अक्षर)",
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              className: "flex-1 h-8 text-sm"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "border-orange-300 text-orange-700 hover:bg-orange-50",
              disabled: resetPasswordMutation.isPending || newPassword.length < 6,
              onClick: async () => {
                if (newPassword.length < 6) {
                  ue.error("पासवर्ड कम से कम 6 अक्षर का होना चाहिए");
                  return;
                }
                try {
                  const hash = await hashPassword(newPassword);
                  const ok = await resetPasswordMutation.mutateAsync({
                    ownerPhone: salon.ownerPhone,
                    newPasswordHash: hash
                  });
                  if (ok) {
                    ue.success(`${salon.name} का पासवर्ड reset हो गया!`);
                    setNewPassword("");
                  } else {
                    ue.error("Owner नहीं मिला — पासवर्ड reset नहीं हुआ");
                  }
                } catch {
                  ue.error("पासवर्ड reset नहीं हो पाया");
                }
              },
              children: resetPasswordMutation.isPending ? "..." : "Reset"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-1", children: [
          "Owner: ",
          salon.ownerPhone
        ] })
      ] })
    ] })
  ] }) });
}
export {
  AdminPanel as default
};
