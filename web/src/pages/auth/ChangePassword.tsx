import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseconfig";

function passwordStrength(pw: string) {
  // Simple, predictable checks (no external deps)
  const hasMin = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);

  const score = [hasMin, hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

  const label =
    score <= 2 ? "Weak" : score === 3 ? "Fair" : score === 4 ? "Good" : "Strong";

  return { hasMin, hasUpper, hasLower, hasNumber, hasSymbol, score, label };
}

export default function ChangePassword(): JSX.Element {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(newPassword), [newPassword]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      setError("You are not signed in. Please log in again.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Keep this validation aligned with your org policy
    if (!strength.hasMin) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // Firebase may throw "requires-recent-login" if session is old
      await updatePassword(user, newPassword);

      // Clear the forced-change flag in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        mustchangepassword: false,
        passwordUpdatedAt: serverTimestamp(),
      });

      await auth.signOut();
      navigate("/login", { replace: true });
    } catch (err: any) {
      const code: string | undefined = err?.code;

      if (code === "auth/requires-recent-login") {
        setError("For security, please log in again and then change your password.");
      } else if (code === "auth/weak-password") {
        setError("That password is too weak. Please choose a stronger one.");
      } else {
        setError(err?.message ?? "Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <ShieldCheck className="h-8 w-8 text-[#0D47A1]" />
        </div>

        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">Secure Your Account</h2>
        <p className="mb-8 text-center text-sm text-gray-500">
          For security reasons, you must change your temporary password before proceeding.
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-11 outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]"
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength helper */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Strength</span>
                <span
                  className={
                    strength.score <= 2
                      ? "text-red-600 font-semibold"
                      : strength.score === 3
                      ? "text-yellow-700 font-semibold"
                      : strength.score === 4
                      ? "text-blue-700 font-semibold"
                      : "text-green-700 font-semibold"
                  }
                >
                  {strength.label}
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={
                    strength.score <= 2
                      ? "h-2 rounded-full bg-red-500"
                      : strength.score === 3
                      ? "h-2 rounded-full bg-yellow-500"
                      : strength.score === 4
                      ? "h-2 rounded-full bg-blue-500"
                      : "h-2 rounded-full bg-green-500"
                  }
                  style={{ width: `${(strength.score / 5) * 100}%` }}
                />
              </div>

              <ul className="grid grid-cols-1 gap-1 text-xs text-gray-500">
                <li className={strength.hasMin ? "text-green-700" : ""}>• At least 8 characters</li>
                <li className={strength.hasUpper ? "text-green-700" : ""}>• One uppercase letter</li>
                <li className={strength.hasLower ? "text-green-700" : ""}>• One lowercase letter</li>
                <li className={strength.hasNumber ? "text-green-700" : ""}>• One number</li>
                <li className={strength.hasSymbol ? "text-green-700" : ""}>• One symbol</li>
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Confirm Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-11 outline-none transition-all focus:ring-2 focus:ring-[#0D47A1]"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <p className="mt-2 text-xs text-red-600">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full transform rounded-xl bg-[#0D47A1] py-3.5 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl disabled:opacity-70 disabled:hover:transform-none"
          >
            {loading ? "Updating Security..." : "Update Password"}
          </button>

          <p className="text-center text-xs text-gray-400">
            You will be signed out after changing your password.
          </p>
        </form>
      </div>
    </div>
  );
}
