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
      <div className="bg-zinc-950 text-zinc-100 p-5 sm:p-6 rounded-xl border border-zinc-850 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            <Trophy size={14} className="text-amber-400" />
            <span>Tableau d'Honneur & Progression Rangs</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Classement Général des Astronautes
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
            Points cumulés selon les 8 critères officiels et validation des passages bibliques de rang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRanksRoadmap(!showRanksRoadmap)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 transition-all cursor-pointer shadow-2xs"
          >
            <BookOpen size={14} className="text-zinc-400" />
            {showRanksRoadmap ? 'Masquer la Hiérarchie' : 'Consulter les 18 Rangs'}
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
      <div className="bg-white p-3 rounded-xl border border-zinc-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou rang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
          />
        </div>

        {/* Group Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
            {['All', 'Red', 'Green', 'Yellow', 'Blue'].map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setSelectedGroup(grp)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  selectedGroup === grp
                    ? 'bg-white text-zinc-900 font-semibold shadow-2xs'
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
            className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
          >
            <option value="All">Tous les Statuts</option>
            <option value="Qualified Astronaute">Astronautes Qualifiés</option>
            <option value="Recruit">Recrues</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {filteredChildren.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Rocket size={32} className="mx-auto text-zinc-300 mb-2" />
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
                  className={`p-3.5 sm:p-4 transition-colors hover:bg-zinc-50/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                    isEligible ? 'bg-amber-50/30' : ''
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Rank position badge */}
                    <div className="w-8 h-8 rounded-lg shrink-0 font-mono font-bold text-xs flex items-center justify-center">
                      {isTopThree ? (
                        index === 0 ? (
                          <div className="w-full h-full bg-amber-400 text-amber-950 rounded-lg flex items-center justify-center font-bold shadow-2xs">
                            1
                          </div>
                        ) : index === 1 ? (
                          <div className="w-full h-full bg-zinc-300 text-zinc-800 rounded-lg flex items-center justify-center font-bold shadow-2xs">
                            2
                          </div>
                        ) : (
                          <div className="w-full h-full bg-amber-600/25 text-amber-900 rounded-lg flex items-center justify-center font-bold shadow-2xs">
                            3
                          </div>
                        )
                      ) : (
                        <span className="text-zinc-400">#{index + 1}</span>
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-zinc-900 text-sm truncate">
                          {child.first_name} {child.last_name}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium border ${getColorGroupClasses(child.color_group)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(child.color_group)}`} />
                          Groupe {getColorGroupLabel(child.color_group)}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${getRankBadgeClasses(child.current_rank)}`}>
                          {getRankDisplay(child.current_rank)}
                        </span>
                        {child.status === 'Recruit' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/60">
                            Recrue ({child.qualification_progress?.consecutive_weeks || 0}/3 sem.)
                          </span>
                        )}
                      </div>

                      {/* Progress bar to next rank */}
                      {nextRank ? (
                        <div className="space-y-1 max-w-sm">
                          <div className="flex items-center justify-between text-[10px] text-zinc-500">
                            <span>Rang Suivant : <strong className="text-zinc-700">{nextRank.title}</strong> ({nextRank.points} pts)</span>
                            <span className="font-mono">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isEligible ? 'bg-amber-500' : 'bg-zinc-800'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                          <Sparkles size={12} /> Palier Maximal Atteint
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Score & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pl-11 lg:pl-0">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Total Cumulé</span>
                      <div className="flex items-baseline justify-end gap-0.5">
                        <span className="font-mono text-base font-bold text-zinc-900">{child.total_accumulated_points}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">pts</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isEligible && (
                        <button
                          type="button"
                          onClick={() => setSelectedChildForPromotion(child)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition-all cursor-pointer"
                        >
                          <Sparkles size={13} />
                          Promouvoir
                        </button>
                      )}

                      {child.status === 'Recruit' && (
                        <button
                          type="button"
                          onClick={() => setSelectedChildForRecruit(child)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/80 transition-all cursor-pointer"
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

