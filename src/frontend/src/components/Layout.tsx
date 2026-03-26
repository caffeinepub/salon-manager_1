import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

const navItems = [
  {
    to: "/",
    label: "डैशबोर्ड",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  {
    to: "/appointments",
    label: "अपॉइंटमेंट",
    icon: Calendar,
    ocid: "nav.appointments.link",
  },
  { to: "/customers", label: "ग्राहक", icon: Users, ocid: "nav.customers.link" },
  { to: "/services", label: "सेवाएं", icon: Sparkles, ocid: "nav.services.link" },
  { to: "/staff", label: "स्टाफ", icon: UserCheck, ocid: "nav.staff.link" },
];

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { clear } = useInternetIdentity();
  const qc = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const isActive = (to: string) =>
    to === "/" ? currentPath === "/" : currentPath.startsWith(to);

  const SidebarContent = () => (
    <div
      className="h-full flex flex-col"
      style={{ background: "oklch(0.28 0.025 162)" }}
    >
      <div
        className="p-6 border-b"
        style={{ borderColor: "oklch(0.35 0.025 162)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.73 0.11 75)" }}
          >
            <Scissors
              className="w-4 h-4"
              style={{ color: "oklch(0.28 0.025 162)" }}
            />
          </div>
          <div>
            <div
              className="font-display text-base font-semibold"
              style={{ color: "oklch(0.95 0.005 182)" }}
            >
              Salon Pro
            </div>
            <div className="text-xs" style={{ color: "oklch(0.65 0.015 182)" }}>
              सैलून मैनेजमेंट
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={item.ocid}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: active ? "oklch(0.34 0.075 192)" : "transparent",
                color: active
                  ? "oklch(0.95 0.005 182)"
                  : "oklch(0.65 0.015 182)",
              }}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        className="p-4 border-t"
        style={{ borderColor: "oklch(0.35 0.025 162)" }}
      >
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback
              className="text-xs font-semibold"
              style={{
                background: "oklch(0.93 0.035 75)",
                color: "oklch(0.34 0.075 192)",
              }}
            >
              {profile?.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: "oklch(0.95 0.005 182)" }}
            >
              {profile?.name ?? "User"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          data-ocid="nav.logout.button"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-xs"
          style={{ color: "oklch(0.65 0.015 182)" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          लॉगआउट
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <aside className="hidden lg:block w-60 flex-shrink-0 shadow-sidebar">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setMobileOpen(false)}
          onKeyUp={(e) => e.key === "Escape" && setMobileOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-background"
          style={{ borderColor: "oklch(0.92 0.005 240)" }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            data-ocid="nav.menu.button"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Scissors
              className="w-4 h-4"
              style={{ color: "oklch(0.34 0.075 192)" }}
            />
            <span className="font-display font-semibold">Salon Pro</span>
          </div>
          {mobileOpen && (
            <button type="button" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
