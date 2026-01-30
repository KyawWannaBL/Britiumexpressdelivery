import * as React from "react";
import { useLocation } from "react-router-dom";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseconfig";

// Keep this aligned with your role enum
type Role =
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

type UserProfile = {
  role?: Role;
  stationId?: string;
  stationName?: string;
  displayName?: string;
  email?: string;
};

function mask(value?: string) {
  if (!value) return "";
  if (value.length <= 8) return "***";
  return value.slice(0, 4) + "..." + value.slice(-4);
}

export default function Debug() {
  const loc = useLocation();
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(null);
      setProfileError(null);

      if (!u) {
        setLoading(false);
        return;
      }

      try {
        // Profile doc assumption: users/{uid}
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setProfile(snap.data() as UserProfile);
        else setProfile(null);
      } catch (e: any) {
        setProfileError(e?.message ?? "Failed to read profile doc");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const env = {
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    // API key is not secret, but we still mask it to avoid copy leaks
    VITE_FIREBASE_API_KEY: mask(import.meta.env.VITE_FIREBASE_API_KEY),
  };

  return (
    <div style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>/debug</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        Quick diagnostics for Auth + Profile + Env + Routing.
      </p>

      <div style={{ display: "grid", gap: 16, maxWidth: 900 }}>
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Route</h2>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{JSON.stringify(
  { pathname: loc.pathname, search: loc.search, hash: loc.hash },
  null,
  2
)}
          </pre>
        </section>

        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Auth</h2>
          {loading ? (
            <div>Loading auth…</div>
          ) : user ? (
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{JSON.stringify(
  {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    providerData: user.providerData?.map((p) => ({
      providerId: p.providerId,
      uid: p.uid,
      email: p.email,
      displayName: p.displayName,
    })),
  },
  null,
  2
)}
            </pre>
          ) : (
            <div>Not logged in.</div>
          )}
        </section>

        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Profile (Firestore)</h2>
          {!user ? (
            <div>Login first to read profile doc.</div>
          ) : profileError ? (
            <div style={{ color: "crimson" }}>Error: {profileError}</div>
          ) : profile ? (
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{JSON.stringify(profile, null, 2)}
            </pre>
          ) : (
            <div>
              No profile document found at <code>users/{`{uid}`}</code>. (Create it or adjust the path.)
            </div>
          )}
        </section>

        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Environment</h2>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{JSON.stringify(env, null, 2)}
          </pre>
        </section>
      </div>

      <p style={{ marginTop: 18, opacity: 0.75, fontSize: 13 }}>
        Tip: If env values show <code>null/undefined</code> on Vercel, add them in Vercel Project → Settings → Environment Variables.
      </p>
    </div>
  );
}
