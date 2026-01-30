import React, { useState } from 'react';
import { ChevronRight, Package, Truck, CreditCard, MapPin, CheckCircle } from 'lucide-react';

const CreateShipment = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    pickupId: '', // Links to addresses table
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    weight: '',
    dims: { l: '', w: '', h: '' },
    serviceType: 'normal', // Matches SQL Enum: 'express','normal','same_day'
    isCod: false,
    codAmount: 0,
    declaredValue: 0,
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Progress Stepper */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0"></div>
          {[
            { id: 1, label: 'Pickup', icon: MapPin },
            { id: 2, label: 'Receiver', icon: Truck },
            { id: 3, label: 'Parcel', icon: Package },
            { id: 4, label: 'Service', icon: CreditCard }
          ].map((s) => (
            <div key={s.id} className={`relative z-10 flex flex-col items-center bg-gray-50 px-4`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors ${step >= s.id ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <s.icon size={18} />
              </div>
              <span className={`text-xs font-bold mt-2 ${step >= s.id ? 'text-blue-600' : 'text-gray-400'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          
          {/* STEP 1: Pickup Details */}
          {step === 1 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Select Pickup Location</h2>
              <div className="grid grid-cols-2 gap-4">
                {['Main Warehouse', 'Downtown Store', 'Home Office'].map((loc) => (
                  <label key={loc} className="border-2 border-gray-100 p-4 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all flex items-start gap-3">
                    <input type="radio" name="pickup" className="mt-1" />
                    <div>
                      <span className="font-bold text-gray-800 block">{loc}</span>
                      <span className="text-sm text-gray-500">123 Merchant Road, Yangon</span>
                    </div>
                  </label>
                ))}
                <button className="border-2 border-dashed border-gray-300 p-4 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2">
                  + Add New Address
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Receiver Details */}
          {step === 2 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Receiver Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" className="w-full p-3 border rounded-lg" placeholder="Maung Maung" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" className="w-full p-3 border rounded-lg" placeholder="09xxxxxxxxx" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
                  <textarea className="w-full p-3 border rounded-lg" rows={3} placeholder="Building, Street, Township..."></textarea>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Parcel Details */}
          {step === 3 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Parcel Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Weight (Kg)</label>
                   <input type="number" className="w-full p-3 border rounded-lg" placeholder="0.5" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Declared Value (MMK)</label>
                   <input type="number" className="w-full p-3 border rounded-lg" placeholder="50000" />
                </div>
                <div className="col-span-2">
                   <label className="block text-sm font-bold text-gray-700 mb-2">Dimensions (cm) - Optional</label>
                   <div className="grid grid-cols-3 gap-4">
                     <input type="number" placeholder="L" className="p-3 border rounded-lg"/>
                     <input type="number" placeholder="W" className="p-3 border rounded-lg"/>
                     <input type="number" placeholder="H" className="p-3 border rounded-lg"/>
                   </div>
                </div>
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" className="w-5 h-5 text-blue-600"/>
                    <span className="font-medium">Fragile</span>
                  </label>
                  <label className="flex items-center gap-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" className="w-5 h-5 text-blue-600"/>
                    <span className="font-medium">Bulky / Oversize</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Service & COD */}
          {step === 4 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Service & Payment</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Service Type</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'normal', label: 'Standard', price: '2,000 Ks', time: '2-3 Days' },
                    { id: 'express', label: 'Express', price: '3,500 Ks', time: 'Next Day' },
                    { id: 'same_day', label: 'Same Day', price: '5,000 Ks', time: 'Today' }
                  ].map((srv) => (
                    <div key={srv.id} className={`border-2 p-4 rounded-xl cursor-pointer transition-all ${formData.serviceType === srv.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`} onClick={() => setFormData({...formData, serviceType: srv.id})}>
                      <span className="font-bold block text-gray-800">{srv.label}</span>
                      <span className="text-xs text-gray-500 block mb-2">{srv.time}</span>
                      <span className="font-bold text-blue-600">{srv.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800 flex items-center gap-2"><CreditCard size={18}/> Cash on Delivery (COD)</span>
                  <input type="checkbox" className="w-5 h-5 toggle-checkbox" checked={formData.isCod} onChange={(e) => setFormData({...formData, isCod: e.target.checked})} />
                </div>
                {formData.isCod && (
                   <div className="mt-3">
                     <label className="text-xs font-bold text-gray-500 uppercase">Amount to Collect</label>
                     <div className="flex items-center mt-1">
                       <input type="number" className="w-full p-2 border border-orange-200 rounded-lg focus:ring-orange-500" placeholder="0" />
                       <span className="ml-2 font-bold text-gray-600">MMK</span>
                     </div>
                   </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            {step > 1 ? (
              <button onClick={prevStep} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Back</button>
            ) : <div></div>}
            
            {step < 4 ? (
              <button onClick={nextStep} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2">
                Next Step <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={() => alert("Shipment Created!")} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-200">
                Confirm & Print Label <CheckCircle size={18} />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateShipment;