import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, AlertCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

type TaskType = 'pickup' | 'delivery' | 'return';

const RiderTaskList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TaskType>('delivery');

  // Mock Data
  const tasks = [
    { id: 'TX-101', type: 'delivery', name: 'John Doe', address: '123 Sule Pagoda Rd', tags: ['COD', 'Express'], sla: '14:00', status: 'pending' },
    { id: 'TX-102', type: 'delivery', name: 'Tech Store', address: '45 Insein Rd', tags: ['Fragile'], sla: '16:00', status: 'pending' },
    { id: 'TX-205', type: 'pickup', name: 'Fashion Hub', address: 'Junction City Lvl 3', tags: ['Urgent'], sla: '13:30', status: 'pending' },
  ];

  const filteredTasks = tasks.filter(t => t.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h2 className="text-xl font-bold text-center mb-4">Job Queue</h2>
        <div className="flex p-1 bg-gray-100 rounded-lg">
          {(['pickup', 'delivery', 'return'] as TaskType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-bold rounded-md capitalize transition-all ${
                activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {tab}s
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 space-y-3">
        {filteredTasks.map((task) => (
          <div 
            key={task.id}
            onClick={() => navigate(`/rider/job/${task.id}`)}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{task.id}</span>
              <div className="flex gap-1">
                {task.tags.includes('COD') && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">COD</span>}
                {task.tags.includes('Express') && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded">EXP</span>}
                {task.tags.includes('Fragile') && <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">FRG</span>}
              </div>
            </div>

            <h3 className="font-bold text-gray-800 text-lg">{task.name}</h3>
            
            <div className="flex items-start gap-2 mt-1 text-gray-600">
              <MapPin size={16} className="mt-1 shrink-0" />
              <p className="text-sm leading-tight">{task.address}</p>
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
                <Clock size={14} />
                <span>Due: {task.sla}</span>
              </div>
              <span className="text-blue-600 text-sm font-bold flex items-center gap-1">
                View Details {activeTab === 'pickup' ? <ArrowUpCircle size={16}/> : <ArrowDownCircle size={16}/>}
              </span>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p>No {activeTab} tasks remaining.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderTaskList;