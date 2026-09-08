import { User, Child, DailyGrading, Attendance, MonthlyReport } from '../types';

const TOKEN_KEY = 'astronautes_session_token';

function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* private browsing can disable storage */ }
}

async function request<T>(url: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (authenticated) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 && authenticated) {
    setToken(null);
    window.dispatchEvent(new CustomEvent('astronautes:auth-expired'));
  }
  if (!res.ok) {
    let message = 'La requête a échoué.';
    try {
      const body = await res.json();
      if (typeof body.error === 'string') message = body.error;
    } catch { /* use generic message */ }
    throw new Error(message);
  }
  return res.status === 204 ? undefined as T : res.json();
}

export const api = {
  async getLoginUsers(): Promise<User[]> {
    return request<User[]>('/api/auth/users', {}, false);
  },

  async login(userId: string, pin: string): Promise<User> {
    const result = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, pin }),
    }, false);
    setToken(result.token);
    return result.user;
  },

  logout() { setToken(null); },

  async getUsers(): Promise<User[]> { return request<User[]>('/api/users'); },
  async createUser(user: Partial<User>): Promise<User> {
    return request<User>('/api/users', { method: 'POST', body: JSON.stringify(user) });
  },
  async updateUserPin(id: string, pinCode: string): Promise<User> {
    return request<User>(`/api/users/${id}/pin`, { method: 'PUT', body: JSON.stringify({ pinCode }) });
  },
  async deleteUser(id: string): Promise<void> {
    await request<void>(`/api/users/${id}`, { method: 'DELETE' });
  },

  async getChildren(): Promise<Child[]> { return request<Child[]>('/api/children'); },
  async createChild(child: Partial<Child>): Promise<Child> {
    return request<Child>('/api/children', { method: 'POST', body: JSON.stringify(child) });
  },
  async updateChild(id: string, child: Partial<Child>): Promise<Child> {
    return request<Child>(`/api/children/${id}`, { method: 'PUT', body: JSON.stringify(child) });
  },
  async deleteChild(id: string): Promise<void> {
    await request<void>(`/api/children/${id}`, { method: 'DELETE' });
  },

  async getGradings(): Promise<DailyGrading[]> { return request<DailyGrading[]>('/api/gradings'); },
  async saveGrading(grading: Partial<DailyGrading>): Promise<DailyGrading> {
    return request<DailyGrading>('/api/gradings', { method: 'POST', body: JSON.stringify(grading) });
  },
  async getAttendances(): Promise<Attendance[]> { return request<Attendance[]>('/api/attendances'); },
  async saveAttendance(attendance: Partial<Attendance>): Promise<Attendance> {
    return request<Attendance>('/api/attendances', { method: 'POST', body: JSON.stringify(attendance) });
  },
  async getReports(): Promise<MonthlyReport[]> { return request<MonthlyReport[]>('/api/reports'); },
  async saveReport(report: Partial<MonthlyReport>): Promise<MonthlyReport> {
    return request<MonthlyReport>('/api/reports', { method: 'POST', body: JSON.stringify(report) });
  },
  async resetDatabase(): Promise<void> {
    await request<void>('/api/reset', { method: 'POST' });
  },
};
