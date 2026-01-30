import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Map, Package, Truck, Wifi, WifiOff } from 'lucide-react';
import { auth, db } from '../../firebase'; // Adjust path
import { collection, query, where, getDocs } from 'firebase/firestore';

const RiderDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [stats, setStats] = useState({ pending: 0, completed: 0, failed: 0, cod: 0 });

  // Mock fetching KPIs
  useEffect(() => {
    // In production, fetch from Firestore 'tasks' collection where riderId == auth.currentUser.uid
    setStats({ pending: 12, completed: 5, failed: 1, cod: 45000 });
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header & Status */}
      <header className="bg-blue-600 text-white p-4 rounded-b-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold">Hello, {auth.currentUser?.displayName || 'Rider'}</h1>
            <p className="text-sm opacity-90">Zone: Downtown-A</p>
          </div>
          <button onClick={() => navigate('/rider/notifications')} className="relative p-2">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Connectivity & Duty Toggle */}
        <div className="flex justify-between items-center bg-blue-700/50 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi size={18} className="text-green-300"/> : <WifiOff size={18} className="text-red-300"/>}
            <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>
          <button 
            onClick={() => setIsOnDuty(!isOnDuty)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              isOnDuty ? 'bg-green-400 text-green-900' : 'bg-gray-300 text-gray-700'
            }`}
          >
            {isOnDuty ? 'ON DUTY' : 'START ROUTE'}
          </button>
        </div>
      </header>

      {/* 2. KPI Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 -mt-2">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center" onClick={() => navigate('/rider/tasks?filter=pending')}>
          <Package className="text-blue-500 mb-2" />
          <span className="text-2xl font-bold text-gray-800">{stats.pending}</span>
          <span className="text-xs text-gray-500">Pending Tasks</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <Truck className="text-green-500 mb-2" />
          <span className="text-2xl font-bold text-gray-800">{stats.completed}</span>
          <span className="text-xs text-gray-500">Completed</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <span className="text-2xl font-bold text-red-500">{stats.failed}</span>
          <span className="text-xs text-gray-500">Failed/Return</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center" onClick={() => navigate('/rider/wallet')}>
          <span className="text-lg font-bold text-gray-800">{stats.cod.toLocaleString()} Ks</span>
          <span className="text-xs text-gray-500">COD On-Hand</span>
        </div>
      </div>

      {/* 3. Quick Actions */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Today's Route</h3>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-orange-500 mb-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-gray-800">Next Stop: Golden City Condo</h4>
              <p className="text-sm text-gray-500">Delivery • 2.4 km away</p>
            </div>
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">Exp</span>
          </div>
          <button 
            onClick={() => navigate('/rider/map')}
            className="w-full mt-3 bg-gray-900 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Map size={16} /> Navigate
          </button>
        </div>
        
        <button 
          onClick={() => navigate('/rider/tasks')}
          className="w-full py-3 text-blue-600 font-bold bg-blue-50 rounded-xl"
        >
          View Full Task List
        </button>
      </div>
    </div>
  );
};

export default RiderDashboard;