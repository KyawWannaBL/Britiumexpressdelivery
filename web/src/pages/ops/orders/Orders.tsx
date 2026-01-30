import React from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../../../firebaseconfig";
import { useAuthProfile, requireStation } from "../../../shared/useAuthProfile";

type Order = {
  orderNo?: string;
  merchantId?: string;
  status?: string; // created/paid/packed/in_transit/delivered/cancelled etc.
  stationId?: string;
  createdAt?: any;
};

export default function Orders() {
  const { user, profile, loading } = useAuthProfile();
  const [rows, setRows] = React.useState<Array<{ id: string; data: Order }>>([]);
  const [status, setStatus] = React.useState("ALL");

  React.useEffect(() => {
    if (!user || !profile) return;
    let stationId = "";
    try { stationId = requireStation(profile); } catch { return; }

    const q = query(collection(db, "orders"), where("stationId", "==", stationId), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => setRows(snap.docs.map((d) => ({ id: d.id, data: d.data() as Order }))));
  }, [user, profile]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">Please login.</div>;

  const filtered = rows.filter((r) => status === "ALL" || (r.data.status ?? "") === status);

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="text-2xl font-extrabold">Orders</div>
        <div className="text-sm text-neutral-600">Shipment orders pipeline (station scope).</div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          Station: <span className="font-mono">{profile?.stationId ?? "N/A"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold uppercase text-neutral-500">Status</div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border px-3 py-2 bg-white text-sm">
            <option value="ALL">All</option>
            <option value="created">Created</option>
            <option value="in_transit">In transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b text-sm font-semibold">Order List</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr className="text-left">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Merchant</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-6 text-neutral-600">No orders.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3 font-mono">{r.data.orderNo ?? r.id}</td>
                    <td className="px-4 py-3 font-mono">{r.data.merchantId ?? "-"}</td>
                    <td className="px-4 py-3">{r.data.status ?? "-"}</td>
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
