import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { getColorGroupDot, getColorGroupLabel } from '../utils';
import { 
  CalendarCheck, 
  Users, 
  Trophy, 
  Sparkles, 
  Menu, 
  LayoutDashboard, 
  Database,
  FileText,
  X
} from 'lucide-react';
import MobileDrawer from './MobileDrawer';

export default function MobileNavBar() {
  const { currentUser, activeTab, setActiveTab, isAiAssistantOpen, setIsAiAssistantOpen } = useAppContext();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getNavItems = () => {
    switch (currentUser.role) {
      case 'Dev':
        return [
          { id: 'Users', icon: Users, label: 'Utilisateurs' },
          { id: 'Logs', icon: Database, label: 'BD & Logs' },
          { id: 'Leaderboard', icon: Trophy, label: 'Rangs' },
        ];
      case 'Admin':
        return [
          { id: 'Overview', icon: LayoutDashboard, label: 'Aperçu' },
          { id: 'Roster', icon: Users, label: 'Effectif' },
          { id: 'Leaderboard', icon: Trophy, label: 'Rangs' },
        ];
      case 'Pilote':
      case 'Co-Pilote':
      case 'Helper':
      default:
        return [
          { id: 'Daily Grading', icon: CalendarCheck, label: 'Notation' },
          { id: 'Group Roster', icon: Users, label: 'Effectif' },
          { id: 'Leaderboard', icon: Trophy, label: 'Rangs' },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Sticky Bottom Navigation Bar (Visible only on mobile < md) */}
      <nav 
        id="mobile-bottom-nav" 
        className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/90 text-zinc-400 md:hidden pb-safe shadow-lg"
      >
        <div className="grid grid-cols-5 min-h-16 items-center px-1 pb-0.5">
          {/* Main 3 Tabs */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isAiAssistantOpen;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isAiAssistantOpen) setIsAiAssistantOpen(false);
                }}
                className={`flex flex-col items-center justify-center h-full py-1 px-0.5 relative transition-colors cursor-pointer ${
                  isActive ? 'text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className={`relative p-1 rounded-lg transition-transform ${isActive ? 'scale-110 bg-zinc-850' : ''}`}>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-zinc-400'} />
                </div>
                <span className={`text-[10px] font-medium tracking-tight mt-0.5 truncate max-w-full ${isActive ? 'text-white font-semibold' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}

          {/* AI Assistant Quick Toggle */}
          <button
            type="button"
            onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
            aria-label="Ouvrir l’assistant IA"
            className={`flex min-h-14 flex-col items-center justify-center h-full py-1 px-0.5 relative transition-colors cursor-pointer ${
              isAiAssistantOpen ? 'text-amber-400' : 'text-zinc-400 hover:text-amber-300'
            }`}
          >
            <div className={`relative p-1 rounded-lg transition-transform ${isAiAssistantOpen ? 'scale-110 bg-amber-950/60 border border-amber-500/40' : ''}`}>
              <Sparkles size={18} className={isAiAssistantOpen ? 'text-amber-400' : 'text-zinc-400'} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse ring-1 ring-zinc-950" />
            </div>
            <span className={`text-[10px] font-medium tracking-tight mt-0.5 truncate max-w-full ${isAiAssistantOpen ? 'text-amber-300 font-semibold' : ''}`}>
              IA
            </span>
            {isAiAssistantOpen && (
              <span className="absolute top-0 w-8 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          {/* More / Menu Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Ouvrir le menu"
            className={`flex min-h-14 flex-col items-center justify-center h-full py-1 px-0.5 relative transition-colors cursor-pointer ${
              isDrawerOpen ? 'text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="p-1 rounded-lg">
              <Menu size={18} className="text-zinc-400" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5 truncate max-w-full">
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-out Mobile Navigation Drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
