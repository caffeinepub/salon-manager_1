import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, P as Primitive, a as useComposedRefs, b as createSlot, d as cn, e as useActor, S as Scissors, B as Button, E as ErrorBoundary, u as ue, L as Label, I as Input, f as LoaderCircle, g as SalonLoadingScreen, h as Phone } from "./index-BAQNtztU.js";
import { F as useControllableState, G as createContextScope, H as useId, P as Presence, I as composeEventHandlers, J as Portal$1, K as hideOthers, R as ReactRemoveScroll, L as useFocusGuards, M as FocusScope, N as DismissableLayer, O as createContext2, X, Q as useGetMyCustomerProfile, S as useSavePushSubscription, T as LogOut, U as Tabs, V as TabsList, W as TabsTrigger, Y as TabsContent, Z as useSaveCustomerProfile, C as Card, o as CardHeader, p as CardTitle, n as CardContent, _ as useGetAllActiveSalons, B as Badge, $ as useGetMyAppointments, a0 as useGetSalonServices, a1 as useBookAppointment, a2 as useGetQueueInfo, a3 as useGetSalonPhotos } from "./tabs-B0YY6ziL.js";
import { C as CircleCheckBig, a as Clock } from "./clock-tciY5PXK.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ]
];
const Bell = createLucideIcon("bell", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode$2);
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
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
];
const MapPin = createLucideIcon("map-pin", __iconNode$1);
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
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
];
const Star = createLucideIcon("star", __iconNode);
var DIALOG_NAME = "Dialog";
var [createDialogContext] = createContextScope(DIALOG_NAME);
var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
var Dialog$1 = (props) => {
  const {
    __scopeDialog,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const triggerRef = reactExports.useRef(null);
  const contentRef = reactExports.useRef(null);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: DIALOG_NAME
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogProvider,
    {
      scope: __scopeDialog,
      triggerRef,
      contentRef,
      contentId: useId(),
      titleId: useId(),
      descriptionId: useId(),
      open,
      onOpenChange: setOpen,
      onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children
    }
  );
};
Dialog$1.displayName = DIALOG_NAME;
var TRIGGER_NAME = "DialogTrigger";
var DialogTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...triggerProps } = props;
    const context = useDialogContext(TRIGGER_NAME, __scopeDialog);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": context.open,
        "aria-controls": context.contentId,
        "data-state": getState(context.open),
        ...triggerProps,
        ref: composedTriggerRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
DialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "DialogPortal";
var [PortalProvider, usePortalContext] = createDialogContext(PORTAL_NAME, {
  forceMount: void 0
});
var DialogPortal$1 = (props) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = useDialogContext(PORTAL_NAME, __scopeDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PortalProvider, { scope: __scopeDialog, forceMount, children: reactExports.Children.map(children, (child) => /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { asChild: true, container, children: child }) })) });
};
DialogPortal$1.displayName = PORTAL_NAME;
var OVERLAY_NAME = "DialogOverlay";
var DialogOverlay$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
    return context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
  }
);
DialogOverlay$1.displayName = OVERLAY_NAME;
var Slot = createSlot("DialogOverlay.RemoveScroll");
var DialogOverlayImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReactRemoveScroll, { as: Slot, allowPinchZoom: true, shards: [context.contentRef], children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          "data-state": getState(context.open),
          ...overlayProps,
          ref: forwardedRef,
          style: { pointerEvents: "auto", ...overlayProps.style }
        }
      ) })
    );
  }
);
var CONTENT_NAME = "DialogContent";
var DialogContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }
);
DialogContent$1.displayName = CONTENT_NAME;
var DialogContentModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
    reactExports.useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: true,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          var _a;
          event.preventDefault();
          (_a = context.triggerRef.current) == null ? void 0 : _a.focus();
        }),
        onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (isRightClick) event.preventDefault();
        }),
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault()
        )
      }
    );
  }
);
var DialogContentNonModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const hasInteractedOutsideRef = reactExports.useRef(false);
    const hasPointerDownOutsideRef = reactExports.useRef(false);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContentImpl,
      {
        ...props,
        ref: forwardedRef,
        trapFocus: false,
        disableOutsidePointerEvents: false,
        onCloseAutoFocus: (event) => {
          var _a, _b;
          (_a = props.onCloseAutoFocus) == null ? void 0 : _a.call(props, event);
          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) (_b = context.triggerRef.current) == null ? void 0 : _b.focus();
            event.preventDefault();
          }
          hasInteractedOutsideRef.current = false;
          hasPointerDownOutsideRef.current = false;
        },
        onInteractOutside: (event) => {
          var _a, _b;
          (_a = props.onInteractOutside) == null ? void 0 : _a.call(props, event);
          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true;
            if (event.detail.originalEvent.type === "pointerdown") {
              hasPointerDownOutsideRef.current = true;
            }
          }
          const target = event.target;
          const targetIsTrigger = (_b = context.triggerRef.current) == null ? void 0 : _b.contains(target);
          if (targetIsTrigger) event.preventDefault();
          if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
            event.preventDefault();
          }
        }
      }
    );
  }
);
var DialogContentImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, __scopeDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    useFocusGuards();
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FocusScope,
        {
          asChild: true,
          loop: true,
          trapped: trapFocus,
          onMountAutoFocus: onOpenAutoFocus,
          onUnmountAutoFocus: onCloseAutoFocus,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DismissableLayer,
            {
              role: "dialog",
              id: context.contentId,
              "aria-describedby": context.descriptionId,
              "aria-labelledby": context.titleId,
              "data-state": getState(context.open),
              ...contentProps,
              ref: composedRefs,
              onDismiss: () => context.onOpenChange(false)
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TitleWarning, { titleId: context.titleId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionWarning, { contentRef, descriptionId: context.descriptionId })
      ] })
    ] });
  }
);
var TITLE_NAME = "DialogTitle";
var DialogTitle$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...titleProps } = props;
    const context = useDialogContext(TITLE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.h2, { id: context.titleId, ...titleProps, ref: forwardedRef });
  }
);
DialogTitle$1.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "DialogDescription";
var DialogDescription = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...descriptionProps } = props;
    const context = useDialogContext(DESCRIPTION_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.p, { id: context.descriptionId, ...descriptionProps, ref: forwardedRef });
  }
);
DialogDescription.displayName = DESCRIPTION_NAME;
var CLOSE_NAME = "DialogClose";
var DialogClose = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...closeProps } = props;
    const context = useDialogContext(CLOSE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        ...closeProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
      }
    );
  }
);
DialogClose.displayName = CLOSE_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var TITLE_WARNING_NAME = "DialogTitleWarning";
var [WarningProvider, useWarningContext] = createContext2(TITLE_WARNING_NAME, {
  contentName: CONTENT_NAME,
  titleName: TITLE_NAME,
  docsSlug: "dialog"
});
var TitleWarning = ({ titleId }) => {
  const titleWarningContext = useWarningContext(TITLE_WARNING_NAME);
  const MESSAGE = `\`${titleWarningContext.contentName}\` requires a \`${titleWarningContext.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${titleWarningContext.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${titleWarningContext.docsSlug}`;
  reactExports.useEffect(() => {
    if (titleId) {
      const hasTitle = document.getElementById(titleId);
      if (!hasTitle) console.error(MESSAGE);
    }
  }, [MESSAGE, titleId]);
  return null;
};
var DESCRIPTION_WARNING_NAME = "DialogDescriptionWarning";
var DescriptionWarning = ({ contentRef, descriptionId }) => {
  const descriptionWarningContext = useWarningContext(DESCRIPTION_WARNING_NAME);
  const MESSAGE = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${descriptionWarningContext.contentName}}.`;
  reactExports.useEffect(() => {
    var _a;
    const describedById = (_a = contentRef.current) == null ? void 0 : _a.getAttribute("aria-describedby");
    if (descriptionId && describedById) {
      const hasDescription = document.getElementById(descriptionId);
      if (!hasDescription) console.warn(MESSAGE);
    }
  }, [MESSAGE, contentRef, descriptionId]);
  return null;
};
var Root = Dialog$1;
var Portal = DialogPortal$1;
var Overlay = DialogOverlay$1;
var Content = DialogContent$1;
var Title = DialogTitle$1;
var Close = DialogClose;
function Dialog({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { "data-slot": "dialog", ...props });
}
function DialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Overlay,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Content,
      {
        "data-slot": "dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props,
        children: [
          children,
          showCloseButton && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Close,
            {
              "data-slot": "dialog-close",
              className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function DialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Title,
    {
      "data-slot": "dialog-title",
      className: cn("text-lg leading-none font-semibold", className),
      ...props
    }
  );
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ...props
    }
  );
}
const RATINGS_KEY = "salon_ratings";
function getRatings() {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveRating(entry) {
  const list = getRatings().filter(
    (r) => r.appointmentId !== entry.appointmentId
  );
  list.push(entry);
  localStorage.setItem(RATINGS_KEY, JSON.stringify(list));
}
function deleteRating(appointmentId) {
  const list = getRatings().filter((r) => r.appointmentId !== appointmentId);
  localStorage.setItem(RATINGS_KEY, JSON.stringify(list));
}
function getAverageRating(salonId) {
  const list = getRatings().filter((r) => r.salonId === salonId);
  if (list.length === 0) return { avg: 0, count: 0 };
  const avg = list.reduce((s, r) => s + r.stars, 0) / list.length;
  return { avg: Math.round(avg * 10) / 10, count: list.length };
}
function hasRated(appointmentId) {
  return getRatings().some((r) => r.appointmentId === appointmentId);
}
const STATUS_LABELS = {
  pending: "प्रतीक्षा",
  confirmed: "कन्फर्म",
  inprogress: "चल रहा",
  completed: "पूरा",
  cancelled: "रद्द"
};
function getTodayString() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function CustomerDashboard({ phone, onSwitchRole }) {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: profile, isLoading: profileLoading } = useGetMyCustomerProfile(phone);
  const [profileSaved, setProfileSaved] = reactExports.useState(false);
  const [savedProfileName, setSavedProfileName] = reactExports.useState("");
  const { mutate: savePushSub } = useSavePushSubscription();
  reactExports.useEffect(() => {
    if (!("Notification" in window)) return;
    const doSubscribe = async () => {
      if (Notification.permission === "default") {
        await Notification.requestPermission().catch(() => {
        });
      }
      if (Notification.permission !== "granted") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        const sub = existing ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBkYIAgAJALeV3pcuogE"
        });
        if (!sub) return;
        const p256dhKey = sub.getKey("p256dh");
        const authKey = sub.getKey("auth");
        if (!p256dhKey || !authKey) return;
        const toBase64 = (buf) => {
          const bytes = new Uint8Array(buf);
          let bin = "";
          for (let i = 0; i < bytes.byteLength; i++)
            bin += String.fromCharCode(bytes[i]);
          return btoa(bin);
        };
        savePushSub({
          phone,
          endpoint: sub.endpoint,
          p256dh: toBase64(p256dhKey),
          auth: toBase64(authKey)
        });
      } catch {
      }
    };
    doSubscribe();
  }, [phone, savePushSub]);
  const { actor: actorForPoll } = useActor();
  reactExports.useEffect(() => {
    if (!actorForPoll) return;
    const checkQueue = async () => {
      try {
        const appts = await actorForPoll.getMyAppointmentsByPhone(
          phone
        );
        const active = appts.filter(
          (a) => a.status === "confirmed" || a.status === "inprogress"
        );
        for (const appt of active) {
          const info = await actorForPoll.getQueueInfo(appt.id);
          const waitMinutes = Number(info[1]);
          if (waitMinutes <= 20 && waitMinutes > 0) {
            ue.info(
              "⏰ आपकी बारी 20 मिनट में है! सैलून के लिए निकलने की तैयारी करें",
              { id: `queue-reminder-${appt.id.toString()}`, duration: 8e3 }
            );
          }
        }
      } catch {
      }
    };
    const id = setInterval(checkQueue, 6e4);
    return () => clearInterval(id);
  }, [phone, actorForPoll]);
  const actorReady = !!actor && !actorFetching;
  if (actorReady && !profileLoading && !profile && !profileSaved) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProfileSetupForm,
      {
        phone,
        onLogout: onSwitchRole,
        onProfileSaved: (name) => {
          setProfileSaved(true);
          setSavedProfileName(name);
        }
      }
    );
  }
  const effectiveProfile = profile ?? (profileSaved && savedProfileName ? { name: savedProfileName, phone, createdAt: BigInt(0) } : null);
  const effectiveProfileName = (effectiveProfile == null ? void 0 : effectiveProfile.name) ?? "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen",
      style: { background: "oklch(0.09 0.005 60)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "header",
          {
            className: "sticky top-0 z-10 px-4 py-3 flex items-center justify-between",
            style: {
              background: "oklch(0.13 0.008 60)",
              borderBottom: "1px solid oklch(0.28 0.04 75 / 0.6)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-8 h-8 rounded-full flex items-center justify-center",
                    style: { background: "oklch(0.78 0.12 80)" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "w-4 h-4 text-white" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "font-bold text-sm",
                      style: { color: "oklch(0.97 0.015 80)" },
                      children: "Salon360"
                    }
                  ),
                  effectiveProfileName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", style: { color: "oklch(0.55 0.04 80)" }, children: [
                    "नमस्ते, ",
                    effectiveProfileName
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "h-2.5 w-20 rounded animate-pulse mt-0.5",
                      style: { background: "oklch(0.22 0.03 70)" }
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: onSwitchRole,
                  "data-ocid": "customer.close_button",
                  style: { color: "oklch(0.55 0.04 80)" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4 mr-1" }),
                    "बाहर"
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "max-w-2xl mx-auto p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "salons", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TabsList,
            {
              className: "w-full mb-4",
              style: { background: "oklch(0.17 0.012 60)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TabsTrigger,
                  {
                    value: "salons",
                    className: "flex-1",
                    "data-ocid": "customer.tab",
                    children: "सैलून चुनें"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TabsTrigger,
                  {
                    value: "bookings",
                    className: "flex-1",
                    "data-ocid": "customer.tab",
                    children: "मेरी बुकिंग"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "salons", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SalonListTab,
            {
              phone,
              profile: effectiveProfile ?? { name: effectiveProfileName, phone }
            }
          ) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "bookings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MyBookingsTab, { phone }) }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "footer",
          {
            className: "text-center py-4 text-xs",
            style: { color: "oklch(0.4 0.03 70)" },
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
function ProfileSetupForm({
  phone,
  onLogout,
  onProfileSaved
}) {
  const [name, setName] = reactExports.useState("");
  const { mutate, isPending } = useSaveCustomerProfile(phone);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      ue.error("नाम जरूरी है");
      return;
    }
    mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          ue.success("प्रोफ़ाइल सेव हो गई!");
          onProfileSaved == null ? void 0 : onProfileSaved(name.trim());
        },
        onError: () => ue.error("कुछ गलत हुआ")
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen flex flex-col",
      style: { background: "oklch(0.09 0.005 60)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "header",
          {
            className: "px-4 py-3 flex items-center justify-between",
            style: {
              background: "oklch(0.13 0.008 60)",
              borderBottom: "1px solid oklch(0.28 0.04 75 / 0.6)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Scissors,
                  {
                    className: "w-5 h-5",
                    style: { color: "oklch(0.78 0.12 80)" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", style: { color: "oklch(0.97 0.015 80)" }, children: "Salon360" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: onLogout,
                  style: { color: "oklch(0.55 0.04 80)" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4 mr-1" }),
                    "बाहर"
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Card,
          {
            className: "w-full max-w-md",
            style: {
              background: "oklch(0.17 0.012 60)",
              border: "1px solid oklch(0.28 0.04 75 / 0.6)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2",
                    style: { background: "oklch(0.78 0.12 80 / 0.12)" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Star,
                      {
                        className: "w-6 h-6",
                        style: { color: "oklch(0.78 0.12 80)" }
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardTitle,
                  {
                    className: "text-center",
                    style: { color: "oklch(0.97 0.015 80)" },
                    children: "अपना नाम भरें"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "text-center text-sm",
                    style: { color: "oklch(0.55 0.04 80)" },
                    children: "सैलून बुक करने के लिए"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Label,
                    {
                      className: "text-sm",
                      style: { color: "oklch(0.65 0.07 80)" },
                      children: "आपका नाम *"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: name,
                      onChange: (e) => setName(e.target.value),
                      placeholder: "अपना पूरा नाम",
                      "data-ocid": "profile.input",
                      style: {
                        background: "oklch(0.17 0.012 60)",
                        border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                        color: "oklch(0.97 0.015 80)"
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Label,
                    {
                      className: "text-sm",
                      style: { color: "oklch(0.65 0.07 80)" },
                      children: "मोबाइल नंबर"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: phone,
                      disabled: true,
                      "data-ocid": "profile.input",
                      style: {
                        background: "oklch(0.17 0.012 60)",
                        border: "1px solid oklch(0.28 0.04 75 / 0.6)",
                        color: "oklch(0.55 0.04 80)"
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    type: "submit",
                    className: "w-full",
                    disabled: isPending,
                    "data-ocid": "profile.submit_button",
                    style: { background: "oklch(0.78 0.12 80)", color: "white" },
                    children: [
                      isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : null,
                      isPending ? "सेव हो रहा है..." : "आगे बढ़ें"
                    ]
                  }
                )
              ] }) })
            ]
          }
        ) })
      ]
    }
  );
}
function RatingPopup({
  appointmentId,
  salonId,
  salonName,
  customerPhone,
  onClose
}) {
  const [stars, setStars] = reactExports.useState(0);
  const [hovered, setHovered] = reactExports.useState(0);
  const [review, setReview] = reactExports.useState("");
  const handleSubmit = () => {
    if (stars === 0) {
      ue.error("कृपया स्टार रेटिंग दें");
      return;
    }
    saveRating({
      appointmentId,
      salonId,
      salonName,
      customerPhone,
      stars,
      review: review.trim(),
      date: (/* @__PURE__ */ new Date()).toISOString()
    });
    ue.success("रेटिंग दी गई!");
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      "data-ocid": "rating.dialog",
      style: {
        background: "oklch(0.17 0.012 60)",
        border: "1px solid oklch(0.28 0.04 75 / 0.6)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { style: { color: "oklch(0.97 0.015 80)" }, children: "रेटिंग दें" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: { color: "oklch(0.55 0.04 80)" }, children: salonName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-sm mb-2",
                style: { color: "oklch(0.65 0.07 80)" },
                children: "आपका अनुभव कैसा रहा?"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 justify-center", children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "rating.toggle",
                onClick: () => setStars(n),
                onMouseEnter: () => setHovered(n),
                onMouseLeave: () => setHovered(0),
                className: "p-1 transition-transform hover:scale-110 active:scale-95",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Star,
                  {
                    className: "w-8 h-8",
                    style: {
                      color: n <= (hovered || stars) ? "oklch(0.82 0.14 78)" : "oklch(0.35 0.04 155)",
                      fill: n <= (hovered || stars) ? "oklch(0.82 0.14 78)" : "transparent",
                      transition: "color 0.15s, fill 0.15s"
                    }
                  }
                )
              },
              n
            )) }),
            stars > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-center text-xs mt-1",
                style: { color: "oklch(0.82 0.14 78)" },
                children: ["बहुत बुरा", "बुरा", "ठीक है", "अच्छा", "बहुत अच्छा"][stars - 1]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", style: { color: "oklch(0.65 0.07 80)" }, children: "समीक्षा (वैकल्पिक)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: review,
                onChange: (e) => setReview(e.target.value),
                placeholder: "अपना अनुभव लिखें...",
                rows: 3,
                maxLength: 300,
                "data-ocid": "rating.textarea",
                style: {
                  background: "oklch(0.17 0.012 60)",
                  border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                  color: "oklch(0.97 0.015 80)",
                  marginTop: "4px"
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                onClick: onClose,
                className: "flex-1",
                "data-ocid": "rating.cancel_button",
                style: { color: "oklch(0.55 0.04 80)" },
                children: "बाद में"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: handleSubmit,
                className: "flex-1",
                "data-ocid": "rating.submit_button",
                style: { background: "oklch(0.78 0.12 80)", color: "white" },
                children: "जमा करें"
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function SalonListTab({
  phone,
  profile
}) {
  const { data: salons = [], isLoading } = useGetAllActiveSalons();
  const [selectedSalon, setSelectedSalon] = reactExports.useState(null);
  const [, forceUpdate] = reactExports.useState(0);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "salons.loading_state", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SalonLoadingScreen, { compact: true }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold", style: { color: "oklch(0.97 0.015 80)" }, children: [
      "नज़दीकी सैलून (",
      salons.length,
      ")"
    ] }),
    salons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", "data-ocid": "salons.empty_state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Scissors,
        {
          className: "w-10 h-10 mx-auto mb-3",
          style: { color: "oklch(0.4 0.03 70)" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "oklch(0.55 0.04 80)" }, children: "अभी कोई सैलून उपलब्ध नहीं" })
    ] }) : salons.map((salon, idx) => {
      const { avg, count } = getAverageRating(salon.id.toString());
      const isTopRated = avg >= 4.5 && count >= 1;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "w-full rounded-xl p-4 cursor-pointer transition-all hover:opacity-90 active:scale-98 text-left",
          "data-ocid": `salons.item.${idx + 1}`,
          onClick: () => setSelectedSalon(salon),
          style: {
            background: "oklch(0.17 0.012 60)",
            border: "1px solid oklch(0.28 0.04 75 / 0.6)"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  style: { background: "oklch(0.78 0.12 80 / 0.12)" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Scissors,
                    {
                      className: "w-5 h-5",
                      style: { color: "oklch(0.78 0.12 80)" }
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "font-semibold text-sm",
                      style: { color: "oklch(0.97 0.015 80)" },
                      children: salon.name
                    }
                  ),
                  isTopRated && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      className: "text-xs px-1.5 py-0",
                      style: {
                        background: "oklch(0.82 0.14 78 / 0.15)",
                        color: "oklch(0.82 0.14 78)",
                        border: "1px solid oklch(0.72 0.18 85 / 0.3)"
                      },
                      children: "🏆 टॉप रेटेड"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MapPin,
                    {
                      className: "w-3 h-3",
                      style: { color: "oklch(0.55 0.04 80)" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "text-xs",
                      style: { color: "oklch(0.55 0.04 80)" },
                      children: salon.city
                    }
                  )
                ] }),
                count > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-xs",
                      style: { color: "oklch(0.82 0.14 78)" },
                      children: Array.from(
                        { length: 5 },
                        (_, i) => i < Math.round(avg) ? "★" : "☆"
                      ).join("")
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: "text-xs",
                      style: { color: "oklch(0.65 0.07 80)" },
                      children: [
                        avg,
                        " (",
                        count,
                        " समीक्षाएं)"
                      ]
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "text-xs mt-0.5",
                    style: { color: "oklch(0.4 0.03 70)" },
                    children: "अभी कोई रेटिंग नहीं"
                  }
                ),
                salon.address && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "text-xs mt-0.5",
                    style: { color: "oklch(0.45 0.03 70)" },
                    children: salon.address
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              salon.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "text-xs",
                  style: { color: "oklch(0.78 0.12 80)" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3 h-3 inline mr-0.5" }),
                    salon.phone
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ChevronRight,
                {
                  className: "w-4 h-4",
                  style: { color: "oklch(0.4 0.03 70)" }
                }
              )
            ] })
          ] })
        },
        salon.id.toString()
      );
    }),
    selectedSalon && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      BookingModal,
      {
        salon: selectedSalon,
        customerPhone: phone,
        customerName: profile.name,
        onClose: () => {
          setSelectedSalon(null);
          forceUpdate((n) => n + 1);
        }
      }
    ) })
  ] });
}
function BookingModal({
  salon,
  customerName,
  customerPhone,
  onClose
}) {
  const { data: services = [], isLoading: servicesLoading } = useGetSalonServices(salon.id);
  const { mutate: book, isPending: booking } = useBookAppointment(customerPhone);
  const [selectedService, setSelectedService] = reactExports.useState("");
  const [date, setDate] = reactExports.useState(getTodayString());
  const [booked, setBooked] = reactExports.useState(null);
  const handleBook = () => {
    if (!date) {
      ue.error("तारीख चुनें");
      return;
    }
    if (!selectedService) {
      ue.error("सेवा चुनें");
      return;
    }
    book(
      {
        salonId: salon.id,
        customerName,
        serviceName: selectedService,
        date
      },
      {
        onSuccess: (id) => {
          setBooked({ appointmentId: id, queueNum: 0 });
          ue.success("अपॉइंटमेंट बुक हो गई!");
        },
        onError: () => ue.error("बुकिंग नहीं हो सकी, दोबारा कोशिश करें")
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      style: {
        background: "oklch(0.17 0.012 60)",
        border: "1px solid oklch(0.28 0.04 75 / 0.6)"
      },
      "data-ocid": "booking.dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { style: { color: "oklch(0.97 0.015 80)" }, children: salon.name }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SalonPhotoGallery, { salonId: salon.id }),
        booked ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
              style: { background: "oklch(0.78 0.12 80 / 0.12)" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                CircleCheckBig,
                {
                  className: "w-8 h-8",
                  style: { color: "oklch(0.78 0.12 80)" }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "text-lg font-bold mb-1",
              style: { color: "oklch(0.97 0.015 80)" },
              children: "बुकिंग हो गई! ༼"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", style: { color: "oklch(0.55 0.04 80)" }, children: [
            "आपकी अपॉइंटमेंट ",
            date,
            " को है"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "text-xs mt-2",
              style: { color: "oklch(0.78 0.12 80)" },
              children: '"मेरी बुकिंग" में queue नंबर देखें'
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              className: "mt-4 w-full",
              onClick: onClose,
              "data-ocid": "booking.close_button",
              style: { background: "oklch(0.78 0.12 80)", color: "white" },
              children: "ठीक है"
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Label,
              {
                className: "text-sm mb-2 block",
                style: { color: "oklch(0.65 0.07 80)" },
                children: "तारीख चुनें"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: date,
                min: getTodayString(),
                onChange: (e) => setDate(e.target.value),
                "data-ocid": "booking.input",
                style: {
                  background: "oklch(0.17 0.012 60)",
                  border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                  color: "oklch(0.97 0.015 80)"
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Label,
              {
                className: "text-sm mb-2 block",
                style: { color: "oklch(0.65 0.07 80)" },
                children: "सेवा चुनें"
              }
            ),
            servicesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              LoaderCircle,
              {
                className: "w-5 h-5 animate-spin",
                style: { color: "oklch(0.78 0.12 80)" }
              }
            ) }) : services.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: { color: "oklch(0.55 0.04 80)" }, children: "इस सैलून में कोई सेवा नहीं है अभी" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: services.map((svc) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                className: "w-full rounded-lg p-3 cursor-pointer flex items-center justify-between text-left",
                "data-ocid": "booking.select",
                onClick: () => setSelectedService(svc.name),
                style: {
                  background: selectedService === svc.name ? "oklch(0.78 0.12 80 / 0.12)" : "oklch(0.17 0.012 60)",
                  border: `1px solid ${selectedService === svc.name ? "oklch(0.78 0.12 80)" : "oklch(0.32 0.06 78 / 0.5)"}`
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: "font-medium text-sm",
                        style: { color: "oklch(0.97 0.015 80)" },
                        children: svc.name
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "p",
                      {
                        className: "text-xs",
                        style: { color: "oklch(0.55 0.04 80)" },
                        children: [
                          String(svc.durationMinutes),
                          " मिनट"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: "font-bold",
                      style: { color: "oklch(0.78 0.12 80)" },
                      children: [
                        "₹",
                        Number(svc.price)
                      ]
                    }
                  )
                ]
              },
              svc.id.toString()
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                onClick: onClose,
                className: "flex-1",
                "data-ocid": "booking.cancel_button",
                style: { color: "oklch(0.55 0.04 80)" },
                children: "रद्द"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleBook,
                className: "flex-1",
                disabled: booking || !selectedService,
                "data-ocid": "booking.primary_button",
                style: { background: "oklch(0.78 0.12 80)", color: "white" },
                children: [
                  booking ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : null,
                  booking ? "बुक हो रहा है..." : "बुक करें"
                ]
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function AppointmentCard({
  appt,
  salons,
  customerPhone
}) {
  const salon = salons.find((s) => s.id === appt.salonId);
  const salonName = (salon == null ? void 0 : salon.name) || "सैलून";
  const salonId = appt.salonId.toString();
  const isActive = appt.status === "confirmed" || appt.status === "inprogress" || appt.status === "pending";
  const { data: queueInfo } = useGetQueueInfo(isActive ? appt.id : null);
  const notifiedRef = reactExports.useRef(false);
  const [showRating, setShowRating] = reactExports.useState(false);
  const [alreadyRated, setAlreadyRated] = reactExports.useState(
    () => hasRated(appt.id.toString())
  );
  reactExports.useEffect(() => {
    if (!queueInfo || !isActive || notifiedRef.current) return;
    const ahead = Number(queueInfo[1]);
    if (ahead <= 1 && Notification.permission === "granted") {
      notifiedRef.current = true;
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification("💈 salon360Pro", {
            body: `आपकी बारी आने वाली है! (${salonName})`,
            icon: "/assets/generated/icon-192.dim_192x192.png",
            badge: "/assets/generated/icon-192.dim_192x192.png",
            tag: "customer-turn-notification",
            requireInteraction: true,
            silent: false
          });
        }).catch(() => {
        });
      } else if ("Notification" in window) {
        try {
          new Notification("💈 salon360Pro", {
            body: `आपकी बारी आने वाली है! (${salonName})`,
            icon: "/assets/generated/icon-192.dim_192x192.png"
          });
        } catch {
        }
      }
    }
  }, [queueInfo, isActive, salonName]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl p-4",
        style: {
          background: "oklch(0.17 0.012 60)",
          border: "1px solid oklch(0.28 0.04 75 / 0.6)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "font-semibold text-sm",
                  style: { color: "oklch(0.97 0.015 80)" },
                  children: salonName
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", style: { color: "oklch(0.55 0.04 80)" }, children: [
                appt.serviceName,
                " • ",
                appt.date
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                className: "text-xs",
                style: {
                  background: appt.status === "completed" ? "oklch(0.78 0.12 80 / 0.12)" : appt.status === "cancelled" ? "oklch(0.577 0.245 27.325 / 0.2)" : "oklch(0.78 0.12 80 / 0.12)",
                  color: appt.status === "completed" ? "oklch(0.78 0.12 80)" : appt.status === "cancelled" ? "oklch(0.577 0.245 27.325)" : "oklch(0.78 0.12 80)",
                  border: "none"
                },
                children: STATUS_LABELS[appt.status] || appt.status
              }
            )
          ] }),
          isActive && queueInfo && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-lg p-2 mt-2 flex items-center gap-2",
              style: { background: "oklch(0.78 0.12 80 / 0.08)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Clock,
                  {
                    className: "w-4 h-4 flex-shrink-0",
                    style: { color: "oklch(0.78 0.12 80)" }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", style: { color: "oklch(0.78 0.12 80)" }, children: [
                  "आप नंबर ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: String(queueInfo[0]) }),
                  " पर हैं",
                  Number(queueInfo[1]) > 0 && ` • ${Number(queueInfo[1])} लोग पहले`
                ] })
              ]
            }
          ),
          appt.status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "mt-3 pt-3",
              style: { borderTop: "1px solid oklch(0.25 0.04 155)" },
              children: alreadyRated ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: { color: "oklch(0.78 0.12 80)" }, children: "✓ रेटिंग दी गई" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => setShowRating(true),
                  "data-ocid": "bookings.toggle",
                  className: "text-xs h-7 px-3",
                  style: {
                    background: "oklch(0.82 0.18 85 / 0.12)",
                    color: "oklch(0.82 0.14 78)",
                    border: "1px solid oklch(0.72 0.18 85 / 0.25)"
                  },
                  children: "⭐ रेटिंग दें"
                }
              )
            }
          )
        ]
      }
    ),
    showRating && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RatingPopup,
      {
        appointmentId: appt.id.toString(),
        salonId,
        salonName,
        customerPhone,
        onClose: () => {
          setShowRating(false);
          setAlreadyRated(hasRated(appt.id.toString()));
        }
      }
    )
  ] });
}
function MyBookingsTab({ phone }) {
  const { data: appointments = [], isLoading } = useGetMyAppointments(phone);
  const { data: salons = [] } = useGetAllActiveSalons();
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "bookings.loading_state", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SalonLoadingScreen, { compact: true }) });
  }
  const sorted = [...appointments].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt)
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold", style: { color: "oklch(0.97 0.015 80)" }, children: [
        "मेरी बुकिंग (",
        sorted.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-1 text-xs",
          style: { color: "oklch(0.78 0.12 80)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-3 h-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "नोटिफ़िकेशन चालू" })
          ]
        }
      )
    ] }),
    sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", "data-ocid": "bookings.empty_state", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Calendar,
        {
          className: "w-10 h-10 mx-auto mb-3",
          style: { color: "oklch(0.4 0.03 70)" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "oklch(0.55 0.04 80)" }, children: "कोई बुकिंग नहीं है" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", style: { color: "oklch(0.4 0.03 70)" }, children: '"सैलून चुनें" टैब से बुक करें' })
    ] }) : sorted.map((appt, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": `bookings.item.${idx + 1}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      AppointmentCard,
      {
        appt,
        salons,
        customerPhone: phone
      }
    ) }, appt.id.toString()))
  ] });
}
function SalonPhotoGallery({ salonId }) {
  const { data: photos = [] } = useGetSalonPhotos(salonId);
  if (!photos || photos.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex gap-2 overflow-x-auto pb-2",
        style: { scrollSnapType: "x mandatory" },
        children: photos.map((photo, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex-shrink-0 rounded-xl overflow-hidden",
            style: {
              width: "160px",
              height: "120px",
              scrollSnapAlign: "start",
              border: "1px solid oklch(0.28 0.04 75 / 0.5)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: photo.url,
                alt: `सैलून ${idx + 1}`,
                className: "w-full h-full object-cover",
                loading: "lazy"
              }
            )
          },
          photo.id.toString()
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1", style: { color: "oklch(0.4 0.03 70)" }, children: [
      photos.length,
      " फोटो"
    ] })
  ] });
}
export {
  CustomerDashboard as default,
  deleteRating,
  getAverageRating,
  getRatings,
  hasRated,
  saveRating
};
