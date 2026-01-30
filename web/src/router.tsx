import * as React from "react";
import { createBrowserRouter } from "react-router";

import RootLayout from "./layouts/RootLayout";
import RequireRole from "./guards/RequireRole";
import RequireAuth from "./guards/RequireAuth";

const AdminLayoutLazy = React.lazy(() => import("./layouts/AdminLayout"));
const MerchantLayoutLazy = React.lazy(() => import("./layouts/MerchantLayout"));
const RoleHomeLazy = React.lazy(() => import("./pages/RoleHome"));

function Loader() {
  return <div className="p-6">Loading…</div>;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public / Customer
      {
        index: true,
        lazy: async () => {
          const m = await import("./pages/public/SendParcel");
          return { Component: m.default };
        },
      },

      // Auth
      {
        path: "/login",
        lazy: async () => {
          const m = await import("./pages/auth/Login");
          return { Component: m.default };
        },
      },

      // Role-based landing
      {
        path: "/app",
        element: (
          <RequireAuth>
            <React.Suspense fallback={<Loader />}>
              <RoleHomeLazy />
            </React.Suspense>
          </RequireAuth>
        ),
      },

      // Admin
      {
        path: "/admin",
        element: (
          <RequireRole allow={["super_admin", "manager", "sub_station_manager", "supervisor", "accountant"]}>
            <React.Suspense fallback={<Loader />}>
              <AdminLayoutLazy />
            </React.Suspense>
          </RequireRole>
        ),
        children: [
          { index: true, lazy: async () => ({ Component: (await import("./pages/admin/Dashboard")).default }) },
          { path: "management", lazy: async () => ({ Component: (await import("./pages/admin/AdminManagement")).default }) },
          { path: "users", lazy: async () => ({ Component: (await import("./pages/admin/AdminUsers")).default }) },
          { path: "tariff", lazy: async () => ({ Component: (await import("./pages/admin/TariffSetting")).default }) },
        ],
      },

      // Merchant
      {
        path: "/merchant",
        element: (
          <RequireRole allow={["merchant"]}>
            <React.Suspense fallback={<Loader />}>
              <MerchantLayoutLazy />
            </React.Suspense>
          </RequireRole>
        ),
        children: [
          { index: true, lazy: async () => ({ Component: (await import("./pages/merchant/MerchantPortal")).default }) },
          { path: "create", lazy: async () => ({ Component: (await import("./pages/merchant/CreateShipment")).default }) },
          { path: "bulk", lazy: async () => ({ Component: (await import("./pages/merchant/BulkUpload")).default }) },
          { path: "finance", lazy: async () => ({ Component: (await import("./pages/merchant/MerchantFinance")).default }) },
          { path: "pickups", lazy: async () => ({ Component: (await import("./pages/merchant/MerchantPickups")).default }) },
        ],
      },

      // 403
      {
        path: "/403",
        element: (
          <div className="p-6">
            <div className="rounded-xl border bg-white p-6">
              <div className="text-xl font-extrabold">403</div>
              <div className="text-sm text-neutral-600 mt-1">You don’t have permission to view this page.</div>
            </div>
          </div>
        ),
      },
    ],
  },
]);
