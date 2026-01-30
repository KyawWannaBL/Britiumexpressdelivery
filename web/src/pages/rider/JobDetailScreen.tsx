import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, MessageCircle, Navigation, ChevronLeft, Package, AlertTriangle } from 'lucide-react';

const JobDetailScreen = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Mock Data (In reality, fetch from Firestore using jobId)
  const job = {
    id: jobId,
    type: 'delivery', // or 'pickup'
    customerName: 'Maung Maung',
    phone: '+95912345678',
    address: 'Room 5A, Build 12, Hledan Center, Kamayut Tsp',
    codAmount: 45000,
    slaTime: '14:30',
    notes: 'Doorbell is broken, please call upon arrival.',
    isFragile: true,
  };

  const handleCall = () => window.open(`tel:${job.phone}`);
  const handleMap = () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Nav */}
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2"><ChevronLeft /></button>
        <h1 className="font-bold text-lg ml-2">Job #{job.id}</h1>
      </div>

      {/* Map Placeholder */}
      <div className="h-48 bg-gray-200 w-full relative group">
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          [ Interactive Map View ]
        </div>
        <button 
          onClick={handleMap}
          className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm"
        >
          <Navigation size={16} /> Open Maps
        </button>
      </div>

      {/* Customer Info */}
      <div className="p-5 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">{job.customerName}</h2>
          <p className="text-gray-600 mt-1 leading-snug">{job.address}</p>
          
          <div className="flex gap-3 mt-4">
            <button onClick={handleCall} className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg font-bold flex items-center justify-center gap-2 border border-green-200">
              <Phone size={18} /> Call
            </button>
            <button className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg font-bold flex items-center justify-center gap-2 border border-green-200">
              <MessageCircle size={18} /> SMS
            </button>
          </div>
        </div>

        {/* Parcel Details */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="font-bold text-gray-500 text-sm uppercase mb-3">Shipment Details</h3>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Collect COD</span>
            <span className="font-bold text-lg text-red-600">{job.codAmount.toLocaleString()} Ks</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">SLA Deadline</span>
            <span className="font-bold text-red-500">{job.slaTime}</span>
          </div>

          {job.isFragile && (
            <div className="mt-3 bg-red-50 p-3 rounded-lg flex items-center gap-2 text-red-700 text-sm font-bold border border-red-100">
              <AlertTriangle size={18} />
              Handle with Care: FRAGILE
            </div>
          )}

          {job.notes && (
            <div className="mt-3 bg-yellow-50 p-3 rounded-lg text-yellow-800 text-sm border border-yellow-100">
              " {job.notes} "
            </div>
          )}
        </div>
      </div>

      {/* Action Slider / Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="grid grid-cols-4 gap-2">
          <button 
             onClick={() => navigate(`/rider/exception/${job.id}`)}
             className="col-span-1 bg-red-100 text-red-700 rounded-lg font-bold py-3 flex flex-col items-center justify-center text-xs"
          >
            <AlertTriangle size={20} className="mb-1" />
            Failed
          </button>
          <button 
             onClick={() => navigate(job.type === 'delivery' ? `/rider/delivery-confirm/${job.id}` : `/rider/pickup-confirm/${job.id}`)}
             className="col-span-3 bg-blue-600 text-white rounded-lg font-bold text-lg py-3 shadow-lg active:bg-blue-700"
          >
            {job.type === 'delivery' ? 'CONFIRM DELIVERY' : 'START PICKUP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailScreen;