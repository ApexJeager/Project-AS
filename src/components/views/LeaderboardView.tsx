import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { Child, ColorGroup } from '../../types';
import { RANK_SYSTEM, getNextRankInfo } from '../../constants/ranks';
import { getColorGroupClasses, getColorGroupDot, getColorGroupLabel, getRankBadgeClasses, getRankDisplay, getStatusLabel } from '../../utils';
import PromotionModal from '../PromotionModal';
import RecruitQualificationModal from '../RecruitQualificationModal';
import { 
  Trophy, 
  Search, 
  Sparkles, 
  Award, 
  Rocket, 
  BookOpen, 
  Filter, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function LeaderboardView() {
  const { children, currentUser } = useAppContext();
  
  // Initial group filter: if Pilote/Helper default to their group, else 'All'
  const [selectedGroup, setSelectedGroup] = useState<string>(
    currentUser.color_group ? currentUser.color_group : 'All'
  );
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRanksRoadmap, setShowRanksRoadmap] = useState<boolean>(false);

  // Modal states
  const [selectedChildForPromotion, setSelectedChildForPromotion] = useState<Child | null>(null);
  const [selectedChildForRecruit, setSelectedChildForRecruit] = useState<Child | null>(null);

  // Filter and sort children by total_accumulated_points descending
  const filteredChildren = children
    .filter(child => {
      if (selectedGroup !== 'All' && child.color_group !== selectedGroup) return false;
      if (statusFilter !== 'All' && child.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const fullName = `${child.first_name} ${child.last_name}`.toLowerCase();
        return fullName.includes(query) || child.current_rank.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a, b) => b.total_accumulated_points - a.total_accumulated_points);

  const readyForPromotionCount = children.filter(c => getNextRankInfo(c).isEligible).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 p-6 sm:p-7 rounded-2xl border border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">
            <Trophy size={14} className="text-amber-400 animate-pulse" />
            <span>Tableau d'Honneur & Hiérarchie Officielle</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Classement Général des Astronautes
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Progression en temps réel basée sur le barème quotidien de 250 points et validation solennelle des versets bibliques de rang.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={() => setShowRanksRoadmap(!showRanksRoadmap)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold border border-zinc-700/80 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <BookOpen size={14} className="text-amber-400" />
            {showRanksRoadmap ? 'Masquer la Hiérarchie' : 'Matrice des 18 Rangs'}
          </button>
        </div>
      </div>

      {/* Promotion Alert Banner if any kids are ready */}
      {readyForPromotionCount > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="font-semibold text-amber-950 text-xs sm:text-sm">
                {readyForPromotionCount} {readyForPromotionCount === 1 ? 'candidat est prêt' : 'candidats sont prêts'} pour la promotion de rang !
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Le seuil de points a été franchi. Évaluez la récitation du verset assigné.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 18 Ranks Roadmap Reference (Collapsible) */}
      {showRanksRoadmap && (
        <div className="bg-white rounded-xl p-5 border border-zinc-200/90 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="text-zinc-700" size={18} />
              <h3 className="font-bold text-zinc-900 text-sm">Système Officiel des 18 Rangs Astronautes</h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">Paliers & Versets Bibliques</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {RANK_SYSTEM.map((rank, idx) => (
              <div key={rank.title} className="p-3 rounded-lg border border-zinc-200/80 bg-zinc-50/50 space-y-1 hover:bg-white hover:border-zinc-300 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h5 className="font-semibold text-xs text-zinc-900 truncate">{rank.title}</h5>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-700 bg-white px-2 py-0.5 rounded border border-zinc-200/80">
                    {rank.points} pts
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                  <BookOpen size={11} className="text-zinc-400 shrink-0" />
                  <span className="truncate">{rank.verse}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher un astronaute ou rang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Group Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/80">
            {['All', 'Red', 'Green', 'Yellow', 'Blue'].map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedGroup === grp
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {getColorGroupLabel(grp)}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
          >
            <option value="All">Tous les Statuts</option>
            <option value="Qualified Astronaute">Astronautes Qualifiés</option>
            <option value="Recruit">Recrues</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm overflow-hidden">
        {filteredChildren.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Rocket size={36} className="mx-auto text-zinc-300 mb-2.5" />
            <p className="font-semibold text-xs text-zinc-700">Aucun candidat ne correspond aux filtres.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200/70">
            {filteredChildren.map((child, index) => {
              const { nextRank, isEligible, progressPercent } = getNextRankInfo(child);
              const isTopThree = index < 3 && selectedGroup === 'All' && !searchQuery;

              return (
                <div 
                  key={child.id}
                  className={`p-4 sm:p-4.5 transition-colors hover:bg-zinc-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 ${
                    isEligible ? 'bg-amber-50/40' : ''
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Rank position badge */}
                    <div className="w-9 h-9 rounded-xl shrink-0 font-mono font-bold text-xs flex items-center justify-center">
                      {isTopThree ? (
                        index === 0 ? (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 rounded-xl flex items-center justify-center font-extrabold shadow-sm border border-amber-300 text-sm">
                            🥇
                          </div>
                        ) : index === 1 ? (
                          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-zinc-300 text-zinc-800 rounded-xl flex items-center justify-center font-extrabold shadow-sm border border-zinc-300 text-sm">
                            🥈
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-700/30 to-amber-800/30 text-amber-900 rounded-xl flex items-center justify-center font-extrabold shadow-sm border border-amber-700/20 text-sm">
                            🥉
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-500 font-bold text-xs">
                          #{index + 1}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-bold text-zinc-900 text-sm sm:text-base tracking-tight truncate">
                          {child.first_name} {child.last_name}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border shadow-2xs ${getColorGroupClasses(child.color_group)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(child.color_group)} shadow-[0_0_4px_currentColor]`} />
                          Groupe {getColorGroupLabel(child.color_group)}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border shadow-2xs ${getRankBadgeClasses(child.current_rank)}`}>
                          {getRankDisplay(child.current_rank)}
                        </span>
                        {child.status === 'Recruit' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200/80 shadow-2xs">
                            Recrue ({child.qualification_progress?.consecutive_weeks || 0}/3 sem.)
                          </span>
                        )}
                      </div>

                      {/* Progress bar to next rank */}
                      {nextRank ? (
                        <div className="space-y-1 max-w-sm">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span>Vers : <strong className="text-zinc-800 font-semibold">{nextRank.title}</strong> ({nextRank.points} pts)</span>
                            <span className="font-mono font-bold text-zinc-700">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isEligible ? 'bg-amber-500 shadow-[0_0_6px_#fbbf24]' : 'bg-zinc-850'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                          <Sparkles size={12} className="text-amber-500" /> Rang Ultime d'Excellence Atteint
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Score & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pl-12 lg:pl-0">
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Points Cumulés</span>
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="font-mono text-lg font-extrabold text-zinc-900 tracking-tight">{child.total_accumulated_points}</span>
                        <span className="text-[10px] text-zinc-400 font-semibold">pts</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEligible && (
                        <button
                          type="button"
                          onClick={() => setSelectedChildForPromotion(child)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm glow-amber-subtle transition-all cursor-pointer active:scale-95"
                        >
                          <Sparkles size={13} />
                          Promouvoir
                        </button>
                      )}

                      {child.status === 'Recruit' && (
                        <button
                          type="button"
                          onClick={() => setSelectedChildForRecruit(child)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-all cursor-pointer active:scale-95"
                        >
                          <ShieldCheck size={13} />
                          Qualif
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Promotion Modal */}
      <PromotionModal
        child={selectedChildForPromotion}
        isOpen={Boolean(selectedChildForPromotion)}
        onClose={() => setSelectedChildForPromotion(null)}
      />

      {/* Recruit Qualification Modal */}
      <RecruitQualificationModal
        child={selectedChildForRecruit}
        isOpen={Boolean(selectedChildForRecruit)}
        onClose={() => setSelectedChildForRecruit(null)}
      />
    </div>
  );
}

