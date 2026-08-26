import { User, Child, DailyGrading, Attendance, MonthlyReport } from '../types';

export const api = {
  // USERS
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async createUser(user: Partial<User>): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  async updateUserPin(id: string, pinCode: string): Promise<User> {
    const res = await fetch(`/api/users/${id}/pin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinCode }),
    });
    if (!res.ok) throw new Error('Failed to update PIN');
    return res.json();
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete user');
  },

  // CHILDREN
  async getChildren(): Promise<Child[]> {
    const res = await fetch('/api/children');
    if (!res.ok) throw new Error('Failed to fetch children');
    return res.json();
  },

  async createChild(child: Partial<Child>): Promise<Child> {
    const res = await fetch('/api/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(child),
    });
    if (!res.ok) throw new Error('Failed to create child');
    return res.json();
  },

  async updateChild(id: string, child: Partial<Child>): Promise<Child> {
    const res = await fetch(`/api/children/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(child),
    });
    if (!res.ok) throw new Error('Failed to update child');
    return res.json();
  },

  async deleteChild(id: string): Promise<void> {
    const res = await fetch(`/api/children/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete child');
  },

  // GRADINGS
  async getGradings(): Promise<DailyGrading[]> {
    const res = await fetch('/api/gradings');
    if (!res.ok) throw new Error('Failed to fetch gradings');
    return res.json();
  },

  async saveGrading(grading: Partial<DailyGrading>): Promise<DailyGrading> {
    const res = await fetch('/api/gradings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grading),
    });
    if (!res.ok) throw new Error('Failed to save grading');
    return res.json();
  },

  // ATTENDANCES
  async getAttendances(): Promise<Attendance[]> {
    const res = await fetch('/api/attendances');
    if (!res.ok) throw new Error('Failed to fetch attendances');
    return res.json();
  },

  async saveAttendance(attendance: Partial<Attendance>): Promise<Attendance> {
    const res = await fetch('/api/attendances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendance),
    });
    if (!res.ok) throw new Error('Failed to save attendance');
    return res.json();
  },

  // REPORTS
  async getReports(): Promise<MonthlyReport[]> {
    const res = await fetch('/api/reports');
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async saveReport(report: Partial<MonthlyReport>): Promise<MonthlyReport> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (!res.ok) throw new Error('Failed to save report');
    return res.json();
  },

  // RESET
  async resetDatabase(): Promise<void> {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset database');
  },
};
