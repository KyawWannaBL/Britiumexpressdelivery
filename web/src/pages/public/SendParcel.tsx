import React, { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../firebaseconfig";

/**
 * Public Send/Quote/Track page
 * - Quote + Request: writes to Firestore collection `quotation_requests`
 * - Tracking: reads from Firestore collection `shipments` (adjust if yours differs)
 *
 * IMPORTANT SECURITY NOTE:
 * If this is public, set Firestore Rules so anonymous users can ONLY "create" quotation_requests
 * with safe fields, and cannot read everything. Prefer Cloud Functions in production.
 */

type TabKey = "quote" | "track" | "calc";

const REGIONS = ["Yangon", "Mandalay", "Naypyidaw", "Bago", "Other"] as const;
const SERVICES = ["Standard", "Express", "Same-day"] as const;

const QuoteSchema = z.object({
  senderName: z.string().min(2, "Sender name is required"),
  senderPhone: z.string().min(6, "Phone is required"),
  senderEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  pickupAddress: z.string().min(6, "Pickup address is required"),

  receiverName: z.string().min(2, "Receiver name is required"),
  receiverPhone: z.string().min(6, "Receiver phone is required"),
  destinationRegion: z.enum(REGIONS, { required_error: "Destination is required" }),
  destinationAddress: z.string().min(6, "Destination address is required"),

  serviceType: z.enum(SERVICES, { required_error: "Service type is required" }),
  weightKg: z.coerce.number().positive("Weight must be > 0").max(200, "Too heavy"),
  lengthCm: z.coerce.number().positive("Length must be > 0").max(300, "Too large"),
  widthCm: z.coerce.number().positive("Width must be > 0").max(300, "Too large"),
  heightCm: z.coerce.number().positive("Height must be > 0").max(300, "Too large"),

  notes: z.string().max(500, "Too long").optional().or(z.literal("")),
});

type QuoteForm = z.infer<typeof QuoteSchema>;

const TrackSchema = z.object({
  trackingId: z.string().min(4, "Enter a valid tracking ID"),
});
type TrackForm = z.infer<typeof TrackSchema>;

type ShipmentStatus =
  | "created"
  | "picked_up"
  | "in_warehouse"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returned"
  | string;

type TrackingEvent = {
  at?: any; // Firestore Timestamp or ISO string
  status: string;
  note?: string;
  location?: string;
};

type ShipmentDoc = {
  trackingId?: string;
  status?: ShipmentStatus;
  senderName?: string;
  receiverName?: string;
  origin?: string;
  destination?: string;
  events?: TrackingEvent[];
  updatedAt?: any;
};

function formatMoneyMMK(amount: number) {
  try {
    return new Intl.NumberFormat("en-US").format(Math.round(amount)) + " MMK";
  } catch {
    return `${Math.round(amount)} MMK`;
  }
}

/**
 * Simple pricing model.
 * Replace with your own rules or fetch from Firestore pricing tables later.
 */
function estimatePriceMMK(input: {
  serviceType: (typeof SERVICES)[number];
  destinationRegion: (typeof REGIONS)[number];
  chargeableWeightKg: number;
}) {
  const { serviceType, destinationRegion, chargeableWeightKg } = input;

  const serviceMultiplier =
    serviceType === "Same-day" ? 1.8 : serviceType === "Express" ? 1.35 : 1.0;

  const regionMultiplier = destinationRegion === "Yangon" ? 1.0 : destinationRegion === "Other" ? 1.25 : 1.15;

  const base = 2500;
  const perKg = 1200;

  const raw = (base + perKg * chargeableWeightKg) * serviceMultiplier * regionMultiplier;
  // round to nearest 100
  return Math.round(raw / 100) * 100;
}

function volumetricWeightKg(lengthCm: number, widthCm: number, heightCm: number) {
  // Common volumetric divisor: 5000 (cm)
  const v = (lengthCm * widthCm * heightCm) / 5000;
  return Math.max(0, v);
}

function safeDateLabel(ts: any) {
  if (!ts) return "";
  // Firestore Timestamp
  if (typeof ts?.toDate === "function") return ts.toDate().toLocaleString();
  if (typeof ts === "string") return new Date(ts).toLocaleString();
  return "";
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-xl text-sm font-semibold transition",
        active
          ? "bg-[#0D47A1] text-white shadow"
          : "bg-white text-gray-700 border hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function SendParcel() {
  const [tab, setTab] = useState<TabKey>("quote");
  const [submitState, setSubmitState] = useState<
    | { type: "idle" }
    | { type: "submitting" }
    | { type: "success"; requestId: string }
    | { type: "error"; message: string }
  >({ type: "idle" });

  const [trackState, setTrackState] = useState<
    | { type: "idle" }
    | { type: "loading" }
    | { type: "not_found" }
    | { type: "error"; message: string }
    | { type: "success"; shipment: ShipmentDoc; docId: string }
  >({ type: "idle" });

  const quoteForm = useForm<QuoteForm>({
    resolver: zodResolver(QuoteSchema),
    defaultValues: {
      senderName: "",
      senderPhone: "",
      senderEmail: "",
      pickupAddress: "",

      receiverName: "",
      receiverPhone: "",
      destinationRegion: "Yangon",
      destinationAddress: "",

      serviceType: "Standard",
      weightKg: 1,
      lengthCm: 20,
      widthCm: 15,
      heightCm: 10,

      notes: "",
    },
    mode: "onBlur",
  });

  const trackForm = useForm<TrackForm>({
    resolver: zodResolver(TrackSchema),
    defaultValues: { trackingId: "" },
    mode: "onSubmit",
  });

  const watched = quoteForm.watch();
  const volKg = useMemo(
    () => volumetricWeightKg(watched.lengthCm || 0, watched.widthCm || 0, watched.heightCm || 0),
    [watched.lengthCm, watched.widthCm, watched.heightCm]
  );

  const chargeableKg = useMemo(() => {
    const actual = Number(watched.weightKg || 0);
    return Math.max(actual, volKg);
  }, [watched.weightKg, volKg]);

  const estimate = useMemo(() => {
    return estimatePriceMMK({
      serviceType: watched.serviceType,
      destinationRegion: watched.destinationRegion,
      chargeableWeightKg: chargeableKg,
    });
  }, [watched.serviceType, watched.destinationRegion, chargeableKg]);

  const onSubmitQuote = async (values: QuoteForm) => {
    setSubmitState({ type: "submitting" });
    try {
      const docRef = await addDoc(collection(db, "quotation_requests"), {
        ...values,
        volumetricWeightKg: volKg,
        chargeableWeightKg: chargeableKg,
        estimatedPriceMMK: estimate,
        source: "web_public",
        status: "new",
        createdAt: serverTimestamp(),
      });

      setSubmitState({ type: "success", requestId: docRef.id });
      // keep form data; user might want to screenshot
    } catch (e: any) {
      console.error("Failed to submit quotation:", e);
      setSubmitState({
        type: "error",
        message: e?.message ?? "Failed to submit request. Please try again.",
      });
    }
  };

  const tryFindShipment = async (trackingId: string) => {
    // Strategy:
    // 1) Try direct document ID: /shipments/{trackingId}
    // 2) If not found, query by field `trackingId`
    const direct = await getDoc(doc(db, "shipments", trackingId));
    if (direct.exists()) return { docId: direct.id, data: direct.data() as ShipmentDoc };

    const q = query(
      collection(db, "shipments"),
      where("trackingId", "==", trackingId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { docId: d.id, data: d.data() as ShipmentDoc };
    }

    return null;
  };

  const onSubmitTrack = async (values: TrackForm) => {
    setTrackState({ type: "loading" });
    try {
      const id = values.trackingId.trim();
      const found = await tryFindShipment(id);
      if (!found) {
        setTrackState({ type: "not_found" });
        return;
      }
      setTrackState({ type: "success", shipment: found.data, docId: found.docId });
    } catch (e: any) {
      console.error("Tracking error:", e);
      setTrackState({ type: "error", message: e?.message ?? "Failed to track. Try again." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Send Parcel
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Get a quote, request pickup, or track your shipment.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <TabButton active={tab === "quote"} onClick={() => setTab("quote")}>
              Quote / Request
            </TabButton>
            <TabButton active={tab === "track"} onClick={() => setTab("track")}>
              Track
            </TabButton>
            <TabButton active={tab === "calc"} onClick={() => setTab("calc")}>
              Calculator
            </TabButton>
          </div>
        </div>

        {/* Summary banner */}
        <div className="mt-5 bg-white border rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <div className="text-xs text-gray-500">Chargeable Weight</div>
              <div className="font-bold text-gray-900">
                {chargeableKg.toFixed(2)} kg
              </div>
              <div className="text-xs text-gray-500">
                (Actual {Number(watched.weightKg || 0).toFixed(2)} / Vol {volKg.toFixed(2)})
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Service</div>
              <div className="font-bold text-gray-900">{watched.serviceType}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Destination</div>
              <div className="font-bold text-gray-900">{watched.destinationRegion}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Estimated Price</div>
              <div className="font-extrabold text-[#0D47A1]">{formatMoneyMMK(estimate)}</div>
              <div className="text-[11px] text-gray-500">Final price may vary after inspection.</div>
            </div>
          </div>
        </div>

        {/* QUOTE / REQUEST */}
        {tab === "quote" && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Request Pickup / Quote</h2>
              <p className="text-sm text-gray-600 mt-1">
                Fill this form. Our team will confirm pickup and pricing.
              </p>

              <form
                className="mt-5 space-y-5"
                onSubmit={quoteForm.handleSubmit(onSubmitQuote)}
              >
                {/* Sender */}
                <section className="space-y-3">
                  <div className="text-sm font-bold text-gray-900">Sender</div>

                  <Field
                    label="Sender Name"
                    error={quoteForm.formState.errors.senderName?.message}
                  >
                    <input
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none"
                      {...quoteForm.register("senderName")}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Phone"
                      error={quoteForm.formState.errors.senderPhone?.message}
                    >
                      <input
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none"
                        {...quoteForm.register("senderPhone")}
                      />
                    </Field>

                    <Field
                      label="Email (optional)"
                      error={quoteForm.formState.errors.senderEmail?.message}
                    >
                      <input
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none"
                        {...quoteForm.register("senderEmail")}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Pickup Address"
                    error={quoteForm.formState.errors.pickupAddress?.message}
                  >
                    <textarea
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none min-h-[92px]"
                      {...quoteForm.register("pickupAddress")}
                    />
                  </Field>
                </section>

                <hr />

                {/* Receiver */}
                <section className="space-y-3">
                  <div className="text-sm font-bold text-gray-900">Receiver</div>

                  <Field
                    label="Receiver Name"
                    error={quoteForm.formState.errors.receiverName?.message}
                  >
                    <input
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none"
                      {...quoteForm.register("receiverName")}
                    />
                  </Field>

                  <Field
                    label="Receiver Phone"
                    error={quoteForm.formState.errors.receiverPhone?.message}
                  >
                    <input
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none"
                      {...quoteForm.register("receiverPhone")}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Destination Region"
                      error={quoteForm.formState.errors.destinationRegion?.message}
                    >
                      <select
                        className="w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#0D47A1] outline-none"
                        {...quoteForm.register("destinationRegion")}
                      >
                        {REGIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Service Type"
                      error={quoteForm.formState.errors.serviceType?.message}
                    >
                      <select
                        className="w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-[#0D47A1] outline-none"
                        {...quoteForm.register("serviceType")}
                      >
                        {SERVICES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field
                    label="Destination Address"
                    error={quoteForm.formState.errors.destinationAddress?.message}
                  >
                    <textarea
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none min-h-[92px]"
                      {...quoteForm.register("destinationAddress")}
                    />
                  </Field>
                </section>

                <hr />

                {/* Parcel */}
                <section className="space-y-3">
                  <div className="text-sm font-bold text-gray-900">Parcel Details</div>

                  <Field label="Weight (kg)" error={quoteForm.formState.errors.weightKg?.message}>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none"
                      {...quoteForm.register("weightKg")}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Length (cm)" error={quoteForm.formState.errors.lengthCm?.message}>
                      <input
                        type="number"
                        step="1"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none"
                        {...quoteForm.register("lengthCm")}
                      />
                    </Field>
                    <Field label="Width (cm)" error={quoteForm.formState.errors.widthCm?.message}>
                      <input
                        type="number"
                        step="1"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none"
                        {...quoteForm.register("widthCm")}
                      />
                    </Field>
                    <Field label="Height (cm)" error={quoteForm.formState.errors.heightCm?.message}>
                      <input
                        type="number"
                        step="1"
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none"
                        {...quoteForm.register("heightCm")}
                      />
                    </Field>
                  </div>

                  <Field label="Notes (optional)" error={quoteForm.formState.errors.notes?.message}>
                    <textarea
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none min-h-[92px]"
                      {...quoteForm.register("notes")}
                    />
                  </Field>
                </section>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                  <button
                    type="submit"
                    disabled={submitState.type === "submitting"}
                    className={[
                      "w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-white shadow transition",
                      submitState.type === "submitting"
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-[#0D47A1] hover:bg-blue-800",
                    ].join(" ")}
                  >
                    {submitState.type === "submitting" ? "Submitting..." : "Submit Request"}
                  </button>

                  <div className="text-sm text-gray-600">
                    Estimate: <span className="font-bold text-[#0D47A1]">{formatMoneyMMK(estimate)}</span>
                  </div>
                </div>

                {submitState.type === "success" && (
                  <div className="mt-4 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm">
                    ✅ Request submitted successfully.<br />
                    Reference ID: <span className="font-mono font-bold">{submitState.requestId}</span>
                  </div>
                )}

                {submitState.type === "error" && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
                    ❌ {submitState.message}
                  </div>
                )}
              </form>
            </div>

            {/* Right side: Explanation / CTA */}
            <div className="bg-white border rounded-2xl p-5 shadow-sm h-fit">
              <h3 className="text-lg font-bold text-gray-900">What happens next?</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700 list-disc pl-5">
                <li>Our team confirms pickup time and final price.</li>
                <li>We generate a tracking ID after pickup is created.</li>
                <li>You can track at <span className="font-mono">/track</span> or on this page’s Track tab.</li>
              </ul>

              <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="font-bold text-[#0D47A1]">Pro tip</div>
                <div className="text-sm text-gray-700 mt-1">
                  When you later add mobile apps, use the same URLs (e.g.{" "}
                  <span className="font-mono">https://www.britiumexpress.app/track/XYZ</span>) for deep linking.
                </div>
              </div>

              <div className="mt-5 flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTab("track")}
                  className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm font-semibold"
                >
                  Go to Tracking
                </button>
                <button
                  type="button"
                  onClick={() => setTab("calc")}
                  className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm font-semibold"
                >
                  Open Calculator
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TRACK */}
        {tab === "track" && (
          <div className="mt-6 bg-white border rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Track a Shipment</h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter a tracking ID to view current status and events.
            </p>

            <form
              className="mt-5 flex flex-col sm:flex-row gap-3"
              onSubmit={trackForm.handleSubmit(onSubmitTrack)}
            >
              <div className="flex-1">
                <input
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none"
                  placeholder="e.g. BRX-2026-000123"
                  {...trackForm.register("trackingId")}
                />
                {trackForm.formState.errors.trackingId?.message && (
                  <div className="text-xs text-red-600 mt-1">
                    {trackForm.formState.errors.trackingId.message}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="px-5 py-3 rounded-xl font-bold text-white bg-[#0D47A1] hover:bg-blue-800 shadow"
                disabled={trackState.type === "loading"}
              >
                {trackState.type === "loading" ? "Searching..." : "Track"}
              </button>
            </form>

            <div className="mt-6">
              {trackState.type === "idle" && (
                <div className="text-sm text-gray-500">Enter an ID to start tracking.</div>
              )}

              {trackState.type === "not_found" && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-xl p-4 text-sm">
                  Not found. Please check the tracking ID and try again.
                </div>
              )}

              {trackState.type === "error" && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
                  ❌ {trackState.message}
                </div>
              )}

              {trackState.type === "success" && (
                <TrackingCard shipment={trackState.shipment} docId={trackState.docId} />
              )}
            </div>

            <div className="mt-6 text-xs text-gray-500">
              If your collection is not named <span className="font-mono">shipments</span>, change it in this file.
            </div>
          </div>
        )}

        {/* CALCULATOR */}
        {tab === "calc" && (
          <div className="mt-6 bg-white border rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Shipping Calculator</h2>
            <p className="text-sm text-gray-600 mt-1">
              Adjust weight/dimensions and service to get an instant estimate.
            </p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Destination</label>
                    <select
                      className="w-full mt-1 px-4 py-3 border rounded-xl bg-white"
                      value={watched.destinationRegion}
                      onChange={(e) => quoteForm.setValue("destinationRegion", e.target.value as any)}
                    >
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Service</label>
                    <select
                      className="w-full mt-1 px-4 py-3 border rounded-xl bg-white"
                      value={watched.serviceType}
                      onChange={(e) => quoteForm.setValue("serviceType", e.target.value as any)}
                    >
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Weight (kg)</label>
                    <input
                      className="w-full mt-1 px-4 py-3 border rounded-xl"
                      type="number"
                      step="0.01"
                      value={watched.weightKg}
                      onChange={(e) => quoteForm.setValue("weightKg", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Volumetric divisor</label>
                    <div className="mt-1 px-4 py-3 border rounded-xl bg-gray-50 text-sm text-gray-700">
                      (L×W×H)/5000
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">L (cm)</label>
                    <input
                      className="w-full mt-1 px-4 py-3 border rounded-xl"
                      type="number"
                      value={watched.lengthCm}
                      onChange={(e) => quoteForm.setValue("lengthCm", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">W (cm)</label>
                    <input
                      className="w-full mt-1 px-4 py-3 border rounded-xl"
                      type="number"
                      value={watched.widthCm}
                      onChange={(e) => quoteForm.setValue("widthCm", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">H (cm)</label>
                    <input
                      className="w-full mt-1 px-4 py-3 border rounded-xl"
                      type="number"
                      value={watched.heightCm}
                      onChange={(e) => quoteForm.setValue("heightCm", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border p-5 bg-gray-50">
                <div className="text-sm text-gray-600">Results</div>

                <div className="mt-3 space-y-2">
                  <Row label="Actual weight" value={`${Number(watched.weightKg || 0).toFixed(2)} kg`} />
                  <Row label="Volumetric weight" value={`${volKg.toFixed(2)} kg`} />
                  <Row label="Chargeable weight" value={`${chargeableKg.toFixed(2)} kg`} />
                </div>

                <div className="mt-5 p-4 rounded-xl bg-white border">
                  <div className="text-xs text-gray-500 uppercase font-bold">Estimated Price</div>
                  <div className="text-2xl font-extrabold text-[#0D47A1] mt-1">
                    {formatMoneyMMK(estimate)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Replace pricing logic later with your tariff tables.
                  </div>
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTab("quote")}
                    className="px-4 py-2 rounded-xl bg-[#0D47A1] text-white font-bold hover:bg-blue-800"
                  >
                    Use this in Request Form
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      quoteForm.reset();
                      setSubmitState({ type: "idle" });
                    }}
                    className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 text-xs text-gray-500">
          © {new Date().getFullYear()} Britium Express
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-gray-600">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function TrackingCard({ shipment, docId }: { shipment: ShipmentDoc; docId: string }) {
  const status = shipment.status ?? "unknown";
  const updated = safeDateLabel(shipment.updatedAt);

  const events = Array.isArray(shipment.events) ? shipment.events : [];

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="text-xs text-gray-500 uppercase font-bold">Shipment</div>
          <div className="text-lg font-extrabold text-gray-900 mt-1">
            {shipment.trackingId ?? docId}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Status: <span className="font-bold text-[#0D47A1]">{String(status)}</span>
          </div>
          {updated && <div className="text-xs text-gray-500 mt-1">Updated: {updated}</div>}
        </div>

        <div className="rounded-xl bg-gray-50 border p-4 text-sm w-full sm:w-auto">
          <div className="text-xs text-gray-500 uppercase font-bold">From → To</div>
          <div className="mt-1 text-gray-800">
            {shipment.origin ?? "—"} → {shipment.destination ?? "—"}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-sm font-bold text-gray-900">Tracking Events</div>

        {events.length === 0 ? (
          <div className="text-sm text-gray-500 mt-2">No events available yet.</div>
        ) : (
          <div className="mt-3 space-y-3">
            {events.map((e, idx) => (
              <div key={idx} className="border rounded-xl p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="font-bold text-gray-900">{e.status}</div>
                  <div className="text-xs text-gray-500">{safeDateLabel(e.at)}</div>
                </div>
                {(e.location || e.note) && (
                  <div className="text-sm text-gray-700 mt-1">
                    {e.location ? <span className="font-semibold">{e.location}</span> : null}
                    {e.location && e.note ? " — " : null}
                    {e.note ?? ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          If your tracking data is stored differently, adjust fields in this component.
        </div>
      </div>
    </div>
  );
}

