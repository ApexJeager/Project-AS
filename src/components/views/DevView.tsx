import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { getRoleClasses, getColorGroupClasses, getColorGroupDot, getRoleLabel, getColorGroupLabel } from '../../utils';
import { Role, ColorGroup, User } from '../../types';
import LeaderboardView from './LeaderboardView';
import { 
  Shield, 
  Key, 
  KeyRound, 
  Database, 
  RefreshCw, 
  UserPlus, 
  CheckCircle2, 
  RotateCcw, 
  Award, 
  Sparkles, 
  Bot, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Shuffle, 
  AlertTriangle,
  FileCheck,
  Trash2
} from 'lucide-react';

export default function DevView() {
  const { 
    currentUser,
    activeTab, 
    setActiveTab,
    users, 
    gradings, 
    children, 
    resetDatabase, 
    addUser,
    deleteUser,
    updateUserPin,
    generateRandomPin,
    geminiApiKey,
    setGeminiApiKey,
    setIsAiAssistantOpen,
    lockSession,
    addToast
  } = useAppContext();

  const isDev = currentUser.role === 'Dev';

  if (!isDev) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4 animate-in fade-in">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 shadow-xs">
          <Shield className="mx-auto text-amber-500 mb-2" size={24} />
          <p className="font-bold text-sm">Accès Réservé au Développeur</p>
          <p className="text-xs text-amber-700 mt-1">Vous devez vous authentifier avec le compte Développeur et le code PIN maître pour accéder à cette console.</p>
        </div>
        <button
          type="button"
          onClick={() => lockSession(undefined, "Accès réservé au Développeur. Veuillez saisir votre code PIN.")}
          className="px-4 py-2 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-850 transition-colors shadow-2xs"
        >
          S'authentifier en tant que Développeur
        </button>
      </div>
    );
  }

  // Gemini API Key state in Dev portal
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || '');
  const [isSaved, setIsSaved] = useState(false);

  // Add User Form Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('Pilote');
  const [newGroup, setNewGroup] = useState<ColorGroup>('Red');
  const [newPin, setNewPin] = useState('');

  // PIN Management State
  const [selectedUserForPin, setSelectedUserForPin] = useState<User | null>(null);
  const [editPinInput, setEditPinInput] = useState('');
  const [revealedPins, setRevealedPins] = useState<{ [userId: string]: boolean }>({});
  const [showAllPins, setShowAllPins] = useState(false);

  // User Deletion State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const togglePinVisibility = (userId: string) => {
    setRevealedPins(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleOpenPinModal = (user: User) => {
    if (!isDev) {
      addToast('warning', 'Accès Refusé', 'Seul le Développeur a l\'autorisation de modifier les codes PIN.');
      return;
    }
    setSelectedUserForPin(user);
    setEditPinInput(user.pinCode || user.pin || '');
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPin) return;

    if (!isDev) {
      addToast('warning', 'Action Non Autorisée', 'Seul le rôle Développeur peut sauvegarder des modifications de PIN.');
      return;
    }

    if (!/^\d{4}$/.test(editPinInput)) {
      addToast('warning', 'Format Invalide', 'Le code PIN doit comporter exactement 4 chiffres (0-9).');
      return;
    }

    const success = updateUserPin(selectedUserForPin.id, editPinInput);
    if (success) {
      setSelectedUserForPin(null);
      setEditPinInput('');
    }
  };

  const handleQuickGeneratePin = (userId: string) => {
    if (!isDev) {
      addToast('warning', 'Accès Refusé', 'Seul le Développeur a l\'autorisation de modifier les codes PIN.');
      return;
    }
    const randomPin = generateRandomPin();
    updateUserPin(userId, randomPin);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(apiKeyInput);
    setIsSaved(true);
    addToast('success', 'Clé API Sauvegardée', apiKeyInput ? 'Clé Gemini mise à jour avec succès.' : 'Clé réinitialisée (mode local).');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const isGlobal = newRole === 'Dev' || newRole === 'Admin';
    const assignedPin = newPin.trim() && /^\d{4}$/.test(newPin) ? newPin.trim() : generateRandomPin();

    addUser({
      name: newName.trim(),
      role: newRole,
      color_group: isGlobal ? null : newGroup,
      pinCode: assignedPin,
      pin: assignedPin,
    });

    setNewName('');
    setNewPin('');
    setIsAddUserOpen(false);
  };

  if (activeTab === 'Leaderboard' || activeTab === 'Ranks' || activeTab === 'Classement' || activeTab === 'Rangs') {
    return <LeaderboardView />;
  }

  // Sub-tabs navigation bar for Dev portal (horizontally scrollable on mobile)
  const renderDevSubTabs = () => (
    <div className="bg-zinc-200/70 p-1 rounded-xl flex items-center gap-1 max-w-full overflow-x-auto whitespace-nowrap scrollbar-none shadow-2xs mb-4">
      <button
        type="button"
        onClick={() => setActiveTab('Users')}
        className={`shrink-0 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
          activeTab === 'Users' || activeTab === 'Utilisateurs'
            ? 'bg-white text-zinc-900 shadow-2xs'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        <Shield size={14} />
        <span>Utilisateurs & RBAC</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('PINs')}
        className={`shrink-0 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
          activeTab === 'PINs' || activeTab === 'Gestion des PINs'
            ? 'bg-white text-zinc-900 shadow-2xs'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        <KeyRound size={14} />
        <span>Gestion des PINs</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('Logs')}
        className={`shrink-0 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
          activeTab === 'Logs' || activeTab === 'Journaux' || activeTab === 'Journaux & Télémétrie'
            ? 'bg-white text-zinc-900 shadow-2xs'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        <Database size={14} />
        <span>BD & Logs</span>
      </button>
    </div>
  );

  // Edit PIN Modal component used across views
  const renderEditPinModal = () => {
    if (!selectedUserForPin || !isDev) return null;

    const isTargetDev = selectedUserForPin.role === 'Dev';
    const isValidPin = /^\d{4}$/.test(editPinInput);

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-zinc-200/90 animate-in slide-in-from-bottom duration-200">
          <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto mb-3 sm:hidden" />
          
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  {isTargetDev ? 'Éditer le Code PIN Maître' : 'Éditer le Code PIN'}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Compte : <strong className="text-zinc-800">{selectedUserForPin.name}</strong> ({getRoleLabel(selectedUserForPin.role)})
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSavePin} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Nouveau Code PIN (exactement 4 chiffres)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  required
                  value={editPinInput}
                  onChange={e => setEditPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Ex: 1926"
                  autoFocus
                  className="flex-1 px-3 py-2.5 text-center font-mono font-bold text-xl tracking-widest rounded-xl border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-zinc-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setEditPinInput(generateRandomPin())}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Shuffle size={13} />
                  <span>Générer</span>
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1.5 flex items-center justify-between">
                <span>Le code doit comporter 4 chiffres numériques.</span>
                <span className={`font-mono font-semibold ${isValidPin ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {editPinInput.length}/4 chiffres
                </span>
              </p>
            </div>

            {isTargetDev && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold block">PIN Maître par défaut : 1926</span>
                  <span className="text-[10px] text-amber-700">Vous pouvez personnaliser votre propre PIN ou restaurer 1926.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditPinInput('1926')}
                  className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 font-semibold text-[10px] text-amber-950 transition-colors cursor-pointer shrink-0 ml-2"
                >
                  Appliquer 1926
                </button>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedUserForPin(null);
                  setEditPinInput('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!isValidPin}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xs transition-all cursor-pointer disabled:opacity-40"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete User Confirmation Modal
  const renderDeleteUserModal = () => {
    if (!userToDelete || !isDev) return null;

    const isCurrentActiveUser = userToDelete.id === currentUser.id;

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-zinc-200/90 animate-in slide-in-from-bottom duration-200">
          <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto mb-3 sm:hidden" />
          
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Supprimer l'Utilisateur</h3>
              <p className="text-[11px] text-zinc-500">Cette action retirera définitivement ce compte de la base.</p>
            </div>
          </div>

          <div className="py-4 space-y-3">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Nom :</span>
                <strong className="text-zinc-900">{userToDelete.name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Rôle RBAC :</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getRoleClasses(userToDelete.role)}`}>
                  {getRoleLabel(userToDelete.role)}
                </span>
              </div>
              {userToDelete.color_group && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Groupe :</span>
                  <span className="text-zinc-800 font-medium">Groupe {getColorGroupLabel(userToDelete.color_group)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Identifiant :</span>
                <span className="font-mono text-[10px] text-zinc-400">{userToDelete.id}</span>
              </div>
            </div>

            {isCurrentActiveUser ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>Vous êtes actuellement connecté avec ce compte. Pour le supprimer, veuillez d'abord basculer sur un autre compte Développeur.</span>
              </div>
            ) : (
              <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200/70">
                Cet utilisateur ne pourra plus accéder à l'application ni s'authentifier par code PIN ({userToDelete.pinCode || userToDelete.pin || '----'}).
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setUserToDelete(null)}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={isCurrentActiveUser}
              onClick={async () => {
                const id = userToDelete.id;
                setUserToDelete(null);
                await deleteUser(id);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirmer la Suppression
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 1. PIN Management Panel (Dedicated Dev Security View)
  if (activeTab === 'PINs' || activeTab === 'Gestion des PINs' || activeTab === 'Sécurité') {
    return (
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
        {renderDevSubTabs()}

        {/* Non-Dev Warning Guard */}
        {!isDev && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 flex items-start gap-3 shadow-2xs">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">Mode Lecture Seule • Contrôle Réservé au Développeur</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Vous êtes actuellement connecté en tant que <strong>{currentUser.name}</strong> ({getRoleLabel(currentUser.role)}). Seul le profil Développeur dispose des autorisations pour attribuer, régénérer ou réinitialiser les codes PIN des comptes.
              </p>
            </div>
          </div>
        )}

        {/* Header Ribbon */}
        <div className="bg-white rounded-xl border border-zinc-200/90 p-4 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              <KeyRound size={13} className="text-amber-500" />
              <span>Contrôle Exclusif Développeur • Sécurité Système</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
              Gestion des Codes PIN & Accès
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Seul le Développeur a les privilèges de générer, attribuer et réinitialiser les codes PIN des comptes.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setShowAllPins(!showAllPins)}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all border border-zinc-200/90 cursor-pointer"
            >
              {showAllPins ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showAllPins ? 'Masquer les PINs' : 'Afficher les PINs'}</span>
            </button>

            <button
              type="button"
              onClick={() => lockSession()}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Lock size={14} />
              <span>Tester le Verrouillage</span>
            </button>
          </div>
        </div>

        {/* Master PIN Highlight Banner */}
        <div className="p-4 bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-850 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <KeyRound size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Code PIN Maître Développeur</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-zinc-950 uppercase">
                  Master Key
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Le compte Développeur initial utilise le PIN maître fixe par défaut : <strong className="text-amber-300 font-mono text-sm tracking-wider">1926</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <span className="text-xs text-zinc-400">Comptes sécurisés :</span>
            <span className="font-bold font-mono text-emerald-400">{users.length} actifs</span>
          </div>
        </div>

        {/* Users PIN Management: Desktop Table / Mobile Cards */}
        <div className="bg-white rounded-xl shadow-2xs border border-zinc-200/90 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Rôle RBAC</th>
                  <th className="px-4 py-3">Périmètre / Groupe</th>
                  <th className="px-4 py-3 text-center">Code PIN (4 chiffres)</th>
                  <th className="px-4 py-3 text-right">Actions Développeur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70">
                {users.map(user => {
                  const isDevMaster = user.role === 'Dev';
                  const isVisible = showAllPins || revealedPins[user.id];
                  const displayPin = user.pinCode || user.pin || '----';

                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 font-semibold flex items-center justify-center text-[11px] shrink-0">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 block">{user.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">{user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getRoleClasses(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.color_group ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${getColorGroupClasses(user.color_group)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(user.color_group)}`} />
                            Groupe {getColorGroupLabel(user.color_group)}
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic text-[11px]">Accès Global</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-2 bg-zinc-100/90 border border-zinc-200 px-3 py-1 rounded-lg">
                          <span className="font-mono font-bold text-xs text-zinc-900 tracking-widest min-w-[48px] text-center">
                            {isVisible ? displayPin : '••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePinVisibility(user.id)}
                            className="text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer"
                            title={isVisible ? 'Masquer' : 'Afficher le PIN'}
                          >
                            {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          {isDevMaster && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                              Master
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isDev ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenPinModal(user)}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                            >
                              Éditer le Code PIN
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickGeneratePin(user.id)}
                              title="Générer un nouveau PIN aléatoire"
                              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
                            >
                              <Shuffle size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              disabled={user.id === currentUser.id}
                              title={user.id === currentUser.id ? "Impossible de supprimer votre propre compte actif" : "Supprimer cet utilisateur"}
                              className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400 italic">Verrouillé (Dev Uniquement)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden divide-y divide-zinc-200/70">
            {users.map(user => {
              const isDevMaster = user.role === 'Dev';
              const isVisible = showAllPins || revealedPins[user.id];
              const displayPin = user.pinCode || user.pin || '----';

              return (
                <div key={user.id} className="p-4 space-y-3 bg-white">
                  {/* Header line: User Name (bold) + Role Badge + Color Group Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-zinc-900 text-sm truncate">{user.name}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono block">{user.id}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getRoleClasses(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      {user.color_group ? (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-medium border ${getColorGroupClasses(user.color_group)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(user.color_group)}`} />
                          Groupe {getColorGroupLabel(user.color_group)}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[10px] italic">Global</span>
                      )}
                    </div>
                  </div>

                  {/* Body: Access Scope summary & PIN status */}
                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-[11px]">Périmètre d'accès :</span>
                      <span className="font-medium text-zinc-800 text-[11px]">
                        {user.role === 'Dev' ? 'Système & BDD' :
                         user.role === 'Admin' ? 'Accès Global (4 Gr.)' :
                         `Groupe ${getColorGroupLabel(user.color_group)}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200/60">
                      <span className="text-zinc-500 text-[11px]">Statut Code PIN :</span>
                      <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg">
                        <span className="font-mono font-bold text-xs text-zinc-900 tracking-widest min-w-[40px] text-center">
                          {isVisible ? displayPin : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(user.id)}
                          className="text-zinc-400 hover:text-zinc-800 p-0.5 cursor-pointer"
                          aria-label={isVisible ? 'Masquer' : 'Afficher le PIN'}
                        >
                          {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        {isDevMaster && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                            Master
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action: Prominent "Éditer le PIN" with touch padding */}
                  {isDev && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenPinModal(user)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-98 min-h-[44px]"
                      >
                        <KeyRound size={14} className="text-amber-400" />
                        <span>Éditer le PIN</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickGeneratePin(user.id)}
                        title="Générer un nouveau PIN aléatoire"
                        className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl border border-zinc-200/80 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Générer PIN aléatoire"
                      >
                        <Shuffle size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserToDelete(user)}
                        disabled={user.id === currentUser.id}
                        title={user.id === currentUser.id ? "Impossible de supprimer votre propre compte actif" : "Supprimer cet utilisateur"}
                        className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200/80 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Supprimer cet utilisateur"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {renderEditPinModal()}
        {renderDeleteUserModal()}
      </div>
    );
  }

  // 2. Users & RBAC View
  if (activeTab === 'Users' || activeTab === 'Utilisateurs') {
    return (
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
        {renderDevSubTabs()}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              <Shield size={13} className="text-purple-600" />
              <span>Console Développeur & Système</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">Gestion des Utilisateurs & Permissions RBAC</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Appliquez le cloisonnement strict des rôles, assignations de groupe et codes PIN.</p>
          </div>
          <button 
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <UserPlus size={14} />
            <span>Ajouter un Utilisateur</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-2xs border border-zinc-200/90 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Groupe de Couleur</th>
                  <th className="px-4 py-3 text-center">Code PIN</th>
                  <th className="px-4 py-3">Périmètre d'Accès</th>
                  <th className="px-4 py-3 text-right">Actions Développeur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70">
                {users.map(user => {
                  const isVisible = showAllPins || revealedPins[user.id];
                  const displayPin = user.pinCode || user.pin || '----';

                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-zinc-900">{user.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getRoleClasses(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.color_group ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${getColorGroupClasses(user.color_group)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(user.color_group)}`} />
                            Groupe {getColorGroupLabel(user.color_group)}
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic text-[11px]">Global (Aucun)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-zinc-800">
                        <div className="inline-flex items-center gap-1.5 bg-zinc-100 px-2 py-0.5 rounded text-xs">
                          <span>{isVisible ? displayPin : '••••'}</span>
                          <button
                            type="button"
                            onClick={() => togglePinVisibility(user.id)}
                            className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                          >
                            {isVisible ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-zinc-600 font-medium">
                        {user.role === 'Dev' ? 'Système Complet & Maintenance BDD' :
                         user.role === 'Admin' ? 'Accès Global aux 4 Groupes' :
                         `Assigné au Groupe ${getColorGroupLabel(user.color_group)}`}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isDev ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenPinModal(user)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 transition-all cursor-pointer"
                            >
                              Éditer le PIN
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              disabled={user.id === currentUser.id}
                              title={user.id === currentUser.id ? "Impossible de supprimer votre propre compte actif" : "Supprimer cet utilisateur"}
                              className="p-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400 italic">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards View */}
          <div className="md:hidden divide-y divide-zinc-200/70">
            {users.map(user => {
              const isVisible = showAllPins || revealedPins[user.id];
              const displayPin = user.pinCode || user.pin || '----';

              return (
                <div key={user.id} className="p-4 space-y-3 bg-white">
                  {/* Header line: User Name (bold) + Role Badge + Color Group Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">{user.name}</h4>
                      <span className="text-[10px] text-zinc-400 font-mono">{user.id}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getRoleClasses(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      {user.color_group ? (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-medium border ${getColorGroupClasses(user.color_group)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(user.color_group)}`} />
                          Groupe {getColorGroupLabel(user.color_group)}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[10px] italic">Global</span>
                      )}
                    </div>
                  </div>

                  {/* Body: Access Scope summary and PIN Status */}
                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-[11px]">Périmètre :</span>
                      <span className="font-medium text-zinc-800 text-[11px]">
                        {user.role === 'Dev' ? 'Système Complet & Maintenance' :
                         user.role === 'Admin' ? 'Accès Global (4 Groupes)' :
                         `Assigné au Groupe ${getColorGroupLabel(user.color_group)}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200/60">
                      <span className="text-zinc-500 text-[11px]">Code PIN (4 chiffres) :</span>
                      <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg">
                        <span className="font-mono font-bold text-xs text-zinc-900 tracking-widest min-w-[40px] text-center">
                          {isVisible ? displayPin : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(user.id)}
                          className="text-zinc-400 hover:text-zinc-800 p-0.5 cursor-pointer"
                          aria-label={isVisible ? 'Masquer' : 'Afficher le PIN'}
                        >
                          {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action: "Éditer le PIN" and "Supprimer" with touch padding */}
                  {isDev && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenPinModal(user)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-98 min-h-[44px]"
                      >
                        <KeyRound size={14} className="text-amber-400" />
                        <span>Éditer le PIN</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserToDelete(user)}
                        disabled={user.id === currentUser.id}
                        title={user.id === currentUser.id ? "Impossible de supprimer votre propre compte actif" : "Supprimer cet utilisateur"}
                        className="flex items-center justify-center p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200/80 transition-colors cursor-pointer min-h-[44px] min-w-[44px] disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Supprimer cet utilisateur"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {renderEditPinModal()}
        {renderDeleteUserModal()}

        {/* Add User Modal */}
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-zinc-200/90 animate-in slide-in-from-bottom duration-200">
              <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto mb-3 sm:hidden" />

              <h3 className="text-base font-bold text-zinc-900 mb-0.5">Créer un Utilisateur Système</h3>
              <p className="text-xs text-zinc-500 mb-4">Définissez les identifiants, le groupe RBAC et le code PIN de connexion.</p>

              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Nom Complet</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Ex: Marc Tremblay"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Rôle</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Dev">Développeur (Maintenance & Journaux)</option>
                    <option value="Admin">Admin / Grand Leader (Supervision globale)</option>
                    <option value="Pilote">Pilote (Chef de Groupe)</option>
                    <option value="Co-Pilote">Co-Pilote (Adjoint de Groupe)</option>
                    <option value="Helper">Assistant (Soutien de Groupe)</option>
                  </select>
                </div>

                {newRole !== 'Dev' && newRole !== 'Admin' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Groupe de Couleur Assigné</label>
                    <select
                      value={newGroup}
                      onChange={e => setNewGroup(e.target.value as ColorGroup)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none cursor-pointer"
                    >
                      <option value="Red">Rouge</option>
                      <option value="Green">Vert</option>
                      <option value="Yellow">Jaune</option>
                      <option value="Blue">Bleu</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Code PIN de Connexion (4 chiffres)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      value={newPin}
                      onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Laissez vide pour générer automatiquement"
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 font-mono text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNewPin(generateRandomPin())}
                      className="px-2.5 py-2 rounded-xl text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 cursor-pointer"
                    >
                      Générer
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xs cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Logs & Telemetry View
  if (activeTab === 'Logs' || activeTab === 'Journaux & Télémétrie' || activeTab === 'Journaux') {
    return (
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
        {renderDevSubTabs()}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              <Database size={13} className="text-zinc-700" />
              <span>Opérations & Télémétrie Base de Données</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">Journaux de Base de Données & Moteur de Notation</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Enregistrements en temps réel des évaluations quotidiennes et flux d'événements système.</p>
          </div>
          <button 
            type="button"
            onClick={resetDatabase}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Réinitialiser la BDD</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-2xs flex items-start gap-3">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200/60">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-xs">Moteur RBAC & PIN</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">{users.length} comptes verrouillés par PIN 4 chiffres.</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-2xs flex items-start gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60">
              <Award size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-xs">Feuilles d'Évaluation</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">{gradings.length} soumissions de notation enregistrées.</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-2xs flex items-start gap-3">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200/60">
              <Database size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-xs">Schéma de Données</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">18 Rangs, 8 Critères, 4 Groupes synchronisés.</p>
            </div>
          </div>
        </div>

        {/* Gemini AI & Telemetry Settings */}
        <div className="bg-white rounded-xl p-5 border border-zinc-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900">Intégration Assistant IA Gemini</h3>
                <p className="text-[11px] text-zinc-500">Moteur génératif pour l'explication des règles, les versets et l'assistance à la rédaction des rapports.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiAssistantOpen(true)}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Bot size={13} />
              <span>Ouvrir le Chatbot</span>
            </button>
          </div>

          <form onSubmit={handleSaveApiKey} className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Key size={13} />
              </div>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Clé API Gemini (ex: AIzaSy... ou laisser vide pour le moteur local)"
                className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-850 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              {isSaved ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Shield size={14} />}
              <span>{isSaved ? 'Enregistré !' : 'Mettre à jour la clé'}</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${apiKeyInput ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              Statut : {apiKeyInput ? 'Clé personnalisée active (Gemini API)' : 'Moteur de règles local embarqué actif (100% autonome)'}
            </span>
            <span>Modèle : gemini-2.5-flash / gemini-3.7-flash</span>
          </div>
        </div>

        {/* Real-time event log */}
        <div className="bg-zinc-950 rounded-xl p-4 font-mono text-[11px] text-zinc-300 space-y-1.5 max-h-96 overflow-y-auto border border-zinc-850 shadow-inner">
          <div className="text-emerald-400 font-bold">[ENGINE_INIT] Algorithme de notation Astronautes et table des 18 rangs initialisés.</div>
          <div className="text-amber-400 font-bold">[AUTH_INIT] Contrôle d'accès PIN activé. Code Maître Développeur: 1926.</div>
          <div className="text-cyan-400">[RBAC] Cloisonnement des rôles actif : Développeur & Admin (global), Responsables (Rouge, Vert, Jaune, Bleu).</div>
          <div className="text-zinc-400">[CHILD_SYNC] {children.length} profils de candidats actifs en base.</div>
          {gradings.map(g => {
            const kid = children.find(k => k.id === g.child_id);
            return (
              <div key={g.id} className="text-zinc-300">
                <span className="text-zinc-500">[{g.date}]</span> <span className="text-indigo-400">ÉVÉNEMENT_NOTATION</span> : <span className="text-amber-300 font-bold">{g.total_day_points} pts</span> pour {kid ? `${kid.first_name} ${kid.last_name}` : g.child_id} (Par : {g.recorded_by})
              </div>
            );
          })}
          <div className="text-amber-400">[READY_CHECK] Tous les seuils de rang ont été évalués par rapport aux points accumulés.</div>
        </div>
      </div>
    );
  }

  return null;
}

