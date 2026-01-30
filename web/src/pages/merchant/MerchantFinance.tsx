import React, { useState } from 'react';
import { DollarSign, Download, ArrowUpRight, Clock, AlertCircle, Search, Filter } from 'lucide-react';

const MerchantFinance = () => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'payouts'>('ledger');

  // Mock Data: COD Ledger
  const transactions = [
    { id: 'TX-901', date: '2026-01-28', ref: 'ORD-1122', type: 'COD Collected', amount: 45000, status: 'pending' },
    { id: 'TX-902', date: '2026-01-28', ref: 'ORD-1125', type: 'Delivery Fee', amount: -2500, status: 'deducted' },
    { id: 'TX-880', date: '2026-01-27', ref: 'ORD-1099', type: 'COD Collected', amount: 120000, status: 'payable' },
  ];

  // Mock Data: Payout Batches
  const payouts = [
    { id: 'PO-005', date: '2026-01-25', amount: 850000, method: 'KBZPay', status: 'paid', ref: 'KBZ123456' },
    { id: 'PO-006', date: '2026-02-01', amount: 420000, method: 'Pending', status: 'processing', ref: '-' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      
      {/* 1. Financial Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-gray-500 font-bold text-sm uppercase">Unsettled COD</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2">1,245,000 <span className="text-sm font-medium text-gray-400">MMK</span></h2>
            <p className="text-xs text-orange-500 font-bold mt-2 flex items-center gap-1">
              <Clock size={12} /> Next Payout: Feb 1st
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-orange-50 to-transparent"></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-bold text-sm uppercase">Wallet Balance</p>
          <h2 className="text-3xl font-extrabold text-blue-600 mt-2">50,000 <span className="text-sm font-medium text-gray-400">MMK</span></h2>
          <div className="flex gap-2 mt-3">
             <button className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
               + Top Up
             </button>
             <button className="text-xs bg-gray-50 text-gray-600 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
               View Statement
             </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
          <div>
            <p className="text-blue-200 font-bold text-sm uppercase">Action</p>
            <h3 className="font-bold text-lg mt-1">Request Early Payout?</h3>
          </div>
          <button className="mt-4 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all">
            <ArrowUpRight size={16} /> Request Withdrawal
          </button>
        </div>
      </div>

      {/* 2. Transaction Tabs */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 flex px-6">
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`py-4 mr-8 font-bold text-sm border-b-2 transition-colors ${activeTab === 'ledger' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Transaction Ledger
          </button>
          <button 
            onClick={() => setActiveTab('payouts')}
            className={`py-4 mr-8 font-bold text-sm border-b-2 transition-colors ${activeTab === 'payouts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Payout History
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input type="text" placeholder="Search Order ID..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64" />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {activeTab === 'ledger' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Ref ID</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{tx.ref}</td>
                    <td className="px-6 py-4">{tx.type}</td>
                    <td className={`px-6 py-4 text-right font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        tx.status === 'payable' ? 'bg-green-100 text-green-700' : 
                        tx.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button title="Report Issue" className="text-gray-400 hover:text-red-500"><AlertCircle size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">Batch ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((po) => (
                   <tr key={po.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 font-mono font-medium text-blue-600">{po.id}</td>
                     <td className="px-6 py-4 text-gray-500">{po.date}</td>
                     <td className="px-6 py-4 font-bold text-gray-900">{po.amount.toLocaleString()}</td>
                     <td className="px-6 py-4 flex items-center gap-2">
                        {po.method} 
                        {po.ref !== '-' && <span className="text-xs bg-gray-100 px-1 rounded text-gray-500 font-mono">{po.ref}</span>}
                     </td>
                     <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${po.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                         {po.status.toUpperCase()}
                       </span>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantFinance;