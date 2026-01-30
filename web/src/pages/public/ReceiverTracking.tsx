import React, { useState } from 'react';
import { Truck, MapPin, Calendar, Box, ChevronRight, Clock, ShieldCheck } from 'lucide-react';

const ReceiverTracking = () => {
  const [showReschedule, setShowReschedule] = useState(false);
  
  const events = [
    { status: 'Out for Delivery', time: '10:30 AM', date: 'Today', active: true, desc: 'Rider Kyaw Kyaw is on the way.' },
    { status: 'Arrived at Hub', time: '08:15 AM', date: 'Today', active: false },
    { status: 'Picked Up', time: '04:00 PM', date: 'Yesterday', active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header Map Placeholder */}
      <div className="h-64 bg-blue-900 relative">
        <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Yangon_map.png')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 to-transparent pt-20">
          <div className="bg-white rounded-xl shadow-lg p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Estimated Delivery</span>
              <h1 className="text-2xl font-extrabold text-gray-900">Today, 2:00 PM</h1>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Truck size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Timeline */}
      <div className="px-6 py-4">
        <h2 className="font-bold text-gray-800 mb-4">Tracking History</h2>
        <div className="space-y-6 pl-2 border-l-2 border-gray-200 ml-2">
          {events.map((e, i) => (
            <div key={i} className="relative pl-6">
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${e.active ? 'bg-green-500 ring-4 ring-green-100' : 'bg-gray-300'}`}></div>
              <h3 className={`font-bold ${e.active ? 'text-green-700' : 'text-gray-700'}`}>{e.status}</h3>
              <p className="text-xs text-gray-400">{e.date} • {e.time}</p>
              {e.desc && <p className="text-sm text-gray-600 mt-1 bg-gray-100 p-2 rounded">{e.desc}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Receiver Actions */}
      <div className="px-6 mt-4">
        <h2 className="font-bold text-gray-800 mb-3">Delivery Preferences</h2>
        <div className="grid gap-3">
          <button 
            onClick={() => setShowReschedule(true)}
            className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Calendar size={20}/></div>
              <div className="text-left">
                <span className="block font-bold text-gray-800 text-sm">Reschedule Delivery</span>
                <span className="block text-xs text-gray-500">Not home today? Change date.</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400"/>
          </button>

          <button className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><MapPin size={20}/></div>
              <div className="text-left">
                <span className="block font-bold text-gray-800 text-sm">Redirect Package</span>
                <span className="block text-xs text-gray-500">Change delivery address.</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400"/>
          </button>
          
           <button className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg"><ShieldCheck size={20}/></div>
              <div className="text-left">
                <span className="block font-bold text-gray-800 text-sm">Leave with Neighbor / Guard</span>
                <span className="block text-xs text-gray-500">Safe drop instructions.</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400"/>
          </button>
        </div>
      </div>

      {/* OTP Reschedule Modal (Mock) */}
      {showReschedule && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-96 p-6 rounded-t-2xl sm:rounded-2xl animate-in slide-in-from-bottom">
            <h3 className="font-bold text-lg mb-2">Verify Identity</h3>
            <p className="text-sm text-gray-500 mb-4">We will send an OTP to 09****678 to verify you are the owner.</p>
            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mb-3">Send OTP</button>
            <button onClick={() => setShowReschedule(false)} className="w-full text-gray-500 font-bold py-3">Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReceiverTracking;