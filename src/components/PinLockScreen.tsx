import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../AppContext';
import { getRoleClasses, getRoleLabel, getColorGroupClasses, getColorGroupDot, getColorGroupLabel } from '../utils';
import { Shield, Lock, Unlock, KeyRound, Check, Delete, ChevronDown, Rocket, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { User } from '../types';

export default function PinLockScreen() {
  const { users, currentUser, unlockSession, isLocked, targetLockUserId, lockReason } = useAppContext();
  
  const [selectedUserId, setSelectedUserId] = useState<string>(
    targetLockUserId || currentUser?.id || users[0]?.id || 'u1'
  );
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [showDemoPins, setShowDemoPins] = useState<boolean>(false);

  // Sync selectedUserId if targetLockUserId changes
  useEffect(() => {
    if (targetLockUserId) {
      setSelectedUserId(targetLockUserId);
      setPin('');
      setIsError(false);
      setErrorMessage('');
    }
  }, [targetLockUserId]);

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0] || currentUser;

  // Clear pin when selected user changes
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setPin('');
    setIsError(false);
    setErrorMessage('');
    setShowProfileDropdown(false);
  };

  const handleKeyPress = useCallback((digit: string) => {
    if (isSuccess) return;
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setIsError(false);
      setErrorMessage('');

      // Auto submit upon 4th digit
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  }, [pin, isSuccess, selectedUserId]);

  const handleBackspace = useCallback(() => {
    if (isSuccess) return;
    setPin(prev => prev.slice(0, -1));
    setIsError(false);
    setErrorMessage('');
  }, [isSuccess]);

  const handleClear = useCallback(() => {
    if (isSuccess) return;
    setPin('');
    setIsError(false);
    setErrorMessage('');
  }, [isSuccess]);

  const verifyPin = (pinToTest: string) => {
    const result = unlockSession(selectedUserId, pinToTest);
    if (result.success) {
      setIsSuccess(true);
    } else {
      setIsError(true);
      setErrorMessage(result.error || 'Code PIN incorrect.');
      // Auto clear after error feedback
      setTimeout(() => {
        setPin('');
      }, 550);
    }
  };

  // Keyboard input listener
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, handleKeyPress, handleBackspace, handleClear]);

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-zinc-950 via-[#0a0a0f] to-zinc-950 flex flex-col items-center justify-between p-4 sm:p-6 text-zinc-100 select-none overflow-y-auto animate-in fade-in duration-200">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Logo */}
      <div className="w-full max-w-md flex items-center justify-between pt-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/60 flex items-center justify-center text-zinc-100 shadow-inner">
            <Rocket size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Astronautes</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                Sécurité PIN
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">Ministère des Enfants</p>
          </div>
        </div>

        {/* Demo PINs toggle helper */}
        <button
          type="button"
          onClick={() => setShowDemoPins(!showDemoPins)}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          title="Consulter les codes PIN"
        >
          <HelpCircle size={14} className="text-amber-400" />
          <span className="hidden sm:inline">Codes PIN par défaut</span>
        </button>
      </div>

      {/* Demo PINs Accordion Banner */}
      {showDemoPins && (
        <div className="w-full max-w-md bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 my-2 text-xs space-y-2.5 animate-in slide-in-from-top-2 duration-150 shadow-xl relative z-10">
          <div className="flex items-center justify-between font-bold text-zinc-200 pb-2 border-b border-zinc-800/80">
            <span className="flex items-center gap-2 text-[11px]">
              <KeyRound size={14} className="text-amber-400" />
              Codes PIN Système Préconfigurés :
            </span>
            <span className="text-[10px] text-amber-400 font-mono font-bold">Dev Master: 1926</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 font-mono">
            {users.map(u => (
              <div 
                key={u.id} 
                onClick={() => handleSelectUser(u.id)}
                className={`p-2 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-all ${
                  selectedUserId === u.id ? 'ring-2 ring-amber-400/80 bg-zinc-850 shadow-xs' : ''
                }`}
              >
                <span className="text-zinc-300 truncate mr-1.5 font-sans font-medium">{u.name} :</span>
                <span className="font-bold text-amber-400 shrink-0">{u.pinCode || u.pin}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Lockpad Card */}
      <div className="w-full max-w-sm my-auto flex flex-col items-center space-y-5 relative z-10">
        
        {/* Security Warning / Reason Banner */}
        {lockReason && lockReason !== 'inactivity' && (
          <div className="w-full p-3.5 bg-amber-950/60 border border-amber-800/80 rounded-2xl text-xs text-amber-200 flex items-start gap-3 animate-in fade-in shadow-lg backdrop-blur-sm">
            <Shield className="text-amber-400 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">Sécurité d'Accès</p>
              <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">{lockReason}</p>
            </div>
          </div>
        )}

        {/* User Profile Selector Badge */}
        <div className="relative w-full">
          <button
            type="button"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="w-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800/90 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer shadow-lg group active:scale-98"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700 text-amber-300 flex items-center justify-center font-extrabold text-sm shadow-inner shrink-0">
                {selectedUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left min-w-0">
                <p className="font-display font-bold text-sm sm:text-base text-white truncate">{selectedUser.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide border shadow-2xs ${getRoleClasses(selectedUser.role)}`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                  {selectedUser.color_group && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-zinc-300 bg-zinc-800/90 px-2 py-0.5 rounded-full border border-zinc-700/60">
                      <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(selectedUser.color_group)} shadow-[0_0_4px_currentColor]`} />
                      Gr. {getColorGroupLabel(selectedUser.color_group)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-zinc-400 group-hover:text-zinc-200">
              <span className="text-[11px] font-semibold hidden sm:inline">Changer</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Profile Dropdown Selection Menu */}
          {showProfileDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-2 shadow-2xl z-20 max-h-64 overflow-y-auto divide-y divide-zinc-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Sélectionner un profil
              </div>
              {users.map(user => {
                const isCurrent = user.id === selectedUserId;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isCurrent ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-200 truncate">{user.name}</p>
                        <p className="text-[10px] text-zinc-400">
                          {user.color_group ? `Groupe ${getColorGroupLabel(user.color_group)}` : getRoleLabel(user.role)}
                        </p>
                      </div>
                    </div>
                    {isCurrent && <Check size={14} className="text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* PIN Entry Prompt & Dots */}
        <div className="flex flex-col items-center space-y-3.5">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <Lock size={14} className="text-zinc-500" />
            <span>Code PIN à 4 chiffres</span>
          </div>

          {/* 4 Concealed PIN Dots */}
          <div className={`flex items-center gap-4 my-1 transition-all ${isError ? 'animate-bounce text-rose-500' : ''}`}>
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    isSuccess 
                      ? 'border-emerald-400 bg-emerald-400 scale-125 shadow-[0_0_12px_#34d399]'
                      : isError
                        ? 'border-rose-500 bg-rose-500 scale-125 shadow-[0_0_12px_#f43f5e]'
                        : isFilled
                          ? 'border-white bg-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                          : 'border-zinc-700 bg-zinc-900/80'
                  }`}
                />
              );
            })}
          </div>

          {/* Error / Status text */}
          <div className="h-5 flex items-center justify-center">
            {isError && (
              <p className="text-xs font-bold text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle size={14} />
                <span>{errorMessage || 'Code PIN incorrect'}</span>
              </p>
            )}
            {isSuccess && (
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <Unlock size={14} />
                <span>Accès autorisé...</span>
              </p>
            )}
          </div>
        </div>

        {/* 0-9 Numeric Keypad */}
        <div className="w-full grid grid-cols-3 gap-3 max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num.toString())}
              disabled={isSuccess}
              className="h-14 sm:h-15 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 active:bg-zinc-700 active:scale-95 border border-zinc-800 hover:border-zinc-700 font-display text-2xl font-bold text-white flex items-center justify-center transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {num}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isSuccess || pin.length === 0}
            className="h-14 sm:h-15 rounded-2xl bg-zinc-900/50 hover:bg-zinc-850 active:scale-95 text-xs font-bold text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
          >
            Effacer
          </button>

          {/* Digit 0 */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            disabled={isSuccess}
            className="h-14 sm:h-15 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 active:bg-zinc-700 active:scale-95 border border-zinc-800 hover:border-zinc-700 font-display text-2xl font-bold text-white flex items-center justify-center transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            disabled={isSuccess || pin.length === 0}
            aria-label="Effacer le dernier chiffre"
            className="h-14 sm:h-15 rounded-2xl bg-zinc-900/50 hover:bg-zinc-850 active:scale-95 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Master Developer Mention */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-zinc-500">
            Contrôle d'accès géré exclusivement par le <strong className="text-zinc-300 font-semibold">Développeur</strong> (Master PIN : 1926).
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-md text-center py-2 border-t border-zinc-900/80 relative z-10">
        <p className="text-[10px] text-zinc-500">
          Système protégé contre les accès non autorisés • Ministère des Enfants Astronautes
        </p>
      </div>
    </div>
  );
}
