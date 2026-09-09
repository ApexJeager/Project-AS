import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Server } from 'node:http';

const users = [
  { id: 'user_dev_1', name: 'Justin (Dev)', role: 'Dev', color_group: null, pinCode: '1926', createdAt: new Date().toISOString() },
];

vi.mock('./src/db/index.ts', () => ({
  ensureSchema: vi.fn().mockResolvedValue(undefined),
  findChild: vi.fn().mockResolvedValue(undefined),
  findUser: vi.fn(async (id: string) => users.find(user => user.id === id)),
  insertChild: vi.fn(),
  insertUser: vi.fn(),
  insertUsers: vi.fn(),
  listAttendances: vi.fn().mockResolvedValue([]),
  listChildren: vi.fn().mockResolvedValue([]),
  listGradings: vi.fn().mockResolvedValue([]),
  listReports: vi.fn().mockResolvedValue([]),
  listUsers: vi.fn().mockResolvedValue(users),
  resetDatabase: vi.fn(),
  updateChild: vi.fn(),
  updateUserPin: vi.fn().mockResolvedValue(users[0]),
  upsertAttendance: vi.fn(),
  upsertGrading: vi.fn(),
  upsertReport: vi.fn(),
  deleteChild: vi.fn(),
  deleteUser: vi.fn(),
}));

describe('Express API', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.VERCEL = '1';
    process.env.AUTH_SECRET = 'test-secret-for-api-tests';
    const { startServer } = await import('./server.ts');
    const app = await startServer();
    await new Promise<void>(resolve => {
      server = app.listen(0, () => resolve());
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  });

  it('returns a healthy database status', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok', database: 'connected' });
  });

  it('returns public login profiles without PINs', async () => {
    const response = await fetch(`${baseUrl}/api/auth/users`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: 'user_dev_1', name: 'Justin (Dev)', role: 'Dev', color_group: null }]);
  });

  it('rejects an invalid login PIN', async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: 'user_dev_1', pin: '0000' }),
    });
    expect(response.status).toBe(401);
  });

  it('authenticates the seeded Dev user and protects API routes', async () => {
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user_id: 'user_dev_1', pin: '1926' }),
    });
    expect(login.status).toBe(200);
    const { token } = await login.json();

    const children = await fetch(`${baseUrl}/api/children`, {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(children.status).toBe(200);
    expect(await children.json()).toEqual([]);
  });
});
