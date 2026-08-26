import { describe, expect, it } from 'vitest';
import { calculateDailyPoints, getNextRankInfo, isRecruitFullyQualified, RANK_SYSTEM } from './ranks';
import type { Child } from '../types';

const child = (overrides: Partial<Child> = {}): Child => ({
  id: 'test-child',
  first_name: 'Test',
  last_name: 'Child',
  color_group: 'Red',
  status: 'Qualified Astronaute',
  qualification_progress: { consecutive_weeks: 3, recited_astronaut_verse: true, recited_motto: true, recited_nt_books: true },
  current_rank: 'Astronaute',
  total_accumulated_points: 0,
  ...overrides,
});

describe('official scoring', () => {
  it('returns the 250-point base maximum and visitor bonus', () => {
    expect(calculateDailyPoints({ presence: true, punctuality: true, good_behavior: true, verse_of_the_day: true, bible: true, cleanliness: true, scarf: true })).toBe(250);
    expect(calculateDailyPoints({ visitors_count: 2 })).toBe(50);
    expect(calculateDailyPoints({ visitors_count: -2 })).toBe(0);
  });
});

describe('rank progression', () => {
  it('contains the 17 promotion ranks that follow the initial recruit status', () => {
    expect(RANK_SYSTEM).toHaveLength(17);
    expect(RANK_SYSTEM[0]).toMatchObject({ title: 'Astronaute', points: 500 });
    expect(RANK_SYSTEM.at(-1)).toMatchObject({ title: 'Amiral Suprême', points: 10000 });
  });

  it('calculates eligibility for the next rank', () => {
    const result = getNextRankInfo(child({ total_accumulated_points: 500 }));
    expect(result.nextRank?.title).toBe('Apprenti');
    expect(result.isEligible).toBe(false);
    expect(result.pointsNeeded).toBe(500);
  });
});

describe('recruit qualification', () => {
  it('requires all four official conditions', () => {
    expect(isRecruitFullyQualified({ consecutive_weeks: 3, recited_astronaut_verse: true, recited_motto: true, recited_nt_books: true })).toBe(true);
    expect(isRecruitFullyQualified({ consecutive_weeks: 4, recited_astronaut_verse: true, recited_motto: true, recited_nt_books: false })).toBe(false);
  });
});
