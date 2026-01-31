import * as React from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
// Verify '@/' is correctly mapped in your vite.config.ts / tsconfig.json
import { auth, db } from "@/firebaseconfig"; 

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
      
      // Reset profile immediately on logout
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Listener for Firestore user document
      const ref = doc(db, "users", u.uid);
      const unsubProfile = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            setProfile({
              role: "customer",
              displayName: u.displayName ?? undefined,
              email: u.email ?? undefined,
            });
          }
          setLoading(false);
        },
        (error) => {
          console.error("Profile fetch error:", error);
          setProfile({
            role: "customer",
            displayName: u.displayName ?? undefined,
            email: u.email ?? undefined,
          });
          setLoading(false);
        }
      );

      return () => unsubProfile();
    });

    return () => unsubAuth();
  }, []);

  return { user, profile, loading };
}