import { RankDefinition, Child, DailyGrading } from '../types';

export const RANK_SYSTEM: RankDefinition[] = [
  { points: 400, title: "Astronaute 3e classe", verse: "Jean 3:16-18", verseDescription: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique..." },
  { points: 800, title: "Astronaute 2e classe", verse: "Romains 10:9,10,13", verseDescription: "Si tu confesses de ta bouche le Seigneur Jésus..." },
  { points: 1300, title: "Astronaute 1e classe", verse: "1 Jean 2:2-5", verseDescription: "Il est lui-même une victime expiatoire pour nos péchés..." },
  { points: 1800, title: "Sergent", verse: "Psaumes 23", verseDescription: "L'Éternel est mon berger: je ne manquerai de rien..." },
  { points: 2300, title: "Sergent Chef", verse: "Psaumes 1", verseDescription: "Heureux l'homme qui ne marche pas selon le conseil des méchants..." },
  { points: 2900, title: "Adjudant", verse: "Jean 14:6; Jean 8:24; Jean 10:12; Hébreux 7:25", verseDescription: "Jésus lui dit: Je suis le chemin, la vérité, et la vie..." },
  { points: 3500, title: "Adjudant Chef", verse: "Ésaïe 12:2; Actes 4:12; 2 Corinthiens 6:2; Jean 1:12", verseDescription: "Voici, Dieu est ma délivrance, je serai plein de confiance..." },
  { points: 4000, title: "Sous-lieutenant", verse: "Romains 8:37-39", verseDescription: "Mais dans toutes ces choses nous sommes plus que vainqueurs..." },
  { points: 4500, title: "Lieutenant", verse: "Ésaïe 53:1-6", verseDescription: "Qui a cru à ce qui nous était annoncé?..." },
  { points: 5100, title: "Capitaine", verse: "Philippiens 2:5-11", verseDescription: "Ayez en vous les sentiments qui étaient en Jésus-Christ..." },
  { points: 5700, title: "Major", verse: "2 Timothée 1:7-14", verseDescription: "Car ce n'est pas un esprit de timidité que Dieu nous a donné..." },
  { points: 6400, title: "Lieutenant-Colonel", verse: "1 Thessaloniciens 4:13-18", verseDescription: "Nous ne voulons pas, frères, que vous soyez dans l'ignorance..." },
  { points: 7100, title: "Colonel", verse: "Éphésiens 6:11-17", verseDescription: "Revêtez-vous de toutes les armes de Dieu..." },
  { points: 7900, title: "Brigadier Général", verse: "Jean 10:1-11", verseDescription: "En vérité, en vérité, je vous le dis, je suis le bon berger..." },
  { points: 8800, title: "Major Général", verse: "Proverbes 3:1-10", verseDescription: "Mon fils, n'oublie pas mes enseignements, et que ton cœur garde mes préceptes..." },
  { points: 9700, title: "Lieutenant-Général", verse: "Jean 1:1-14", verseDescription: "Au commencement était la Parole, et la Parole était avec Dieu..." },
  { points: 10700, title: "Général", verse: "Psaumes 91", verseDescription: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant..." },
  { points: 12000, title: "Coupe de Timothée", verse: "1 Timothée 4:1-16", verseDescription: "Que personne ne méprise ta jeunesse; mais sois un modèle pour les fidèles..." },
];

export const GRADING_CRITERIA = [
  { key: 'presence', label: 'Présence', points: 30, description: 'Présent au rassemblement' },
  { key: 'punctuality', label: 'Ponctualité', points: 40, description: 'Arrivé à l\'heure' },
  { key: 'good_behavior', label: 'Bonne conduite', points: 40, description: 'Respect, calme et écoute' },
  { key: 'verse_of_the_day', label: 'Verset du jour', points: 40, description: 'Récitation du verset hebdomadaire' },
  { key: 'bible', label: 'Bible apportée', points: 50, description: 'Possession de sa Bible personnelle' },
  { key: 'cleanliness', label: 'Propreté', points: 30, description: 'Tenue soignée et propre' },
  { key: 'scarf', label: 'Foulard porté', points: 20, description: 'Port du foulard de groupe' },
] as const;

export const VISITOR_POINTS = 25;

export function calculateDailyPoints(grading: Partial<DailyGrading>): number {
  let total = 0;
  if (grading.presence) total += 30;
  if (grading.punctuality) total += 40;
  if (grading.good_behavior) total += 40;
  if (grading.verse_of_the_day) total += 40;
  if (grading.bible) total += 50;
  if (grading.cleanliness) total += 30;
  if (grading.scarf) total += 20;
  if (grading.visitors_count && grading.visitors_count > 0) {
    total += grading.visitors_count * VISITOR_POINTS;
  }
  return total;
}

export function getRankIndex(rankTitle: string): number {
  if (!rankTitle) return -1;
  const lower = rankTitle.trim().toLowerCase();
  if (lower === 'recruit' || lower === 'astronaute') return -1;
  return RANK_SYSTEM.findIndex(r => r.title.toLowerCase() === lower);
}

export function getNextRankInfo(child: Child): {
  nextRank: RankDefinition | null;
  isEligible: boolean;
  pointsNeeded: number;
  progressPercent: number;
  currentRankObj: RankDefinition | null;
} {
  if (!child) {
    return {
      nextRank: RANK_SYSTEM[0],
      isEligible: false,
      pointsNeeded: RANK_SYSTEM[0].points,
      progressPercent: 0,
      currentRankObj: null,
    };
  }

  const currentRankIdx = getRankIndex(child.current_rank);
  const currentRankObj = currentRankIdx >= 0 ? RANK_SYSTEM[currentRankIdx] : null;

  // If current rank is the last rank in RANK_SYSTEM (Coupe de Timothée)
  if (currentRankIdx >= RANK_SYSTEM.length - 1) {
    return {
      nextRank: null,
      isEligible: false,
      pointsNeeded: 0,
      progressPercent: 100,
      currentRankObj: RANK_SYSTEM[RANK_SYSTEM.length - 1],
    };
  }

  // Next rank index in RANK_SYSTEM: if current is -1 (Recruit/Astronaute), next is 0 (Astronaute 3e classe)
  const nextRankIdx = currentRankIdx < 0 ? 0 : currentRankIdx + 1;
  const nextRank = RANK_SYSTEM[nextRankIdx] || null;

  if (!nextRank) {
    return {
      nextRank: null,
      isEligible: false,
      pointsNeeded: 0,
      progressPercent: 100,
      currentRankObj,
    };
  }

  const prevRankPoints = currentRankIdx >= 0 ? (RANK_SYSTEM[currentRankIdx]?.points || 0) : 0;
  const targetPoints = nextRank.points;
  const totalPoints = child.total_accumulated_points || 0;
  
  const isEligible = totalPoints >= targetPoints && child.status === "Qualified Astronaute";
  const pointsNeeded = Math.max(0, targetPoints - totalPoints);

  const span = Math.max(1, targetPoints - prevRankPoints);
  const earnedInTier = Math.max(0, totalPoints - prevRankPoints);
  let progressPercent = Math.min(100, Math.round((earnedInTier / span) * 100));
  if (isNaN(progressPercent) || progressPercent < 0) progressPercent = 0;

  return {
    nextRank,
    isEligible,
    pointsNeeded,
    progressPercent,
    currentRankObj,
  };
}

export function isRecruitFullyQualified(progress: Child['qualification_progress']): boolean {
  return (
    progress.consecutive_weeks >= 3 &&
    progress.recited_astronaut_verse &&
    progress.recited_motto &&
    progress.recited_nt_books
  );
}
