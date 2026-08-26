import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { getColorGroupClasses, getColorGroupDot, getColorGroupLabel, getRoleClasses, getRoleLabel } from '../utils';
import { ChevronDown, Rocket, Check, Sparkles, Shield, UserCircle2, Menu, Lock } from 'lucide-react';
import MobileDrawer from './MobileDrawer';

export default function Header() {
  const { currentUser, users, setIsAiAssistantOpen, lockSession } = useAppContext();
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

  // Secure profile switch requiring target user PIN
  const handleSecureProfileSwitch = (targetUserId: string) => {
    setIsDropdownOpen(false);
    const target = users.find(u => u.id === targetUserId);
    const targetName = target ? target.name : 'l\'utilisateur';
    lockSession(targetUserId, `Authentification requise pour basculer sur le profil ${targetName}.`);
  };

  return (
    <>
      <header className="bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 text-zinc-100 shadow-sm max-w-full overflow-x-hidden">
        {/* Brand & Logo + Mobile Drawer Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger button with 44px min touch target */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 md:hidden transition-colors cursor-pointer shrink-0 active:scale-95"
            aria-label="Ouvrir le menu principal"
          >
            <Menu size={20} />
          </button>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/70 flex items-center justify-center text-zinc-100 shadow-inner shrink-0 relative group">
            <Rocket size={16} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] transition-transform group-hover:scale-110 duration-200" />
          </div>
          
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm sm:text-base font-bold tracking-tight text-white truncate">
                Astronautes
              </span>
              {currentUser.color_group ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-900/90 border border-zinc-750 text-zinc-200 shrink-0 shadow-xs">
                  <span className={`w-2 h-2 rounded-full ${getColorGroupDot(currentUser.color_group)} shadow-[0_0_6px_currentColor]`} />
                  <span className="hidden xs:inline text-zinc-400">Groupe</span> {getColorGroupLabel(currentUser.color_group)}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 shrink-0 shadow-xs">
                  {currentUser.role}
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium truncate hidden sm:block tracking-wide">
              Ministère des Enfants • Centre de Commandement
            </span>
          </div>
        </div>

        {/* Header Actions: Lock, AI Assistant & User Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Lock Session Button */}
          <button
            type="button"
            onClick={() => lockSession(undefined, "Session verrouillée manuellement.")}
            className="flex items-center justify-center gap-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 min-h-[36px]"
            title="Verrouiller la session avec code PIN"
            aria-label="Verrouiller la session"
          >
            <Lock size={14} className="text-zinc-400" />
            <span className="hidden md:inline">Verrouiller</span>
          </button>

          {/* AI Assistant Button with ambient gold micro-glow */}
          <button
            type="button"
            onClick={() => setIsAiAssistantOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-b from-amber-500/15 to-amber-950/30 hover:from-amber-500/25 hover:to-amber-950/40 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/50 p-2 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs glow-amber-subtle min-h-[36px] active:scale-95"
            title="Ouvrir l'Assistant IA Astronautes"
            aria-label="Assistant IA"
          >
            <Sparkles size={14} className="text-amber-400 shrink-0 animate-pulse" />
            <span className="hidden md:inline font-medium">Assistant IA</span>
          </button>

          {/* User Switcher Dropdown with Strict PIN Gate */}
          <div className="relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 p-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-all border border-zinc-800 hover:border-zinc-700 cursor-pointer text-left min-h-[36px] active:scale-95"
            >
              <div className="w-6.5 h-6.5 rounded-lg bg-zinc-800 border border-zinc-700 text-amber-300 flex items-center justify-center text-[10px] sm:text-[11px] font-bold shadow-inner shrink-0">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-semibold text-zinc-200 leading-tight">
                  {currentUser.name}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-zinc-400">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 divide-y divide-zinc-800/60">
                <div className="px-3.5 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                      Changer de Profil
                    </p>
                    <p className="text-[10px] text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                      <Lock size={10} />
                      <span>Code PIN requis pour chaque profil</span>
                    </p>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${getRoleClasses(currentUser.role)}`}>
                    Actuel : {currentUser.role}
                  </span>
                </div>

                <div className="py-1 max-h-64 overflow-y-auto">
                  {users.map(user => {
                    const isSelected = currentUser.id === user.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSecureProfileSwitch(user.id)}
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
                          {isSelected ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Lock size={12} className="text-zinc-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      lockSession(undefined, "Session verrouillée. Entrez le code PIN pour vous reconnecter.");
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white transition-colors cursor-pointer border border-zinc-700"
                  >
                    <Lock size={13} className="text-amber-400" />
                    <span>Verrouiller / Déconnexion</span>
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


