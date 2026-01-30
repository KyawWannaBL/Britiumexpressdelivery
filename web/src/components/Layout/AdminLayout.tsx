import React from "react";
import AppShell, { AppNavItem } from "./AppShell";

const adminNav: AppNavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "Home", end: true },
  { to: "/admin/orders", label: "Orders", icon: "Package" },
  { to: "/admin/merchants", label: "Merchants", icon: "Users" },
  { to: "/admin/riders", label: "Riders", icon: "Truck" },
  { to: "/admin/tracking", label: "Tracking", icon: "MapPin" },
  { to: "/admin/payments", label: "Payments", icon: "CreditCard" },
  { to: "/admin/settings", label: "Settings", icon: "Settings" },
];

export default function AdminLayout() {
  // Best practice: enforce auth/role here (redirect if not admin).
  // Example:
  // const { user } = useAuth();
  // if (!user) return <Navigate to="/login" replace />;
  // if (user.role !== "admin") return <Navigate to="/403" replace />;

  return (
    <AppShell
      title="Admin • Britium Express"
      brand={{ name: "Britium Admin", href: "/admin/dashboard" }}
      nav={adminNav}
      headerRight={
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-sm text-neutral-600">Admin</span>
          <div className="h-8 w-8 rounded-full bg-neutral-200" aria-label="User avatar" />
        </div>
      }
      footer={<div className="px-6 py-4 text-xs text-neutral-500">© {new Date().getFullYear()} Britium Express</div>}
    />
  );
}
