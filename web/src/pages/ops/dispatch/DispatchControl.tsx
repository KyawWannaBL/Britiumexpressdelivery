import React from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../../../firebaseconfig";
import { useAuthProfile, requireStation } from "../../../shared/useAuthProfile";

type Delivery = {
  stationId: string;
  status: "pending" | "active" | "completed" | "failed" | "returned" | string;
  driverName?: string;
  driverUid?: string;
  parcelIds?: string[];
  createdAt?: any;
};

function Column({ title, items }: { title: string; items: Array<{ id: string; data: Delivery }> }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b font-semibold text-sm flex justify-between">
        <span>{title}</span>
        <span className="text-xs text-neutral-500">{items.length}</span>
      </div>
      <div className="p-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-neutral-600">No items.</div>
        ) : (
          items.map((d) => (
            <div key={d.id} className="rounded-lg border p-3">
              <div className="font-mono text-xs">{d.id}</div>
              <div className="text-sm font-semibold mt-1">{d.data.driverName ?? d.data.driverUid ?? "-"}</div>
              <div className="text-xs text-neutral-600 mt-1">
                Parcels: {d.data.parcelIds?.length ?? 0}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function DispatchControl() {
  const { user, profile, loading } = useAuthProfile();
  const [rows, setRows] = React.useState<Array<{ id: string; data: Delivery }>>([]);

  React.useEffect(() => {
    if (!user || !profile) return;
    let stationId = "";
    try { stationId = requireStation(profile); } catch { return; }

    const q = query(
      collection(db, "deliveries"),
      where("stationId", "==", stationId),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => setRows(snap.docs.map((d) => ({ id: d.id, data: d.data() as Delivery }))));
  }, [user, profile]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">Please login.</div>;

  const pending = rows.filter((x) => x.data.status === "pending");
  const active = rows.filter((x) => x.data.status === "active");
  const failed = rows.filter((x) => x.data.status === "failed");
  const returned = rows.filter((x) => x.data.status === "returned");
  const completed = rows.filter((x) => x.data.status === "completed");

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="text-2xl font-extrabold">Dispatch Control</div>
        <div className="text-sm text-neutral-600">Live dispatch board by job status.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Column title="Pending" items={pending} />
        <Column title="Active" items={active} />
        <Column title="Failed" items={failed} />
        <Column title="Returned" items={returned} />
        <Column title="Completed" items={completed} />
      </div>
    </div>
  );
}
