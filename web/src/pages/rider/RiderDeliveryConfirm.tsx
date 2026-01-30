import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, PenTool, DollarSign, ChevronLeft, Check } from 'lucide-react';

const RiderDeliveryConfirm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // Mock Data
  const requiredCOD = 45000;
  
  // State
  const [codCollected, setCodCollected] = useState(false);
  const [signature, setSignature] = useState<boolean>(false); // In real app, store base64 string
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSign = () => {
    // In production, open a Modal with react-signature-canvas
    const signed = window.confirm("Simulate Customer Signature?");
    if (signed) setSignature(true);
  };

  const canComplete = codCollected && (signature || photo);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 shadow-sm flex items-center mb-4">
        <button onClick={() => navigate(-1)}><ChevronLeft /></button>
        <h1 className="font-bold text-lg ml-4">Confirm Delivery</h1>
      </div>

      <div className="p-4 space-y-6">
        
        {/* 1. Cash Collection (Critical) */}
        {requiredCOD > 0 && (
          <div className="bg-red-50 border border-red-100 p-5 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-red-700 font-bold">
                <DollarSign />
                <span>Collect Cash</span>
              </div>
              <span className="text-2xl font-bold text-red-800">{requiredCOD.toLocaleString()} Ks</span>
            </div>
            
            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 cursor-pointer">
              <input 
                type="checkbox" 
                checked={codCollected} 
                onChange={() => setCodCollected(!codCollected)}
                className="w-6 h-6 text-red-600 rounded focus:ring-red-500" 
              />
              <span className="font-medium text-gray-800">I have collected the full amount</span>
            </label>
          </div>
        )}

        {/* 2. Proof of Delivery (Tabs) */}
        <div>
          <h3 className="font-bold text-gray-700 mb-3">Proof of Delivery</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Signature Input */}
            <div 
              onClick={handleSign}
              className={`h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                signature ? 'bg-green-50 border-green-500' : 'bg-white border-gray-300'
              }`}
            >
              {signature ? (
                <>
                  <Check size={32} className="text-green-600 mb-1" />
                  <span className="text-green-700 font-bold text-sm">SIGNED</span>
                </>
              ) : (
                <>
                  <PenTool size={24} className="text-gray-400 mb-2" />
                  <span className="text-gray-500 text-xs font-bold">GET SIGNATURE</span>
                </>
              )}
            </div>

            {/* Photo Input */}
            <label className={`h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative ${
                photo ? 'bg-green-50 border-green-500' : 'bg-white border-gray-300'
            }`}>
              {photo ? (
                <img src={photo} alt="Proof" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              ) : (
                <>
                  <Camera size={24} className="text-gray-400 mb-2" />
                  <span className="text-gray-500 text-xs font-bold">TAKE PHOTO</span>
                </>
              )}
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Either Signature or Photo is required.</p>
        </div>
      </div>

      {/* Swipe/Button to Complete */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg border-t">
        <button 
          disabled={!canComplete}
          onClick={() => {
            alert("Job Completed! Cash balance updated.");
            navigate('/rider/dashboard');
          }}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 ${
            canComplete ? 'bg-green-600 text-white active:bg-green-700' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {canComplete ? <Check /> : null}
          COMPLETE DELIVERY
        </button>
      </div>
    </div>
  );
};

export default RiderDeliveryConfirm;