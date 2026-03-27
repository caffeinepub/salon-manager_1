import { r as reactExports, u as useAdminGetDashboardStats, a as useAdminGetPendingSalons, b as useAdminGetAllSalons, c as useAdminGetDefaultTrialDays, d as useAdminApproveSalon, e as useAdminRejectSalon, f as useAdminSetSalonActive, g as useAdminSetSalonSubscription, h as useAdminSetDefaultTrialDays, i as useAdminProcessTrialExpirations, j as jsxRuntimeExports, B as Button, I as Input } from "./index-DLhChIln.js";
import { B as Badge } from "./badge-CUhCe83M.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-BxSp9t7b.js";
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
function AdminPanel({ onLogout }) {
  const [tab, setTab] = reactExports.useState("dashboard");
  const [trialDaysInput, setTrialDaysInput] = reactExports.useState("");
  const { data: stats, isLoading: statsLoading } = useAdminGetDashboardStats();
  const { data: pendingSalons = [], isLoading: pendingLoading } = useAdminGetPendingSalons();
  const { data: allSalons = [], isLoading: salonsLoading } = useAdminGetAllSalons();
  const { data: defaultTrialDays } = useAdminGetDefaultTrialDays();
  const approveMutation = useAdminApproveSalon();
  const rejectMutation = useAdminRejectSalon();
  const setActiveMutation = useAdminSetSalonActive();
  const setSubMutation = useAdminSetSalonSubscription();
  const setTrialDaysMutation = useAdminSetDefaultTrialDays();
  const processExpMutation = useAdminProcessTrialExpirations();
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
    { id: "settings", label: "सेटिंग" }
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
        pendingSalons.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-yellow-200 bg-yellow-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-yellow-800", children: [
            "⚠️ ",
            pendingSalons.length,
            " दुकान",
            pendingSalons.length > 1 ? "ें" : "",
            " अनुमोदन की प्रतीक्षा में"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              className: "mt-2",
              variant: "outline",
              onClick: () => setTab("pending"),
              children: "अभी देखें"
            }
          )
        ] }) })
      ] }),
      tab === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "लंबित अनुमोदन" }),
        pendingLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "लोड हो रहा है..." }),
        !pendingLoading && pendingSalons.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6 text-center text-gray-500 text-sm", children: "कोई लंबित अनुमोदन नहीं" }) }),
        pendingSalons.map((salon) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-yellow-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: salon.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
                salon.city,
                " — ",
                salon.phone
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: salon.address })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "लंबित" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                className: "flex-1 bg-green-600 hover:bg-green-700 text-white",
                disabled: approveMutation.isPending,
                onClick: () => approveMutation.mutate(salon.id),
                children: approveMutation.isPending ? "..." : "✓ मंजूर करें"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "destructive",
                className: "flex-1",
                disabled: rejectMutation.isPending,
                onClick: () => rejectMutation.mutate(salon.id),
                children: rejectMutation.isPending ? "..." : "✗ अस्वीकार करें"
              }
            )
          ] })
        ] }) }, salon.id.toString()))
      ] }),
      tab === "salons" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-semibold text-gray-800", children: [
            "सभी दुकानें (",
            allSalons.length,
            "/100)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              disabled: processExpMutation.isPending,
              onClick: () => processExpMutation.mutate(),
              children: processExpMutation.isPending ? "..." : "ट्रायल जांचें"
            }
          )
        ] }),
        salonsLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "लोड हो रहा है..." }),
        !salonsLoading && allSalons.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6 text-center text-gray-500 text-sm", children: "कोई दुकान नहीं मिली" }) }),
        allSalons.map((salon) => {
          const status = getTrialStatus(salon);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: salon.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
                  salon.city,
                  " — ",
                  salon.phone
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: status.variant, children: status.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: salon.isActive ? "outline" : "default",
                  disabled: setActiveMutation.isPending,
                  onClick: () => setActiveMutation.mutate({
                    salonId: salon.id,
                    active: !salon.isActive
                  }),
                  children: salon.isActive ? "निष्क्रिय करें" : "सक्रिय करें"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: salon.subscriptionActive ? "outline" : "default",
                  disabled: setSubMutation.isPending,
                  onClick: () => setSubMutation.mutate({
                    salonId: salon.id,
                    active: !salon.subscriptionActive
                  }),
                  children: salon.subscriptionActive ? "सदस्यता रद्द करें" : "सदस्यता दें"
                }
              )
            ] })
          ] }) }, salon.id.toString());
        })
      ] }),
      tab === "settings" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "सेटिंग" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "डिफ़ॉल्ट ट्रायल अवधि" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
              "वर्तमान डिफ़ॉल्ट:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                defaultTrialDays ?? 7,
                " दिन"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: "1",
                  max: "365",
                  placeholder: "दिन",
                  value: trialDaysInput,
                  onChange: (e) => setTrialDaysInput(e.target.value),
                  className: "flex-1"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  disabled: !trialDaysInput || setTrialDaysMutation.isPending,
                  onClick: () => {
                    const days = Number.parseInt(trialDaysInput);
                    if (days > 0) {
                      setTrialDaysMutation.mutate(days, {
                        onSuccess: () => setTrialDaysInput("")
                      });
                    }
                  },
                  children: setTrialDaysMutation.isPending ? "..." : "सेव करें"
                }
              )
            ] }),
            setTrialDaysMutation.isSuccess && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600", children: "✓ ट्रायल अवधि अपडेट हो गई" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: "ट्रायल समाप्ति प्रक्रिया" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "जिन दुकानों का ट्रायल समाप्त हो गया है और सदस्यता नहीं है, उन्हें स्वचालित रूप से निष्क्रिय करें।" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                disabled: processExpMutation.isPending,
                onClick: () => processExpMutation.mutate(),
                children: processExpMutation.isPending ? "प्रक्रिया हो रही है..." : "ट्रायल समाप्त करें"
              }
            ),
            processExpMutation.isSuccess && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600", children: [
              "✓ ",
              Number(processExpMutation.data ?? 0),
              " दुकानें निष्क्रिय की गईं"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
          "अधिकतम दुकानें: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "100" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "ट्रायल अवधि:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
            defaultTrialDays ?? 7,
            " दिन"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "Admin ईमेल:",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "amitkrji498@gmail.com" })
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  AdminPanel as default
};
