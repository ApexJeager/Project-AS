import React, { useState } from 'react';
import { Child, RankDefinition } from '../types';
import { useAppContext } from '../AppContext';
import { getNextRankInfo } from '../constants/ranks';
import { getRankBadgeClasses, getRankDisplay } from '../utils';
import { Award, BookOpen, CheckCircle2, Sparkles, X, ChevronRight, Check } from 'lucide-react';

interface PromotionModalProps {
  child: Child | null;
  isOpen: boolean;
  onClose: () => void;
  key?: React.Key;
}

export default function PromotionModal({ child, isOpen, onClose }: PromotionModalProps) {
  const { promoteChildRank } = useAppContext();
  const [verseRecited, setVerseRecited] = useState(false);

  if (!isOpen || !child) return null;

  const { nextRank, pointsNeeded, isEligible } = getNextRankInfo(child);

  if (!nextRank) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
        <div className="bg-white rounded-xl p-5 max-w-sm w-full shadow-2xl border border-zinc-200/90 text-center">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-3 text-amber-600 border border-amber-200/80">
            <Award size={22} />
          </div>
          <h3 className="text-base font-bold text-zinc-900">Rang Suprême Atteint</h3>
          <p className="text-xs text-zinc-600 mt-1">
            {child.first_name} {child.last_name} a atteint le grade maximal : <span className="font-semibold text-amber-700">{getRankDisplay(child.current_rank)}</span>.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const handlePromote = () => {
    if (!verseRecited) return;
    promoteChildRank(child.id, nextRank.title);
    setVerseRecited(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full shadow-2xl border border-zinc-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200">
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />
        
        {/* Modal Header */}
        <div className="bg-zinc-950 p-4 sm:p-5 text-white relative border-b border-zinc-850">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={13} />
            <span>Examen de Promotion de Rang</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-100">{child.first_name} {child.last_name}</h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400">
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getRankBadgeClasses(child.current_rank)}`}>
              {getRankDisplay(child.current_rank)}
            </span>
            <ChevronRight size={13} className="text-zinc-500" />
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getRankBadgeClasses(nextRank.title)}`}>
              {nextRank.title}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Points Status */}
          <div className="bg-zinc-50/70 p-3 rounded-lg border border-zinc-200/80 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Points Cumulés</p>
              <p className="text-lg font-mono font-bold text-zinc-900 mt-0.5">{child.total_accumulated_points} <span className="text-xs font-normal text-zinc-500">pts</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Seuil {nextRank.title}</p>
              <p className="text-lg font-mono font-bold text-zinc-900 mt-0.5">{nextRank.points} <span className="text-xs font-normal text-zinc-500">pts</span></p>
            </div>
          </div>

          {!isEligible && (
            <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-800 text-xs">
              <span className="font-semibold">Attention :</span> Il manque {pointsNeeded} points ou le statut Recrue est en cours.
            </div>
          )}

          {/* Scripture Memory Requirement */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-zinc-800 font-semibold text-xs">
              <BookOpen size={14} className="text-zinc-600" />
              <span>Passage Biblique Obligatoire de Promotion</span>
            </div>
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 text-xs">{nextRank.verse}</span>
                <span className="text-[10px] font-semibold bg-zinc-200 text-zinc-800 px-1.5 py-0.5 rounded">Récitation</span>
              </div>
              {nextRank.verseDescription && (
                <p className="text-xs text-zinc-700 italic font-serif leading-relaxed">
                  « {nextRank.verseDescription} »
                </p>
              )}
            </div>
          </div>

          {/* Verification Checkbox */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setVerseRecited(!verseRecited)}
              className={`w-full flex items-start gap-2.5 p-3 rounded-lg border text-left cursor-pointer transition-all ${
                verseRecited 
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xs' 
                  : 'bg-zinc-50/60 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100/60'
              }`}
            >
              <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] shrink-0 ${
                verseRecited ? 'bg-zinc-100 text-zinc-950 font-bold' : 'border border-zinc-300 bg-white'
              }`}>
                {verseRecited && <Check size={11} strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-xs">Passage Récité Par Cœur Sans Faute</p>
                <p className={`text-[11px] mt-0.5 ${verseRecited ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Le candidat a récité fidèlement le passage <span className="font-medium">{nextRank.verse}</span>.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handlePromote}
            disabled={!verseRecited}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all ${
              verseRecited
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 size={14} />
            Promouvoir au rang de {nextRank.title}
          </button>
        </div>
      </div>
    </div>
  );
}

