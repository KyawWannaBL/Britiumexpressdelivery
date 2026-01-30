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
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseconfig";

type UserProfile = { stationId?: string; stationName?: string };

type Parcel = {
  trackingId?: string;
  status?: string;
  returnReason?: string;
  currentStationId?: string;
};

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

export default function Returns() {
  const { user, profile } = useUserProfile();
  const stationId = profile?.stationId ?? "";
  const stationName = profile?.stationName ?? "Station";

  const [code, setCode] = React.useState("");
  const [reason, setReason] = React.useState("Customer not available");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [rows, setRows] = React.useState<Array<{ id: string; data: Parcel }>>([]);

  React.useEffect(() => {
    if (!stationId) return;
    const q = query(
      collection(db, "parcels"),
      where("currentStationId", "==", stationId),
      where("status", "in", ["return_requested", "return_received"]),
      orderBy("trackingId")
    );
    return onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, data: d.data() as Parcel })));
    });
  }, [stationId]);

  const scanReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim();
    if (!trimmed) return;

    if (!user) return setError("Login required.");
    if (!stationId) return setError("Missing stationId.");

    setBusy(true);
    try {
      const found = await findParcelByCode(trimmed);
      if (!found) {
        setError("Parcel not found.");
        return;
      }

      await updateDoc(doc(db, "parcels", found.id), {
        status: "return_received",
        returnReason: reason,
        currentStationId: stationId,
        currentStationName: stationName,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "warehouse_events"), {
        type: "RETURN_RECEIVED",
        stationId,
        stationName,
        parcelId: found.id,
        trackingId: found.data.trackingId ?? trimmed,
        reason,
        actorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      setCode("");
    } catch (err: any) {
      setError(err?.message ?? "Failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-extrabold">Returns</div>
          <div className="text-sm text-neutral-600">
            Receive and manage return parcels.
          </div>
        </div>
        <Link className="text-sm underline" to="/warehouse">
          Back to Dashboard
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={scanReturn} className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-neutral-500 uppercase">Tracking ID</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
              placeholder="Scan return parcel"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-neutral-500 uppercase">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3 bg-white"
            >
              <option>Customer not available</option>
              <option>Address incorrect</option>
              <option>Receiver refused</option>
              <option>Damaged</option>
              <option>Other</option>
            </select>
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-black px-5 py-3 text-white font-bold disabled:opacity-60"
            >
              {busy ? "Saving…" : "Receive Return"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <div className="text-sm font-semibold">Return Parcels</div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr className="text-left">
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-neutral-600">
                    No returns.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3 font-mono">{r.data.trackingId ?? r.id}</td>
                    <td className="px-4 py-3">{r.data.status ?? "-"}</td>
                    <td className="px-4 py-3">{r.data.returnReason ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
