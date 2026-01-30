import * as React from "react";
import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Outlet />
    </div>
  );
}
