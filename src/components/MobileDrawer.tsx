import React from 'react';
import { useAppContext } from '../AppContext';
import { getColorGroupClasses, getColorGroupDot, getColorGroupLabel, getRoleClasses, getRoleLabel } from '../utils';
import { 
  X, 
  UserCircle2, 
  Check, 
  CalendarCheck, 
  Users, 
  Trophy, 
  FileText, 
  Database, 
  Sparkles, 
  RotateCcw, 
  BookOpen, 
  Shield, 
  LayoutDashboard,
  Rocket,
  Lock,
  KeyRound
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { 
    currentUser, 
    users, 
    activeTab, 
    setActiveTab, 
    setIsAiAssistantOpen,
    resetDatabase,
    lockSession,
  } = useAppContext();

  if (!isOpen) return null;

  const handleUserChange = (userId: string) => {
    onClose();
    const target = users.find(u => u.id === userId);
    const targetName = target ? target.name : 'l\'utilisateur';
    lockSession(userId, `Authentification PIN requise pour basculer sur le profil ${targetName}.`);
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  const handleOpenAi = () => {
    setIsAiAssistantOpen(true);
    onClose();
  };

  const handleLockSession = () => {
    onClose();
    lockSession(undefined, "Session verrouillée manuellement.");
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser toutes les données aux valeurs par défaut ?')) {
      resetDatabase();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative ml-auto w-[85%] max-w-sm bg-zinc-950 text-zinc-100 h-full shadow-2xl border-l border-zinc-800 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250 z-10">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-750 flex items-center justify-center text-zinc-100">
              <Rocket size={16} className="text-zinc-200" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white leading-tight">Astronautes</h3>
              <p className="text-[10px] text-zinc-400">Ministère des Enfants</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 space-y-5 flex-1">
          
          {/* Active User Card */}
          <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-zinc-800/90 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              <span>Profil Actif</span>
              <span className={`px-1.5 py-0.5 rounded ${getRoleClasses(currentUser.role)}`}>
                {currentUser.role}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-zinc-100 truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-zinc-400">
                    {getRoleLabel(currentUser.role)}
                  </span>
                  {currentUser.color_group && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(currentUser.color_group)}`} />
                      {getColorGroupLabel(currentUser.color_group)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-1 mb-2">
              Navigation Rapide
            </p>

            {currentUser.role !== 'Dev' && currentUser.role !== 'Admin' && (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectTab('Daily Grading')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'Daily Grading' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <CalendarCheck size={16} className="text-zinc-400" />
                  <span>Feuille de Notation & Présences</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab('Group Roster')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'Group Roster' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <Users size={16} className="text-zinc-400" />
                  <span>Effectif du Groupe & Recrues</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab('Report Form')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'Report Form' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <FileText size={16} className="text-zinc-400" />
                  <span>Rapport Mensuel de Groupe</span>
                </button>
              </>
            )}

            {currentUser.role === 'Admin' && (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectTab('Overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'Overview' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <LayoutDashboard size={16} className="text-zinc-400" />
                  <span>Vue d'Ensemble Globale</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab('Roster')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'Roster' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <Users size={16} className="text-zinc-400" />
                  <span>Effectif Général des 4 Groupes</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab('Reports')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'Reports' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <FileText size={16} className="text-zinc-400" />
                  <span>Validation des Rapports Mensuels</span>
                </button>
              </>
            )}

            {currentUser.role === 'Dev' && (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectTab('Users')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'Users' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <Users size={16} className="text-zinc-400" />
                  <span>Gestion des Utilisateurs & Rôles</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab('Logs')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    activeTab === 'Logs' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <Database size={16} className="text-zinc-400" />
                  <span>Journaux Système & Données BD</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => handleSelectTab('Leaderboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                activeTab === 'Leaderboard' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Trophy size={16} className="text-amber-400" />
              <span>Classement Général & 18 Rangs</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAi}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-amber-300 hover:bg-zinc-900 transition-all text-left cursor-pointer"
            >
              <Sparkles size={16} className="text-amber-400" />
              <span>Ouvrir l'Assistant IA Gemini</span>
            </button>
          </div>

          {/* User Switcher List with PIN Gate */}
          <div className="space-y-1 pt-2 border-t border-zinc-850">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Changer d'Utilisateur
              </p>
              <span className="text-[9px] text-amber-400 font-medium flex items-center gap-1">
                <Lock size={10} />
                <span>PIN requis</span>
              </span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {users.map(u => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleUserChange(u.id)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] font-semibold shrink-0">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-200 truncate text-[11px]">{u.name}</p>
                        <p className="text-[9px] text-zinc-400 truncate">
                          {u.color_group ? `Gr. ${getColorGroupLabel(u.color_group)}` : u.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected ? (
                        <Check size={13} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Lock size={12} className="text-zinc-600 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-850 bg-zinc-950/80 space-y-2">
          <button
            type="button"
            onClick={handleLockSession}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-semibold bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 transition-colors cursor-pointer"
          >
            <Lock size={13} className="text-amber-400" />
            <span>Verrouiller l'écran (PIN)</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-medium bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Réinitialiser les Données Démo</span>
          </button>
          <p className="text-[9px] text-zinc-400 text-center">
            Ministère des Enfants • v2.0 Mobile Optimized
          </p>
        </div>
      </div>
    </div>
  );
}
