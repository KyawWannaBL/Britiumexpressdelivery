import React from "react";
import { Link } from "react-router-dom";
import { Hourglass, Bell, CheckCircle2 } from "lucide-react";

export default function PendingApproval(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
          <Hourglass className="h-9 w-9 text-orange-600 animate-pulse" />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900">Registration Submitted</h1>

        <p className="mb-6 leading-relaxed text-gray-600">
          Thank you for joining Britium Express! Your account is currently{" "}
          <span className="ml-1 inline-flex items-center rounded bg-orange-50 px-2 py-1 font-bold text-orange-700">
            Pending Approval
          </span>
          .
        </p>

        {/* Status */}
        <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-5 text-left">
          <div className="mb-3 flex items-center gap-2 text-[#0D47A1]">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-semibold">Status Update</p>
          </div>

          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0D47A1]">
                1
              </span>
              <span>Your documents have been received.</span>
            </li>

            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0D47A1]">
                2
              </span>
              <span>Admin verification is in progress.</span>
            </li>

            <li className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0D47A1]">
                3
              </span>
              <span>You will be notified once approved.</span>
            </li>
          </ul>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-xs text-gray-600">
            <Bell className="h-4 w-4 text-[#0D47A1]" />
            <span>Please check your email regularly for updates.</span>
          </div>
        </div>

        <Link
          to="/login"
          className="block w-full rounded-xl border-2 border-gray-200 bg-white py-3 font-bold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}
