import React from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";

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
  | "accountant"
  | string;

export type UserProfile = {
  role?: Role;
  stationId?: string;
  stationName?: string;
  displayName?: string;
  phone?: string;
  active?: boolean;
};

export function useAuthProfile() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(null);

      if (!u) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        setProfile((snap.data() as UserProfile) ?? null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return { user, profile, loading };
}
