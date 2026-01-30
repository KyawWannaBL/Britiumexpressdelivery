import React, { useState } from 'react';
import { Truck, Calendar, MapPin, Plus, Clock, ChevronRight } from 'lucide-react';

const MerchantPickups = () => {
  const [showModal, setShowModal] = useState(false);

  // Mock Data
  const pickups = [
    { id: 'PK-202', status: 'assigned', date: 'Today', time: '10:00 AM - 12:00 PM', location: 'Main Warehouse', rider: 'Kyaw Kyaw', count: 12 },
    { id: 'PK-203', status: 'pending', date: 'Tomorrow', time: '02:00 PM - 04:00 PM', location: 'Downtown Store', rider: null, count: 50 },
    { id: 'PK-199', status: 'completed', date: 'Yesterday', time: '04:30 PM', location: 'Main Warehouse', rider: 'Aung Aung', count: 24 },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pickup Requests</h1>
          <p className="text-gray-500">Manage your scheduled pickups.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-lg"
        >
          <Plus size={18} /> New Pickup Request
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pickups.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-blue-400 transition-colors group">
            
            {/* Left: Info */}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                p.status === 'completed' ? 'bg-green-100 text-green-600' : 
                p.status === 'assigned' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
              }`}>
                <Truck size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {p.count} Parcels 
                    <span className="text-gray-400 font-medium text-sm ml-2">#{p.id}</span>
                  </h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    p.status === 'assigned' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1"><Calendar size={14}/> {p.date}</div>
                  <div className="flex items-center gap-1"><Clock size={14}/> {p.time}</div>
                  <div className="flex items-center gap-1"><MapPin size={14}/> {p.location}</div>
                </div>
              </div>
            </div>

            {/* Right: Rider Info & Action */}
            <div className="mt-4 md:mt-0 flex items-center gap-6">
              {p.rider && (
                <div className="text-right hidden md:block">
                  <p className="text-xs text-gray-400 uppercase font-bold">Assigned Rider</p>
                  <p className="font-bold text-gray-800">{p.rider}</p>
                </div>
              )}
              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Pickup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Schedule New Pickup</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pickup Location</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg">
                  <option>Main Warehouse (Default)</option>
                  <option>Downtown Branch</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                  <input type="date" className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Time Slot</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg">
                    <option>Morning (10am - 12pm)</option>
                    <option>Afternoon (2pm - 4pm)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Estimated Parcel Count</label>
                <input type="number" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="e.g., 20" />
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Notes for Rider</label>
                 <textarea className="w-full p-2 border border-gray-300 rounded-lg" rows={2} placeholder="Gate code, parking info..."></textarea>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={() => { alert('Request Sent!'); setShowModal(false); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Confirm Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantPickups;