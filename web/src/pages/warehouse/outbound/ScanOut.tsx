import React from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseconfig";

type ParcelStatus =
  | "inbound_received"
  | "sorted"
  | "manifested"
  | "out_for_delivery"
  | "delivered"
  | "transfer_dispatched"
  | "cancelled"
  | string;

type Parcel = {
  trackingId?: string;
  status?: ParcelStatus;
  currentStationId?: string;
  currentStationName?: string;
  manifestId?: string;
};

type UserProfile = {
  stationId?: string;
  stationName?: string;
};

function cn(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

function useUserProfile() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(null);
      if (!u) return;
      const snap = await getDoc(doc(db, "users", u.uid));
      setProfile((snap.data() as UserProfile) ?? null);
    });
    return () => unsub();
  }, []);

  return { user, profile };
}

async function findParcelByCode(code: string): Promise<{ id: string; data: Parcel } | null> {
  const direct = await getDoc(doc(db, "parcels", code));
  if (direct.exists()) return { id: direct.id, data: direct.data() as Parcel };

  const q = query(collection(db, "parcels"), where("trackingId", "==", code), limit(1));
  const res = await getDocs(q);
  const d = res.docs[0];
  if (!d) return null;
  return { id: d.id, data: d.data() as Parcel };
}

export default function ScanOut() {
  const { user, profile } = useUserProfile();
  const stationId = profile?.stationId ?? "";
  const stationName = profile?.stationName ?? "Station";

  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"OUT_FOR_DELIVERY" | "TRANSFER_DISPATCH">("OUT_FOR_DELIVERY");
  const [recent, setRecent] = React.useState<Array<{ code: string; ok: boolean; msg: string; at: number }>>([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) return;

    if (!user) return setError("Please login first.");
    if (!stationId) return setError("Your profile has no stationId (users/{uid}.stationId).");

    setBusy(true);
    try {
      const found = await findParcelByCode(trimmed);
      if (!found) {
        setRecent((s) => [{ code: trimmed, ok: false, msg: "Parcel not found", at: Date.now() }, ...s].slice(0, 8));
        setCode("");
        return;
      }

      // Optional guard: ensure it belongs to this station
      if (found.data.currentStationId && found.data.currentStationId !== stationId) {
        setRecent((s) =>
          [
            {
              code: trimmed,
              ok: false,
              msg: `Parcel is at station ${found.data.currentStationId}, not ${stationId}`,
              at: Date.now(),
            },
            ...s,
          ].slice(0, 8)
        );
        setCode("");
        return;
      }

      const nextStatus: ParcelStatus =
        mode === "OUT_FOR_DELIVERY" ? "out_for_delivery" : "transfer_dispatched";

      await updateDoc(doc(db, "parcels", found.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "warehouse_events"), {
        type: mode === "OUT_FOR_DELIVERY" ? "SCAN_OUT_DELIVERY" : "SCAN_OUT_TRANSFER",
        stationId,
        stationName,
        parcelId: found.id,
        trackingId: found.data.trackingId ?? trimmed,
        actorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      setRecent((s) =>
        [{ code: trimmed, ok: true, msg: `Scanned OUT • ${nextStatus}`, at: Date.now() }, ...s].slice(0, 8)
      );
      setCode("");
    } catch (err: any) {
      setError(err?.message ?? "Scan failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-extrabold">Outbound • Scan Out</div>
          <div className="text-sm text-neutral-600">
            Dispatch parcels from <span className="font-semibold">{stationName}</span>
          </div>
        </div>
        <Link className="text-sm underline" to="/warehouse">
          Back to Dashboard
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <div className="text-sm font-semibold">Mode</div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={mode === "OUT_FOR_DELIVERY"}
              onChange={() => setMode("OUT_FOR_DELIVERY")}
            />
            Out for delivery
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={mode === "TRANSFER_DISPATCH"}
              onChange={() => setMode("TRANSFER_DISPATCH")}
            />
            Transfer dispatch (inter-station)
          </label>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">
              Tracking ID / Barcode
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
              placeholder="Scan or enter tracking ID"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-black px-5 py-3 text-white font-bold disabled:opacity-60"
          >
            {busy ? "Scanning…" : "Scan Out"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Recent Scans</div>
        <div className="mt-3 space-y-2">
          {recent.length === 0 ? (
            <div className="text-sm text-neutral-600">No scans yet.</div>
          ) : (
            recent.map((s, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-3 text-sm",
                  s.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                )}
              >
                <div className="font-mono">{s.code}</div>
                <div className="text-neutral-700">{s.msg}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
