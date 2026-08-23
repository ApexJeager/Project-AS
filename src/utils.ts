import { ColorGroup, Role } from './types';

export function getRoleLabel(role: string | null | undefined): string {
  switch (role) {
    case 'Dev': return 'Développeur';
    case 'Admin': return 'Admin / Grand Leader';
    case 'Pilote': return 'Pilote';
    case 'Co-Pilote': return 'Co-Pilote';
    case 'Helper': return 'Assistant';
    default: return role || '';
  }
}

export function getColorGroupLabel(color: ColorGroup | string | null | undefined): string {
  switch (color) {
    case 'Red': return 'Rouge';
    case 'Green': return 'Vert';
    case 'Yellow': return 'Jaune';
    case 'Blue': return 'Bleu';
    case 'All': return 'Tous les Groupes';
    default: return color || '';
  }
}

export function getStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'Draft': return 'Brouillon';
    case 'Submitted': return 'Soumis';
    case 'Reviewed': return 'Validé';
    case 'Active': return 'Actif';
    case 'Inactive': return 'Inactif';
    case 'Present': return 'Présent';
    case 'Absent': return 'Absent';
    case 'Recruit': return 'Recrue';
    case 'Qualified Astronaute': return 'Astronaute Qualifié';
    default: return status || '';
  }
}

export function getRankDisplay(rank: string | null | undefined): string {
  if (!rank) return '';
  if (rank === 'Recruit') return 'Recrue';
  return rank;
}

export function getColorGroupClasses(color: ColorGroup | string | null | undefined): string {
  switch (color) {
    case 'Red': return 'bg-rose-50 text-rose-700 border-rose-200/90';
    case 'Green': return 'bg-emerald-50 text-emerald-700 border-emerald-200/90';
    case 'Yellow': return 'bg-amber-50 text-amber-800 border-amber-200/90';
    case 'Blue': return 'bg-blue-50 text-blue-700 border-blue-200/90';
    default: return 'bg-zinc-100 text-zinc-700 border-zinc-200/90';
  }
}

export function getColorGroupDot(color: ColorGroup | string | null | undefined): string {
  switch (color) {
    case 'Red': return 'bg-rose-500';
    case 'Green': return 'bg-emerald-500';
    case 'Yellow': return 'bg-amber-500';
    case 'Blue': return 'bg-blue-500';
    default: return 'bg-zinc-400';
  }
}

export function getColorGroupSolid(color: ColorGroup | string | null | undefined): string {
  switch (color) {
    case 'Red': return 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs';
    case 'Green': return 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs';
    case 'Yellow': return 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-xs';
    case 'Blue': return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs';
    default: return 'bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white shadow-xs';
  }
}

export function getColorGroupBorder(color: ColorGroup | string | null | undefined): string {
  switch (color) {
    case 'Red': return 'border-rose-300/80 text-rose-700 bg-rose-50/40';
    case 'Green': return 'border-emerald-300/80 text-emerald-700 bg-emerald-50/40';
    case 'Yellow': return 'border-amber-300/80 text-amber-800 bg-amber-50/40';
    case 'Blue': return 'border-blue-300/80 text-blue-700 bg-blue-50/40';
    default: return 'border-zinc-300/80 text-zinc-700 bg-zinc-50/40';
  }
}

export function getRoleClasses(role: string): string {
  switch (role) {
    case 'Dev': return 'bg-purple-50 text-purple-700 border-purple-200/80';
    case 'Admin': return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    case 'Pilote': return 'bg-blue-50 text-blue-700 border-blue-200/80';
    case 'Co-Pilote': return 'bg-teal-50 text-teal-700 border-teal-200/80';
    case 'Helper': return 'bg-amber-50 text-amber-800 border-amber-200/80';
    default: return 'bg-zinc-100 text-zinc-700 border-zinc-200/80';
  }
}

export function getRankBadgeClasses(rank: string): string {
  if (rank === 'Recruit') return 'bg-zinc-100 text-zinc-600 border-zinc-200/80';
  if (rank === 'Astronaute') return 'bg-cyan-50 text-cyan-800 border-cyan-200/80';
  if (rank.includes('3e classe') || rank.includes('2e classe') || rank.includes('1e classe')) {
    return 'bg-blue-50 text-blue-800 border-blue-200/80';
  }
  if (rank.includes('Sergent') || rank.includes('Adjudant')) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
  }
  if (rank.includes('Lieutenant') || rank.includes('Capitaine') || rank.includes('Major')) {
    return 'bg-amber-50 text-amber-900 border-amber-200/80';
  }
  if (rank.includes('Colonel') || rank.includes('Général')) {
    return 'bg-purple-50 text-purple-900 border-purple-200/80';
  }
  if (rank.includes('Coupe')) {
    return 'bg-amber-100 text-amber-950 font-bold border-amber-300 shadow-2xs';
  }
  return 'bg-indigo-50 text-indigo-800 border-indigo-200/80';
}

