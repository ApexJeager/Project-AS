import React from 'react';
import { useAppContext } from '../../AppContext';
import { getColorGroupClasses } from '../../utils';
import { Check, X } from 'lucide-react';

export default function TeamView() {
  const { activeTab, currentUser, children, attendances, reports } = useAppContext();
  const groupColor = currentUser.color_group;

  if (!groupColor) return <div className="p-8">Error: No group assigned.</div>;

  const groupChildren = children.filter(c => c.color_group === groupColor);
  const today = new Date().toISOString().split('T')[0];

  if (activeTab === 'Group Roster') {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className={`p-8 rounded-2xl border-2 ${getColorGroupClasses(groupColor)} shadow-sm`}>
          <h2 className="text-3xl font-bold">{groupColor} Group Roster</h2>
          <p className="mt-2 opacity-80">View and manage children assigned to your group.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">First Name</th>
                <th className="px-6 py-4 font-medium">Last Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groupChildren.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">No children in this group yet.</td>
                </tr>
              ) : groupChildren.map(child => (
                <tr key={child.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{child.first_name}</td>
                  <td className="px-6 py-4 text-gray-600">{child.last_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      child.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {child.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === 'Attendance') {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Attendance</h2>
          <p className="text-gray-500 mt-1">Mark attendance for today: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {groupChildren.map(child => {
              const record = attendances.find(a => a.child_id === child.id && a.date === today);
              const isPresent = record?.status === 'Present';
              const isAbsent = record?.status === 'Absent';

              return (
                <div key={child.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{child.first_name} {child.last_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isPresent ? 'bg-green-100 text-green-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}>
                      <Check size={16} /> Present
                    </button>
                    <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isAbsent ? 'bg-red-100 text-red-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}>
                      <X size={16} /> Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'Report Form') {
    const latestReport = reports.find(r => r.color_group === groupColor);
    
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monthly Report</h2>
          <p className="text-gray-500 mt-1">Submit your summary for the month.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Content</label>
          <textarea 
            className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 resize-none"
            placeholder="Describe this month's activities, behavior, and highlights..."
            defaultValue={latestReport?.content || ''}
          ></textarea>
          
          <div className="mt-6 flex items-center justify-end gap-3">
            <button className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors">
              Save Draft
            </button>
            <button className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${getColorGroupClasses(groupColor).split(' ')[0].replace('100', '600')} hover:opacity-90`}>
              Submit Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
