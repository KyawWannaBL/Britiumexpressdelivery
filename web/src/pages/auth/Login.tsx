// src/pages/Login.tsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseconfig"; // Ensure this points to your config
import { useNavigate, Link } from "react-router-dom";

// --- ASSETS ---
const LOGO_URL = "https://img.sanishtech.com/u/c4db63c2085abfa571109c655dfa68f5.png";

// ⚠️ IMPORTANT: PASTE YOUR GIF URL INSIDE THE QUOTES BELOW ⚠️
const COVER_URL = "https://img.sanishtech.com/u/f883e6f27828fb13e906cf7204f098e4.gif";
export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);

      // --- SECURITY CHECK ---
      if (password === "P@ssw0rd1") {
        alert("⚠️ SECURITY ALERT: You are using the default password 'P@ssw0rd1'.\n\nPlease go to Settings and change your password immediately to secure this account.");
      }

      navigate("/dashboard");
    } catch (err: any) {
      const code: string | undefined = err?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/invalid-email") {
        setError("Invalid email or password.");
      } else if (code === "auth/user-not-found") {
        setError("No account found for this email.");
      } else {
        setError("Login failed. Please try again.");
      }
      console.error("Firebase login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function kept in case you need it later, but unused in UI now
  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Side: Cover Background (GIF) */}
      <div className="hidden lg:flex w-7/12 relative overflow-hidden bg-gray-900">
        {/* Overlay to ensure text readability over animated GIF */}
        <div className="absolute inset-0 bg-blue-900/30 z-10 mix-blend-multiply" />
        <img 
          src={COVER_URL} 
          alt="Britium Express Logistics Motion Background" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 text-white">
          <div className="mb-6 w-24 h-1 bg-orange-500 rounded-full" />
          <h2 className="text-5xl font-bold mb-4 shadow-sm drop-shadow-md">Britium Express</h2>
          <p className="text-xl opacity-95 font-medium drop-shadow-md">
            Next-Gen Logistics Powered by Intelligence.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            {/* Updated Logo */}
            <img src={LOGO_URL} alt="Britium Logo" className="w-32 mx-auto mb-6" />
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
            <p className="mt-2 text-sm text-gray-500">Sign in to manage your operations</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input 
                  type="email" 
                  required 
                  className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  autoComplete="email" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                <input 
                  type="password" 
                  required 
                  className="w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#0D47A1] outline-none" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  autoComplete="current-password" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 bg-[#0D47A1] text-white font-bold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-70 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="text-center mt-4">
              <Link to="/signup" className="text-[#0D47A1] font-bold hover:underline">
                Apply for Account
              </Link>
            </div>
          </form>

          {/* --- ADMIN QUICK ACCESS SECTION HIDDEN ---
            To restore, uncomment the block below.
          */}
          {/* <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 uppercase tracking-widest mb-4 font-semibold">
              Admin Quick Access
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button 
                type="button" 
                onClick={() => fillDemo("md@britiumexpress.com", "P@ssw0rd1")} 
                className="p-3 bg-blue-50 border border-blue-100 rounded hover:bg-blue-100 text-left flex justify-between items-center group"
              >
                <div>
                  <div className="font-bold text-[#0D47A1]">Super Admin</div>
                  <div className="text-[10px] text-gray-500">md@britiumexpress.com</div>
                </div>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded group-hover:bg-blue-300">Auto-Fill</span>
              </button>

              <button 
                type="button" 
                onClick={() => fillDemo("hod@britiumexpress.com", "P@ssw0rd1")} 
                className="p-3 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 text-left flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-gray-700">Manager (HOD)</div>
                  <div className="text-[10px] text-gray-500">hod@britiumexpress.com</div>
                </div>
              </button>

               <button 
                type="button" 
                onClick={() => fillDemo("mgkyawwanna@gmail.com", "P@ssw0rd1")} 
                className="p-3 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 text-left flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-gray-700">Backup Admin</div>
                  <div className="text-[10px] text-gray-500">mgkyawwanna@gmail.com</div>
                </div>
              </button>
            </div>
          </div> 
          */}

        </div>
      </div>
    </div>
  );
}