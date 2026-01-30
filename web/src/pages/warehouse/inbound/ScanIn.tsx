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
  | "created"
  | "inbound_received"
  | "sorting"
  | "sorted"
  | "manifested"
  | "out_for_delivery"
  | "delivered"
  | "return_requested"
  | "return_received"
  | "transfer_dispatched"
  | "transfer_arrived"
  | "cancelled";

type Parcel = {
  trackingId?: string;
  status?: ParcelStatus;
  currentStationId?: string;
  currentStationName?: string;
  sortBin?: string;
  manifestId?: string;
  updatedAt?: any;
};

type UserProfile = {
  stationId?: string;
  stationName?: string;
  role?: string;
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
  // 1) Try doc id match
  const direct = await getDoc(doc(db, "parcels", code));
  if (direct.exists()) return { id: direct.id, data: direct.data() as Parcel };

  // 2) Try trackingId field
  const q = query(collection(db, "parcels"), where("trackingId", "==", code), limit(1));
  const res = await getDocs(q);
  const d = res.docs[0];
  if (!d) return null;
  return { id: d.id, data: d.data() as Parcel };
}

async function logWarehouseEvent(input: {
  stationId: string;
  stationName: string;
  parcelId: string;
  trackingId: string;
  type: "SCAN_IN";
  actorUid: string;
}) {
  await addDoc(collection(db, "warehouse_events"), {
    type: input.type,
    stationId: input.stationId,
    stationName: input.stationName,
    parcelId: input.parcelId,
    trackingId: input.trackingId,
    actorUid: input.actorUid,
    createdAt: serverTimestamp(),
  });
}

export default function ScanIn() {
  const { user, profile } = useUserProfile();
  const stationId = profile?.stationId ?? "";
  const stationName = profile?.stationName ?? "Station";

  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastScans, setLastScans] = React.useState<
    Array<{ code: string; ok: boolean; message: string; at: number }>
  >([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim();
    if (!trimmed) return;

    if (!user) {
      setError("Please login first.");
      return;
    }
    if (!stationId) {
      setError("Your profile has no stationId (users/{uid}.stationId).");
      return;
    }

    setBusy(true);
    try {
      const found = await findParcelByCode(trimmed);
      if (!found) {
        setLastScans((s) => [{ code: trimmed, ok: false, message: "Parcel not found", at: Date.now() }, ...s].slice(0, 8));
        setCode("");
        return;
      }

      const next: Partial<Parcel> = {
        status: "inbound_received",
        currentStationId: stationId,
        currentStationName: stationName,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "parcels", found.id), next);

      const trackingId = found.data.trackingId ?? trimmed;
      await logWarehouseEvent({
        stationId,
        stationName,
        parcelId: found.id,
        trackingId,
        type: "SCAN_IN",
        actorUid: user.uid,
      });

      setLastScans((s) =>
        [{ code: trimmed, ok: true, message: `Scanned IN • ${found.id}`, at: Date.now() }, ...s].slice(0, 8)
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
          <div className="text-2xl font-extrabold">Inbound • Scan In</div>
          <div className="text-sm text-neutral-600">
            Receive parcels into <span className="font-semibold">{stationName}</span>
          </div>
        </div>
        <Link className="text-sm underline" to="/warehouse">
          Back to Dashboard
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        {error ? (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">
              Tracking ID / Barcode
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={cn(
                "mt-1 w-full rounded-xl border px-4 py-3 outline-none",
                "focus:ring-2 focus:ring-black/20"
              )}
              placeholder="Scan or enter tracking ID"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-black px-5 py-3 text-white font-bold disabled:opacity-60"
          >
            {busy ? "Scanning…" : "Scan In"}
          </button>
        </form>

        <div className="mt-4 text-xs text-neutral-500">
          Tip: If your parcels use docId = trackingId, Scan In is instant. Otherwise it searches by <code>trackingId</code> field.
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Recent Scans</div>
        <div className="mt-3 space-y-2">
          {lastScans.length === 0 ? (
            <div className="text-sm text-neutral-600">No scans yet.</div>
          ) : (
            lastScans.map((s, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-3 text-sm",
                  s.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                )}
              >
                <div className="font-mono">{s.code}</div>
                <div className="text-neutral-700">{s.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
