import { r as reactExports, j as jsxRuntimeExports, B as Button, I as Input } from "./index-B9yPYncm.js";
import { B as Badge, g as getRatings, d as deleteRating } from "./CustomerDashboard-CnphlrK9.js";
import { u as useAdminGetDashboardStats, a as useAdminGetPendingSalons, b as useAdminGetAllSalons, c as useAdminGetDefaultTrialDays, d as useAdminGetSubscriptionPrice, e as useAdminApproveSalon, f as useAdminRejectSalon, g as useAdminSetSalonActive, h as useAdminSetSalonSubscription, i as useAdminSetDefaultTrialDays, j as useAdminSetSubscriptionPrice, k as useAdminProcessTrialExpirations, l as useAdminGetRevenueStats, C as Card, m as CardContent, n as CardHeader, o as CardTitle } from "./tabs-BjibxdOt.js";
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
function AdminPanel({ onLogout }) {
  const [tab, setTab] = reactExports.useState("dashboard");
  const [trialDaysInput, setTrialDaysInput] = reactExports.useState("");
  const [priceInput, setPriceInput] = reactExports.useState("");
  const { data: stats, isLoading: statsLoading } = useAdminGetDashboardStats();
  const { data: pendingSalons = [], isLoading: pendingLoading } = useAdminGetPendingSalons();
  const { data: allSalons = [], isLoading: salonsLoading } = useAdminGetAllSalons();
  const { data: defaultTrialDays } = useAdminGetDefaultTrialDays();
  const { data: subscriptionPrice } = useAdminGetSubscriptionPrice();
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
    { id: "salons", label: "सभी दुकानें" },
    { id: "settings", label: "सेटिंग" },
    { id: "revenue", label: "रेवेन्यू" },
    { id: "reviews", label: "समीक्षाएं" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-gray-900", children: "Salon360 Admin" }),
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
                        alert(`डिफ़ॉल्ट ट्रायल ${d} दिन हो गया`);
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
      ] })
    ] })
  ] });
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
                alert(
                  `${salon.name} के लिए ट्रायल ${d} दिन सेट करें (backend hook जोड़ें)`
                );
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
      ] })
    ] })
  ] }) });
}
export {
  AdminPanel as default
};
