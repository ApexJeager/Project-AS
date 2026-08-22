import React from 'react';
import { useAppContext } from '../AppContext';
import { Users, Database, LayoutDashboard, FileText, ClipboardList, CheckSquare } from 'lucide-react';

export default function Sidebar() {
  const { currentUser, activeTab, setActiveTab } = useAppContext();

  const getNavItems = () => {
    switch (currentUser.role) {
      case 'Dev':
        return [
          { id: 'Users', icon: Users, label: 'User Management' },
          { id: 'Logs', icon: Database, label: 'Database Logs' },
        ];
      case 'Admin':
        return [
          { id: 'Overview', icon: LayoutDashboard, label: 'Global Overview' },
          { id: 'Reports', icon: FileText, label: 'Group Reports' },
          { id: 'Roster', icon: Users, label: 'All Children Roster' },
        ];
      case 'Pilote':
      case 'Co-Pilote':
      case 'Helper':
        return [
          { id: 'Group Roster', icon: Users, label: 'Group Roster' },
          { id: 'Attendance', icon: CheckSquare, label: 'Daily Attendance' },
          { id: 'Report Form', icon: ClipboardList, label: 'Monthly Report' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-[calc(100vh-73px)] sticky top-[73px]">
      <div className="p-4 flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
          {currentUser.role === 'Dev' ? 'Developer Portal' : currentUser.role === 'Admin' ? 'Admin Dashboard' : `${currentUser.color_group} Group`}
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-700' : 'text-gray-500'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
