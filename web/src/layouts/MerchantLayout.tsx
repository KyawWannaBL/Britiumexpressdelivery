import * as React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function MerchantLayout() {
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
      <div className="text-2xl font-extrabold">Merchant</div>
      <div className="flex flex-wrap gap-2">
        {item("/merchant", "Dashboard")}
        {item("/merchant/create", "Create")}
        {item("/merchant/bulk", "Bulk")}
        {item("/merchant/finance", "Finance")}
        {item("/merchant/pickups", "Pickups")}
      </div>
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
