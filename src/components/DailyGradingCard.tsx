import React, { useState, useEffect, useCallback } from 'react';
import { Child, DailyGrading } from '../types';
import { useAppContext } from '../AppContext';
import { GRADING_CRITERIA, VISITOR_POINTS, calculateDailyPoints } from '../constants/ranks';
import { getColorGroupClasses, getRankBadgeClasses, getRankDisplay } from '../utils';
import { 
  Check, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Heart, 
  Scroll, 
  Sparkle, 
  Sparkles as ScarfIcon,
  Users as UsersIcon,
  ShieldAlert
} from 'lucide-react';

interface DailyGradingCardProps {
  child: Child;
  date: string;
  isExpandedDefault?: boolean;
  key?: React.Key;
}

export default function DailyGradingCard({ child, date, isExpandedDefault = true }: DailyGradingCardProps) {
  const { gradings, saveDailyGrading, addToast } = useAppContext();

  // Find existing grading for this date
  const existingGrading = gradings.find(g => g.child_id === child.id && g.date === date);

  const [presence, setPresence] = useState(existingGrading?.presence ?? true);
  const [punctuality, setPunctuality] = useState(existingGrading?.punctuality ?? true);
  const [goodBehavior, setGoodBehavior] = useState(existingGrading?.good_behavior ?? true);
  const [verseOfTheDay, setVerseOfTheDay] = useState(existingGrading?.verse_of_the_day ?? false);
  const [bible, setBible] = useState(existingGrading?.bible ?? true);
  const [cleanliness, setCleanliness] = useState(existingGrading?.cleanliness ?? true);
  const [scarf, setScarf] = useState(existingGrading?.scarf ?? false);
  const [visitorsCount, setVisitorsCount] = useState(existingGrading?.visitors_count ?? 0);
  const [isSaved, setIsSaved] = useState(Boolean(existingGrading));
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);

  // Sync state if existingGrading changes
  useEffect(() => {
    if (existingGrading) {
      setPresence(existingGrading.presence);
      setPunctuality(existingGrading.punctuality);
      setGoodBehavior(existingGrading.good_behavior);
      setVerseOfTheDay(existingGrading.verse_of_the_day);
      setBible(existingGrading.bible);
      setCleanliness(existingGrading.cleanliness);
      setScarf(existingGrading.scarf);
      setVisitorsCount(existingGrading.visitors_count);
      setIsSaved(true);
    }
  }, [existingGrading]);

  // Current live points
  const livePoints = calculateDailyPoints({
    presence,
    punctuality,
    good_behavior: goodBehavior,
    verse_of_the_day: verseOfTheDay,
    bible,
    cleanliness,
    scarf,
    visitors_count: visitorsCount,
  });

  // Auto-save helper that writes to context
  const triggerAutoSave = useCallback((updates: Partial<DailyGrading>) => {
    const updatedRecord = {
      id: existingGrading?.id,
      child_id: child.id,
      date,
      presence: updates.presence !== undefined ? updates.presence : presence,
      punctuality: updates.punctuality !== undefined ? updates.punctuality : punctuality,
      good_behavior: updates.good_behavior !== undefined ? updates.good_behavior : goodBehavior,
      verse_of_the_day: updates.verse_of_the_day !== undefined ? updates.verse_of_the_day : verseOfTheDay,
      bible: updates.bible !== undefined ? updates.bible : bible,
      cleanliness: updates.cleanliness !== undefined ? updates.cleanliness : cleanliness,
      scarf: updates.scarf !== undefined ? updates.scarf : scarf,
      visitors_count: updates.visitors_count !== undefined ? updates.visitors_count : visitorsCount,
    };

    saveDailyGrading(updatedRecord);
    setIsSaved(true);
  }, [child.id, date, existingGrading?.id, presence, punctuality, goodBehavior, verseOfTheDay, bible, cleanliness, scarf, visitorsCount, saveDailyGrading]);

  const handleQuickFull = () => {
    setPresence(true);
    setPunctuality(true);
    setGoodBehavior(true);
    setVerseOfTheDay(true);
    setBible(true);
    setCleanliness(true);
    setScarf(true);
    triggerAutoSave({
      presence: true,
      punctuality: true,
      good_behavior: true,
      verse_of_the_day: true,
      bible: true,
      cleanliness: true,
      scarf: true,
    });
    addToast('success', `${child.first_name} ${child.last_name}`, 'Journée Parfaite validée (250 pts enregistrés).');
  };

  const handleQuickAbsent = () => {
    setPresence(false);
    setPunctuality(false);
    setGoodBehavior(false);
    setVerseOfTheDay(false);
    setBible(false);
    setCleanliness(false);
    setScarf(false);
    setVisitorsCount(0);
    triggerAutoSave({
      presence: false,
      punctuality: false,
      good_behavior: false,
      verse_of_the_day: false,
      bible: false,
      cleanliness: false,
      scarf: false,
      visitors_count: 0,
    });
    addToast('info', `${child.first_name} ${child.last_name}`, 'Marqué comme Absent pour cette séance.');
  };

  const handleSave = () => {
    triggerAutoSave({});
    addToast('success', 'Enregistré', `Fiche de ${child.first_name} enregistrée avec succès.`);
  };

  // Toggle presence directly
  const handleTogglePresence = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newPresence = !presence;
    setPresence(newPresence);
    if (!newPresence) {
      // If absent, reset other criteria
      setPunctuality(false);
      setGoodBehavior(false);
      setVerseOfTheDay(false);
      setBible(false);
      setCleanliness(false);
      setScarf(false);
      triggerAutoSave({
        presence: false,
        punctuality: false,
        good_behavior: false,
        verse_of_the_day: false,
        bible: false,
        cleanliness: false,
        scarf: false,
      });
    } else {
      triggerAutoSave({ presence: true });
    }
  };

  const criteriaList = [
    { 
      key: 'presence', 
      label: 'Présence', 
      pts: 30, 
      value: presence, 
      toggle: () => { 
        const next = !presence; 
        setPresence(next); 
        triggerAutoSave({ presence: next }); 
      } 
    },
    { 
      key: 'punctuality', 
      label: 'Ponctualité', 
      pts: 40, 
      value: punctuality, 
      toggle: () => { 
        const next = !punctuality; 
        setPunctuality(next); 
        triggerAutoSave({ punctuality: next }); 
      } 
    },
    { 
      key: 'good_behavior', 
      label: 'Bonne Conduite', 
      pts: 40, 
      value: goodBehavior, 
      toggle: () => { 
        const next = !goodBehavior; 
        setGoodBehavior(next); 
        triggerAutoSave({ good_behavior: next }); 
      } 
    },
    { 
      key: 'verse', 
      label: 'Verset du Jour', 
      pts: 40, 
      value: verseOfTheDay, 
      toggle: () => { 
        const next = !verseOfTheDay; 
        setVerseOfTheDay(next); 
        triggerAutoSave({ verse_of_the_day: next }); 
      },
      badge: 'Par cœur'
    },
    { 
      key: 'bible', 
      label: 'Bible Apportée', 
      pts: 50, 
      value: bible, 
      toggle: () => { 
        const next = !bible; 
        setBible(next); 
        triggerAutoSave({ bible: next }); 
      },
      badge: '+50 pts'
    },
    { 
      key: 'cleanliness', 
      label: 'Propreté', 
      pts: 30, 
      value: cleanliness, 
      toggle: () => { 
        const next = !cleanliness; 
        setCleanliness(next); 
        triggerAutoSave({ cleanliness: next }); 
      } 
    },
    { 
      key: 'scarf', 
      label: 'Foulard / Écharpe', 
      pts: 20, 
      value: scarf, 
      toggle: () => { 
        const next = !scarf; 
        setScarf(next); 
        triggerAutoSave({ scarf: next }); 
      } 
    },
  ];

  return (
    <div 
      className={`bg-white rounded-xl border transition-all duration-150 shadow-2xs overflow-hidden ${
        !presence 
          ? 'border-zinc-200 bg-zinc-50/50 opacity-80' 
          : isSaved ? 'border-zinc-200/90 hover:border-zinc-300' : 'border-amber-300 ring-1 ring-amber-300'
      }`}
    >
      {/* Header / Main Touch Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 sm:p-4 flex items-center justify-between gap-2.5 select-none cursor-pointer bg-white active:bg-zinc-50/80 transition-colors"
      >
        {/* Left child info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Avatar with Presence Indicator */}
          <div className="relative shrink-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
              presence 
                ? 'bg-zinc-900 text-zinc-100 shadow-2xs' 
                : 'bg-zinc-200 text-zinc-500'
            }`}>
              {child.first_name[0]}{child.last_name[0]}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              presence ? 'bg-emerald-500' : 'bg-zinc-300'
            }`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-zinc-900 text-xs sm:text-sm truncate">
                {child.first_name} {child.last_name}
              </span>
              <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-medium border ${getRankBadgeClasses(child.current_rank)}`}>
                {getRankDisplay(child.current_rank)}
              </span>
              {child.status === 'Recruit' && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Recrue
                </span>
              )}
            </div>

            <div className="text-[10px] sm:text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
              <span>Total : <strong className="font-mono text-zinc-800">{child.total_accumulated_points} pts</strong></span>
              <span>•</span>
              <button
                type="button"
                onClick={handleTogglePresence}
                className={`px-1.5 py-0.2 rounded font-semibold text-[10px] transition-colors cursor-pointer ${
                  presence 
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' 
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {presence ? '✓ Présent' : '✗ Absent'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Points Counter & Expand Icon */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider block">Aujourd'hui</span>
            <div className="flex items-baseline gap-0.5 justify-end">
              <span className={`font-mono text-sm sm:text-base font-bold ${
                livePoints >= 200 ? 'text-emerald-700' : livePoints > 0 ? 'text-zinc-900' : 'text-zinc-400'
              }`}>
                +{livePoints}
              </span>
              <span className="text-[9px] text-zinc-400 font-medium">pts</span>
            </div>
          </div>

          <div className="p-1 rounded-md text-zinc-400 group-hover:text-zinc-700 transition-colors">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Expanded Touch-Friendly Checklist & Presets */}
      {isExpanded && (
        <div className="p-3 sm:p-4 pt-2 border-t border-zinc-100 bg-zinc-50/40 space-y-3 animate-in fade-in duration-150">
          
          {/* Quick Presets Bar */}
          <div className="flex items-center justify-between text-[11px] pb-1 border-b border-zinc-200/60">
            <span className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">
              8 Critères (250 pts max)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickFull}
                className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-[0.97] shadow-2xs"
              >
                <Sparkles size={11} className="text-amber-400" />
                <span>Jour Parfait (250 pts)</span>
              </button>
              <button
                type="button"
                onClick={handleQuickAbsent}
                className="px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-medium text-[10px] cursor-pointer transition-all active:scale-[0.97]"
              >
                Absent
              </button>
            </div>
          </div>

          {/* 7 Individual Criteria Touch Buttons (min 44px height for mobile ease) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {criteriaList.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={c.toggle}
                className={`min-h-[46px] p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-100 cursor-pointer active:scale-[0.97] ${
                  c.value
                    ? 'bg-zinc-900 border-zinc-800 text-white shadow-2xs'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50/80'
                }`}
              >
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-semibold truncate leading-tight">{c.label}</p>
                  <p className={`text-[10px] font-mono mt-0.5 ${c.value ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    +{c.pts} pts
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] shrink-0 ${
                  c.value ? 'bg-white text-zinc-950 font-bold' : 'border border-zinc-300 bg-zinc-50'
                }`}>
                  {c.value && <Check size={13} strokeWidth={3} />}
                </div>
              </button>
            ))}

            {/* 8. Visitors Touch Stepper */}
            <div className="min-h-[46px] p-2.5 rounded-xl border border-zinc-200 bg-white flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-900 truncate leading-tight">Visiteurs</p>
                <p className="text-[10px] font-mono text-zinc-500">+{VISITOR_POINTS} pts/invité</p>
              </div>

              {/* Large Stepper Buttons */}
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(0, visitorsCount - 1);
                    setVisitorsCount(next);
                    triggerAutoSave({ visitors_count: next });
                  }}
                  className="w-8 h-8 rounded-lg bg-zinc-100 active:bg-zinc-200 border border-zinc-200 flex items-center justify-center text-zinc-700 cursor-pointer active:scale-95"
                  aria-label="Diminuer les visiteurs"
                >
                  <Minus size={13} />
                </button>
                <span className="font-mono text-xs font-bold text-zinc-900 w-5 text-center">
                  {visitorsCount}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = visitorsCount + 1;
                    setVisitorsCount(next);
                    triggerAutoSave({ visitors_count: next });
                  }}
                  className="w-8 h-8 rounded-lg bg-zinc-900 active:bg-zinc-800 text-white flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
                  aria-label="Ajouter un visiteur"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Auto-save feedback */}
          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span>Modifications enregistrées automatiquement</span>
            </span>
            <span className="font-mono font-bold text-zinc-800">
              Total séance : +{livePoints} pts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


