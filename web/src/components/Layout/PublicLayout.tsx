import React from "react";
import AppShell, { AppNavItem } from "./AppShell";
import { NavLink } from "react-router-dom";

const publicNav: AppNavItem[] = [
  { to: "/", label: "Home", end: true },
  { to: "/pricing", label: "Pricing" },
  { to: "/contact", label: "Contact" },
];

export default function PublicLayout() {
  return (
    <AppShell
      title="Britium Express"
      variant="public"
      brand={{ name: "Britium Express", href: "/" }}
      nav={publicNav}
      headerRight={
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-1" aria-label="Public navigation">
            {publicNav.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                end={i.end}
                className={({ isActive }) =>
                  isActive
                    ? "px-3 py-2 rounded-md text-sm bg-neutral-900 text-white"
                    : "px-3 py-2 rounded-md text-sm text-neutral-700 hover:bg-neutral-100"
                }
              >
                {i.label}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/login"
            className="px-3 py-2 rounded-md text-sm bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Sign in
          </NavLink>
        </div>
      }
      footer={
        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 text-xs text-neutral-500">
          © {new Date().getFullYear()} Britium Express • Privacy • Terms
        </div>
      }
    />
  );
}
