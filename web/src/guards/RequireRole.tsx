import * as React from "react";
import { Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import { Role, useAuthProfile } from "../shared/useAuthProfile";

export default function RequireRole({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuthProfile();

  return (
    <RequireAuth>
      {loading ? (
        <div className="p-6">Loading…</div>
      ) : allow.includes(profile?.role ?? "customer") ? (
        <>{children}</>
      ) : (
        <Navigate to="/403" replace />
      )}
    </RequireAuth>
  );
}
