import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { getColorGroupClasses, getColorGroupDot, getColorGroupLabel, getRoleClasses, getRoleLabel } from '../utils';
import { ChevronDown, Rocket, Check, Sparkles, Shield, UserCircle2, Menu, Lock } from 'lucide-react';
import MobileDrawer from './MobileDrawer';

export default function Header() {
  const { currentUser, users, setCurrentUser, setActiveTab, setIsAiAssistantOpen, lockSession } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'Dev') setActiveTab('Users');
      else if (user.role === 'Admin') setActiveTab('Overview');
      else setActiveTab('Daily Grading');
    }
    setIsDropdownOpen(false);
  };

  return (
    <>
      <header className="bg-zinc-950 border-b border-zinc-800/90 px-3.5 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 text-zinc-100 shadow-xs">
        {/* Brand & Logo + Mobile Drawer Trigger */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 md:hidden transition-colors cursor-pointer"
            aria-label="Ouvrir le menu principal"
          >
            <Menu size={20} />
          </button>

          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-750 flex items-center justify-center text-zinc-100 shadow-2xs shrink-0">
            <Rocket size={17} className="text-zinc-200" />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-zinc-100">
                Astronautes
              </span>
              {currentUser.color_group ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 border border-zinc-800 text-zinc-200">
                  <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(currentUser.color_group)}`} />
                  <span className="hidden xs:inline">Gr.</span> {getColorGroupLabel(currentUser.color_group)}
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-850 text-zinc-300 border border-zinc-750">
                  {currentUser.role}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-normal truncate max-w-[150px] sm:max-w-none">
              Ministère des Enfants
            </span>
          </div>
        </div>

        {/* Header Actions: Lock, AI Assistant & User Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Lock Session Button */}
          <button
            type="button"
            onClick={() => lockSession()}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Verrouiller la session avec code PIN"
          >
            <Lock size={13} className="text-zinc-400" />
            <span className="hidden sm:inline">Verrouiller</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAiAssistantOpen(true)}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 text-amber-400 hover:text-amber-300 border border-zinc-800 hover:border-zinc-700 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Ouvrir l'Assistant IA Astronautes"
          >
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span className="hidden sm:inline text-zinc-200">Assistant IA</span>
          </button>

          {/* User Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all border border-zinc-800 hover:border-zinc-700 cursor-pointer text-left"
            >
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center text-[10px] sm:text-[11px] font-semibold shrink-0">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-medium text-zinc-200 leading-tight">
                  {currentUser.name}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-zinc-400">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className={`text-zinc-400 ml-0.5 sm:ml-1 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 sm:w-76 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 divide-y divide-zinc-800/60">
                <div className="px-3.5 py-1.5 flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Changer de Profil
                  </p>
                  <span className="text-[9px] text-zinc-500 font-mono">Securisé PIN</span>
                </div>

                <div className="py-1 max-h-64 overflow-y-auto">
                  {users.map(user => {
                    const isSelected = currentUser.id === user.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleUserChange(user.id)}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-zinc-800/70 transition-colors cursor-pointer ${
                          isSelected ? 'bg-zinc-800/90 text-zinc-100' : 'text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] font-semibold shrink-0">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-200 truncate">{user.name}</p>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {user.color_group ? `Groupe ${getColorGroupLabel(user.color_group)}` : 'Supervision Globale'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getRoleClasses(user.role)}`}>
                            {user.role}
                          </span>
                          {isSelected && <Check size={14} className="text-zinc-200" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      lockSession();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Lock size={13} />
                    <span>Verrouiller l'écran</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} />
    </>
  );
}


