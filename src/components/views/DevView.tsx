import React from 'react';
import { useAppContext } from '../../AppContext';
import { getRoleClasses, getColorGroupClasses } from '../../utils';
import { Shield, Key, Database, RefreshCw } from 'lucide-react';

export default function DevView() {
  const { activeTab, users } = useAppContext();

  if (activeTab === 'Users') {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-500 mt-1">Manage platform access, roles, and group assignments.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Add New User
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Color Group</th>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleClasses(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.color_group ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getColorGroupClasses(user.color_group)}`}>
                        {user.color_group}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.id}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === 'Logs') {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Database & System Logs</h2>
            <p className="text-gray-500 mt-1">System-level events and database configuration.</p>
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <RefreshCw size={16} />
            Refresh Logs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Security Policies</h3>
              <p className="text-sm text-gray-500 mt-1">RBAC rules active and enforced.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Database Status</h3>
              <p className="text-sm text-gray-500 mt-1">Connected. 24ms ping.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Key size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">API Keys</h3>
              <p className="text-sm text-gray-500 mt-1">All secrets injected.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-gray-300 h-96 overflow-y-auto">
          <div className="text-green-400">[2026-08-22 09:00:12] SYSTEM: Initialized roles and permissions.</div>
          <div className="text-gray-400">[2026-08-22 09:01:45] DB: Synced 8 child records.</div>
          <div className="text-gray-400">[2026-08-22 09:02:10] AUTH: User u1 (Dev David) authenticated.</div>
          <div className="text-gray-400">[2026-08-22 09:05:33] AUTH: User u3 (Pilote Peter) authenticated.</div>
          <div className="text-blue-400">[2026-08-22 09:06:01] DB: Attendance record a1 created.</div>
          <div className="text-blue-400">[2026-08-22 09:06:05] DB: Attendance record a2 created.</div>
        </div>
      </div>
    );
  }

  return null;
}
