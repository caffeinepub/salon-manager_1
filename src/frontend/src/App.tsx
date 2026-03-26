import { Scissors } from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";
import LoginPage from "./components/LoginPage";
import RoleSelect from "./components/RoleSelect";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";

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

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  const [pendingRole, setPendingRole] = useState<AppRole | null>(null);
  const [savedRole, setSavedRole] = useState<AppRole | null>(() => {
    const r = localStorage.getItem(ROLE_KEY);
    return r === "salon" || r === "customer" ? r : null;
  });

  useEffect(() => {
    if (isAuthenticated && pendingRole) {
      localStorage.setItem(ROLE_KEY, pendingRole);
      setSavedRole(pendingRole);
      setPendingRole(null);
    }
  }, [isAuthenticated, pendingRole]);

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
      <Suspense fallback={<LoadingSpinner />}>
        <AdminPanel />
      </Suspense>
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
      <Suspense fallback={<LoadingSpinner />}>
        <SalonOwnerDashboard
          onSwitchRole={() => {
            localStorage.removeItem(ROLE_KEY);
            setSavedRole(null);
          }}
        />
      </Suspense>
    );
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CustomerDashboard
        onSwitchRole={() => {
          localStorage.removeItem(ROLE_KEY);
          setSavedRole(null);
        }}
      />
    </Suspense>
  );
}
