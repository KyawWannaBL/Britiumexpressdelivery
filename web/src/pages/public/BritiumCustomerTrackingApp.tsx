import React, { useState } from 'react';
import { Bell, User, Search, Package, Calendar, CalendarPlus, MessageCircle, Check, Truck, MapPin, Home, FileText } from 'lucide-react';

const BritiumCustomerTrackingApp = () => {
  const [activeScreen, setActiveScreen] = useState('home');

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden">
        
        {/* Header */}
        <header className="bg-gradient-to-br from-[#0D47A1] to-[#1976D2] text-white p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-[#0D47A1] font-bold">B</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">Britium Express</h1>
                <p className="text-xs text-blue-100">Hello, John Doe</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="relative p-2 hover:bg-white/20 rounded-full">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
              </button>
              <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="pb-20">
          {activeScreen === 'home' && (
            <>
              {/* Quick Track */}
              <div className="p-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Search className="w-5 h-5 mr-2 text-blue-600" /> Quick Track
                  </h2>
                  <div className="flex space-x-2">
                    <input type="text" placeholder="Enter tracking number" className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={() => setActiveScreen('track')} className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700">
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Deliveries */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Active Deliveries</h2>
                  <button className="text-blue-600 text-sm font-medium">View All</button>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><Package className="w-5 h-5 text-blue-600"/></div>
                        <div><p className="font-semibold text-gray-800">#BE2026001234</p><p className="text-sm text-gray-500">Electronics</p></div>
                      </div>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Out for Delivery</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Est: Today 3:00 PM</span>
                      <button onClick={() => setActiveScreen('track')} className="text-blue-600 font-medium">Track</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4">
                 <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                 <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3"><CalendarPlus className="w-6 h-6 text-blue-600"/></div>
                        <p className="font-semibold text-gray-800">Book Pickup</p>
                    </button>
                    <button className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><MessageCircle className="w-6 h-6 text-green-600"/></div>
                        <p className="font-semibold text-gray-800">Support</p>
                    </button>
                 </div>
              </div>
            </>
          )}

          {activeScreen === 'track' && (
            <div className="p-4 animate-in slide-in-from-right">
                <button onClick={() => setActiveScreen('home')} className="mb-4 text-sm text-blue-600 font-medium">&larr; Back to Home</button>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><Package className="w-8 h-8 text-blue-600"/></div>
                        <h2 className="text-xl font-bold text-gray-800">#BE2026001234</h2>
                        <p className="text-gray-500">Electronics Package</p>
                    </div>
                     <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex justify-between items-center">
                         <div><p className="font-semibold text-green-800">Out for Delivery</p><p className="text-sm text-green-600">Today 3:00 PM</p></div>
                         <Truck className="w-6 h-6 text-green-600" />
                     </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-6">Delivery Timeline</h3>
                    <div className="space-y-6 relative pl-4 border-l-2 border-gray-200">
                        <div className="relative pl-6">
                             <div className="absolute -left-[21px] top-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-white"><Check className="w-4 h-4"/></div>
                             <p className="font-semibold text-gray-800">Picked Up</p>
                             <p className="text-xs text-gray-400">Today, 9:30 AM</p>
                        </div>
                        <div className="relative pl-6">
                             <div className="absolute -left-[21px] top-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-white animate-pulse"><Truck className="w-4 h-4"/></div>
                             <p className="font-semibold text-gray-800">Out for Delivery</p>
                             <p className="text-sm text-gray-500">Rider Aung Kyaw is on the way</p>
                             <p className="text-xs text-gray-400">Today, 2:00 PM</p>
                        </div>
                        <div className="relative pl-6">
                             <div className="absolute -left-[21px] top-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 border-4 border-white"><Home className="w-4 h-4"/></div>
                             <p className="font-semibold text-gray-400">Delivered</p>
                             <p className="text-xs text-gray-400">Expected 3:00 PM</p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </main>

        {/* Bottom Nav */}
        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 p-4 flex justify-around items-center">
            <button onClick={() => setActiveScreen('home')} className={`flex flex-col items-center ${activeScreen === 'home' ? 'text-blue-600' : 'text-gray-400'}`}>
                <Home className="w-6 h-6" />
                <span className="text-xs mt-1">Home</span>
            </button>
            <button className="flex flex-col items-center text-gray-400">
                <Search className="w-6 h-6" />
                <span className="text-xs mt-1">Track</span>
            </button>
            <button className="flex flex-col items-center text-gray-400">
                <FileText className="w-6 h-6" />
                <span className="text-xs mt-1">History</span>
            </button>
            <button className="flex flex-col items-center text-gray-400">
                <User className="w-6 h-6" />
                <span className="text-xs mt-1">Profile</span>
            </button>
        </nav>
      </div>
    </div>
  );
};

export default BritiumCustomerTrackingApp;