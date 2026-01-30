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
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseconfig";

type UserProfile = { stationId?: string; stationName?: string; role?: string };

type Parcel = {
  trackingId?: string;
  status?: string;
  currentStationId?: string;
  sortBin?: string;
  routeCode?: string;
  createdAt?: any;
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

const DEFAULT_BINS = ["A", "B", "C", "D", "E"];
const DEFAULT_ROUTES = ["R1", "R2", "R3", "R4"];

export default function SortingBoard() {
  const { user, profile } = useUserProfile();
  const stationId = profile?.stationId ?? "";
  const stationName = profile?.stationName ?? "Station";

  const [rows, setRows] = React.useState<Array<{ id: string; data: Parcel }>>([]);
  const [loading, setLoading] = React.useState(true);

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const selectedIds = Object.keys(selected).filter((k) => selected[k]);

  const [bin, setBin] = React.useState(DEFAULT_BINS[0]);
  const [routeCode, setRouteCode] = React.useState(DEFAULT_ROUTES[0]);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!stationId) return;

    setLoading(true);
    const q = query(
      collection(db, "parcels"),
      where("currentStationId", "==", stationId),
      where("status", "in", ["inbound_received", "sorting", "sorted"]),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const out = snap.docs.map((d) => ({ id: d.id, data: d.data() as Parcel }));
        setRows(out);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [stationId]);

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const s = search.trim().toLowerCase();
    return (r.data.trackingId ?? r.id).toLowerCase().includes(s);
  });

  const toggleOne = (id: string) => {
    setSelected((m) => ({ ...m, [id]: !m[id] }));
  };

  const toggleAll = (checked: boolean) => {
    const map: Record<string, boolean> = {};
    filtered.forEach((r) => (map[r.id] = checked));
    setSelected(map);
  };

  const applyBulk = async () => {
    if (!user) return alert("Login required.");
    if (!stationId) return alert("Missing stationId.");
    if (selectedIds.length === 0) return alert("Select at least one parcel.");

    const b = writeBatch(db);
    selectedIds.forEach((id) => {
      b.update(doc(db, "parcels", id), {
        status: "sorted",
        sortBin: bin,
        routeCode,
        updatedAt: serverTimestamp(),
      });
    });
    await b.commit();

    // clear selection
    setSelected({});
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-extrabold">Sorting Board</div>
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
          <label className="text-xs font-bold text-neutral-500 uppercase">Bin</label>
          <select
            value={bin}
            onChange={(e) => setBin(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-3 bg-white"
          >
            {DEFAULT_BINS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-neutral-500 uppercase">Route</label>
          <select
            value={routeCode}
            onChange={(e) => setRouteCode(e.target.value)}
            className="mt-1 w-full rounded-xl border px-4 py-3 bg-white"
          >
            {DEFAULT_ROUTES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleAll(true)}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Select filtered
          </button>
          <button
            onClick={() => toggleAll(false)}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Clear selection
          </button>
          <button
            onClick={applyBulk}
            className={cn(
              "rounded-xl bg-black px-4 py-2 text-sm font-bold text-white",
              selectedIds.length === 0 && "opacity-60 cursor-not-allowed"
            )}
            disabled={selectedIds.length === 0}
          >
            Apply bin/route to {selectedIds.length} parcel(s)
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-sm font-semibold">Parcels</div>
          <div className="text-xs text-neutral-500">
            {loading ? "Loading…" : `${filtered.length} shown / ${rows.length} total`}
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr className="text-left">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => toggleAll(e.target.checked)}
                    checked={filtered.length > 0 && filtered.every((r) => selected[r.id])}
                    aria-label="Select all filtered"
                  />
                </th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bin</th>
                <th className="px-4 py-3">Route</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-neutral-600" colSpan={5}>
                    No parcels match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!selected[r.id]}
                        onChange={() => toggleOne(r.id)}
                        aria-label={`Select ${r.data.trackingId ?? r.id}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono">{r.data.trackingId ?? r.id}</td>
                    <td className="px-4 py-3">{r.data.status ?? "-"}</td>
                    <td className="px-4 py-3">{r.data.sortBin ?? "-"}</td>
                    <td className="px-4 py-3">{r.data.routeCode ?? "-"}</td>
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
