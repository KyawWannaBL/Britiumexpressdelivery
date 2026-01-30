import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { collection, onSnapshot, orderBy, query, updateDoc, doc, where, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseconfig";
import { useAuthProfile, requireStation } from "../../../shared/useAuthProfile";

type Delivery = {
  stationId: string;
  status: "pending" | "active" | "completed" | "failed" | "returned" | string;
  driverUid?: string;
  driverName?: string;
  parcelIds?: string[];
  createdAt?: any;
};

export default function Deliveries() {
  const { user, profile, loading } = useAuthProfile();
  const [params] = useSearchParams();
  const highlight = params.get("highlight");

  const [rows, setRows] = React.useState<Array<{ id: string; data: Delivery }>>([]);
  const [status, setStatus] = React.useState<string>("ALL");

  React.useEffect(() => {
    if (!user || !profile) return;
    let stationId = "";
    try { stationId = requireStation(profile); } catch { return; }

    const q = query(
      collection(db, "deliveries"),
      where("stationId", "==", stationId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, data: d.data() as Delivery }));
      setRows(list);
    });
  }, [user, profile]);

  const filtered = rows.filter((r) => status === "ALL" || r.data.status === status);

  const setDeliveryStatus = async (id: string, next: Delivery["status"]) => {
    await updateDoc(doc(db, "deliveries", id), {
      status: next,
      updatedAt: serverTimestamp(),
    });
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">Please login.</div>;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-extrabold">Deliveries</div>
          <div className="text-sm text-neutral-600">Create, monitor, and update delivery jobs.</div>
        </div>
        <Link className="rounded-xl bg-black px-4 py-2 text-white font-bold" to="/ops/deliveries/create">
          + Create Delivery
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-neutral-600">
          Station: <span className="font-mono">{profile?.stationId ?? "N/A"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold uppercase text-neutral-500">Filter</div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border px-3 py-2 bg-white text-sm">
            <option value="ALL">All</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b text-sm font-semibold">Delivery List</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr className="text-left">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Parcels</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-72">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-neutral-600">No deliveries.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className={`border-t ${highlight === r.id ? "bg-yellow-50" : ""}`}>
                    <td className="px-4 py-3 font-mono">{r.id}</td>
                    <td className="px-4 py-3">{r.data.driverName ?? r.data.driverUid ?? "-"}</td>
                    <td className="px-4 py-3">{r.data.parcelIds?.length ?? 0}</td>
                    <td className="px-4 py-3">{r.data.status}</td>
                    <td className="px-4 py-3 flex gap-2 flex-wrap">
                      <button className="rounded-md border px-3 py-1 hover:bg-neutral-50" onClick={() => setDeliveryStatus(r.id, "active")} disabled={r.data.status !== "pending"}>
                        Start
                      </button>
                      <button className="rounded-md border px-3 py-1 hover:bg-neutral-50" onClick={() => setDeliveryStatus(r.id, "completed")} disabled={r.data.status !== "active"}>
                        Complete
                      </button>
                      <button className="rounded-md border px-3 py-1 hover:bg-neutral-50" onClick={() => setDeliveryStatus(r.id, "failed")} disabled={r.data.status === "completed"}>
                        Fail
                      </button>
                      <button className="rounded-md border px-3 py-1 hover:bg-neutral-50" onClick={() => setDeliveryStatus(r.id, "returned")} disabled={r.data.status === "completed"}>
                        Return
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-neutral-500">
        Note: If Firestore requires composite indexes for stationId + createdAt ordering, Firebase console will show the index link.
      </div>
    </div>
  );
}
