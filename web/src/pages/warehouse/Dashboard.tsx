import React from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebaseconfig";

type Role =
  | "super_admin"
  | "manager"
  | "sub_station_manager"
  | "supervisor"
  | "warehouse"
  | "rider_driver"
  | "merchant"
  | "vendor"
  | "customer"
  | "accountant"
  | string;

type ParcelStatus =
  | "created"
  | "inbound_received"
  | "sorting"
  | "sorted"
  | "manifested"
  | "out_for_delivery"
  | "delivered"
  | "return_requested"
  | "return_received"
  | "transfer_dispatched"
  | "transfer_arrived"
  | "cancelled";

type UserProfile = {
  role?: Role;
  stationId?: string;
  stationName?: string;
  branchId?: string;
  displayName?: string;
};

function cn(...p: Array<string | false | null | undefined>) {
  return p.filter(Boolean).join(" ");
}

function StatCard({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value: number | null;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-extrabold">
        {loading ? "…" : value ?? 0}
      </div>
      {sub ? <div className="mt-1 text-sm text-neutral-600">{sub}</div> : null}
    </div>
  );
}

function QuickLink({
  to,
  title,
  desc,
}: {
  to: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-xl border bg-white p-4 shadow-sm transition",
        "hover:shadow-md hover:border-neutral-300",
        "focus:outline-none focus:ring-2 focus:ring-black/20"
      )}
    >
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-neutral-600">{desc}</div>
    </Link>
  );
}

function useUserProfile() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(null);
      if (!u) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        setProfile((snap.data() as UserProfile) ?? null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return { user, profile, loading };
}

async function countParcels(stationId: string, status?: ParcelStatus) {
  const base = query(collection(db, "parcels"), where("currentStationId", "==", stationId));
  const q = status ? query(collection(db, "parcels"), where("currentStationId", "==", stationId), where("status", "==", status)) : base;
  const res = await getCountFromServer(q);
  return res.data().count;
}

export default function WarehouseDashboard() {
  const { user, profile, loading: profileLoading } = useUserProfile();
  const stationId = profile?.stationId ?? "";
  const stationName = profile?.stationName ?? "Warehouse";

  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    inbound: 0,
    sorted: 0,
    manifested: 0,
    outForDelivery: 0,
    returns: 0,
    transfers: 0,
  });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!stationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [
          inbound,
          sorted,
          manifested,
          outForDelivery,
          returns,
          transfers,
        ] = await Promise.all([
          countParcels(stationId, "inbound_received"),
          countParcels(stationId, "sorted"),
          countParcels(stationId, "manifested"),
          countParcels(stationId, "out_for_delivery"),
          countParcels(stationId, "return_received"),
          countParcels(stationId, "transfer_dispatched"),
        ]);
        if (!alive) return;
        setStats({ inbound, sorted, manifested, outForDelivery, returns, transfers });
      } catch {
        // ignore, show zeros
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [stationId]);

  if (profileLoading) {
    return <div className="p-6">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-6">
          <div className="text-lg font-semibold">Please sign in</div>
          <div className="mt-1 text-sm text-neutral-600">
            You must be logged in to access warehouse operations.
          </div>
          <Link className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-white" to="/login">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!stationId) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-6">
          <div className="text-lg font-semibold">Station not configured</div>
          <div className="mt-1 text-sm text-neutral-600">
            Your user profile is missing <code>stationId</code>. Add it in Firestore under{" "}
            <code>users/{user.uid}</code>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-extrabold">{stationName} • Warehouse</div>
        <div className="text-sm text-neutral-600">
          Station: <span className="font-mono">{stationId}</span> • Role:{" "}
          <span className="font-semibold">{profile?.role ?? "unknown"}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Inbound (Received)" value={stats.inbound} loading={loading} />
        <StatCard label="Sorted" value={stats.sorted} loading={loading} />
        <StatCard label="Manifested" value={stats.manifested} loading={loading} />
        <StatCard label="Out for Delivery" value={stats.outForDelivery} loading={loading} />
        <StatCard label="Returns (Received)" value={stats.returns} loading={loading} />
        <StatCard label="Transfers (Dispatched)" value={stats.transfers} loading={loading} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickLink to="/warehouse/inbound" title="Scan In (Inbound)" desc="Receive parcels into this station." />
        <QuickLink to="/warehouse/outbound" title="Scan Out (Outbound)" desc="Send parcels out for delivery or transfer." />
        <QuickLink to="/warehouse/sorting" title="Sorting Board" desc="Assign inbound parcels to bins/routes." />
        <QuickLink to="/warehouse/loading" title="Load Manifest" desc="Create manifests and load parcels to vehicles." />
        <QuickLink to="/warehouse/transfers" title="Transit Routes" desc="Inter-station transfer management." />
        <QuickLink to="/warehouse/returns" title="Returns" desc="Handle return parcels and reasons." />
        <QuickLink to="/warehouse/labels" title="Print Labels" desc="Print shipping labels for parcels." />
        <QuickLink to="/warehouse/inventory" title="Inventory" desc="Search and export inventory list." />
      </div>
    </div>
  );
}
