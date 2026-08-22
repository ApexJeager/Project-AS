import React from 'react';
import { useAppContext } from '../../AppContext';
import { getColorGroupClasses } from '../../utils';
import { Users, UserCheck, UserX, BarChart3 } from 'lucide-react';

export default function AdminView() {
  const { activeTab, children, attendances, reports } = useAppContext();

  if (activeTab === 'Overview') {
    const totalKids = children.length;
    const activeKids = children.filter(c => c.status === 'Active').length;
    const today = new Date().toISOString().split('T')[0];
    const todayPresent = attendances.filter(a => a.date === today && a.status === 'Present').length;
    const todayAbsent = attendances.filter(a => a.date === today && a.status === 'Absent').length;

    const groupStats = ['Red', 'Blue', 'Green', 'Yellow'].map(color => {
      return {
        color,
        count: children.filter(c => c.color_group === color).length,
      };
    });

    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Global Overview</h2>
          <p className="text-gray-500 mt-1">High-level metrics across all color groups.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <Users size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500">Total Enrolled</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalKids}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
              <UserCheck size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500">Active Status</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{activeKids}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <BarChart3 size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500">Present Today</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{todayPresent}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-4">
              <UserX size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500">Absent Today</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{todayAbsent}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Group Distribution</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {groupStats.map(stat => (
              <div key={stat.color} className={`p-5 rounded-2xl border ${getColorGroupClasses(stat.color as any)} bg-opacity-50`}>
                <p className="text-sm font-semibold opacity-80 uppercase tracking-wide">{stat.color} Group</p>
                <p className="text-3xl font-bold mt-2">{stat.count} <span className="text-lg font-medium opacity-70">kids</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'Reports') {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Group Reports</h2>
          <p className="text-gray-500 mt-1">Review monthly submissions from group Pilotes.</p>
        </div>

        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getColorGroupClasses(report.color_group)}`}>
                    {report.color_group}
                  </span>
                  <span className="text-gray-500 font-medium">{report.month_year}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  report.status === 'Submitted' ? 'bg-amber-100 text-amber-800' :
                  report.status === 'Reviewed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {report.status}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{report.content}</p>
              {report.status === 'Submitted' && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Mark as Reviewed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'Roster') {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Children Roster</h2>
            <p className="text-gray-500 mt-1">Global directory of all enrolled children.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">First Name</th>
                <th className="px-6 py-4 font-medium">Last Name</th>
                <th className="px-6 py-4 font-medium">Group</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {children.map(child => (
                <tr key={child.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{child.first_name}</td>
                  <td className="px-6 py-4 text-gray-600">{child.last_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getColorGroupClasses(child.color_group)}`}>
                      {child.color_group}
                    </span>
                  </td>
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

  return null;
}
