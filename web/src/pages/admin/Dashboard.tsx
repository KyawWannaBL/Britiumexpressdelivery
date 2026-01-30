import React from 'react';
import { Users, Truck, Package, TrendingUp } from 'lucide-react';
// Import the shared components we just created
import { Card } from '../../components/ui/SharedComponents';

const DashboardPage = () => {
  const pickupStats = {
    total: 27,
    percent: 23,
    breakdown: [
      { label: "To assign", count: 28, color: "text-orange-600" },
      { label: "Already assigned", count: 60, color: "text-blue-600" },
      { label: "On way", count: 0, color: "text-indigo-600" },
      { label: "Canceled", count: 0, color: "text-red-600" },
    ]
  };

  const deliveryStats = {
    total: 19,
    percent: 3,
    breakdown: [
      { label: "To assign", count: 52, color: "text-orange-600" },
      { label: "Already assigned", count: 434, color: "text-blue-600" },
      { label: "On way", count: 54, color: "text-indigo-600" },
      { label: "Retry", count: 1, color: "text-yellow-600" },
      { label: "Canceled", count: 0, color: "text-red-600" },
      { label: "Return", count: 0, color: "text-slate-600" },
    ]
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <div className="text-sm text-slate-500">Overview period: 25/12/2025 - 25/01/2026</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Merchant Orders Table */}
        <Card className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-lg">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Users size={18} className="text-[#0D47A1]" />
              Merchant direct order
            </h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold text-center">Ways</th>
                  <th className="px-4 py-3 font-semibold">Order at</th>
                  <th className="px-4 py-3 font-semibold">Town</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { id: 1, merchant: "Nora Store", ways: 15, date: "24/01/26", town: "ရန်ကင်း" },
                  { id: 2, merchant: "ပီတိစာပေ", ways: 1, date: "23/01/26", town: "ဒဂုံမြို့" },
                  { id: 3, merchant: "စံချိန်သစ် ကွန်ပျူတာ", ways: 1, date: "21/01/26", town: "egyi" },
                  { id: 4, merchant: "Aqua Pa La Tar Aquarium", ways: 1, date: "21/01/26", town: "လှိုင်" },
                  { id: 5, merchant: "Unique/Diva", ways: 20, date: "21/01/26", town: "တာမွေ" },
                  { id: 6, merchant: "Mee Lay", ways: 3, date: "20/01/26", town: "ay" },
                ].map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{order.merchant}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs font-bold">
                        {order.ways}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.date}</td>
                    <td className="px-4 py-3 text-slate-600">{order.town}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Stats Column */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-700 mb-1">Pickup Summary</h3>
                <p className="text-2xl font-bold text-[#2E7D32] flex items-center gap-2">
                  {pickupStats.total} <span className="text-sm font-normal text-slate-500">ways successful</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Truck size={24} />
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                    <span>Progress</span>
                    <span>{pickupStats.percent}% Completed</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-[#2E7D32] h-2 rounded-full" style={{ width: `${pickupStats.percent}%` }}></div>
                </div>
            </div>
            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pickupStats.breakdown.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center p-2 rounded bg-slate-50 border border-slate-100">
                  <span className={`text-lg font-bold ${stat.color}`}>{stat.count}</span>
                  <span className="text-xs text-slate-500 text-center">{stat.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-700 mb-1">Delivery Summary</h3>
                <p className="text-2xl font-bold text-[#0D47A1] flex items-center gap-2">
                  {deliveryStats.total} <span className="text-sm font-normal text-slate-500">ways successful</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Package size={24} />
              </div>
            </div>
             <div className="mb-4">
                <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                    <span>Progress</span>
                    <span>{deliveryStats.percent}% Completed</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-[#0D47A1] h-2 rounded-full" style={{ width: `${deliveryStats.percent}%` }}></div>
                </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {deliveryStats.breakdown.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center p-2 rounded bg-slate-50 border border-slate-100">
                  <span className={`text-lg font-bold ${stat.color}`}>{stat.count}</span>
                  <span className="text-xs text-slate-500 text-center">{stat.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;