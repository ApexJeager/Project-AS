import React from 'react';
import { useAppContext } from '../AppContext';
import { getColorGroupClasses, getRoleClasses } from '../utils';
import { ChevronDown, User as UserIcon, LogOut, Settings } from 'lucide-react';

export default function Header() {
  const { currentUser, users, setCurrentUser, setActiveTab } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      // Reset active tab based on role
      if (user.role === 'Dev') setActiveTab('Users');
      else if (user.role === 'Admin') setActiveTab('Overview');
      else setActiveTab('Group Roster');
    }
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          CM
        </div>
        <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Children's Ministry</h1>
      </div>

      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200"
        >
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">{currentUser.name}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleClasses(currentUser.role)}`}>
                {currentUser.role}
              </span>
              {currentUser.color_group && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getColorGroupClasses(currentUser.color_group)}`}>
                  {currentUser.color_group} Group
                </span>
              )}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <UserIcon size={18} />
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100 mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Switch Role (Testing)</p>
            </div>
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleUserChange(user.id)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${currentUser.id === user.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
              >
                <span>{user.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${getRoleClasses(user.role)}`}>{user.role}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
