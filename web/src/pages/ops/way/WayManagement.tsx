import React from "react";
import { collection, onSnapshot, orderBy, query, where, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseconfig";
import { useAuthProfile, requireStation } from "../../../shared/useAuthProfile";

type Parcel = {
  trackingId?: string;
  status?: string;
  currentStationId?: string;
  sortBin?: string;
  routeCode?: string;
  updatedAt?: any;
};

const STATUS_BUCKETS = [
  { key: "inbound_received", label: "Inbound" },
  { key: "sorted", label: "Sorted" },
  { key: "manifested", label: "Manifested" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "return_received", label: "Returns" },
  { key: "transfer_dispatched", label: "Transfers" },
];

export default function WayManagement() {
  const { user, profile, loading } = useAuthProfile();
  const [rows, setRows] = React.useState<Array<{ id: string; data: Parcel }>>([]);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!user || !profile) return;
    let stationId = "";
    try { stationId = requireStation(profile); } catch { return; }

    const q = query(collection(db, "parcels"), where("currentStationId", "==", stationId), orderBy("trackingId"));
    return onSnapshot(q, (snap) => setRows(snap.docs.map((d) => ({ id: d.id, data: d.data() as Parcel }))));
  }, [user, profile]);

  const filtered = rows.filter((r) => {
    const t = (r.data.trackingId ?? r.id).toLowerCase();
    return !search.trim() || t.includes(search.trim().toLowerCase());
  });

  const moveTo = async (id: string, status: string) => {
    await updateDoc(doc(db, "parcels", id), { status, updatedAt: serverTimestamp() });
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">Please login.</div>;

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="text-2xl font-extrabold">Way Management</div>
        <div className="text-sm text-neutral-600">Operational control of parcel states (station scope).</div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <label className="text-xs font-bold uppercase text-neutral-500">Search tracking</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
          placeholder="Tracking ID"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {STATUS_BUCKETS.map((b) => {
          const items = filtered.filter((x) => (x.data.status ?? "") === b.key);
          return (
            <div key={b.key} className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b flex justify-between">
                <span className="font-semibold text-sm">{b.label}</span>
                <span className="text-xs text-neutral-500">{items.length}</span>
              </div>
              <div className="p-3 space-y-2">
                {items.length === 0 ? (
                  <div className="text-sm text-neutral-600">No parcels.</div>
                ) : (
                  items.map((p) => (
                    <div key={p.id} className="rounded-lg border p-3">
                      <div className="font-mono text-sm">{p.data.trackingId ?? p.id}</div>
                      <div className="text-xs text-neutral-600 mt-1">
                        Bin: {p.data.sortBin ?? "-"} • Route: {p.data.routeCode ?? "-"}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button className="rounded-md border px-3 py-1 text-xs hover:bg-neutral-50" onClick={() => moveTo(p.id, "sorted")}>
                          → Sorted
                        </button>
                        <button className="rounded-md border px-3 py-1 text-xs hover:bg-neutral-50" onClick={() => moveTo(p.id, "manifested")}>
                          → Manifested
                        </button>
                        <button className="rounded-md border px-3 py-1 text-xs hover:bg-neutral-50" onClick={() => moveTo(p.id, "out_for_delivery")}>
                          → Out
                        </button>
                        <button className="rounded-md border px-3 py-1 text-xs hover:bg-neutral-50" onClick={() => moveTo(p.id, "return_received")}>
                          → Return
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-neutral-500">
        For strict control, hide the “move buttons” for roles below Supervisor and enforce server-side rules in Firestore security rules.
      </div>
    </div>
  );
}
