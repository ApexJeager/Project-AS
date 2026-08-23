import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../AppContext';
import { getRoleClasses, getRoleLabel, getColorGroupClasses, getColorGroupDot, getColorGroupLabel } from '../utils';
import { Shield, Lock, Unlock, KeyRound, Check, Delete, ChevronDown, Rocket, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { User } from '../types';

export default function PinLockScreen() {
  const { users, currentUser, unlockSession, isLocked } = useAppContext();
  
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || users[0]?.id || 'u1');
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [showDemoPins, setShowDemoPins] = useState<boolean>(false);

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
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-between p-4 sm:p-6 text-zinc-100 select-none overflow-y-auto animate-in fade-in duration-200">
      
      {/* Top Header & Logo */}
      <div className="w-full max-w-md flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shadow-2xs">
            <Rocket size={18} className="text-zinc-200" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
              <span>Astronautes</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-400 border border-zinc-750">
                Sécurité PIN
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400">Ministère des Enfants</p>
          </div>
        </div>

        {/* Demo PINs toggle helper */}
        <button
          type="button"
          onClick={() => setShowDemoPins(!showDemoPins)}
          className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          title="Consulter les codes PIN"
        >
          <HelpCircle size={13} />
          <span className="hidden sm:inline">Codes PIN par défaut</span>
        </button>
      </div>

      {/* Demo PINs Accordion Banner */}
      {showDemoPins && (
        <div className="w-full max-w-md bg-zinc-900/95 border border-zinc-800 rounded-xl p-3 my-2 text-xs space-y-2 animate-in slide-in-from-top duration-150">
          <div className="flex items-center justify-between font-semibold text-zinc-300 pb-1.5 border-b border-zinc-800">
            <span className="flex items-center gap-1.5 text-[11px]">
              <KeyRound size={13} className="text-amber-400" />
              Codes PIN Système Préconfigurés :
            </span>
            <span className="text-[10px] text-amber-400 font-mono">Dev Master: 1926</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-zinc-300 font-mono">
            {users.map(u => (
              <div 
                key={u.id} 
                onClick={() => handleSelectUser(u.id)}
                className={`p-1.5 rounded bg-zinc-950/60 border border-zinc-850 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-colors ${
                  selectedUserId === u.id ? 'ring-1 ring-amber-400/80 bg-zinc-850' : ''
                }`}
              >
                <span className="text-zinc-300 truncate mr-1 font-sans">{u.name} :</span>
                <span className="font-bold text-amber-400 shrink-0">{u.pin}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Lockpad Card */}
      <div className="w-full max-w-sm my-auto flex flex-col items-center space-y-5">
        
        {/* User Profile Selector Badge */}
        <div className="relative w-full">
          <button
            type="button"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="w-full bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer shadow-lg group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                {selectedUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-sm text-zinc-100 truncate">{selectedUser.name}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${getRoleClasses(selectedUser.role)}`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                  {selectedUser.color_group && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(selectedUser.color_group)}`} />
                      Gr. {getColorGroupLabel(selectedUser.color_group)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-zinc-400 group-hover:text-zinc-200">
              <span className="text-[10px] font-medium hidden sm:inline">Changer</span>
              <ChevronDown size={16} className={`transition-transform duration-150 ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Profile Dropdown Selection Menu */}
          {showProfileDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 shadow-2xl z-20 max-h-60 overflow-y-auto divide-y divide-zinc-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Choisir votre profil
              </div>
              {users.map(user => {
                const isCurrent = user.id === selectedUserId;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isCurrent ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-300 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-semibold shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-200 truncate">{user.name}</p>
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
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Lock size={13} className="text-zinc-500" />
            <span>Entrez votre code PIN à 4 chiffres</span>
          </div>

          {/* 4 Concealed PIN Dots */}
          <div className={`flex items-center gap-4 my-1 transition-all ${isError ? 'animate-bounce text-rose-500' : ''}`}>
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                    isSuccess 
                      ? 'border-emerald-400 bg-emerald-400 scale-110 shadow-emerald-500/50 shadow-sm'
                      : isError
                        ? 'border-rose-500 bg-rose-500 scale-110'
                        : isFilled
                          ? 'border-zinc-100 bg-zinc-100 scale-105 shadow-zinc-400/40 shadow-xs'
                          : 'border-zinc-700 bg-zinc-900/60'
                  }`}
                />
              );
            })}
          </div>

          {/* Error / Status text */}
          <div className="h-5 flex items-center justify-center">
            {isError && (
              <p className="text-xs font-semibold text-rose-400 flex items-center gap-1 animate-in fade-in">
                <AlertCircle size={13} />
                <span>{errorMessage || 'Code PIN incorrect'}</span>
              </p>
            )}
            {isSuccess && (
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <Unlock size={13} />
                <span>Accès autorisé...</span>
              </p>
            )}
          </div>
        </div>

        {/* 0-9 Numeric Keypad */}
        <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3 max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num.toString())}
              disabled={isSuccess}
              className="h-14 sm:h-15 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-750 active:scale-95 border border-zinc-800/90 text-xl font-bold text-zinc-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {num}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isSuccess || pin.length === 0}
            className="h-14 sm:h-15 rounded-2xl bg-zinc-900/60 hover:bg-zinc-850 active:scale-95 text-xs font-semibold text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
          >
            Effacer
          </button>

          {/* Digit 0 */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            disabled={isSuccess}
            className="h-14 sm:h-15 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-750 active:scale-95 border border-zinc-800/90 text-xl font-bold text-zinc-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            disabled={isSuccess || pin.length === 0}
            aria-label="Effacer le dernier chiffre"
            className="h-14 sm:h-15 rounded-2xl bg-zinc-900/60 hover:bg-zinc-850 active:scale-95 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Master Developer Mention */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-zinc-500">
            Contrôle d'accès géré exclusivement par le <strong className="text-zinc-400">Développeur</strong> (Master PIN : 1926).
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-md text-center py-2 border-t border-zinc-900">
        <p className="text-[10px] text-zinc-500">
          Système verrouillé après 15 minutes d'inactivité pour sécuriser les données des enfants.
        </p>
      </div>
    </div>
  );
}
