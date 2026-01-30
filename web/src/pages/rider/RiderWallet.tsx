import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Wallet, History, ChevronRight, DollarSign, ChevronLeft } from 'lucide-react';

const RiderWallet = () => {
  const navigate = useNavigate();

  // Mock Financial Data
  // In production: calculated from Firestore 'transactions' collection
  const financials = {
    codOnHand: 125000,    // Cash collected from customers (Liability)
    todaysEarnings: 8500, // Delivery fees earned (Asset)
    walletBalance: 25000, // Accumulated earnings not yet withdrawn
  };

  const netPayable = financials.codOnHand; // Usually, riders remit full COD, and earnings are paid weekly.

  const transactions = [
    { id: 'TX-1', type: 'cod', amount: 45000, desc: 'COD: Order #101', time: '10:30 AM' },
    { id: 'TX-2', type: 'fee', amount: 1500, desc: 'Fee: Order #101', time: '10:30 AM' },
    { id: 'TX-3', type: 'cod', amount: 80000, desc: 'COD: Order #105', time: '11:45 AM' },
    { id: 'TX-4', type: 'fee', amount: 2000, desc: 'Fee: Order #105', time: '11:45 AM' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white rounded-b-3xl shadow-lg pt-6">
        <div className="flex items-center mb-6">
           <button onClick={() => navigate(-1)} className="p-1"><ChevronLeft /></button>
           <h1 className="font-bold text-xl ml-2">My Wallet</h1>
        </div>

        {/* Main Balance Card */}
        <div className="bg-white text-gray-800 rounded-2xl p-5 shadow-xl mb-4">
          <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cash to Remit (COD)</p>
              <h2 className="text-3xl font-extrabold text-red-600">{financials.codOnHand.toLocaleString()} <span className="text-sm text-gray-500">Ks</span></h2>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <DollarSign className="text-red-500" size={24} />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">Today's Earnings</p>
              <p className="font-bold text-green-600">+{financials.todaysEarnings.toLocaleString()} Ks</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Total Wallet Balance</p>
              <p className="font-bold text-gray-800">{financials.walletBalance.toLocaleString()} Ks</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg border border-blue-400/30">
          <ArrowUpRight size={18} />
          REMIT CASH TO HUB
        </button>
      </div>

      {/* Transaction History */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <History size={18} /> History
          </h3>
          <span className="text-xs text-blue-600 font-bold">View All</span>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tx.type === 'cod' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                   {tx.type === 'cod' ? <DollarSign size={18} /> : <Wallet size={18} />}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">{tx.desc}</p>
                  <p className="text-xs text-gray-400">{tx.time}</p>
                </div>
              </div>
              <span className={`font-bold ${tx.type === 'cod' ? 'text-red-600' : 'text-green-600'}`}>
                {tx.type === 'cod' ? '+' : '+'}{tx.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiderWallet;