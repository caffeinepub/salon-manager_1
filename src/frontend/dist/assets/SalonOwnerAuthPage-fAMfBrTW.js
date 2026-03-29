import { v as useActor, r as reactExports, j as jsxRuntimeExports, g as Scissors, u as ue, z as EyeOff, A as Eye, h as LoaderCircle } from "./index-CoJntSyQ.js";
import { a as Clock, C as CircleCheckBig } from "./clock-CAb4EzGb.js";
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}salon360_salt`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
const BG = "oklch(0.12 0.04 155)";
const CARD = "oklch(0.18 0.05 155)";
const BORDER = "1px solid oklch(0.28 0.05 155)";
const ACCENT = "oklch(0.52 0.18 145)";
const TEXT = "oklch(0.95 0.02 145)";
const MUTED = "oklch(0.6 0.05 145)";
const INPUT_BG = "oklch(0.22 0.05 155)";
const INPUT_BORDER = "1px solid oklch(0.32 0.05 155)";
function FieldLabel({
  htmlFor,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "label",
    {
      htmlFor,
      className: "block text-sm font-medium",
      style: { color: MUTED },
      children
    }
  );
}
function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  ocid,
  readOnly
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      id,
      type,
      value,
      onChange: onChange ? (e) => onChange(e.target.value) : void 0,
      placeholder,
      readOnly,
      "data-ocid": ocid,
      className: "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all",
      style: {
        background: readOnly ? "oklch(0.20 0.05 155)" : INPUT_BG,
        border: INPUT_BORDER,
        color: TEXT
      }
    }
  );
}
function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  ocid
}) {
  const [show, setShow] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: id, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id,
          type: show ? "text" : "password",
          value,
          onChange: (e) => onChange(e.target.value),
          placeholder,
          "data-ocid": ocid,
          className: "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all pr-10",
          style: { background: INPUT_BG, border: INPUT_BORDER, color: TEXT }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setShow((s) => !s),
          className: "absolute right-3 top-1/2 -translate-y-1/2 p-0.5",
          style: { color: MUTED },
          children: show ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
        }
      )
    ] })
  ] });
}
function PhoneField({
  id,
  value,
  onChange,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: id, children: "मोबाइल नंबर" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex rounded-xl overflow-hidden",
        style: { border: INPUT_BORDER },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "px-3 py-3 text-sm flex items-center flex-shrink-0",
              style: { background: "oklch(0.20 0.05 155)", color: MUTED },
              children: "+91"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id,
              type: "tel",
              inputMode: "numeric",
              maxLength: 10,
              value,
              onChange: (e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10)),
              placeholder: placeholder ?? "10 अंकों का नंबर",
              "data-ocid": "salon_auth.input",
              className: "flex-1 px-3 py-3 text-sm outline-none",
              style: { background: INPUT_BG, color: TEXT }
            }
          )
        ]
      }
    )
  ] });
}
function Card({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "w-full max-w-md mx-auto rounded-2xl p-6 space-y-5",
      style: { background: CARD, border: BORDER },
      children
    }
  );
}
function ActionButton({
  loading,
  label,
  loadingLabel,
  ocid,
  onClick,
  type = "submit"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type,
      disabled: loading,
      "data-ocid": ocid,
      onClick,
      className: "w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity disabled:opacity-70 flex items-center justify-center gap-2",
      style: { background: ACCENT },
      children: [
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
        loading ? loadingLabel ?? label : label
      ]
    }
  );
}
function LinkBtn({
  onClick,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick,
      className: "text-sm underline-offset-2 hover:underline",
      style: { color: ACCENT },
      children
    }
  );
}
function SalonOwnerAuthPage({ onBack, onLoginSuccess }) {
  const { actor } = useActor();
  const [mode, setMode] = reactExports.useState("login");
  const [loginPhone, setLoginPhone] = reactExports.useState("");
  const [loginPassword, setLoginPassword] = reactExports.useState("");
  const [regPhone, setRegPhone] = reactExports.useState("");
  const [regName, setRegName] = reactExports.useState("");
  const [regServices, setRegServices] = reactExports.useState("");
  const [regPassword, setRegPassword] = reactExports.useState("");
  const [regConfirm, setRegConfirm] = reactExports.useState("");
  const [spPassword, setSpPassword] = reactExports.useState("");
  const [spConfirm, setSpConfirm] = reactExports.useState("");
  const [spPhone, setSpPhone] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [pendingSalonName, setPendingSalonName] = reactExports.useState("");
  async function waitForActor() {
    if (actor) return actor;
    const start = Date.now();
    while (Date.now() - start < 45e3) {
      await new Promise((r) => setTimeout(r, 2e3));
      if (actor) return actor;
    }
    throw new Error("सर्वर से कनेक्ट नहीं हो पाया। पेज रीलोड करें।");
  }
  async function handleLogin(e) {
    e.preventDefault();
    const phone = loginPhone.trim();
    if (!/^\d{10}$/.test(phone)) {
      ue.error("सही 10 अंकों का मोबाइल नंबर डालें");
      return;
    }
    if (loginPassword.length < 6) {
      ue.error("पासवर्ड कम से कम 6 अक्षर का होना चाहिए");
      return;
    }
    setLoading(true);
    try {
      const a = await waitForActor();
      const hash = await hashPassword(loginPassword);
      const result = await a.salonOwnerLogin(phone, hash);
      const [status, salonRaw] = result;
      const salon = Array.isArray(salonRaw) ? salonRaw.length > 0 ? salonRaw[0] : null : salonRaw;
      switch (status) {
        case "approved":
          ue.success("लॉगिन सफल! डैशबोर्ड खुल रहा है...");
          onLoginSuccess(phone);
          break;
        case "pending":
          setPendingSalonName((salon == null ? void 0 : salon.name) ?? "");
          setMode("pending");
          break;
        case "wrong_password":
          ue.error("पासवर्ड गलत है");
          break;
        case "not_found":
          ue.error("यह नंबर रजिस्टर नहीं है");
          break;
        case "inactive":
          ue.error(
            `आपकी दुकान ${(salon == null ? void 0 : salon.name) ?? ""} निष्क्रिय है। Admin से संपर्क करें।`
          );
          break;
        case "no_password":
          setSpPhone(phone);
          setMode("set_password");
          break;
        default:
          ue.error("कुछ गलत हुआ, दोबारा कोशिश करें");
      }
    } catch (err) {
      ue.error((err == null ? void 0 : err.message) ?? "कुछ गलत हुआ, दोबारा कोशिश करें");
    } finally {
      setLoading(false);
    }
  }
  async function handleRegister(e) {
    e.preventDefault();
    const phone = regPhone.trim();
    if (!/^\d{10}$/.test(phone)) {
      ue.error("सही 10 अंकों का मोबाइल नंबर डालें");
      return;
    }
    if (!regName.trim()) {
      ue.error("सैलून का नाम डालें");
      return;
    }
    if (regPassword.length < 6) {
      ue.error("पासवर्ड कम से कम 6 अक्षर का होना चाहिए");
      return;
    }
    if (regPassword !== regConfirm) {
      ue.error("दोनों पासवर्ड मेल नहीं खाते");
      return;
    }
    setLoading(true);
    try {
      const a = await waitForActor();
      const hash = await hashPassword(regPassword);
      const parsedServices = regServices.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
      const result = await a.salonOwnerRegisterV2(
        phone,
        regName.trim(),
        parsedServices,
        hash
      );
      switch (result) {
        case "ok":
          setPendingSalonName(regName.trim());
          setMode("success");
          break;
        case "already_registered":
          ue.error("यह नंबर पहले से रजिस्टर है। लॉगिन करें।");
          setMode("login");
          setLoginPhone(phone);
          break;
        case "limit_reached":
          ue.error("अभी नया सैलून नहीं जुड़ सकता। Admin से संपर्क करें।");
          break;
        default:
          ue.error("रजिस्ट्रेशन नहीं हो पाया, दोबारा कोशिश करें");
      }
    } catch (err) {
      ue.error((err == null ? void 0 : err.message) ?? "रजिस्ट्रेशन नहीं हो पाया, दोबारा कोशिश करें");
    } finally {
      setLoading(false);
    }
  }
  async function handleSetPassword(e) {
    e.preventDefault();
    if (spPassword.length < 6) {
      ue.error("पासवर्ड कम से कम 6 अक्षर का होना चाहिए");
      return;
    }
    if (spPassword !== spConfirm) {
      ue.error("दोनों पासवर्ड मेल नहीं खाते");
      return;
    }
    setLoading(true);
    try {
      const a = await waitForActor();
      const hash = await hashPassword(spPassword);
      const ok = await a.salonOwnerSetPassword(
        spPhone,
        hash
      );
      if (ok) {
        ue.success("पासवर्ड सेट हो गया! डैशबोर्ड खुल रहा है...");
        onLoginSuccess(spPhone);
      } else {
        ue.error("पासवर्ड सेट नहीं हो पाया");
      }
    } catch (err) {
      ue.error((err == null ? void 0 : err.message) ?? "कुछ गलत हुआ, दोबारा कोशिश करें");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen flex flex-col items-center justify-start py-8 px-4",
      style: { background: BG },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-10 h-10 rounded-full flex items-center justify-center",
              style: { background: ACCENT },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "w-5 h-5 text-white" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold", style: { color: TEXT }, children: "Salon360" })
        ] }),
        mode === "login" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", style: { color: TEXT }, children: "सैलून मालिक लॉगिन" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: { color: MUTED }, children: "अपना रजिस्टर्ड नंबर और पासवर्ड डालें" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              PhoneField,
              {
                id: "login-phone",
                value: loginPhone,
                onChange: setLoginPhone,
                placeholder: "10 अंकों का नंबर"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              PasswordField,
              {
                id: "login-password",
                label: "पासवर्ड",
                value: loginPassword,
                onChange: setLoginPassword,
                placeholder: "कम से कम 6 अक्षर",
                ocid: "salon_auth.input"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ActionButton,
              {
                loading,
                label: "लॉगिन करें",
                loadingLabel: "लॉगिन हो रहा है...",
                ocid: "salon_auth.submit_button"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", style: { color: MUTED }, children: [
              "नया सैलून?",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(LinkBtn, { onClick: () => setMode("register"), children: "यहाँ रजिस्टर करें" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onBack,
                "data-ocid": "salon_auth.cancel_button",
                className: "text-sm",
                style: { color: MUTED },
                children: "← वापस जाएं"
              }
            )
          ] })
        ] }),
        mode === "register" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", style: { color: TEXT }, children: "नया सैलून रजिस्टर करें" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: { color: MUTED }, children: "Admin की मंजूरी के बाद लॉगिन कर पाएंगे" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleRegister, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              PhoneField,
              {
                id: "reg-phone",
                value: regPhone,
                onChange: setRegPhone,
                placeholder: "10 अंकों का अनोखा नंबर"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "reg-name", children: "सैलून का नाम" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextInput,
                {
                  id: "reg-name",
                  value: regName,
                  onChange: setRegName,
                  placeholder: "जैसे: राज हेयर सैलून",
                  ocid: "salon_auth.input"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "reg-services", children: "सेवाएं" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  id: "reg-services",
                  value: regServices,
                  onChange: (e) => setRegServices(e.target.value),
                  placeholder: "अल्पविराम से अलग करें, जैसे: बाल काटना, शेव, फेशियल",
                  rows: 2,
                  "data-ocid": "salon_auth.textarea",
                  className: "w-full px-4 py-3 rounded-xl text-sm outline-none resize-none",
                  style: {
                    background: INPUT_BG,
                    border: INPUT_BORDER,
                    color: TEXT
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", style: { color: "oklch(0.5 0.04 155)" }, children: "comma (,) से अलग करें" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              PasswordField,
              {
                id: "reg-password",
                label: "पासवर्ड",
                value: regPassword,
                onChange: setRegPassword,
                placeholder: "कम से कम 6 अक्षर",
                ocid: "salon_auth.input"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              PasswordField,
              {
                id: "reg-confirm",
                label: "पासवर्ड दोबारा",
                value: regConfirm,
                onChange: setRegConfirm,
                placeholder: "पासवर्ड दोबारा डालें",
                ocid: "salon_auth.input"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ActionButton,
              {
                loading,
                label: "रजिस्टर करें",
                loadingLabel: "रजिस्टर हो रहा है...",
                ocid: "salon_auth.submit_button"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", style: { color: MUTED }, children: [
              "पहले से account है?",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(LinkBtn, { onClick: () => setMode("login"), children: "लॉगिन करें" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onBack,
                "data-ocid": "salon_auth.cancel_button",
                className: "text-sm",
                style: { color: MUTED },
                children: "← वापस जाएं"
              }
            )
          ] })
        ] }),
        mode === "set_password" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", style: { color: TEXT }, children: "पासवर्ड सेट करें" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: { color: MUTED }, children: "आपका सैलून पहले से रजिस्टर है। एक बार पासवर्ड सेट करें।" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSetPassword, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "sp-phone", children: "मोबाइल नंबर" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { id: "sp-phone", value: spPhone, readOnly: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              PasswordField,
              {
                id: "sp-password",
                label: "नया पासवर्ड",
                value: spPassword,
                onChange: setSpPassword,
                placeholder: "कम से कम 6 अक्षर",
                ocid: "salon_auth.input"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              PasswordField,
              {
                id: "sp-confirm",
                label: "पासवर्ड दोबारा",
                value: spConfirm,
                onChange: setSpConfirm,
                placeholder: "पासवर्ड दोबारा डालें",
                ocid: "salon_auth.input"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ActionButton,
              {
                loading,
                label: "पासवर्ड सेट करें",
                loadingLabel: "सेट हो रहा है...",
                ocid: "salon_auth.submit_button"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setMode("login"),
              className: "text-sm",
              style: { color: MUTED },
              children: "← वापस जाएं"
            }
          ) })
        ] }),
        mode === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
              style: { background: "oklch(0.75 0.18 85 / 0.15)" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Clock,
                {
                  className: "w-8 h-8",
                  style: { color: "oklch(0.75 0.18 85)" }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", style: { color: TEXT }, children: "अनुमोदन प्रतीक्षा में" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm mt-2", style: { color: MUTED }, children: [
              "आपकी दुकान",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "oklch(0.85 0.08 145)" }, children: pendingSalonName }),
              " ",
              "का रजिस्ट्रेशन हो गया है। Admin की मंजूरी का इंतज़ार है।"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "rounded-xl p-3 text-sm",
              style: {
                background: "oklch(0.75 0.18 85 / 0.1)",
                border: "1px solid oklch(0.75 0.18 85 / 0.3)",
                color: "oklch(0.78 0.14 85)"
              },
              children: "आमतौर पर 24 घंटे में मंजूरी मिलती है"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setMode("login"),
              "data-ocid": "salon_auth.cancel_button",
              className: "w-full py-3 rounded-xl text-sm font-semibold",
              style: {
                background: "oklch(0.22 0.05 155)",
                color: MUTED,
                border: BORDER
              },
              children: "← वापस जाएं"
            }
          )
        ] }) }),
        mode === "success" && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
              style: { background: "oklch(0.52 0.18 145 / 0.15)" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-8 h-8", style: { color: ACCENT } })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", style: { color: TEXT }, children: "रजिस्ट्रेशन सफल!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm mt-2", style: { color: MUTED }, children: [
              "आपकी दुकान",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "oklch(0.85 0.08 145)" }, children: pendingSalonName }),
              " ",
              "रजिस्टर हो गई है। Admin की मंजूरी के बाद आप लॉगिन कर पाएंगे।"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setMode("login"),
              "data-ocid": "salon_auth.primary_button",
              className: "w-full py-3.5 rounded-xl text-white text-sm font-semibold",
              style: { background: ACCENT },
              children: "लॉगिन करें"
            }
          )
        ] }) })
      ]
    }
  );
}
export {
  SalonOwnerAuthPage as default
};
