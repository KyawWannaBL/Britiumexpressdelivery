import React from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseconfig";

type UserProfile = { stationId?: string; stationName?: string };

type TransitRoute = {
  fromStationId: string;
  fromStationName: string;
  toStationId: string;
  vehicleNo?: string;
  driverName?: string;
  status: "PLANNED" | "DISPATCHED" | "ARRIVED" | "CANCELLED";
  departureAt?: any;
  arrivedAt?: any;
  createdAt?: any;
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

export default function TransitRoutes() {
  const { user, profile } = useUserProfile();
  const stationId = profile?.stationId ?? "";
  const stationName = profile?.stationName ?? "Station";

  const [rows, setRows] = React.useState<Array<{ id: string; data: TransitRoute }>>([]);
  const [toStationId, setToStationId] = React.useState("");
  const [vehicleNo, setVehicleNo] = React.useState("");
  const [driverName, setDriverName] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!stationId) return;
    const q = query(
      collection(db, "transit_routes"),
      where("fromStationId", "==", stationId),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, data: d.data() as TransitRoute })));
    });
  }, [stationId]);

  const createRoute = async () => {
    if (!user) return alert("Login required.");
    if (!stationId) return alert("Missing stationId.");
    if (!toStationId.trim()) return alert("Destination station is required.");

    setBusy(true);
    try {
      await addDoc(collection(db, "transit_routes"), {
        fromStationId: stationId,
        fromStationName: stationName,
        toStationId: toStationId.trim(),
        vehicleNo: vehicleNo.trim() || undefined,
        driverName: driverName.trim() || undefined,
        status: "PLANNED",
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      } satisfies TransitRoute & any);

      setToStationId("");
      setVehicleNo("");
      setDriverName("");
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (id: string, status: TransitRoute["status"]) => {
    const patch: any = { status, updatedAt: serverTimestamp() };
    if (status === "DISPATCHED") patch.departureAt = serverTimestamp();
    if (status === "ARRIVED") patch.arrivedAt = serverTimestamp();
    await updateDoc(doc(db, "transit_routes", id), patch);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-extrabold">Transfers • Transit Routes</div>
          <div className="text-sm text-neutral-600">
            Create and manage inter-station transfer routes.
          </div>
        </div>
        <Link className="text-sm underline" to="/warehouse">
          Back to Dashboard
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        <div className="text-sm font-semibold">Create Transit Route</div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-neutral-500 uppercase">To Station ID</label>
            <input
              value={toStationId}
              onChange={(e) => setToStationId(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
              placeholder="e.g., STN-002"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase">Vehicle No</label>
            <input
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase">Driver</label>
            <input
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={createRoute}
            disabled={busy}
            className="rounded-xl bg-black px-5 py-3 text-white font-bold disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <div className="text-sm font-semibold">Routes</div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr className="text-left">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-56">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-neutral-600">
                    No routes yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3 font-mono">{r.id}</td>
                    <td className="px-4 py-3 font-mono">{r.data.toStationId}</td>
                    <td className="px-4 py-3">{r.data.vehicleNo ?? "-"}</td>
                    <td className="px-4 py-3">{r.data.driverName ?? "-"}</td>
                    <td className="px-4 py-3">{r.data.status}</td>
                    <td className="px-4 py-3 flex gap-2 flex-wrap">
                      <button
                        className="rounded-md border px-3 py-1 hover:bg-neutral-50"
                        onClick={() => setStatus(r.id, "DISPATCHED")}
                        disabled={r.data.status !== "PLANNED"}
                      >
                        Dispatch
                      </button>
                      <button
                        className="rounded-md border px-3 py-1 hover:bg-neutral-50"
                        onClick={() => setStatus(r.id, "ARRIVED")}
                        disabled={r.data.status !== "DISPATCHED"}
                      >
                        Arrived
                      </button>
                      <button
                        className="rounded-md border px-3 py-1 hover:bg-neutral-50"
                        onClick={() => setStatus(r.id, "CANCELLED")}
                        disabled={r.data.status === "ARRIVED"}
                      >
                        Cancel
                      </button>
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
