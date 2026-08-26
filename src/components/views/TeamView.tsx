import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { 
  getColorGroupClasses, 
  getColorGroupDot, 
  getColorGroupLabel, 
  getColorGroupSolid, 
  getRankBadgeClasses, 
  getRankDisplay, 
  getStatusLabel 
} from '../../utils';
import { getNextRankInfo, calculateDailyPoints } from '../../constants/ranks';
import { Child } from '../../types';
import DailyGradingCard from '../DailyGradingCard';
import PromotionModal from '../PromotionModal';
import RecruitQualificationModal from '../RecruitQualificationModal';
import LeaderboardView from './LeaderboardView';
import { 
  Rocket, 
  Sparkles, 
  Calendar, 
  CheckCircle, 
  FileText, 
  UserPlus, 
  Award, 
  ShieldCheck, 
  Users,
  CheckCircle2,
  Table,
  LayoutList,
  Save,
  Check,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CalendarCheck
} from 'lucide-react';

export default function TeamView() {
  const { 
    activeTab, 
    setActiveTab,
    currentUser, 
    children, 
    gradings, 
    saveDailyGrading, 
    reports, 
    saveMonthlyReport, 
    addChild,
    addToast
  } = useAppContext();
  
  const groupColor = currentUser.color_group;

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedChildForPromotion, setSelectedChildForPromotion] = useState<Child | null>(null);
  const [selectedChildForRecruit, setSelectedChildForRecruit] = useState<Child | null>(null);
  const [rosterSearch, setRosterSearch] = useState('');

  // New child modal state
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newStatus, setNewStatus] = useState<'Recruit' | 'Qualified Astronaute'>('Recruit');

  // Report state
  const reportMonth = new Date().toISOString().slice(0, 7);
  const reportMonthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${reportMonth}-01`));
  const latestReport = reports.find(r => r.color_group === groupColor && r.month_year === reportMonth);
  const [reportContent, setReportContent] = useState(latestReport?.content || '');

  if (!groupColor) {
    return (
      <div className="p-8 text-center text-zinc-500">
        <p className="text-sm">Aucun groupe de couleur assigné pour cet utilisateur.</p>
      </div>
    );
  }

  const groupChildren = children.filter(c => c.color_group === groupColor);
  const recruits = groupChildren.filter(c => c.status === 'Recruit');
  const qualified = groupChildren.filter(c => c.status === 'Qualified Astronaute');
  const readyForPromotion = groupChildren.filter(c => getNextRankInfo(c).isEligible);

  // Filtered roster
  const filteredRoster = groupChildren.filter(child => {
    if (!rosterSearch.trim()) return true;
    const query = rosterSearch.toLowerCase();
    return `${child.first_name} ${child.last_name}`.toLowerCase().includes(query) ||
           child.current_rank.toLowerCase().includes(query);
  });

  // Calculate live daily stats for this group and date
  const groupGradingsToday = gradings.filter(g => 
    g.date === selectedDate && groupChildren.some(c => c.id === g.child_id)
  );

  const totalPointsRecordedToday = groupGradingsToday.reduce((acc, g) => acc + calculateDailyPoints(g), 0);
  const presentCountToday = groupGradingsToday.filter(g => g.presence).length;

  const handleCreateChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim()) return;

    addChild({
      first_name: newFirstName.trim(),
      last_name: newLastName.trim(),
      color_group: groupColor,
      status: newStatus,
      qualification_progress: {
        consecutive_weeks: newStatus === 'Qualified Astronaute' ? 3 : 0,
        recited_astronaut_verse: newStatus === 'Qualified Astronaute',
        recited_motto: newStatus === 'Qualified Astronaute',
        recited_nt_books: newStatus === 'Qualified Astronaute',
      },
      current_rank: newStatus === 'Qualified Astronaute' ? 'Astronaute' : 'Recruit',
      total_accumulated_points: 0,
    });

    setNewFirstName('');
    setNewLastName('');
    setIsAddChildOpen(false);
  };

  const handleSaveReport = (status: 'Draft' | 'Submitted') => {
    saveMonthlyReport({
      color_group: groupColor,
      month_year: reportMonth,
      content: reportContent,
      status,
    });
  };

  const handleMarkAllPresent = () => {
    groupChildren.forEach(child => {
      const existing = gradings.find(g => g.child_id === child.id && g.date === selectedDate);
      saveDailyGrading({
        id: existing?.id,
        child_id: child.id,
        date: selectedDate,
        presence: true,
        punctuality: existing?.punctuality ?? true,
        good_behavior: existing?.good_behavior ?? true,
        verse_of_the_day: existing?.verse_of_the_day ?? false,
        bible: existing?.bible ?? true,
        cleanliness: existing?.cleanliness ?? true,
        scarf: existing?.scarf ?? false,
        visitors_count: existing?.visitors_count ?? 0,
      });
    });
    addToast('success', 'Présences Enregistrées', `Tous les membres (${groupChildren.length}) sont marqués Présents.`);
  };

  const shiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Top Mobile Segmented Control Bar
  const renderSegmentedTabs = () => (
    <div className="bg-zinc-200/70 p-1 rounded-xl flex items-center gap-1 max-w-lg mx-auto sm:mx-0 shadow-2xs mb-4">
      <button
        type="button"
        onClick={() => setActiveTab('Daily Grading')}
        className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          activeTab === 'Daily Grading' || activeTab === 'Attendance'
            ? 'bg-white text-zinc-900 shadow-2xs'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        <CalendarCheck size={14} />
        <span>Notation & Présences</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('Group Roster')}
        className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          activeTab === 'Group Roster' || activeTab === 'Effectif du Groupe'
            ? 'bg-white text-zinc-900 shadow-2xs'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        <Users size={14} />
        <span>Effectif ({groupChildren.length})</span>
        {readyForPromotion.length > 0 && (
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        )}
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('Report Form')}
        className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          activeTab === 'Report Form' || activeTab === 'Rapport Mensuel'
            ? 'bg-white text-zinc-900 shadow-2xs'
            : 'text-zinc-600 hover:text-zinc-900'
        }`}
      >
        <FileText size={14} />
        <span>Rapport</span>
      </button>
    </div>
  );

  // 1. Group Roster & Recruits View
  if (activeTab === 'Group Roster' || activeTab === 'Effectif du Groupe') {
    return (
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
        {renderSegmentedTabs()}

        {/* Header Ribbon */}
        <div className="bg-white rounded-xl border border-zinc-200/90 p-4 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${getColorGroupDot(groupColor)}`} />
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Espace Direction • Groupe {getColorGroupLabel(groupColor)}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900">
              Effectif & Suivi des Qualifications
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {groupChildren.length} enfants inscrits ({qualified.length} qualifiés, {recruits.length} recrues en observation)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddChildOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <UserPlus size={15} />
            <span>Inscrire un Nouvel Enfant</span>
          </button>
        </div>

        {/* Promotion banner for group */}
        {readyForPromotion.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="font-semibold text-amber-950 text-xs sm:text-sm">
                  {readyForPromotion.length} candidat(s) prêts pour le passage de grade !
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Faites réciter le passage biblique de promotion pour valider leur nouveau grade.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white p-3 rounded-xl border border-zinc-200/90 shadow-2xs flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou rang..."
              value={rosterSearch}
              onChange={e => setRosterSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200/80 rounded-lg text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all"
            />
          </div>

          <div className="text-xs text-zinc-500 font-medium shrink-0">
            <strong className="text-zinc-800">{filteredRoster.length}</strong> / {groupChildren.length}
          </div>
        </div>

        {/* Children Cards for Mobile / Table for Desktop */}
        <div className="bg-white rounded-xl shadow-2xs border border-zinc-200/90 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-500 uppercase tracking-wider font-semibold text-[10px] border-b border-zinc-200/80">
                <tr>
                  <th className="py-3 px-4 sticky left-0 bg-zinc-50/95 backdrop-blur-xs z-10">Candidat</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Rang Actuel</th>
                  <th className="py-3 px-4 text-right">Points Cumulés</th>
                  <th className="py-3 px-4">Progression Rang</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 text-zinc-700">
                {filteredRoster.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400 italic">
                      Aucun enfant ne correspond à la recherche.
                    </td>
                  </tr>
                ) : (
                  filteredRoster.map(child => {
                    const { nextRank, isEligible, progressPercent } = getNextRankInfo(child);
                    return (
                      <tr key={child.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-3 px-4 sticky left-0 bg-white hover:bg-zinc-50/60 transition-colors z-10 border-r border-zinc-100 sm:border-r-0">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 font-semibold flex items-center justify-center text-[11px] shrink-0">
                              {child.first_name[0]}{child.last_name[0]}
                            </div>
                            <span className="font-semibold text-zinc-900 whitespace-nowrap">
                              {child.first_name} {child.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                            child.status === 'Recruit'
                              ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                          }`}>
                            {getStatusLabel(child.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getRankBadgeClasses(child.current_rank)}`}>
                            {getRankDisplay(child.current_rank)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 whitespace-nowrap">
                          {child.total_accumulated_points} pts
                        </td>
                        <td className="py-3 px-4 min-w-36">
                          {nextRank ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                <span>{nextRank.title}</span>
                                <span>{progressPercent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${isEligible ? 'bg-amber-500' : 'bg-zinc-800'}`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-700">Rang Max Atteint</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEligible && (
                              <button
                                type="button"
                                onClick={() => setSelectedChildForPromotion(child)}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs cursor-pointer transition-all active:scale-95"
                              >
                                Promouvoir
                              </button>
                            )}
                            {child.status === 'Recruit' && (
                              <button
                                type="button"
                                onClick={() => setSelectedChildForRecruit(child)}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/80 cursor-pointer transition-all active:scale-95"
                              >
                                Qualif ({child.qualification_progress?.consecutive_weeks || 0}/3)
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden divide-y divide-zinc-200/70">
            {filteredRoster.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs italic">
                Aucun enfant ne correspond à la recherche.
              </div>
            ) : (
              filteredRoster.map(child => {
                const { nextRank, isEligible, progressPercent } = getNextRankInfo(child);
                return (
                  <div key={child.id} className="p-4 space-y-3 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {child.first_name[0]}{child.last_name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 text-sm">
                            {child.first_name} {child.last_name}
                          </h4>
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-medium border ${
                            child.status === 'Recruit'
                              ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                          } mt-0.5`}>
                            {getStatusLabel(child.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getRankBadgeClasses(child.current_rank)}`}>
                          {getRankDisplay(child.current_rank)}
                        </span>
                        <span className="font-mono text-xs font-bold text-zinc-900">
                          {child.total_accumulated_points} pts
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    {nextRank ? (
                      <div className="space-y-1 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/70">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span>Rang suivant: <strong className="text-zinc-800">{nextRank.title}</strong></span>
                          <span className="font-mono font-bold text-zinc-700">{progressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${isEligible ? 'bg-amber-500' : 'bg-zinc-800'}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50/50 p-2 rounded-lg text-center text-[10px] font-medium text-amber-800 border border-amber-200/60">
                        Palier Maximal Atteint
                      </div>
                    )}

                    {/* Action buttons on mobile */}
                    <div className="flex items-center gap-2 pt-1">
                      {isEligible && (
                        <button
                          type="button"
                          onClick={() => setSelectedChildForPromotion(child)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs cursor-pointer transition-all active:scale-98 min-h-[44px]"
                        >
                          <Sparkles size={14} />
                          <span>Promouvoir ({nextRank?.title})</span>
                        </button>
                      )}
                      {child.status === 'Recruit' && (
                        <button
                          type="button"
                          onClick={() => setSelectedChildForRecruit(child)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/80 cursor-pointer transition-all active:scale-98 min-h-[44px]"
                        >
                          <ShieldCheck size={14} />
                          <span>Qualif ({child.qualification_progress?.consecutive_weeks || 0}/3)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Add Child Bottom Sheet / Modal */}
        {isAddChildOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-zinc-200/90 animate-in slide-in-from-bottom duration-200">
              <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto mb-3 sm:hidden" />
              
              <h3 className="text-base font-bold text-zinc-900 mb-1">
                Inscrire un Enfant • Groupe {getColorGroupLabel(groupColor)}
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                Créez une nouvelle fiche de recrue ou d'astronaute qualifié.
              </p>
              
              <form onSubmit={handleCreateChild} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={e => setNewFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                    placeholder="Ex: Samuel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Nom de Famille</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={e => setNewLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                    placeholder="Ex: Kouamé"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Statut d'Entrée</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Recruit">Recrue (Stage d'intégration 3 semaines)</option>
                    <option value="Qualified Astronaute">Astronaute Qualifié (Rang Astronaute actif)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddChildOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xs cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modals */}
        <PromotionModal
          child={selectedChildForPromotion}
          isOpen={Boolean(selectedChildForPromotion)}
          onClose={() => setSelectedChildForPromotion(null)}
        />
        <RecruitQualificationModal
          child={selectedChildForRecruit}
          isOpen={Boolean(selectedChildForRecruit)}
          onClose={() => setSelectedChildForRecruit(null)}
        />
      </div>
    );
  }

  // 2. Daily Grading & Attendance View
  if (activeTab === 'Daily Grading' || activeTab === 'Attendance' || activeTab === 'Évaluation Quotidienne' || activeTab === 'Présences') {
    return (
      <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 sm:space-y-5 pb-28 md:pb-20 animate-in fade-in duration-200">
        {renderSegmentedTabs()}

        {/* Header Toolbar */}
        <div className="bg-white rounded-xl border border-zinc-200/90 p-3.5 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${getColorGroupDot(groupColor)}`} />
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Groupe {getColorGroupLabel(groupColor)} • Feuille Quotidienne
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-zinc-900">
              Notation des 8 Critères & Présence
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Barème officiel jusqu'à 250 pts/enfant (+25 pts par invité).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Date Navigator Stepper */}
            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200/80 px-2 py-1 rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => shiftDate(-7)}
                title="Semaine précédente"
                className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <Calendar size={13} className="text-zinc-400 ml-0.5" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-xs font-semibold text-zinc-800 bg-transparent focus:outline-none cursor-pointer py-0.5"
              />
              <button
                type="button"
                onClick={() => shiftDate(7)}
                title="Semaine suivante"
                className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Quick Presets */}
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/80 transition-colors cursor-pointer active:scale-95 shadow-2xs"
            >
              Tous Présents
            </button>
          </div>
        </div>

        {/* List of cards */}
        <div className="space-y-2.5">
          {groupChildren.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-zinc-200/90 text-center text-zinc-500">
              <Users size={32} className="mx-auto text-zinc-300 mb-2" />
              <p className="font-semibold text-sm">Aucun enfant assigné au Groupe {getColorGroupLabel(groupColor)}.</p>
              <p className="text-xs text-zinc-400 mt-1">Inscrivez des enfants depuis l'onglet Effectif.</p>
            </div>
          ) : (
            groupChildren.map(child => (
              <DailyGradingCard
                key={child.id}
                child={child}
                date={selectedDate}
                isExpandedDefault={true}
              />
            ))
          )}
        </div>

        {/* Sticky Real-Time Summary Bar at bottom */}
        {/* On mobile: placed above the bottom navigation (bottom-16); on desktop: bottom-4 */}
        <div className="fixed bottom-16 md:bottom-4 left-3 right-3 sm:left-64 sm:right-8 z-30 max-w-4xl mx-auto pointer-events-none">
          <div className="pointer-events-auto bg-zinc-950/95 text-white rounded-2xl p-2.5 sm:p-3 px-3.5 sm:px-4 shadow-2xl border border-zinc-800 flex items-center justify-between gap-2.5 backdrop-blur-md">
            <div className="flex items-center gap-3 sm:gap-4 text-xs min-w-0">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs">
                <span className="text-zinc-400 hidden xs:inline">Séance :</span>
                <span className="font-semibold text-zinc-200 truncate">{selectedDate}</span>
              </div>
              <span className="text-zinc-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400">Présents :</span>
                <span className="font-mono font-bold text-emerald-400">
                  {presentCountToday}/{groupChildren.length}
                </span>
              </div>
              <span className="hidden sm:inline text-zinc-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400 hidden sm:inline">Total :</span>
                <span className="font-mono font-bold text-amber-400">
                  +{totalPointsRecordedToday} pts
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Tous Présents
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Leaderboard & Ranks Tab
  if (activeTab === 'Leaderboard' || activeTab === 'Ranks' || activeTab === 'Classement' || activeTab === 'Rangs') {
    return <LeaderboardView />;
  }

  // 4. Monthly Report Form View
  if (activeTab === 'Report Form' || activeTab === 'Monthly Report' || activeTab === 'Rapport Mensuel' || activeTab === 'Formulaire de Rapport') {
    return (
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
        {renderSegmentedTabs()}

        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">Rapport Mensuel de Groupe</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Transmission du bilan d'activité et des faits marquants du Groupe {getColorGroupLabel(groupColor)} au Grand Leader.
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xs border border-zinc-200/90 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getColorGroupClasses(groupColor)}`}>
                Groupe {getColorGroupLabel(groupColor)}
              </span>
              <span className="text-xs font-medium text-zinc-500">• Période : {reportMonthLabel}</span>
            </div>

            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
              latestReport?.status === 'Submitted' ? 'bg-amber-50 text-amber-800 border-amber-200/80' :
              latestReport?.status === 'Reviewed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80' :
              'bg-zinc-100 text-zinc-700 border-zinc-200/80'
            }`}>
              {getStatusLabel(latestReport?.status || 'Draft')}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Synthèse & Observations Pédagogiques
            </label>
            <textarea 
              className="w-full h-52 p-3.5 border border-zinc-200/90 rounded-lg focus:ring-1 focus:ring-zinc-900 outline-none text-xs text-zinc-800 resize-none font-sans leading-relaxed"
              placeholder="Indiquez l'évolution des recrues, le taux de mémorisation des versets, les difficultés rencontrées et les besoins matériels..."
              value={reportContent}
              onChange={e => setReportContent(e.target.value)}
            />
            <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
              <span>Mentionnez les candidats prêts pour l'examen de passage de grade.</span>
              <span>{reportContent.length} caractères</span>
            </div>
          </div>
          
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => handleSaveReport('Draft')}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-100 border border-zinc-200/90 transition-colors cursor-pointer"
            >
              Enregistrer Brouillon
            </button>
            <button
              type="button"
              onClick={() => handleSaveReport('Submitted')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xs transition-all cursor-pointer"
            >
              Soumettre le Rapport
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

