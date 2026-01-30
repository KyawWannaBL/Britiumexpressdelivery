import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../../firebaseconfig";

const LOGO_URL = "https://img.sanishtech.com/u/b9beae3ecc1df0244610c786c48992ab.png";
const COVER_URL = "https://img.sanishtech.com/u/4774210f087879ff509300bbb082cc86.jpg";

type Role = "customer" | "rider" | "driver" | "merchant" | "sub_station" | "warehouse" | "supervisor";

const ROLE_REQUIREMENTS: Record<Role, string[]> = {
  rider: ["Driving License (Front)", "Driving License (Back)", "NRC / ID Card"],
  driver: ["Driving License (Heavy)", "Vehicle Registration", "NRC / ID Card"],
  merchant: ["Business License", "Shop Photo", "Tax ID"],
  sub_station: ["Manager ID", "Branch Permit"],
  warehouse: ["NRC / ID Card", "Recommendation Letter"],
  supervisor: ["NRC / ID Card", "Staff ID"],
  customer: ["NRC / ID Card"],
};

type FormData = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: Role;
  branchId: string;
};

const MAX_FILE_MB = 5;

function formatFirebaseError(err: any): string {
  const code: string | undefined = err?.code;
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please log in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    default:
      return err?.message ?? "Registration failed. Please try again.";
  }
}

