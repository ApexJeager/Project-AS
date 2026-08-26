import React from 'react';
import { useAppContext } from '../AppContext';
import { getColorGroupDot, getColorGroupLabel, getRoleLabel } from '../utils';
import { 
  Users, 
  Database, 
  LayoutDashboard, 
  FileText, 
  Trophy, 
  Rocket, 
  Award,
  CalendarCheck,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function Sidebar() {
  const { currentUser, activeTab, setActiveTab } = useAppContext();

  const getNavItems = () => {
    switch (currentUser.role) {
      case 'Dev':
        return [
          { id: 'Users', icon: Users, label: 'Gestion des Utilisateurs' },
          { id: 'Logs', icon: Database, label: 'Journaux Système & BD' },
          { id: 'Leaderboard', icon: Trophy, label: 'Classement & Rangs' },
        ];
      case 'Admin':
        return [
          { id: 'Overview', icon: LayoutDashboard, label: 'Vue Globale' },
          { id: 'Leaderboard', icon: Trophy, label: 'Classement & Rangs' },
          { id: 'Reports', icon: FileText, label: 'Rapports des Groupes' },
          { id: 'Roster', icon: Users, label: 'Effectif Global des Enfants' },
        ];
      case 'Pilote':
      case 'Co-Pilote':
      case 'Helper':
        return [
          { id: 'Daily Grading', icon: CalendarCheck, label: 'Notation Quotidienne' },
          { id: 'Group Roster', icon: Users, label: 'Effectif & Recrues' },
          { id: 'Leaderboard', icon: Trophy, label: 'Classement & Rangs' },
          { id: 'Report Form', icon: FileText, label: 'Rapport Mensuel' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getPortalTitle = () => {
    if (currentUser.role === 'Dev') return 'Console Développeur';
    if (currentUser.role === 'Admin') return 'Administration';
    return `Groupe ${getColorGroupLabel(currentUser.color_group)}`;
  };

  return (
    <aside className="hidden md:flex w-64 bg-zinc-950/95 backdrop-blur-md border-r border-zinc-800/80 flex-col justify-between h-[calc(100vh-53px)] sticky top-[53px] text-zinc-300 select-none shrink-0">
      <div className="p-4 space-y-6">
        <div>
          <div className="flex items-center justify-between px-3 mb-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {getPortalTitle()}
            </span>
            {currentUser.color_group && (
              <span className={`w-2 h-2 rounded-full ${getColorGroupDot(currentUser.color_group)} shadow-[0_0_8px_currentColor]`} />
            )}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left relative group ${
                    isActive 
                      ? 'bg-gradient-to-r from-zinc-800/90 to-zinc-900/90 text-white shadow-sm border border-zinc-700/60' 
                      : 'text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200'
                  }`}
                >
                  <Icon size={16} className={`transition-colors ${isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info in Sidebar */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/80">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Rôle Actuel</span>
            <span className="font-semibold text-zinc-200">{getRoleLabel(currentUser.role)}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Groupe Assigné</span>
            <span className="font-medium text-zinc-200">
              {currentUser.color_group ? `Groupe ${getColorGroupLabel(currentUser.color_group)}` : 'Supervision Globale'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

