import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthProfile } from "../shared/useAuthProfile";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthProfile();
  const location = useLocation();

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <>{children}</>;
}
