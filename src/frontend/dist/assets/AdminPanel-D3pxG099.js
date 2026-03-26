import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, a as cn, u as useInternetIdentity, B as Button, b as useAdminGetAllSalons, d as useAdminSetSalonSubscription, e as useAdminSetSalonActive, L as LoaderCircle, S as Scissors, f as useGetPlatformSubscriptionPrice, g as useSetPlatformSubscriptionPrice } from "./index-D-lPOF8q.js";
import { B as Badge } from "./badge-WFfNPC11.js";
import { P as Primitive, L as LogOut, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, u as ue, d as Label, I as Input, C as CircleCheckBig } from "./index-DXrke6Wn.js";
import { R as RefreshCw } from "./refresh-cw-Dyt_f4N6.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  [
    "path",
    {
      d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
      key: "1vdc57"
    }
  ],
  ["path", { d: "M5 21h14", key: "11awu3" }]
];
const Crown = createLucideIcon("crown", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M6 3h12", key: "ggurg9" }],
  ["path", { d: "M6 8h12", key: "6g4wlu" }],
  ["path", { d: "m6 13 8.5 8", key: "u1kupk" }],
  ["path", { d: "M6 13h3", key: "wdp6ag" }],
  ["path", { d: "M9 13c6.667 0 6.667-10 0-10", key: "1nkvk2" }]
];
const IndianRupee = createLucideIcon("indian-rupee", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      key: "1qme2f"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ]
];
const Shield = createLucideIcon("shield", __iconNode);
var NAME = "Separator";
var DEFAULT_ORIENTATION = "horizontal";
var ORIENTATIONS = ["horizontal", "vertical"];
var Separator$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { decorative, orientation: orientationProp = DEFAULT_ORIENTATION, ...domProps } = props;
  const orientation = isValidOrientation(orientationProp) ? orientationProp : DEFAULT_ORIENTATION;
  const ariaOrientation = orientation === "vertical" ? orientation : void 0;
  const semanticProps = decorative ? { role: "none" } : { "aria-orientation": ariaOrientation, role: "separator" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-orientation": orientation,
      ...semanticProps,
      ...domProps,
      ref: forwardedRef
    }
  );
});
Separator$1.displayName = NAME;
function isValidOrientation(orientation) {
  return ORIENTATIONS.includes(orientation);
}
var Root = Separator$1;
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root,
    {
      "data-slot": "separator",
      decorative,
      orientation,
      className: cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      ),
      ...props
    }
  );
}
function getTrialDaysRemaining(trialStartDate) {
  const started = Number(trialStartDate) / 1e6;
  const elapsed = Math.floor((Date.now() - started) / (1e3 * 60 * 60 * 24));
  return Math.max(0, 7 - elapsed);
}
function AdminPanel() {
  const { clear } = useInternetIdentity();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen",
      style: { background: "oklch(0.12 0.04 155)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "header",
          {
            className: "sticky top-0 z-10 px-4 py-3",
            style: {
              background: "oklch(0.16 0.05 155)",
              borderBottom: "1px solid oklch(0.25 0.05 155)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-8 h-8 rounded-full flex items-center justify-center",
                    style: { background: "oklch(0.75 0.12 70)" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-4 h-4 text-white" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "font-bold text-sm",
                      style: { color: "oklch(0.95 0.02 145)" },
                      children: "Salon360 Admin"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: { color: "oklch(0.75 0.12 70)" }, children: "सुपर एडमिन पैनल" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => clear(),
                  "data-ocid": "admin.close_button",
                  style: { color: "oklch(0.6 0.05 145)" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4 mr-1" }),
                    "बाहर"
                  ]
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "max-w-2xl mx-auto rounded-xl p-3 flex items-center gap-3",
            style: {
              background: "oklch(0.75 0.12 70 / 0.15)",
              border: "1px solid oklch(0.75 0.12 70 / 0.4)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Shield,
                {
                  className: "w-5 h-5 flex-shrink-0",
                  style: { color: "oklch(0.75 0.12 70)" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "font-semibold text-sm",
                    style: { color: "oklch(0.95 0.02 145)" },
                    children: "आप सुपर एडमिन हैं"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: { color: "oklch(0.75 0.12 70)" }, children: "सभी सैलून और सेटिंग्स का पूरा नियंत्रण" })
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "max-w-2xl mx-auto p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "salons", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsList,
            {
              className: "w-full mb-4",
              style: { background: "oklch(0.18 0.05 155)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TabsTrigger,
                  {
                    value: "salons",
                    className: "flex-1",
                    "data-ocid": "admin.tab",
                    children: "सभी सैलून"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TabsTrigger,
                  {
                    value: "settings",
                    className: "flex-1",
                    "data-ocid": "admin.tab",
                    children: "सेटिंग्स"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "salons", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SalonsTab, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "settings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsTab, {}) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "footer",
          {
            className: "text-center py-4 text-xs",
            style: { color: "oklch(0.45 0.04 155)" },
            children: [
              "© ",
              (/* @__PURE__ */ new Date()).getFullYear(),
              ". Built with love using",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`,
                  className: "underline",
                  target: "_blank",
                  rel: "noreferrer",
                  children: "caffeine.ai"
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function SalonsTab() {
  const { data: salons = [], isLoading, refetch } = useAdminGetAllSalons();
  const { mutate: setSubscription, isPending: subPending } = useAdminSetSalonSubscription();
  const { mutate: setActive, isPending: activePending } = useAdminSetSalonActive();
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex justify-center py-12",
        "data-ocid": "admin.loading_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          LoaderCircle,
          {
            className: "w-6 h-6 animate-spin",
            style: { color: "oklch(0.52 0.18 145)" }
          }
        )
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold", style: { color: "oklch(0.95 0.02 145)" }, children: [
        "सभी सैलून (",
        salons.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => refetch(),
          "data-ocid": "admin.secondary_button",
          style: { color: "oklch(0.52 0.18 145)" },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4" })
        }
      )
    ] }),
    salons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", "data-ocid": "admin.empty_state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Scissors,
        {
          className: "w-10 h-10 mx-auto mb-3",
          style: { color: "oklch(0.4 0.05 155)" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "oklch(0.6 0.05 145)" }, children: "अभी कोई सैलून रजिस्टर नहीं" })
    ] }) : salons.map((salon, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      SalonAdminCard,
      {
        salon,
        idx,
        onToggleSubscription: (active) => setSubscription(
          { salonId: salon.id, active },
          {
            onSuccess: () => ue.success(`सब्सक्रिप्शन ${active ? "चालू" : "बंद"} कर दिया`),
            onError: () => ue.error("कुछ गलत हुआ")
          }
        ),
        onToggleActive: (active) => setActive(
          { salonId: salon.id, active },
          {
            onSuccess: () => ue.success(`सैलून ${active ? "चालू" : "बंद"} कर दिया`),
            onError: () => ue.error("कुछ गलत हुआ")
          }
        ),
        isPending: subPending || activePending
      },
      salon.id.toString()
    ))
  ] });
}
function SalonAdminCard({
  salon,
  idx,
  onToggleSubscription,
  onToggleActive,
  isPending
}) {
  const trialDays = getTrialDaysRemaining(salon.trialStartDate);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-xl p-4",
      "data-ocid": `admin.item.${idx + 1}`,
      style: {
        background: "oklch(0.18 0.05 155)",
        border: "1px solid oklch(0.28 0.05 155)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "font-semibold text-sm",
                  style: { color: "oklch(0.95 0.02 145)" },
                  children: salon.name
                }
              ),
              !salon.isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  className: "text-xs",
                  style: {
                    background: "oklch(0.577 0.245 27.325 / 0.2)",
                    color: "oklch(0.577 0.245 27.325)",
                    border: "none"
                  },
                  children: "बंद"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-xs mt-0.5",
                style: { color: "oklch(0.6 0.05 145)" },
                children: salon.city
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-end gap-1", children: trialDays > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              className: "text-xs",
              style: {
                background: "oklch(0.52 0.18 145 / 0.2)",
                color: "oklch(0.52 0.18 145)",
                border: "none"
              },
              children: [
                "ट्रायल: ",
                trialDays,
                " दिन"
              ]
            }
          ) : salon.subscriptionActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              className: "text-xs",
              style: {
                background: "oklch(0.52 0.18 145 / 0.2)",
                color: "oklch(0.52 0.18 145)",
                border: "none"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3 h-3 mr-1" }),
                "सब्सक्रिप्शन"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              className: "text-xs",
              style: {
                background: "oklch(0.577 0.245 27.325 / 0.2)",
                color: "oklch(0.577 0.245 27.325)",
                border: "none"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3 h-3 mr-1" }),
                "एक्सपायर"
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Separator,
          {
            style: { borderColor: "oklch(0.28 0.05 155)" },
            className: "my-2"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              className: "flex-1 text-xs",
              disabled: isPending,
              "data-ocid": "admin.toggle",
              onClick: () => onToggleSubscription(!salon.subscriptionActive),
              style: {
                background: salon.subscriptionActive ? "oklch(0.577 0.245 27.325 / 0.2)" : "oklch(0.52 0.18 145 / 0.2)",
                color: salon.subscriptionActive ? "oklch(0.577 0.245 27.325)" : "oklch(0.52 0.18 145)",
                border: `1px solid ${salon.subscriptionActive ? "oklch(0.577 0.245 27.325 / 0.4)" : "oklch(0.52 0.18 145 / 0.4)"}`
              },
              children: salon.subscriptionActive ? "सब्स. बंद करें" : "सब्स. चालू करें"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              className: "flex-1 text-xs",
              disabled: isPending,
              "data-ocid": "admin.toggle",
              onClick: () => onToggleActive(!salon.isActive),
              style: {
                background: salon.isActive ? "oklch(0.577 0.245 27.325 / 0.2)" : "oklch(0.52 0.18 145 / 0.2)",
                color: salon.isActive ? "oklch(0.577 0.245 27.325)" : "oklch(0.52 0.18 145)",
                border: `1px solid ${salon.isActive ? "oklch(0.577 0.245 27.325 / 0.4)" : "oklch(0.52 0.18 145 / 0.4)"}`
              },
              children: salon.isActive ? "सैलून बंद करें" : "सैलून चालू करें"
            }
          )
        ] })
      ]
    }
  );
}
function SettingsTab() {
  const { data: price, isLoading } = useGetPlatformSubscriptionPrice();
  const { mutate: setPrice, isPending } = useSetPlatformSubscriptionPrice();
  const [editing, setEditing] = reactExports.useState(false);
  const [newPrice, setNewPrice] = reactExports.useState("");
  const handleSave = (e) => {
    e.preventDefault();
    const val = Number(newPrice);
    if (!val || val < 0) {
      ue.error("सही दाम डालें");
      return;
    }
    setPrice(val, {
      onSuccess: () => {
        ue.success("दाम बदल गया!");
        setEditing(false);
        setNewPrice("");
      },
      onError: () => ue.error("कुछ गलत हुआ")
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl p-4",
        style: {
          background: "oklch(0.18 0.05 155)",
          border: "1px solid oklch(0.28 0.05 155)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              IndianRupee,
              {
                className: "w-5 h-5",
                style: { color: "oklch(0.75 0.12 70)" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h3",
              {
                className: "font-semibold",
                style: { color: "oklch(0.95 0.02 145)" },
                children: "सब्सक्रिप्शन का दाम"
              }
            )
          ] }),
          isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "flex justify-center py-4",
              "data-ocid": "settings.loading_state",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                LoaderCircle,
                {
                  className: "w-5 h-5 animate-spin",
                  style: { color: "oklch(0.52 0.18 145)" }
                }
              )
            }
          ) : !editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "p",
              {
                className: "text-2xl font-bold mb-1",
                style: { color: "oklch(0.75 0.12 70)" },
                children: [
                  "₹",
                  price,
                  "/माह"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-xs mb-4",
                style: { color: "oklch(0.6 0.05 145)" },
                children: "वर्तमान सब्सक्रिप्शन मूल्य"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                onClick: () => {
                  setEditing(true);
                  setNewPrice(String(price));
                },
                "data-ocid": "settings.edit_button",
                style: {
                  background: "oklch(0.75 0.12 70 / 0.2)",
                  color: "oklch(0.75 0.12 70)",
                  border: "1px solid oklch(0.75 0.12 70 / 0.4)"
                },
                children: "दाम बदलें"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSave, className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Label,
                {
                  className: "text-sm",
                  style: { color: "oklch(0.75 0.05 145)" },
                  children: "नया दाम (₹/माह)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: newPrice,
                  onChange: (e) => setNewPrice(e.target.value),
                  type: "number",
                  placeholder: "499",
                  "data-ocid": "settings.input",
                  style: {
                    background: "oklch(0.22 0.05 155)",
                    border: "1px solid oklch(0.32 0.05 155)",
                    color: "oklch(0.95 0.02 145)"
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  type: "submit",
                  size: "sm",
                  disabled: isPending,
                  "data-ocid": "settings.save_button",
                  style: { background: "oklch(0.75 0.12 70)", color: "white" },
                  children: [
                    isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 mr-1 animate-spin" }) : null,
                    "सेव करें"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  size: "sm",
                  variant: "ghost",
                  onClick: () => setEditing(false),
                  "data-ocid": "settings.cancel_button",
                  style: { color: "oklch(0.6 0.05 145)" },
                  children: "रद्द"
                }
              )
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl p-4",
        style: {
          background: "oklch(0.18 0.05 155)",
          border: "1px solid oklch(0.28 0.05 155)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Settings,
              {
                className: "w-5 h-5",
                style: { color: "oklch(0.52 0.18 145)" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h3",
              {
                className: "font-semibold",
                style: { color: "oklch(0.95 0.02 145)" },
                children: "सिस्टम की जानकारी"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "oklch(0.6 0.05 145)" }, children: "प्लेटफॉर्म" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "oklch(0.9 0.02 145)" }, children: "Salon360" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "oklch(0.6 0.05 145)" }, children: "फ्री ट्रायल" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "oklch(0.9 0.02 145)" }, children: "7 दिन" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "oklch(0.6 0.05 145)" }, children: "अधिकतम सैलून" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "oklch(0.9 0.02 145)" }, children: "50+" })
            ] })
          ] })
        ]
      }
    )
  ] });
}
export {
  AdminPanel as default
};
