import React from "react";
import { Link } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebaseconfig";

type Parcel = {
  trackingId?: string;
  senderName?: string;
  senderPhone?: string;
  receiverName?: string;
  receiverPhone?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  service?: string;
  codAmount?: number;
};

async function findParcelByCode(code: string): Promise<{ id: string; data: Parcel } | null> {
  const direct = await getDoc(doc(db, "parcels", code));
  if (direct.exists()) return { id: direct.id, data: direct.data() as Parcel };

  const q = query(collection(db, "parcels"), where("trackingId", "==", code), limit(1));
  const res = await getDocs(q);
  const d = res.docs[0];
  if (!d) return null;
  return { id: d.id, data: d.data() as Parcel };
}

function buildPrintHtml(parcels: Array<{ id: string; data: Parcel }>) {
  const items = parcels
    .map((p) => {
      const tracking = p.data.trackingId ?? p.id;
      return `
      <div class="label">
        <div class="row">
          <div class="brand">BRITIUM EXPRESS</div>
          <div class="tracking">${tracking}</div>
        </div>
        <div class="grid">
          <div>
            <div class="k">From</div>
            <div class="v">${escapeHtml(p.data.senderName ?? "-")} (${escapeHtml(p.data.senderPhone ?? "-")})</div>
            <div class="v">${escapeHtml(p.data.pickupAddress ?? "-")}</div>
          </div>
          <div>
            <div class="k">To</div>
            <div class="v">${escapeHtml(p.data.receiverName ?? "-")} (${escapeHtml(p.data.receiverPhone ?? "-")})</div>
            <div class="v">${escapeHtml(p.data.deliveryAddress ?? "-")}</div>
          </div>
        </div>
        <div class="row2">
          <div><span class="k">Service:</span> <span class="v">${escapeHtml(p.data.service ?? "-")}</span></div>
          <div><span class="k">COD:</span> <span class="v">${p.data.codAmount ?? 0}</span></div>
        </div>
      </div>
      `;
    })
    .join("");

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Print Labels</title>
      <style>
        @page { size: A4; margin: 10mm; }
        body { font-family: Arial, sans-serif; margin: 0; }
        .wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; }
        .label {
          border: 1px solid #111;
          border-radius: 10px;
          padding: 10px;
          height: 120mm;
          box-sizing: border-box;
        }
        .brand { font-weight: 800; font-size: 14px; }
        .tracking { font-weight: 800; font-size: 18px; letter-spacing: 1px; }
        .row { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
        .k { font-size: 11px; color: #555; text-transform: uppercase; font-weight: 700; }
        .v { font-size: 12px; color: #111; margin-top: 3px; }
        .row2 { display: flex; justify-content: space-between; margin-top: 10px; border-top: 1px solid #ddd; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="wrap">${items}</div>
      <script>window.onload = () => window.print();</script>
    </body>
  </html>
  `;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function PrintLabels() {
  const [code, setCode] = React.useState("");
  const [queue, setQueue] = React.useState<Array<{ id: string; data: Parcel }>>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const addToQueue = async () => {
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) return;

    setBusy(true);
    try {
      const found = await findParcelByCode(trimmed);
      if (!found) {
        setError("Parcel not found.");
        return;
      }
      const tracking = found.data.trackingId ?? found.id;
      if (queue.some((q) => (q.data.trackingId ?? q.id) === tracking)) {
        setError("Already added.");
        return;
      }
      setQueue((q) => [found, ...q]);
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const print = () => {
    if (queue.length === 0) return;
    const html = buildPrintHtml(queue);
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return alert("Popup blocked. Allow popups to print.");
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-extrabold">Labels • Print</div>
          <div className="text-sm text-neutral-600">Add parcels by tracking ID and print.</div>
        </div>
        <Link className="text-sm underline" to="/warehouse">
          Back to Dashboard
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        {error ? (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Tracking ID</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
              placeholder="Enter tracking ID"
            />
          </div>
          <button
            onClick={addToQueue}
            disabled={busy}
            className="rounded-xl border px-5 py-3 font-bold hover:bg-neutral-50 disabled:opacity-60"
          >
            {busy ? "Adding…" : "Add"}
          </button>

          <button
            onClick={print}
            disabled={queue.length === 0}
            className="rounded-xl bg-black px-5 py-3 text-white font-bold disabled:opacity-60"
          >
            Print ({queue.length})
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="text-sm font-semibold">Queue</div>
          <button className="text-sm underline" onClick={() => setQueue([])}>
            Clear
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr className="text-left">
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Receiver</th>
                <th className="px-4 py-3">Address</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-neutral-600">
                    No parcels added.
                  </td>
                </tr>
              ) : (
                queue.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3 font-mono">{p.data.trackingId ?? p.id}</td>
                    <td className="px-4 py-3">{p.data.receiverName ?? "-"}</td>
                    <td className="px-4 py-3">{p.data.deliveryAddress ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-neutral-500">
        Note: This prints text labels. If you want QR/barcodes, tell me which format you prefer (QR or Code128) and I’ll add it.
      </div>
    </div>
  );
}
