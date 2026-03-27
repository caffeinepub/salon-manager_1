import { Scissors } from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import LoginPage from "./components/LoginPage";
import RoleSelect from "./components/RoleSelect";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";
import AdminLoginPage, {
  isAdminLoggedIn,
  logoutAdmin,
} from "./pages/AdminLoginPage";

const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const SalonOwnerDashboard = lazy(() => import("./pages/SalonOwnerDashboard"));

const ROLE_KEY = "salon360_role";

export type AppRole = "salon" | "customer";

function LoadingSpinner() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "oklch(0.98 0.005 145)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center animate-pulse"
          style={{ background: "oklch(0.52 0.18 145)" }}
        >
          <Scissors className="w-6 h-6 text-white" />
        </div>
        <p className="text-muted-foreground text-sm">लोड हो रहा है...</p>
      </div>
    </div>
  );
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
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  const [pendingRole, setPendingRole] = useState<AppRole | null>(null);
  const [savedRole, setSavedRole] = useState<AppRole | null>(() => {
    const r = localStorage.getItem(ROLE_KEY);
    return r === "salon" || r === "customer" ? r : null;
  });

  const [adminSession, setAdminSession] = useState<boolean>(() =>
    isAdminLoggedIn(),
  );
  const [onAdminRoute, setOnAdminRoute] = useState<boolean>(() =>
    isAdminRoute(),
  );

  useEffect(() => {
    const handleHashChange = () => {
      setOnAdminRoute(isAdminRoute());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (isAuthenticated && pendingRole) {
      localStorage.setItem(ROLE_KEY, pendingRole);
      setSavedRole(pendingRole);
      setPendingRole(null);
    }
  }, [isAuthenticated, pendingRole]);

  // Admin route: show login page or admin panel
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
        <Suspense fallback={<LoadingSpinner />}>
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

  const loadingAfterAuth = isAuthenticated && adminLoading;

  if (loadingAfterAuth) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    if (!pendingRole && !savedRole) {
      return <RoleSelect onSelect={setPendingRole} />;
    }
    return (
      <LoginPage
        role={pendingRole || savedRole}
        onChangeRole={() => {
          setPendingRole(null);
          setSavedRole(null);
        }}
        isInitializing={isInitializing}
      />
    );
  }

  if (isAdmin) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminPanel />
        </Suspense>
      </ErrorBoundary>
    );
  }

  const role = savedRole;

  if (!role) {
    return (
      <RoleSelect
        onSelect={(r) => {
          localStorage.setItem(ROLE_KEY, r);
          setSavedRole(r);
        }}
      />
    );
  }

  if (role === "salon")
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <SalonOwnerDashboard
            onSwitchRole={() => {
              localStorage.removeItem(ROLE_KEY);
              setSavedRole(null);
            }}
          />
        </Suspense>
      </ErrorBoundary>
    );
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <CustomerDashboard
          onSwitchRole={() => {
            localStorage.removeItem(ROLE_KEY);
            setSavedRole(null);
          }}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
