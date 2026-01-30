import React from "react";
import { collection, onSnapshot, query, where, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseconfig";
import { useAuthProfile, requireStation } from "../../../shared/useAuthProfile";

type Driver = {
  displayName?: string;
  phone?: string;
  stationId?: string;
  role?: string;
  active?: boolean;
  lastSeenAt?: any;
};

export default function Drivers() {
  const { user, profile, loading } = useAuthProfile();
  const [rows, setRows] = React.useState<Array<{ uid: string; data: Driver }>>([]);

  React.useEffect(() => {
    if (!user || !profile) return;
    let stationId = "";
    try { stationId = requireStation(profile); } catch { return; }

    const q = query(collection(db, "users"), where("stationId", "==", stationId), where("role", "==", "rider_driver"));
    return onSnapshot(q, (snap) => setRows(snap.docs.map((d) => ({ uid: d.id, data: d.data() as Driver }))));
  }, [user, profile]);

  const toggleActive = async (uid: string, active: boolean) => {
    await updateDoc(doc(db, "users", uid), { active, updatedAt: serverTimestamp() });
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">Please login.</div>;

  return (
    <div className="p-6 space-y-5">
      <div>
        <div className="text-2xl font-extrabold">Drivers</div>
        <div className="text-sm text-neutral-600">Manage driver roster for this station.</div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b text-sm font-semibold">Driver List</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr className="text-left">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 w-40">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-neutral-600">No drivers.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.uid} className="border-t">
                    <td className="px-4 py-3 font-semibold">{r.data.displayName ?? r.uid}</td>
                    <td className="px-4 py-3 font-mono">{r.data.phone ?? "-"}</td>
                    <td className="px-4 py-3">{r.data.active === false ? "No" : "Yes"}</td>
                    <td className="px-4 py-3">
                      <button
                        className="rounded-md border px-3 py-1 hover:bg-neutral-50"
                        onClick={() => toggleActive(r.uid, r.data.active === false)}
                      >
                        {r.data.active === false ? "Activate" : "Deactivate"}
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
        If you need “warehouse helpers” here too, create users with role = <code>warehouse</code> and manage them in warehouse module or admin users.
      </div>
    </div>
  );
}
