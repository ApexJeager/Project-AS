import React, { useState } from 'react';
import { Child } from '../types';
import { useAppContext } from '../AppContext';
import { isRecruitFullyQualified } from '../constants/ranks';
import { getColorGroupClasses, getColorGroupDot, getColorGroupLabel, getStatusLabel } from '../utils';
import { CheckCircle, Rocket, ShieldCheck, X, BookOpen, Calendar, Award, Check } from 'lucide-react';

interface RecruitQualificationModalProps {
  child: Child | null;
  isOpen: boolean;
  onClose: () => void;
  key?: React.Key;
}

export default function RecruitQualificationModal({ child, isOpen, onClose }: RecruitQualificationModalProps) {
  const { updateRecruitProgress } = useAppContext();

  if (!isOpen || !child) return null;

  const progress = child.qualification_progress || {
    consecutive_weeks: 0,
    recited_astronaut_verse: false,
    recited_motto: false,
    recited_nt_books: false,
  };

  const [weeks, setWeeks] = useState(progress.consecutive_weeks);
  const [verse, setVerse] = useState(progress.recited_astronaut_verse);
  const [motto, setMotto] = useState(progress.recited_motto);
  const [ntBooks, setNtBooks] = useState(progress.recited_nt_books);

  const isReady = weeks >= 3 && verse && motto && ntBooks;

  const handleSave = () => {
    updateRecruitProgress(child.id, {
      consecutive_weeks: weeks,
      recited_astronaut_verse: verse,
      recited_motto: motto,
      recited_nt_books: ntBooks,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200/90 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-200">
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />
        
        {/* Header */}
        <div className="bg-zinc-950 p-4 sm:p-5 text-white relative border-b border-zinc-850">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
            <Rocket size={13} />
            <span>Processus de Qualification Recrue</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-100">{child.first_name} {child.last_name}</h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium border ${getColorGroupClasses(child.color_group)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(child.color_group)}`} />
              Groupe {getColorGroupLabel(child.color_group)}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
              {getStatusLabel(child.status)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          <p className="text-xs text-zinc-600">
            Validez les 4 prérequis indispensables pour qualifier cette recrue au rang d'<strong className="text-zinc-900">Astronaute Qualifié</strong>.
          </p>

          {/* 1. Consecutive Weeks */}
          <div className="p-3 bg-zinc-50/70 rounded-lg border border-zinc-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-zinc-900">
                <Calendar size={14} className="text-zinc-600" />
                <span className="font-semibold text-xs">1. Présence Consécutive (3 Dimanches)</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${weeks >= 3 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-200 text-zinc-700'}`}>
                {weeks} / 3 Semaines
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[1, 2, 3].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeeks(w === weeks && w > 0 ? w - 1 : w)}
                  className={`py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                    weeks >= w
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Semaine {w} {weeks >= w ? '✓' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Verse 2 Tim 2:16 */}
          <button
            type="button"
            onClick={() => setVerse(!verse)}
            className={`w-full flex items-start gap-2.5 p-3 rounded-lg border text-left cursor-pointer transition-all ${
              verse ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xs' : 'bg-zinc-50/60 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100/60'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] shrink-0 ${
              verse ? 'bg-zinc-100 text-zinc-950 font-bold' : 'border border-zinc-300 bg-white'
            }`}>
              {verse && <Check size={11} strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs">2. Verset de l'Astronaute Récité</span>
                <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${verse ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-zinc-200 text-zinc-700 border-zinc-300'}`}>2 Tim 2:16</span>
              </div>
              <p className={`text-[11px] italic font-serif mt-1 leading-tight ${verse ? 'text-zinc-300' : 'text-zinc-600'}`}>
                « Évite les discours vains et profanes; car ceux qui les tiennent avanceront toujours plus dans l'impiété. »
              </p>
            </div>
          </button>

          {/* 3. Motto */}
          <button
            type="button"
            onClick={() => setMotto(!motto)}
            className={`w-full flex items-start gap-2.5 p-3 rounded-lg border text-left cursor-pointer transition-all ${
              motto ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xs' : 'bg-zinc-50/60 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100/60'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] shrink-0 ${
              motto ? 'bg-zinc-100 text-zinc-950 font-bold' : 'border border-zinc-300 bg-white'
            }`}>
              {motto && <Check size={11} strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs">3. Devise des Astronautes Récitée</span>
              </div>
              <p className={`text-[11px] italic font-serif mt-1 leading-tight ${motto ? 'text-zinc-300' : 'text-zinc-600'}`}>
                « Toujours plus haut, fidèles à Christ et à sa Parole ! »
              </p>
            </div>
          </button>

          {/* 4. NT Books */}
          <button
            type="button"
            onClick={() => setNtBooks(!ntBooks)}
            className={`w-full flex items-start gap-2.5 p-3 rounded-lg border text-left cursor-pointer transition-all ${
              ntBooks ? 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xs' : 'bg-zinc-50/60 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100/60'
            }`}
          >
            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] shrink-0 ${
              ntBooks ? 'bg-zinc-100 text-zinc-950 font-bold' : 'border border-zinc-300 bg-white'
            }`}>
              {ntBooks && <Check size={11} strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs">4. Récitation des 27 Livres du Nouveau Testament</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${ntBooks ? 'bg-zinc-800 text-zinc-200 border-zinc-700' : 'bg-zinc-200 text-zinc-700 border-zinc-300'}`}>Matthieu à Apocalypse</span>
              </div>
              <p className={`text-[11px] mt-0.5 leading-tight ${ntBooks ? 'text-zinc-300' : 'text-zinc-500'}`}>
                Récité les 27 livres sans hésitation dans l'ordre canonique.
              </p>
            </div>
          </button>

          {/* Status feedback */}
          {isReady ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200/90 rounded-lg flex items-center gap-2.5 text-emerald-950 animate-in fade-in">
              <Award className="text-emerald-600 shrink-0" size={18} />
              <div>
                <p className="font-bold text-xs">Les 4 critères de qualification sont validés !</p>
                <p className="text-[11px] text-emerald-800">
                  L'enregistrement promouvra automatiquement cet enfant au statut d'<strong>Astronaute Qualifié</strong>.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-zinc-400 text-center">
              Les critères peuvent être validés et enregistrés progressivement au fil des dimanches.
            </p>
          )}
        </div>

        {/* Footer */}
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
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xs transition-all cursor-pointer"
          >
            <ShieldCheck size={14} />
            Enregistrer la Qualification
          </button>
        </div>
      </div>
    </div>
  );
}

