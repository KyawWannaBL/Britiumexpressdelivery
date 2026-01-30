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
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseconfig";

type UserProfile = { stationId?: string; stationName?: string };

type Parcel = {
  trackingId?: string;
  status?: string;
  currentStationId?: string;
  sortBin?: string;
  routeCode?: string;
  manifestId?: string;
};

type Manifest = {
  type: "DELIVERY" | "TRANSFER";
  stationId: string;
  stationName: string;
  destinationStationId?: string;
  vehicleNo?: string;
  driverName?: string;
  routeCode?: string;
  status: "OPEN" | "FINALIZED" | "DISPATCHED";
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

export default function LoadManifest() {
  const { user, profile } = useUserProfile();
  const stationId = profile?.stationId ?? "";
  const stationName = profile?.stationName ?? "Station";

  const [parcels, setParcels] = React.useState<Array<{ id: string; data: Parcel }>>([]);
  const [manifests, setManifests] = React.useState<Array<{ id: string; data: Manifest }>>([]);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  // Create manifest form
  const [type, setType] = React.useState<Manifest["type"]>("DELIVERY");
  const [routeCode, setRouteCode] = React.useState("");
  const [destinationStationId, setDestinationStationId] = React.useState("");
  const [vehicleNo, setVehicleNo] = React.useState("");
  const [driverName, setDriverName] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);

  React.useEffect(() => {
    if (!stationId) return;

    const qParcels = query(
      collection(db, "parcels"),
      where("currentStationId", "==", stationId),
      where("status", "==", "sorted"),
      orderBy("trackingId")
    );

    const unsubParcels = onSnapshot(qParcels, (snap) => {
      setParcels(snap.docs.map((d) => ({ id: d.id, data: d.data() as Parcel })));
    });

    const qMan = query(
      collection(db, "manifests"),
      where("stationId", "==", stationId),
      orderBy("createdAt", "desc")
    );

    const unsubMan = onSnapshot(qMan, (snap) => {
      setManifests(snap.docs.map((d) => ({ id: d.id, data: d.data() as Manifest })));
    });

    return () => {
      unsubParcels();
      unsubMan();
    };
  }, [stationId]);

  const toggle = (id: string) => setSelected((m) => ({ ...m, [id]: !m[id] }));
  const clear = () => setSelected({});

  const createManifest = async () => {
    if (!user) return alert("Login required.");
    if (!stationId) return alert("Missing stationId in user profile.");
    if (selectedIds.length === 0) return alert("Select parcels to load.");
    if (type === "DELIVERY" && !routeCode.trim()) return alert("Route code is required for delivery manifest.");
    if (type === "TRANSFER" && !destinationStationId.trim()) return alert("Destination station is required for transfer manifest.");

    setBusy(true);
    try {
      const manifestDoc = await addDoc(collection(db, "manifests"), {
        type,
        stationId,
        stationName,
        destinationStationId: type === "TRANSFER" ? destinationStationId.trim() : undefined,
        vehicleNo: vehicleNo.trim() || undefined,
        driverName: driverName.trim() || undefined,
        routeCode: type === "DELIVERY" ? routeCode.trim() : undefined,
        status: "OPEN",
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      } satisfies Manifest & any);

      const b = writeBatch(db);
      selectedIds.forEach((pid) => {
        b.update(doc(db, "parcels", pid), {
          manifestId: manifestDoc.id,
          status: "manifested",
          updatedAt: serverTimestamp(),
        });
      });
      await b.commit();

      clear();
      setRouteCode("");
      setDestinationStationId("");
      setVehicleNo("");
      setDriverName("");
      alert(`Manifest created: ${manifestDoc.id}`);
    } finally {
      setBusy(false);
    }
  };

  const finalizeManifest = async (id: string) => {
    if (!confirm("Finalize this manifest?")) return;
    await updateDoc(doc(db, "manifests", id), {
      status: "FINALIZED",
      finalizedAt: serverTimestamp(),
    });
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-extrabold">Loading • Manifests</div>
          <div className="text-sm text-neutral-600">
            Create manifests by selecting <span className="font-semibold">sorted</span> parcels.
          </div>
        </div>
        <Link className="text-sm underline" to="/warehouse">
          Back to Dashboard
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        <div className="text-sm font-semibold">Create Manifest</div>

        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Manifest["type"])}
              className="mt-1 w-full rounded-xl border px-4 py-3 bg-white"
            >
              <option value="DELIVERY">Delivery</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>

          {type === "DELIVERY" ? (
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase">Route Code</label>
              <input
                value={routeCode}
                onChange={(e) => setRouteCode(e.target.value)}
                className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                placeholder="e.g., R1"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase">Destination Station</label>
              <input
                value={destinationStationId}
                onChange={(e) => setDestinationStationId(e.target.value)}
                className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                placeholder="e.g., STN-002"
              />
            </div>
          )}

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
            <label className="text-xs font-bold text-neutral-500 uppercase">Driver Name</label>
            <input
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Selected: <span className="font-semibold">{selectedIds.length}</span>
          </div>
          <button
            onClick={createManifest}
            disabled={busy || selectedIds.length === 0}
            className={cn(
              "rounded-xl bg-black px-5 py-3 text-white font-bold",
              (busy || selectedIds.length === 0) && "opacity-60"
            )}
          >
            {busy ? "Creating…" : "Create Manifest"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold">Sorted Parcels (ready to load)</div>
          <button onClick={clear} className="text-sm underline">
            Clear selection
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr className="text-left">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Bin</th>
                <th className="px-4 py-3">Route</th>
              </tr>
            </thead>
            <tbody>
              {parcels.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-neutral-600">
                    No sorted parcels found for this station.
                  </td>
                </tr>
              ) : (
                parcels.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!selected[p.id]}
                        onChange={() => toggle(p.id)}
                        aria-label={`Select ${p.data.trackingId ?? p.id}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono">{p.data.trackingId ?? p.id}</td>
                    <td className="px-4 py-3">{p.data.sortBin ?? "-"}</td>
                    <td className="px-4 py-3">{p.data.routeCode ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <div className="text-sm font-semibold">Manifests</div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr className="text-left">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Route / Destination</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {manifests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-neutral-600">
                    No manifests yet.
                  </td>
                </tr>
              ) : (
                manifests.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-3 font-mono">{m.id}</td>
                    <td className="px-4 py-3">{m.data.type}</td>
                    <td className="px-4 py-3">
                      {m.data.type === "DELIVERY" ? m.data.routeCode ?? "-" : m.data.destinationStationId ?? "-"}
                    </td>
                    <td className="px-4 py-3">{m.data.status}</td>
                    <td className="px-4 py-3">
                      <button
                        className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-50"
                        onClick={() => finalizeManifest(m.id)}
                        disabled={m.data.status !== "OPEN"}
                      >
                        Finalize
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
