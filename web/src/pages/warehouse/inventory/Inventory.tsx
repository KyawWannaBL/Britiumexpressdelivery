import React from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseconfig";

type UserProfile = { stationId?: string; stationName?: string };

type Parcel = {
  trackingId?: string;
  status?: string;
  sortBin?: string;
  routeCode?: string;
  manifestId?: string;
  updatedAt?: any;
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

function toCsv(rows: Array<{ id: string; data: Parcel }>) {
  const header = ["trackingId", "status", "sortBin", "routeCode", "manifestId", "docId"];
  const lines = rows.map((r) => [
    r.data.trackingId ?? "",
    r.data.status ?? "",
    r.data.sortBin ?? "",
    r.data.routeCode ?? "",
    r.data.manifestId ?? "",
    r.id,
  ]);
  const csv = [header, ...lines]
    .map((cols) => cols.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  return csv;
}

export default function Inventory() {
  const { user, profile } = useUserProfile();
  const stationId = profile?.stationId ?? "";
  const stationName = profile?.stationName ?? "Station";

  const [rows, setRows] = React.useState<Array<{ id: string; data: Parcel }>>([]);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("ALL");

  React.useEffect(() => {
    if (!stationId) return;

    const q = query(
      collection(db, "parcels"),
      where("currentStationId", "==", stationId),
      orderBy("trackingId")
    );

    return onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, data: d.data() as Parcel })));
    });
  }, [stationId]);

  const filtered = rows.filter((r) => {
    const t = (r.data.trackingId ?? r.id).toLowerCase();
    const okSearch = !search.trim() || t.includes(search.trim().toLowerCase());
    const okStatus = status === "ALL" || (r.data.status ?? "") === status;
    return okSearch && okStatus;
  });

  const exportCsv = () => {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${stationId}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-extrabold">Inventory</div>
          <div className="text-sm text-neutral-600">
            Station: <span className="font-semibold">{stationName}</span>
          </div>
        </div>
        <Link className="text-sm underline" to="/warehouse">
          Back to Dashboard
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm grid gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-neutral-500 uppercase">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
            placeholder="Tracking ID"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-neutral-500 uppercase">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-3 bg-white"
          >
            <option value="ALL">All</option>
            <option value="inbound_received">Inbound received</option>
            <option value="sorted">Sorted</option>
            <option value="manifested">Manifested</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="return_received">Return received</option>
            <option value="transfer_dispatched">Transfer dispatched</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={exportCsv}
            className="w-full rounded-xl bg-black px-5 py-3 text-white font-bold"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold">Parcels</div>
          <div className="text-xs text-neutral-500">{filtered.length} shown / {rows.length} total</div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr className="text-left">
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bin</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Manifest</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-neutral-600">
                    No parcels match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3 font-mono">{r.data.trackingId ?? r.id}</td>
                    <td className="px-4 py-3">{r.data.status ?? "-"}</td>
                    <td className="px-4 py-3">{r.data.sortBin ?? "-"}</td>
                    <td className="px-4 py-3">{r.data.routeCode ?? "-"}</td>
                    <td className="px-4 py-3 font-mono">{r.data.manifestId ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!user ? (
        <div className="text-xs text-neutral-500">
          You are not logged in. Inventory might not load without auth.
        </div>
      ) : null}
    </div>
  );
}
