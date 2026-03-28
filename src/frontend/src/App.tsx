import { Scissors } from "lucide-react";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import MobileLoginPage from "./components/MobileLoginPage";
import RoleSelect from "./components/RoleSelect";
import SalonLoadingScreen from "./components/SalonLoadingScreen";
import { createActorWithConfig } from "./config";
import AdminLoginPage, {
  isAdminLoggedIn,
  logoutAdmin,
} from "./pages/AdminLoginPage";

const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const SalonOwnerDashboard = lazy(() => import("./pages/SalonOwnerDashboard"));

const SESSION_KEY = "salon360_session";
const ROLE_KEY = "salon360_role";
const INACTIVITY_MS = 30 * 60 * 1000;

export type AppRole = "salon" | "customer";

interface Session {
  phone: string;
  role: AppRole;
  expiresAt: number;
}

function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(phone: string, role: AppRole) {
  const session: Session = {
    phone,
    role,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(ROLE_KEY, role);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ROLE_KEY);
}

function isAdminRoute(): boolean {
  return (
    window.location.hash === "#/admin-login" ||
    window.location.hash === "#/admin" ||
    window.location.pathname === "/admin-login" ||
    window.location.pathname === "/admin"
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(() => getSession());
  const [pendingRole, setPendingRole] = useState<AppRole | null>(null);
  const [adminSession, setAdminSession] = useState<boolean>(() =>
    isAdminLoggedIn(),
  );
  const [onAdminRoute, setOnAdminRoute] = useState<boolean>(() =>
    isAdminRoute(),
  );

  // Health check: pre-warm backend on app open so ICP cold start happens early
  useEffect(() => {
    createActorWithConfig().catch(() => {});
  }, []);

  // 30-min inactivity auto-logout
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ["mousemove", "keydown", "click", "touchstart"] as const;
    for (const e of events) {
      window.addEventListener(e, updateActivity, { passive: true });
    }

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_MS) {
        const isLoggedIn = !!getSession() || isAdminLoggedIn();
        if (isLoggedIn) {
          clearSession();
          logoutAdmin();
          setSession(null);
          setAdminSession(false);
          setPendingRole(null);
          toast("30 मिनट की निष्क्रियता के कारण लॉगआउट हो गए");
        }
      }
    }, 60_000);

    return () => {
      for (const e of events) {
        window.removeEventListener(e, updateActivity);
      }
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setOnAdminRoute(isAdminRoute());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Admin route
  if (onAdminRoute || adminSession) {
    if (!adminSession) {
      return (
        <ErrorBoundary>
          <AdminLoginPage
            onLoginSuccess={() => {
              setAdminSession(true);
              window.location.hash = "";
            }}
          />
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary>
        <Suspense fallback={<SalonLoadingScreen />}>
          <AdminPanel
            onLogout={() => {
              logoutAdmin();
              setAdminSession(false);
              window.location.hash = "";
            }}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Active session — show dashboard
  if (session) {
    const handleLogout = () => {
      clearSession();
      setSession(null);
      setPendingRole(null);
    };

    if (session.role === "salon") {
      return (
        <ErrorBoundary>
          <Suspense fallback={<SalonLoadingScreen />}>
            <SalonOwnerDashboard
              phone={session.phone}
              onSwitchRole={handleLogout}
            />
          </Suspense>
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary>
        <Suspense fallback={<SalonLoadingScreen />}>
          <CustomerDashboard
            phone={session.phone}
            onSwitchRole={handleLogout}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // No session: role select → login → dashboard
  if (!pendingRole) {
    return (
      <RoleSelect
        onSelect={(role) => {
          setPendingRole(role);
        }}
      />
    );
  }

  return (
    <MobileLoginPage
      role={pendingRole}
      onChangeRole={() => setPendingRole(null)}
      onLoginSuccess={(phone) => {
        saveSession(phone, pendingRole);
        setSession(getSession());
      }}
    />
  );
}
