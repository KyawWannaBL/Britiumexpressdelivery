import React, { useState } from 'react';
import { UploadCloud, FileText, AlertTriangle, Check, X } from 'lucide-react';

const BulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Mock Validation Results
  const [rows, setRows] = useState([
    { row: 1, receiver: 'Kyaw Kyaw', phone: '0912345678', address: 'Yangon', status: 'valid' },
    { row: 2, receiver: 'Su Su', phone: '0987654321', address: 'Mandalay', status: 'valid' },
    { row: 3, receiver: 'Aung Aung', phone: '123', address: '', status: 'error', msg: 'Invalid Phone & Missing Address' },
  ]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    // Simulate parsing delay
    setTimeout(() => { setAnalyzing(false); setFile(new File([""], "orders.csv")); }, 1500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bulk Order Upload</h1>
      
      {/* 1. Upload Zone */}
      {!file && (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer group"
        >
          <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <UploadCloud size={40} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Drag & Drop CSV / Excel file</h3>
          <p className="text-gray-500 mt-2">or <span className="text-blue-600 underline">browse computer</span></p>
          <button className="mt-8 text-sm font-bold text-gray-400 flex items-center justify-center gap-2 mx-auto hover:text-gray-600">
            <FileText size={16} /> Download Template
          </button>
        </div>
      )}

      {/* 2. Validation Table */}
      {file && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Validation Results</h3>
              <p className="text-sm text-gray-500">2 Valid, 1 Error found.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFile(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Re-upload</button>
              <button disabled={rows.some(r => r.status === 'error')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed">
                Create Shipments
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="p-4">Row</th>
                  <th className="p-4">Receiver</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Address</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.row} className={r.status === 'error' ? 'bg-red-50' : 'bg-white'}>
                    <td className="p-4 text-gray-500 font-mono">#{r.row}</td>
                    <td className="p-4 font-medium">{r.receiver}</td>
                    <td className="p-4">{r.phone}</td>
                    <td className="p-4 text-gray-500 truncate max-w-xs">{r.address || '-'}</td>
                    <td className="p-4 text-center">
                      {r.status === 'valid' ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded-full"><Check size={12}/> Valid</span>
                      ) : (
                        <div className="group relative inline-block">
                           <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded-full cursor-help"><AlertTriangle size={12}/> Error</span>
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block">
                             {r.msg}
                           </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;