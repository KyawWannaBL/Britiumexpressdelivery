import React from "react";
import AppShell, { AppNavItem } from "./AppShell";

const riderNav: AppNavItem[] = [
  { to: "/rider/home", label: "Home", icon: "Home", end: true },
  { to: "/rider/assignments", label: "Assignments", icon: "Truck" },
  { to: "/rider/tracking", label: "Tracking", icon: "MapPin" },
  { to: "/rider/earnings", label: "Earnings", icon: "CreditCard" },
  { to: "/rider/profile", label: "Profile", icon: "Users" },
];

export default function RiderLayout() {
  // Best practice: enforce auth/role here (rider).
  return (
    <AppShell
      title="Rider • Britium Express"
      brand={{ name: "Rider App (Web)", href: "/rider/home" }}
      nav={riderNav}
      headerRight={
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-sm text-neutral-600">Rider</span>
          <div className="h-8 w-8 rounded-full bg-neutral-200" aria-label="User avatar" />
        </div>
      }
      footer={<div className="px-6 py-4 text-xs text-neutral-500">Ride safe. Always verify pickup codes.</div>}
    />
  );
}
