import React, { useState } from 'react';
import { Users, Shield, Lock, Search, MoreVertical, Plus, CheckCircle, XCircle } from 'lucide-react';

const AdminUsers = () => {
  const [showAddUser, setShowAddUser] = useState(false);

  // Mock User Data matching RBAC Roles 
  const [users, setUsers] = useState([
    { id: 'U-001', name: 'Admin User', email: 'admin@britium.com', role: 'Super Admin', status: 'active', hub: 'Global' },
    { id: 'U-002', name: 'Kyaw Kyaw', email: 'kyaw@britium.com', role: 'Rider', status: 'active', hub: 'YGN-Downtown' },
    { id: 'U-003', name: 'Su Su', email: 'su@britium.com', role: 'Warehouse Controller', status: 'active', hub: 'YGN-Main' },
    { id: 'U-004', name: 'John Doe', email: 'john@shop.com', role: 'Merchant', status: 'suspended', hub: '-' },
  ]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-blue-600" /> User Management
          </h1>
          <p className="text-gray-500">Manage system access and RBAC roles.</p>
        </div>
        <button 
          onClick={() => setShowAddUser(true)}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow hover:bg-blue-700"
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input type="text" placeholder="Search by name, email or ID..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
           </div>
           <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm">
             <option>All Roles</option>
             <option>Super Admin</option>
             <option>Manager</option>
             <option>Rider</option>
             <option>Merchant</option>
           </select>
        </div>

        {/* User Table */}
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Role [RBAC]</th>
              <th className="px-6 py-4">Assigned Hub</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${
                    u.role === 'Super Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    u.role === 'Rider' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    u.role === 'Merchant' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {u.hub}
                </td>
                <td className="px-6 py-4">
                  {u.status === 'active' ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                      <CheckCircle size={14} /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 text-xs font-bold">
                      <XCircle size={14} /> Suspended
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Full Name</label>
                <input type="text" className="w-full border p-2 rounded" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Email (Login)</label>
                <input type="email" className="w-full border p-2 rounded" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Role</label>
                <select className="w-full border p-2 rounded">
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="warehouse">Warehouse Staff</option>
                  <option value="rider">Rider / Driver</option>
                  <option value="accountant">Accountant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Hub Assignment</label>
                <select className="w-full border p-2 rounded">
                  <option value="YGN-Main">Yangon Main Hub</option>
                  <option value="YGN-DT">Downtown Station</option>
                </select>
              </div>
              <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200 flex items-start gap-2">
                 <Lock size={14} className="mt-0.5 shrink-0"/>
                 <p>A temporary password will be sent to the email address. The user must change it upon first login.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowAddUser(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={() => { alert('User Created'); setShowAddUser(false); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Create Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;