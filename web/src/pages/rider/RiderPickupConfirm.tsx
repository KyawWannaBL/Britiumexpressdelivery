import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Scan, CheckCircle, ChevronLeft, Package } from 'lucide-react';

const RiderPickupConfirm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // Mock State
  const [items, setItems] = useState([
    { id: '101', name: 'Shoe Box (Nike)', scanned: false },
    { id: '102', name: 'Accessory Bag', scanned: false },
  ]);
  const [photoProof, setPhotoProof] = useState<string | null>(null);

  const handleScan = () => {
    // Integration Point: Connect react-qr-reader or Html5QrcodeScanner here
    // For now, we simulate scanning the first unscanned item
    const nextIndex = items.findIndex(i => !i.scanned);
    if (nextIndex !== -1) {
      const newItems = [...items];
      newItems[nextIndex].scanned = true;
      setItems(newItems);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoProof(URL.createObjectURL(e.target.files[0]));
    }
  };

  const allScanned = items.every(i => i.scanned);
  const canSubmit = allScanned && photoProof;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center">
        <button onClick={() => navigate(-1)}><ChevronLeft /></button>
        <h1 className="font-bold text-lg ml-4">Pickup Verification</h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* 1. Scan Section */}
        <div className="bg-blue-900 text-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold">{items.filter(i => i.scanned).length} / {items.length}</h2>
            <p className="opacity-80 text-sm">Items Scanned</p>
          </div>
          
          <button 
            onClick={handleScan}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Scan size={24} />
            {allScanned ? 'SCAN COMPLETE' : 'TAP TO SCAN BARCODE'}
          </button>
        </div>

        {/* 2. Item Checklist */}
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700">Manifest</h3>
          {items.map((item) => (
            <div key={item.id} className={`p-4 rounded-xl border flex items-center justify-between ${item.scanned ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <Package className={item.scanned ? 'text-green-600' : 'text-gray-400'} size={20} />
                <span className={item.scanned ? 'text-green-900 font-medium' : 'text-gray-600'}>{item.name}</span>
              </div>
              {item.scanned && <CheckCircle className="text-green-500" size={20} />}
            </div>
          ))}
        </div>

        {/* 3. Proof Photo */}
        <div>
          <h3 className="font-bold text-gray-700 mb-2">Pickup Proof</h3>
          <label className="block w-full aspect-video bg-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden">
            {photoProof ? (
              <img src={photoProof} alt="Proof" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="text-gray-500 flex flex-col items-center">
                <Camera size={32} className="mb-2" />
                <span className="text-xs font-bold">TAKE PHOTO OF ITEMS</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
          </label>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 bg-white shadow-lg border-t">
        <button 
          disabled={!canSubmit}
          onClick={() => {
            // TODO: Update Firestore status to 'in_transit'
            navigate('/rider/dashboard');
          }}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-md ${
            canSubmit ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          CONFIRM PICKUP
        </button>
      </div>
    </div>
  );
};

export default RiderPickupConfirm;