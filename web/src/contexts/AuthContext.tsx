import * as React from "react";
// Use the @ alias instead of ../
import { useAuthProfile } from "@/shared/useAuthProfile"; 

const AuthContext = React.createContext<ReturnType<typeof useAuthProfile> | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthProfile();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}