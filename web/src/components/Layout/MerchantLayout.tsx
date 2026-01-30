import React from "react";
import AppShell, { AppNavItem } from "./AppShell";

const merchantNav: AppNavItem[] = [
  { to: "/merchant/dashboard", label: "Dashboard", icon: "Home", end: true },
  { to: "/merchant/orders", label: "Orders", icon: "Package" },
  { to: "/merchant/tracking", label: "Tracking", icon: "MapPin" },
  { to: "/merchant/payments", label: "Payments", icon: "CreditCard" },
  { to: "/merchant/settings", label: "Settings", icon: "Settings" },
];

export default function MerchantLayout() {
  // Best practice: enforce auth/role here (merchant).
  return (
    <AppShell
      title="Merchant • Britium Express"
      brand={{ name: "Merchant Portal", href: "/merchant/dashboard" }}
      nav={merchantNav}
      headerRight={
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-sm text-neutral-600">Merchant</span>
          <div className="h-8 w-8 rounded-full bg-neutral-200" aria-label="User avatar" />
        </div>
      }
      footer={<div className="px-6 py-4 text-xs text-neutral-500">Need help? Contact support.</div>}
    />
  );
}
