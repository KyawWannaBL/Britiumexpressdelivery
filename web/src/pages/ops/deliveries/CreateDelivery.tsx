import React from "react";
import { Link, useNavigate } from "react-router-dom";
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
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../firebaseconfig";
import { useAuthProfile, requireStation } from "../../../shared/useAuthProfile";

type Parcel = {
  trackingId?: string;
  status?: string;
  currentStationId?: string;
  receiverName?: string;
  deliveryAddress?: string;
};

type DriverProfile = {
  displayName?: string;
  phone?: string;
  stationId?: string;
  role?: string;
  active?: boolean;
};

async function findParcel(code: string): Promise<{ id: string; data: Parcel } | null> {
  const direct = await getDoc(doc(db, "parcels", code));
  if (direct.exists()) return { id: direct.id, data: direct.data() as Parcel };

  const q = query(collection(db, "parcels"), where("trackingId", "==", code), limit(1));
  const res = await getDocs(q);
  const d = res.docs[0];
  return d ? { id: d.id, data: d.data() as Parcel } : null;
}

export default function CreateDelivery() {
  const { user, profile, loading } = useAuthProfile();
  const navigate = useNavigate();

  const [code, setCode] = React.useState("");
  const [parcels, setParcels] = React.useState<Array<{ id: string; data: Parcel }>>([]);
  const [drivers, setDrivers] = React.useState<Array<{ uid: string; data: DriverProfile }>>([]);
  const [driverUid, setDriverUid] = React.useState<string>("");

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      if (!user || !profile?.stationId) return;
      const stationId = profile.stationId;

      const q = query(
        collection(db, "users"),
        where("stationId", "==", stationId),
        where("role", "==", "rider_driver")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ uid: d.id, data: d.data() as DriverProfile }));
      setDrivers(list.filter((x) => x.data.active !== false));
      if (!driverUid && list.length > 0) setDriverUid(list[0].uid);
    })();
  }, [user, profile?.stationId]);

  const addParcel = async () => {
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) return;

    if (!user) return setError("Login required.");
    if (!profile?.stationId) return setError("Missing stationId in profile.");

    setBusy(true);
    try {
      const found = await findParcel(trimmed);
      if (!found) return setError("Parcel not found.");

      if (found.data.currentStationId && found.data.currentStationId !== profile.stationId) {
        return setError(`Parcel is at station ${found.data.currentStationId}, not ${profile.stationId}.`);
      }

      // must be ready to dispatch (sorted/manifested). adjust if your flow differs.
      if (!["sorted", "manifested"].includes(found.data.status ?? "")) {
        return setError(`Parcel status must be "sorted" or "manifested". Current: ${found.data.status ?? "unknown"}`);
      }

      const tracking = found.data.trackingId ?? found.id;
      if (parcels.some((p) => (p.data.trackingId ?? p.id) === tracking)) return;

      setParcels((p) => [found, ...p]);
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const removeParcel = (id: string) => setParcels((p) => p.filter((x) => x.id !== id));

  const createDelivery = async () => {
    setError(null);
    if (!user) return setError("Login required.");

    let stationId = "";
    try {
      stationId = requireStation(profile);
    } catch (e: any) {
      return setError(e?.message ?? "Missing stationId.");
    }

    if (!driverUid) return setError("Select a driver.");
    if (parcels.length === 0) return setError("Add at least 1 parcel.");

    setBusy(true);
    try {
      const driver = drivers.find((d) => d.uid === driverUid);
      const deliveryRef = await addDoc(collection(db, "deliveries"), {
        stationId,
        status: "pending", // pending -> active -> completed/failed
        driverUid,
        driverName: driver?.data.displayName ?? "",
        parcelIds: parcels.map((p) => p.id),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
      });

      // Update parcels with deliveryId and status out_for_delivery
      const b = writeBatch(db);
      parcels.forEach((p) => {
        b.update(doc(db, "parcels", p.id), {
          status: "out_for_delivery",
          deliveryId: deliveryRef.id,
          updatedAt: serverTimestamp(),
        });
      });
      await b.commit();

      navigate(`/ops/deliveries?highlight=${deliveryRef.id}`);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create delivery.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-extrabold">Create Delivery</div>
          <div className="text-sm text-neutral-600">Assign parcels to driver and dispatch.</div>
        </div>
        <Link className="text-sm underline" to="/ops/deliveries">
          Back to Deliveries
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-xl border bg-white p-4 shadow-sm grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-neutral-500 uppercase">Parcel tracking ID</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
            placeholder="Scan or enter tracking"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={addParcel}
            disabled={busy}
            className="w-full rounded-xl border px-4 py-3 font-bold hover:bg-neutral-50 disabled:opacity-60"
          >
            Add parcel
          </button>
        </div>

        <div className="md:col-span-3">
          <label className="text-xs font-bold text-neutral-500 uppercase">Driver</label>
          <select
            value={driverUid}
            onChange={(e) => setDriverUid(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-3 bg-white"
          >
            <option value="">Select driver</option>
            {drivers.map((d) => (
              <option key={d.uid} value={d.uid}>
                {d.data.displayName ?? d.uid} {d.data.phone ? `(${d.data.phone})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Parcels selected: <span className="font-semibold">{parcels.length}</span>
          </div>
          <button
            onClick={createDelivery}
            disabled={busy || parcels.length === 0 || !driverUid}
            className="rounded-xl bg-black px-5 py-3 text-white font-bold disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create Delivery"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b text-sm font-semibold">Selected Parcels</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr className="text-left">
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Receiver</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {parcels.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-neutral-600">No parcels added.</td></tr>
              ) : (
                parcels.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3 font-mono">{p.data.trackingId ?? p.id}</td>
                    <td className="px-4 py-3">{p.data.receiverName ?? "-"}</td>
                    <td className="px-4 py-3">{p.data.deliveryAddress ?? "-"}</td>
                    <td className="px-4 py-3">
                      <button className="text-sm underline" onClick={() => removeParcel(p.id)}>Remove</button>
                    </td>
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
