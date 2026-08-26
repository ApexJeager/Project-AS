import { Child, DailyGrading, RankDefinition } from '../types';

// Canonical published progression: keep this list as the single source of truth.
export const RANK_SYSTEM: RankDefinition[] = [
  { points: 500, title: 'Astronaute', verse: '2 Timothée 2:16', verseDescription: 'Évite les discours vains et profanes.' },
  { points: 1000, title: 'Apprenti', verse: 'Matthieu 6:33', verseDescription: 'Cherchez premièrement le royaume et la justice de Dieu.' },
  { points: 1500, title: 'Sentinelle', verse: 'Ézéchiel 33:7', verseDescription: 'Je t’ai établi sentinelle sur la maison d’Israël.' },
  { points: 2000, title: 'Éclaireur', verse: 'Psaume 119:105', verseDescription: 'Ta parole est une lampe à mes pieds.' },
  { points: 2500, title: 'Explorateur', verse: 'Josué 1:9', verseDescription: 'Fortifie-toi et prends courage.' },
  { points: 3000, title: 'Pionnier', verse: 'Ésaïe 43:19', verseDescription: 'Voici, je vais faire une chose nouvelle.' },
  { points: 3500, title: 'Navigateur', verse: 'Psaume 32:8', verseDescription: 'Je t’instruirai et te montrerai la voie.' },
  { points: 4000, title: 'Capitaine', verse: '1 Timothée 4:12', verseDescription: 'Sois un modèle pour les fidèles.' },
  { points: 4500, title: 'Commandant', verse: 'Éphésiens 6:10', verseDescription: 'Fortifiez-vous dans le Seigneur.' },
  { points: 5000, title: "Garde d'Honneur", verse: '1 Corinthiens 16:13', verseDescription: 'Veillez, demeurez fermes dans la foi.' },
  { points: 5500, title: 'Chevalier Céleste', verse: '2 Timothée 4:7', verseDescription: 'J’ai combattu le bon combat.' },
  { points: 6000, title: 'Ambassadeur', verse: '2 Corinthiens 5:20', verseDescription: 'Nous faisons donc les fonctions d’ambassadeurs.' },
  { points: 6500, title: 'Sentinelle Stellaire', verse: 'Daniel 12:3', verseDescription: 'Ceux qui auront été intelligents brilleront.' },
  { points: 7000, title: 'Légat Céleste', verse: 'Philippiens 3:20', verseDescription: 'Notre cité à nous est dans les cieux.' },
  { points: 7500, title: 'Maître de Mission', verse: 'Colossiens 3:23', verseDescription: 'Tout ce que vous faites, faites-le de bon cœur.' },
  { points: 8000, title: 'Grand Commandeur', verse: 'Romains 8:37', verseDescription: 'Nous sommes plus que vainqueurs.' },
  { points: 10000, title: 'Amiral Suprême', verse: 'Apocalypse 2:10', verseDescription: 'Sois fidèle jusqu’à la mort.' },
];

export const GRADING_CRITERIA = [
  { key: 'presence', label: 'Présence', points: 30, description: 'Présent au rassemblement' },
  { key: 'punctuality', label: 'Ponctualité', points: 40, description: 'Arrivé à l’heure' },
  { key: 'good_behavior', label: 'Bonne conduite', points: 40, description: 'Respect, calme et écoute' },
  { key: 'verse_of_the_day', label: 'Verset du jour', points: 40, description: 'Récitation du verset hebdomadaire' },
  { key: 'bible', label: 'Bible apportée', points: 50, description: 'Possession de sa Bible personnelle' },
  { key: 'cleanliness', label: 'Propreté', points: 30, description: 'Tenue soignée et propre' },
  { key: 'scarf', label: 'Foulard porté', points: 20, description: 'Port du foulard de groupe' },
  { key: 'visitors_count', label: 'Visiteurs', points: 25, description: 'Bonus par ami invité' },
] as const;

export const VISITOR_POINTS = 25;

export function calculateDailyPoints(grading: Partial<DailyGrading>): number {
  return GRADING_CRITERIA.reduce((total, criterion) => {
    if (criterion.key === 'visitors_count') return total + Math.max(0, Number(grading.visitors_count || 0)) * criterion.points;
    return total + (grading[criterion.key] ? criterion.points : 0);
  }, 0);
}

export function getRankIndex(rankTitle: string): number {
  if (!rankTitle) return -1;
  const normalized = rankTitle.trim().toLowerCase();
  if (normalized === 'recruit') return -1;
  return RANK_SYSTEM.findIndex(rank => rank.title.toLowerCase() === normalized);
}

export function getNextRankInfo(child: Child): {
  nextRank: RankDefinition | null;
  isEligible: boolean;
  pointsNeeded: number;
  progressPercent: number;
  currentRankObj: RankDefinition | null;
} {
  const currentRankIdx = getRankIndex(child.current_rank);
  const currentRankObj = currentRankIdx >= 0 ? RANK_SYSTEM[currentRankIdx] : null;
  const nextRank = RANK_SYSTEM[currentRankIdx + 1] || null;
  if (!nextRank) return { nextRank: null, isEligible: false, pointsNeeded: 0, progressPercent: 100, currentRankObj };
  const previousPoints = currentRankObj?.points || 0;
  const totalPoints = child.total_accumulated_points || 0;
  const pointsNeeded = Math.max(0, nextRank.points - totalPoints);
  const progressPercent = Math.min(100, Math.max(0, Math.round(((totalPoints - previousPoints) / Math.max(1, nextRank.points - previousPoints)) * 100)));
  return { nextRank, isEligible: totalPoints >= nextRank.points && child.status === 'Qualified Astronaute', pointsNeeded, progressPercent, currentRankObj };
}

export function isRecruitFullyQualified(progress: Child['qualification_progress']): boolean {
  return progress.consecutive_weeks >= 3 && progress.recited_astronaut_verse && progress.recited_motto && progress.recited_nt_books;
}
