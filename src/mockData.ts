import { User, Child, Attendance, MonthlyReport, DailyGrading } from './types';

export const initialUsers: User[] = [
  { id: 'u1', name: 'Dev David', role: 'Dev', color_group: null, pin: '1926' },
  { id: 'u2', name: 'Admin Alice', role: 'Admin', color_group: null, pin: '2026' },
  { id: 'u3', name: 'Pilote Peter', role: 'Pilote', color_group: 'Red', pin: '1001' },
  { id: 'u4', name: 'Pilote Paul', role: 'Pilote', color_group: 'Blue', pin: '1002' },
  { id: 'u5', name: 'Co-Pilote Chloe', role: 'Co-Pilote', color_group: 'Yellow', pin: '1003' },
  { id: 'u6', name: 'Helper Harry', role: 'Helper', color_group: 'Green', pin: '1004' },
];

export const initialChildren: Child[] = [
  {
    id: 'c1',
    first_name: 'Tommy',
    last_name: 'Smith',
    color_group: 'Red',
    status: 'Qualified Astronaute',
    qualification_progress: {
      consecutive_weeks: 3,
      recited_astronaut_verse: true,
      recited_motto: true,
      recited_nt_books: true,
    },
    current_rank: 'Astronaute',
    total_accumulated_points: 430, // Eligible for Astronaute 3e classe (400 pts)
  },
  {
    id: 'c2',
    first_name: 'Sarah',
    last_name: 'Jones',
    color_group: 'Red',
    status: 'Recruit',
    qualification_progress: {
      consecutive_weeks: 2,
      recited_astronaut_verse: true,
      recited_motto: false,
      recited_nt_books: false,
    },
    current_rank: 'Recruit',
    total_accumulated_points: 180,
  },
  {
    id: 'c3',
    first_name: 'Mike',
    last_name: 'Brown',
    color_group: 'Blue',
    status: 'Qualified Astronaute',
    qualification_progress: {
      consecutive_weeks: 3,
      recited_astronaut_verse: true,
      recited_motto: true,
      recited_nt_books: true,
    },
    current_rank: 'Astronaute 3e classe',
    total_accumulated_points: 860, // Eligible for Astronaute 2e classe (800 pts)
  },
  {
    id: 'c4',
    first_name: 'Emily',
    last_name: 'Davis',
    color_group: 'Green',
    status: 'Qualified Astronaute',
    qualification_progress: {
      consecutive_weeks: 3,
      recited_astronaut_verse: true,
      recited_motto: true,
      recited_nt_books: true,
    },
    current_rank: 'Astronaute 1e classe',
    total_accumulated_points: 1550, // Working towards Sergent (1800 pts)
  },
  {
    id: 'c5',
    first_name: 'Chris',
    last_name: 'Wilson',
    color_group: 'Yellow',
    status: 'Recruit',
    qualification_progress: {
      consecutive_weeks: 1,
      recited_astronaut_verse: false,
      recited_motto: false,
      recited_nt_books: false,
    },
    current_rank: 'Recruit',
    total_accumulated_points: 90,
  },
  {
    id: 'c6',
    first_name: 'Anna',
    last_name: 'Taylor',
    color_group: 'Red',
    status: 'Qualified Astronaute',
    qualification_progress: {
      consecutive_weeks: 3,
      recited_astronaut_verse: true,
      recited_motto: true,
      recited_nt_books: true,
    },
    current_rank: 'Sergent',
    total_accumulated_points: 2400, // Eligible for Sergent Chef (2300 pts)
  },
  {
    id: 'c7',
    first_name: 'James',
    last_name: 'Anderson',
    color_group: 'Blue',
    status: 'Qualified Astronaute',
    qualification_progress: {
      consecutive_weeks: 3,
      recited_astronaut_verse: true,
      recited_motto: true,
      recited_nt_books: true,
    },
    current_rank: 'Lieutenant',
    total_accumulated_points: 4620, // Working towards Capitaine (5100 pts)
  },
  {
    id: 'c8',
    first_name: 'Lily',
    last_name: 'Thomas',
    color_group: 'Green',
    status: 'Qualified Astronaute',
    qualification_progress: {
      consecutive_weeks: 3,
      recited_astronaut_verse: true,
      recited_motto: true,
      recited_nt_books: true,
    },
    current_rank: 'Astronaute 2e classe',
    total_accumulated_points: 1100,
  },
];

export const initialAttendances: Attendance[] = [
  { id: 'a1', child_id: 'c1', date: new Date().toISOString().split('T')[0], status: 'Present', recorded_by_user_id: 'u3' },
  { id: 'a2', child_id: 'c2', date: new Date().toISOString().split('T')[0], status: 'Present', recorded_by_user_id: 'u3' },
  { id: 'a3', child_id: 'c6', date: new Date().toISOString().split('T')[0], status: 'Present', recorded_by_user_id: 'u3' },
];

export const initialGradings: DailyGrading[] = [
  {
    id: 'g1',
    child_id: 'c1',
    date: new Date().toISOString().split('T')[0],
    recorded_by: 'Pilote Peter',
    presence: true, // 30
    punctuality: true, // 40
    good_behavior: true, // 40
    verse_of_the_day: true, // 40
    bible: true, // 50
    cleanliness: true, // 30
    scarf: true, // 20
    visitors_count: 1, // 25
    total_day_points: 275,
  },
  {
    id: 'g2',
    child_id: 'c2',
    date: new Date().toISOString().split('T')[0],
    recorded_by: 'Pilote Peter',
    presence: true, // 30
    punctuality: false, // 0
    good_behavior: true, // 40
    verse_of_the_day: true, // 40
    bible: true, // 50
    cleanliness: true, // 30
    scarf: false, // 0
    visitors_count: 0,
    total_day_points: 190,
  },
];

export const initialReports: MonthlyReport[] = [
  { id: 'r1', color_group: 'Red', month_year: '2026-08', content: 'Great month! Tommy completed his 3 consecutive weeks and is ready for Astronaute 3e classe test. High participation in recitation.', status: 'Submitted' },
  { id: 'r2', color_group: 'Blue', month_year: '2026-08', content: 'Mike Brown excelled in his Scripture memory and scored maximum daily points this week.', status: 'Draft' },
  { id: 'r3', color_group: 'Green', month_year: '2026-07', content: 'July was fantastic! Emily and Lily progressed consistently through their rank goals.', status: 'Reviewed' },
];
