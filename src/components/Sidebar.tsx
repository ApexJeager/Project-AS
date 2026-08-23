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
    <aside className="hidden md:flex w-60 bg-zinc-950 border-r border-zinc-850 flex-col justify-between h-[calc(100vh-53px)] sticky top-[53px] text-zinc-300 select-none shrink-0">
      <div className="p-3.5 space-y-6">
        <div>
          <div className="flex items-center justify-between px-2.5 mb-2">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              {getPortalTitle()}
            </span>
            {currentUser.color_group && (
              <span className={`w-2 h-2 rounded-full ${getColorGroupDot(currentUser.color_group)}`} />
            )}
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-left ${
                    isActive 
                      ? 'bg-zinc-800 text-zinc-50 font-semibold shadow-2xs border border-zinc-700/60' 
                      : 'text-zinc-400 hover:bg-zinc-900/90 hover:text-zinc-200'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-zinc-100' : 'text-zinc-400'} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info in Sidebar */}
      <div className="p-3.5 border-t border-zinc-900 bg-zinc-950/60">
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-400">Rôle Actuel</span>
            <span className="font-semibold text-zinc-300">{getRoleLabel(currentUser.role)}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-400">Groupe</span>
            <span className="font-medium text-zinc-300">
              {currentUser.color_group ? getColorGroupLabel(currentUser.color_group) : 'Global'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

