import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Truck, Settings, LogOut, Globe, Phone, ChevronRight, Shield } from 'lucide-react';
import { auth } from '../../firebase'; // Mock import

const RiderProfile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Profile Header */}
      <div className="bg-white p-6 pt-10 flex flex-col items-center border-b border-gray-200">
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 overflow-hidden border-4 border-white shadow-lg">
          <img src="https://ui-avatars.com/api/?name=Kyaw+Kyaw&background=0D8ABC&color=fff" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Kyaw Kyaw</h1>
        <p className="text-gray-500 text-sm">ID: RIDER-MM-0042</p>
        
        <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">4.8 ★</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">Senior Rider</span>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="p-4 space-y-4">
        
        {/* Vehicle Info */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 text-sm">Vehicle Details</div>
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Truck className="text-blue-500" />
                    <div>
                        <p className="font-bold text-gray-800">Honda Click 125i</p>
                        <p className="text-sm text-gray-500">YGN-12345</p>
                    </div>
                </div>
                <button className="text-blue-600 text-sm font-bold">Edit</button>
            </div>
        </section>

        {/* General Settings */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 text-sm">App Settings</div>
            
            <button className="w-full p-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50">
                <div className="flex items-center gap-3 text-gray-700">
                    <Globe size={20} />
                    <span>Language</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    English <ChevronRight size={16} />
                </div>
            </button>
            
            <button className="w-full p-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50">
                <div className="flex items-center gap-3 text-gray-700">
                    <Shield size={20} />
                    <span>Privacy & Security</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
            </button>

             <button className="w-full p-4 flex items-center justify-between active:bg-gray-50">
                <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={20} />
                    <span>Dispatcher Support</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
            </button>
        </section>

        {/* Logout */}
        <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-red-100 mt-4 active:bg-red-100 transition-colors"
        >
            <LogOut size={20} />
            Log Out
        </button>

        <p className="text-center text-gray-400 text-xs mt-4">App Version 2.0.1 (Build 405)</p>
      </div>
    </div>
  );
};

export default RiderProfile;