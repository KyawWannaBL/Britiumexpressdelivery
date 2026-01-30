import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Camera, X } from 'lucide-react';

const RiderException = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const reasons = [
    'Customer Unavailable',
    'Wrong Address',
    'Customer Refused Item',
    'Shop/Office Closed',
    'Cannot Contact',
    'Bad Weather'
  ];

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const handleSubmit = () => {
    // TODO: Update Firestore with status 'failed' and reschedule logic
    alert(`Task marked as failed: ${selectedReason}`);
    navigate('/rider/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle /> Failed Job
        </h1>
        <button onClick={() => navigate(-1)} className="bg-gray-200 p-2 rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {/* 1. Reason Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Select Reason</label>
          <div className="grid grid-cols-2 gap-3">
            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedReason(r)}
                className={`p-3 rounded-lg text-sm font-bold border transition-all ${
                  selectedReason === r 
                    ? 'bg-red-600 text-white border-red-600 shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Photo Proof (Conditional/Optional) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Proof (Optional but Recommended)</label>
          <label className="w-full h-32 bg-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative">
             {photo ? (
               <img src={photo} alt="Proof" className="absolute inset-0 w-full h-full object-cover" />
             ) : (
               <div className="text-gray-500 flex flex-col items-center">
                 <Camera size={24} className="mb-2" />
                 <span className="text-xs">Take Photo of Location</span>
               </div>
             )}
             <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files && setPhoto(URL.createObjectURL(e.target.files[0]))} className="hidden" />
          </label>
        </div>

        {/* 3. Notes */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes</label>
          <textarea 
            className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
            rows={3}
            placeholder="E.g., Called 3 times, neighbor said they moved..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          disabled={!selectedReason}
          onClick={handleSubmit}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg mt-4 ${
            selectedReason ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-500'
          }`}
        >
          SUBMIT REPORT
        </button>
      </div>
    </div>
  );
};

export default RiderException;