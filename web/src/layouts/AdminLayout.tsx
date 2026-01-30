import * as React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const item = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-semibold ${
          isActive ? "bg-black text-white" : "hover:bg-neutral-100"
        }`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="text-2xl font-extrabold">Admin</div>
      <div className="flex flex-wrap gap-2">
        {item("/admin", "Dashboard")}
        {item("/admin/management", "Management")}
        {item("/admin/users", "Users")}
        {item("/admin/tariff", "Tariff")}
      </div>
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
