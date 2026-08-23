import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { getColorGroupClasses, getColorGroupDot, getColorGroupLabel, getRankBadgeClasses, getRankDisplay, getStatusLabel } from '../../utils';
import { getNextRankInfo } from '../../constants/ranks';
import { Child } from '../../types';
import LeaderboardView from './LeaderboardView';
import PromotionModal from '../PromotionModal';
import { 
  Users, 
  UserCheck, 
  Sparkles, 
  BarChart3, 
  Trophy, 
  BookOpen, 
  Award, 
  Rocket, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

export default function AdminView() {
  const { activeTab, children, attendances, reports, updateReportStatus } = useAppContext();
  const [selectedChildForPromotion, setSelectedChildForPromotion] = useState<Child | null>(null);

  if (activeTab === 'Leaderboard' || activeTab === 'Ranks' || activeTab === 'Classement' || activeTab === 'Rangs') {
    return <LeaderboardView />;
  }

  if (activeTab === 'Overview' || activeTab === "Vue d'Ensemble") {
    const totalKids = children.length;
    const qualifiedKids = children.filter(c => c.status === 'Qualified Astronaute').length;
    const recruitsCount = children.filter(c => c.status === 'Recruit').length;
    const totalPoints = children.reduce((sum, c) => sum + c.total_accumulated_points, 0);
    const readyPromotions = children.filter(c => getNextRankInfo(c).isEligible);

    const groupStats = ['Red', 'Green', 'Yellow', 'Blue'].map(color => {
      const groupKids = children.filter(c => c.color_group === color);
      const groupPts = groupKids.reduce((s, k) => s + k.total_accumulated_points, 0);
      return {
        color,
        count: groupKids.length,
        points: groupPts,
      };
    });

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-zinc-950 text-zinc-100 p-5 sm:p-6 rounded-xl border border-zinc-850 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            <Trophy size={13} className="text-amber-400" />
            <span>Portail d'Administration du Ministère</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Supervision Globale des Astronautes</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Supervision générale sur les 4 groupes de couleur, indicateurs d'assiduité et validation des rapports mensuels.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-2xs">
            <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-700 mb-3 border border-zinc-200/60">
              <Users size={16} />
            </div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Total des Inscrits</p>
            <p className="text-2xl font-mono font-bold text-zinc-900 mt-0.5">{totalKids}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{recruitsCount} recrues en formation</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-2xs">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700 mb-3 border border-emerald-200/60">
              <UserCheck size={16} />
            </div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Astronautes Qualifiés</p>
            <p className="text-2xl font-mono font-bold text-zinc-900 mt-0.5">{qualifiedKids}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">{Math.round((qualifiedKids / (totalKids || 1)) * 100)}% de taux de qualification</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-2xs">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-700 mb-3 border border-amber-200/60">
              <Sparkles size={16} />
            </div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Prêts pour Promotion</p>
            <p className="text-2xl font-mono font-bold text-amber-600 mt-0.5">{readyPromotions.length}</p>
            <p className="text-[11px] text-amber-800 mt-0.5 font-medium">Examen de verset en attente</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-2xs">
            <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-700 mb-3 border border-zinc-200/60">
              <BarChart3 size={16} />
            </div>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Points Attribués</p>
            <p className="text-2xl font-mono font-bold text-zinc-900 mt-0.5">{totalPoints.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Sur 8 critères officiels</p>
          </div>
        </div>

        {/* Group Distribution & Points */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Aperçu des Groupes de Couleur</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {groupStats.map(stat => (
              <div key={stat.color} className={`p-4 rounded-xl border ${getColorGroupClasses(stat.color as any)} shadow-2xs`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${getColorGroupDot(stat.color as any)}`} />
                    <p className="text-xs font-semibold">Groupe {getColorGroupLabel(stat.color)}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/70">
                    {stat.points} pts
                  </span>
                </div>
                <p className="text-2xl font-mono font-bold mt-2">{stat.count} <span className="text-xs font-sans font-normal opacity-70">candidats</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Promotions list */}
        {readyPromotions.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-amber-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-600" size={16} />
                <h3 className="font-bold text-zinc-900 text-xs sm:text-sm">Candidats Prêts pour l'Examen de Récitation Biblique</h3>
              </div>
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                {readyPromotions.length} Éligible(s)
              </span>
            </div>

            <div className="divide-y divide-zinc-100">
              {readyPromotions.map(child => {
                const { nextRank } = getNextRankInfo(child);
                return (
                  <div key={child.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-zinc-900 text-white text-[11px] font-bold flex items-center justify-center">
                        {child.first_name[0]}{child.last_name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-zinc-900">{child.first_name} {child.last_name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${getColorGroupClasses(child.color_group)}`}>
                            Groupe {getColorGroupLabel(child.color_group)}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          {getRankDisplay(child.current_rank)} → <strong className="text-zinc-800">{nextRank?.title}</strong> ({nextRank?.verse})
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedChildForPromotion(child)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      Examen
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <PromotionModal
          child={selectedChildForPromotion}
          isOpen={Boolean(selectedChildForPromotion)}
          onClose={() => setSelectedChildForPromotion(null)}
        />
      </div>
    );
  }

  if (activeTab === 'Reports' || activeTab === 'Rapports Mensuels') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 animate-in fade-in duration-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Rapports Mensuels de Groupe</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Consultez et validez les récapitulatifs mensuels soumis par les Pilotes de Groupe.</p>
        </div>

        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold border ${getColorGroupClasses(report.color_group)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(report.color_group)}`} />
                    Groupe {getColorGroupLabel(report.color_group)}
                  </span>
                  <span className="text-zinc-500 font-mono text-xs">{report.month_year}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  report.status === 'Submitted' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                  report.status === 'Reviewed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  'bg-zinc-100 text-zinc-600 border border-zinc-200'
                }`}>
                  {getStatusLabel(report.status)}
                </span>
              </div>
              <p className="text-zinc-700 text-xs leading-relaxed whitespace-pre-wrap">{report.content}</p>
              
              <div className="pt-2 border-t border-zinc-100 flex justify-end gap-2">
                {report.status === 'Submitted' && (
                  <button 
                    type="button"
                    onClick={() => updateReportStatus(report.id, 'Reviewed')}
                    className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <CheckCircle2 size={14} />
                    Valider le Rapport
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'Roster' || activeTab === 'Tous les Enfants') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 animate-in fade-in duration-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">Répertoire Général de Tous les Enfants</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Annuaire complet des membres répartis dans les 4 groupes de couleur.</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xs border border-zinc-200/90 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Nom & Prénom</th>
                <th className="px-4 py-3">Groupe</th>
                <th className="px-4 py-3">Rang</th>
                <th className="px-4 py-3">Total Points</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70">
              {children.map(child => {
                const { isEligible, nextRank } = getNextRankInfo(child);
                return (
                  <tr key={child.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-zinc-900">{child.first_name} {child.last_name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${getColorGroupClasses(child.color_group)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getColorGroupDot(child.color_group)}`} />
                        Groupe {getColorGroupLabel(child.color_group)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getRankBadgeClasses(child.current_rank)}`}>
                        {getRankDisplay(child.current_rank)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-zinc-900">{child.total_accumulated_points} pts</td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                        child.status === 'Qualified Astronaute' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-zinc-100 text-zinc-700 border border-zinc-200/60'
                      }`}>
                        {getStatusLabel(child.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEligible ? (
                        <button
                          type="button"
                          onClick={() => setSelectedChildForPromotion(child)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[11px] font-semibold shadow-2xs cursor-pointer"
                        >
                          Promouvoir ({nextRank?.title})
                        </button>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">En progression</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <PromotionModal
          child={selectedChildForPromotion}
          isOpen={Boolean(selectedChildForPromotion)}
          onClose={() => setSelectedChildForPromotion(null)}
        />
      </div>
    );
  }

  return null;
}

