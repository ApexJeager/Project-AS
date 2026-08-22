import { User, Child, Attendance, MonthlyReport } from './types';

export const initialUsers: User[] = [
  { id: 'u1', name: 'Dev David', role: 'Dev', color_group: null },
  { id: 'u2', name: 'Admin Alice', role: 'Admin', color_group: null },
  { id: 'u3', name: 'Pilote Peter', role: 'Pilote', color_group: 'Red' },
  { id: 'u4', name: 'Pilote Paul', role: 'Pilote', color_group: 'Blue' },
  { id: 'u5', name: 'Co-Pilote Chloe', role: 'Co-Pilote', color_group: 'Yellow' },
  { id: 'u6', name: 'Helper Harry', role: 'Helper', color_group: 'Green' },
];

export const initialChildren: Child[] = [
  { id: 'c1', first_name: 'Tommy', last_name: 'Smith', color_group: 'Red', status: 'Active' },
  { id: 'c2', first_name: 'Sarah', last_name: 'Jones', color_group: 'Red', status: 'Active' },
  { id: 'c3', first_name: 'Mike', last_name: 'Brown', color_group: 'Blue', status: 'Active' },
  { id: 'c4', first_name: 'Emily', last_name: 'Davis', color_group: 'Green', status: 'Active' },
  { id: 'c5', first_name: 'Chris', last_name: 'Wilson', color_group: 'Yellow', status: 'Inactive' },
  { id: 'c6', first_name: 'Anna', last_name: 'Taylor', color_group: 'Red', status: 'Active' },
  { id: 'c7', first_name: 'James', last_name: 'Anderson', color_group: 'Blue', status: 'Active' },
  { id: 'c8', first_name: 'Lily', last_name: 'Thomas', color_group: 'Green', status: 'Active' },
];

export const initialAttendances: Attendance[] = [
  { id: 'a1', child_id: 'c1', date: new Date().toISOString().split('T')[0], status: 'Present', recorded_by_user_id: 'u3' },
  { id: 'a2', child_id: 'c2', date: new Date().toISOString().split('T')[0], status: 'Absent', recorded_by_user_id: 'u3' },
];

export const initialReports: MonthlyReport[] = [
  { id: 'r1', color_group: 'Red', month_year: '2026-08', content: 'Great month! The kids learned a lot about sharing and teamwork.', status: 'Submitted' },
  { id: 'r2', color_group: 'Blue', month_year: '2026-08', content: 'Draft report for blue team. Needs more details on activities.', status: 'Draft' },
  { id: 'r3', color_group: 'Green', month_year: '2026-07', content: 'July was fantastic, outdoor activities were a hit.', status: 'Reviewed' },
];