export default function Signup(): JSX.Element {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "customer",
    branchId: "",
  });

  // docName -> File
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const requiredDocs = useMemo(() => ROLE_REQUIREMENTS[formData.role] ?? [], [formData.role]);

  const handleFileChange = (docName: string, file: File | null) => {
    setError(null);

    if (file && file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File too large: "${docName}". Max ${MAX_FILE_MB}MB.`);
      return;
    }

    setFiles((prev) => ({ ...prev, [docName]: file }));
  };

  const missingRequiredDoc = useMemo(() => {
    for (const docName of requiredDocs) {
      if (!files[docName]) return docName;
    }
    return null;
  }, [files, requiredDocs]);

  const updateForm = (patch: Partial<FormData>) => setFormData((p) => ({ ...p, ...patch }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required documents
    if (requiredDocs.length > 0 && missingRequiredDoc) {
      setError(`Please upload: ${missingRequiredDoc}`);
      return;
    }

    setLoading(true);

    try {
      // 1) Create Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      const user = userCredential.user;

      // 2) Upload docs (if any)
      const documentUrls: Record<string, string> = {};

      for (const docName of requiredDocs) {
        const file = files[docName];
        if (!file) continue;

        // sanitize docName for path safety
        const safeName = docName.replace(/[^\w\-(). ]+/g, "_").replace(/\s+/g, "_");
        const storageRef = ref(storage, `uploads/${user.uid}/${safeName}_${Date.now()}`);

        const snapshot = await uploadBytes(storageRef, file);
        documentUrls[docName] = await getDownloadURL(snapshot.ref);
      }

      // 3) Write Firestore profile (pending approval)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email.trim(),
        displayName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        branchId: formData.branchId.trim() || null,
        status: "pending",
        documents: documentUrls,
        createdAt: serverTimestamp(),
        authorityLevel: 1,
        mustchangepassword: false,
      });

      // 4) Update Auth profile
      await updateProfile(user, { displayName: formData.fullName.trim() });

      navigate("/pending-approval", { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT */}
      <div className="sticky top-0 hidden h-screen w-5/12 overflow-hidden bg-gray-900 lg:flex">
        <div className="absolute inset-0 z-10 bg-blue-900/60 mix-blend-multiply" />
        <img src={COVER_URL} alt="Background" className="h-full w-full object-cover opacity-80" />

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center text-white">
          <div className="mb-8 w-32 drop-shadow-2xl transition-transform duration-500 hover:scale-110">
            <img src={LOGO_URL} alt="Logo" className="h-auto w-full" />
          </div>
          <h2 className="mb-4 text-4xl font-bold">Join the Fleet</h2>
          <p className="mx-auto max-w-md text-lg leading-relaxed opacity-90">
            Become part of the most reliable logistics network in the country. Secure. Efficient. Rewarding.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto bg-gray-50/50 p-4 lg:p-12">
        <div className="w-full max-w-2xl rounded-3xl border border-gray-100 bg-white p-8 shadow-xl lg:p-10">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Create Account</h1>
            <p className="mt-2 text-gray-500">Enter your details below to start your application</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start rounded-r-lg border-l-4 border-red-500 bg-red-50 p-4">
              <svg
                className="mr-2 mt-0.5 h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-8">
            {/* Role */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
              <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-[#0D47A1]">
                I am registering as a:
              </label>

              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) => {
                    setFiles({});
                    updateForm({ role: e.target.value as Role });
                  }}
                  className="w-full cursor-pointer appearance-none rounded-xl bg-white p-4 pr-10 text-lg font-medium text-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-[#0D47A1]"
                >
                  <option value="customer">Customer (Sender/Receiver)</option>
                  <option value="rider">Rider (Bike Delivery)</option>
                  <option value="driver">Driver (Truck/Van)</option>
                  <option value="merchant">Merchant (Business Partner)</option>
                  <option value="sub_station">Sub-station Manager</option>
                  <option value="warehouse">Warehouse Staff</option>
                  <option value="supervisor">Supervisor</option>
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                  <svg className="h-5 w-5 text-[#0D47A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="Full Name">
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#0D47A1]"
                  placeholder="e.g. Kyaw Kyaw"
                  value={formData.fullName}
                  onChange={(e) => updateForm({ fullName: e.target.value })}
                  autoComplete="name"
                />
              </Field>

              <Field label="Phone Number">
                <input
                  type="tel"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#0D47A1]"
                  placeholder="+959..."
                  value={formData.phone}
                  onChange={(e) => updateForm({ phone: e.target.value })}
                  autoComplete="tel"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#0D47A1]"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                  autoComplete="email"
                />
              </Field>

              <Field label="Password">
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#0D47A1]"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateForm({ password: e.target.value })}
                  autoComplete="new-password"
                />
              </Field>

              {/* Optional: Branch ID for non-customer roles */}
              {(formData.role === "sub_station" || formData.role === "warehouse" || formData.role === "supervisor") && (
                <Field label="Branch ID (optional)">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#0D47A1]"
                    placeholder="e.g. YGN-001"
                    value={formData.branchId}
                    onChange={(e) => updateForm({ branchId: e.target.value })}
                  />
                </Field>
              )}
            </div>

            {/* Docs */}
            {requiredDocs.length > 0 && (
              <div className="mt-10 border-t border-gray-100 pt-8">
                <div className="mb-6 flex items-start">
                  <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Identity Verification</h3>
                    <p className="text-sm leading-relaxed text-gray-500">
                      Upload clear photos of the required documents for your selected role. An administrator will review
                      them.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                  {requiredDocs.map((docName) => (
                    <div
                      key={docName}
                      className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-[#0D47A1]"
                    >
                      <label className="mb-3 block text-sm font-bold text-gray-700 transition-colors group-hover:text-[#0D47A1]">
                        {docName} <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="file"
                        required
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(docName, e.target.files?.[0] ?? null)}
                        className="block w-full cursor-pointer text-sm text-gray-500
                          file:mr-4 file:rounded-full file:border-0
                          file:bg-[#0D47A1] file:px-5 file:py-2.5
                          file:text-xs file:font-bold file:uppercase file:tracking-wide
                          file:text-white hover:file:bg-blue-800"
                      />

                      {files[docName] && (
                        <p className="mt-2 text-xs text-gray-500">
                          Selected: <span className="font-medium text-gray-700">{files[docName]!.name}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {missingRequiredDoc && (
                  <p className="mt-3 text-sm text-red-600">Missing document: {missingRequiredDoc}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full transform rounded-xl bg-gradient-to-r from-[#0D47A1] to-[#1565C0] py-4 text-lg font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:to-[#0D47A1] disabled:opacity-70 disabled:hover:transform-none"
            >
              {loading ? "Processing Registration..." : "Submit Registration"}
            </button>

            <div className="pb-6 pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-[#0D47A1]"
              >
                Already have an account?{" "}
                <span className="ml-1 font-bold underline decoration-2 underline-offset-2">Log In</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Subcomponents ----------------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group relative">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500 group-focus-within:text-[#0D47A1]">
        {label}
      </label>
      {children}
    </div>
  );
}
