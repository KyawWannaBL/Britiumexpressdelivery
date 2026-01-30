// src/shared/useAuthProfile.ts
import * as React from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebaseconfig";
import { useAuthProfile } from "@/shared/useAuthProfile";
export type Role =
  | "super_admin"
  | "manager"
  | "sub_station_manager"
  | "supervisor"
  | "warehouse"
  | "rider_driver"
  | "merchant"
  | "vendor"
  | "customer"
  | "accountant";

export type UserProfile = {
  role?: Role;
  stationId?: string;
  stationName?: string;
  displayName?: string;
  email?: string;
};

export function useAuthProfile(): {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
} {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(true);

      // Reset profile immediately on logout
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Assumption: your user profile doc is stored at: users/{uid}
      const ref = doc(db, "users", u.uid);

      const unsubProfile = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            // If no profile doc exists yet, keep a safe default
            setProfile({
              role: "customer",
              displayName: u.displayName ?? undefined,
              email: u.email ?? undefined,
            });
          }
          setLoading(false);
        },
        () => {
          // If Firestore read fails, still allow app to continue
          setProfile({
            role: "customer",
            displayName: u.displayName ?? undefined,
            email: u.email ?? undefined,
          });
          setLoading(false);
        }
      );

      // cleanup profile listener when auth changes
      return () => unsubProfile();
    });

    return () => unsubAuth();
  }, []);

  return { user, profile, loading };
}
