import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { eq } from 'drizzle-orm';
import { db, ensureSchema, pool } from './src/db/index.ts';
import { users, children, dailyGradings, attendances, monthlyReports } from './src/db/schema.ts';
import { AuthUser, createToken, hashPin, verifyPin, verifyToken } from './src/server/auth.ts';
import { RANK_SYSTEM } from './src/constants/ranks.ts';

type RequestWithAuth = Request & { auth?: AuthUser };
const roles = ['Dev', 'Admin', 'Pilote', 'Co-Pilote', 'Helper'] as const;
const groups = ['Red', 'Green', 'Yellow', 'Blue'] as const;
const statuses = ['Present', 'Absent'] as const;
const reportStatuses = ['Draft', 'Submitted', 'Reviewed'] as const;
const validRanks = new Set(['Recruit', ...RANK_SYSTEM.map(rank => rank.title)]);

function publicUser(user: typeof users.$inferSelect): AuthUser {
  return { id: user.id, name: user.name, role: user.role, color_group: user.color_group };
}

function errorResponse(res: Response, error: unknown, message = 'Une erreur interne est survenue.') {
  console.error(error);
  res.status(500).json({ error: message });
}

function requireAuth(req: RequestWithAuth, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  const identity = token ? verifyToken(token) : null;
  if (!identity) {
    res.status(401).json({ error: 'Authentification requise.' });
    return;
  }
  db.select().from(users).where(eq(users.id, identity.id)).limit(1).then(([user]) => {
    if (!user || user.role !== identity.role) {
      res.status(401).json({ error: 'Session invalide ou expirée.' });
      return;
    }
    req.auth = publicUser(user);
    next();
  }).catch(error => errorResponse(res, error));
}

function requireRole(...allowed: string[]) {
  return (req: RequestWithAuth, res: Response, next: NextFunction) => {
    if (!req.auth || !allowed.includes(req.auth.role)) {
      res.status(403).json({ error: 'Droits insuffisants.' });
      return;
    }

    next();
  };
}

function isGlobalUser(user?: AuthUser): boolean {
  return user?.role === 'Dev' || user?.role === 'Admin';
}

function canAccessGroup(user: AuthUser | undefined, group: string): boolean {
  return Boolean(user && (isGlobalUser(user) || user.color_group === group));
}

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,120}$/.test(value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isMonth(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function mapChild(child: typeof children.$inferSelect) {
  return {
    id: child.id,
    first_name: child.firstName,
    last_name: child.lastName,
    color_group: child.colorGroup,
    status: child.status,
    qualification_progress: child.qualificationProgress,
    current_rank: child.currentRank,
    total_accumulated_points: child.totalAccumulatedPoints,
  };
}

function mapGrading(grading: typeof dailyGradings.$inferSelect) {
  return {
    id: grading.id,
    child_id: grading.childId,
    date: grading.date,
    recorded_by: grading.recordedBy,
    presence: grading.presence,
    punctuality: grading.punctuality,
    good_behavior: grading.goodBehavior,
    verse_of_the_day: grading.verseOfTheDay,
    bible: grading.bible,
    cleanliness: grading.cleanliness,
    scarf: grading.scarf,
    visitors_count: grading.visitorsCount,
    total_day_points: grading.totalDayPoints,
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  app.use(express.json({ limit: '128kb' }));

  const defaultBaseUsers = [
    { id: 'user_dev_1', name: 'Justin (Dev)', role: 'Dev', color_group: null, pinCode: '1926' },
    { id: 'user_admin_1', name: 'Pasteur Admin', role: 'Admin', color_group: null, pinCode: '0000' },
    { id: 'user_pilote_red', name: 'Sarah (Pilote)', role: 'Pilote', color_group: 'Red', pinCode: '1001' },
    { id: 'user_pilote_green', name: 'David (Pilote)', role: 'Pilote', color_group: 'Green', pinCode: '1002' },
    { id: 'user_pilote_yellow', name: 'Esther (Pilote)', role: 'Pilote', color_group: 'Yellow', pinCode: '1003' },
    { id: 'user_pilote_blue', name: 'Samuel (Pilote)', role: 'Pilote', color_group: 'Blue', pinCode: '1004' },
    { id: 'user_copilote_red', name: 'Marc (Co-Pilote)', role: 'Co-Pilote', color_group: 'Red', pinCode: '2001' },
    { id: 'user_copilote_green', name: 'Léa (Co-Pilote)', role: 'Co-Pilote', color_group: 'Green', pinCode: '2002' },
    { id: 'user_copilote_yellow', name: 'Daniel (Co-Pilote)', role: 'Co-Pilote', color_group: 'Yellow', pinCode: '2003' },
    { id: 'user_copilote_blue', name: 'Ruth (Co-Pilote)', role: 'Co-Pilote', color_group: 'Blue', pinCode: '2004' },
  ];

  try {
    await ensureSchema();
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      await db.insert(users).values(defaultBaseUsers.map(user => ({
        ...user,
        pinCode: hashPin(user.pinCode),
      })));
    } else {
      // One-time, safe migration for installations created before PIN hashing.
      for (const user of existingUsers) {
        if (!user.pinCode.startsWith('scrypt$')) {
          await db.update(users).set({ pinCode: hashPin(user.pinCode) }).where(eq(users.id, user.id));
        }
      }
    }
  } catch (error) {
    console.error('Database initialization failed; health endpoint will report unavailable.', error);
  }

  // Public only for the PIN profile picker; it never exposes credentials.
  app.get('/api/auth/users', async (_req, res) => {
    try {
      const availableUsers = await db.select().from(users);
      res.json(availableUsers.map(publicUser));
    } catch (error) {
      errorResponse(res, error);
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      if (!isRecord(req.body) || !isId(req.body.user_id) || typeof req.body.pin !== 'string' || !/^\d{4}$/.test(req.body.pin)) {
        res.status(400).json({ error: 'Identifiants invalides.' });
        return;
      }
      const [user] = await db.select().from(users).where(eq(users.id, req.body.user_id)).limit(1);
      if (!user || !verifyPin(req.body.pin, user.pinCode)) {
        res.status(401).json({ error: 'Identifiants invalides.' });
        return;
      }
      // Upgrade a legacy plaintext PIN only after a successful login.
      if (!user.pinCode.startsWith('scrypt$')) {
        await db.update(users).set({ pinCode: hashPin(req.body.pin) }).where(eq(users.id, user.id));
      }
      const safeUser = publicUser(user);
      res.json({ token: createToken(safeUser), user: safeUser });
    } catch (error) {
      errorResponse(res, error);
    }
  });

  app.get('/api/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
      console.error(error);
      res.status(503).json({ status: 'error', database: 'unavailable' });
    }
  });

  app.use('/api', requireAuth);

  app.get('/api/users', async (_req, res) => {
    try {
      res.json((await db.select().from(users)).map(publicUser));
    } catch (error) { errorResponse(res, error); }
  });

  app.post('/api/users', requireRole('Dev'), async (req: RequestWithAuth, res) => {
    try {
      const body = req.body;
      if (!isRecord(body) || !isId(body.id) || typeof body.name !== 'string' || !roles.includes(body.role) ||
          (body.color_group !== null && !groups.includes(body.color_group)) || typeof body.pinCode !== 'string' || !/^\d{4}$/.test(body.pinCode)) {
        res.status(400).json({ error: 'Données utilisateur invalides.' });
        return;
      }
      const [created] = await db.insert(users).values({
        id: body.id, name: body.name.trim().slice(0, 120), role: body.role,
        color_group: body.role === 'Dev' || body.role === 'Admin' ? null : body.color_group,
        pinCode: hashPin(body.pinCode),
      }).returning();
      res.status(201).json(publicUser(created));
    } catch (error) { errorResponse(res, error); }
  });

  app.put('/api/users/:id/pin', requireRole('Dev'), async (req: RequestWithAuth, res) => {
    try {
      if (!isId(req.params.id) || !isRecord(req.body) || typeof req.body.pinCode !== 'string' || !/^\d{4}$/.test(req.body.pinCode)) {
        res.status(400).json({ error: 'Le PIN doit comporter exactement 4 chiffres.' });
        return;
      }
      const [updated] = await db.update(users).set({ pinCode: hashPin(req.body.pinCode) }).where(eq(users.id, req.params.id)).returning();
      if (!updated) { res.status(404).json({ error: 'Utilisateur introuvable.' }); return; }
      res.json(publicUser(updated));
    } catch (error) { errorResponse(res, error); }
  });

  app.delete('/api/users/:id', requireRole('Dev'), async (req: RequestWithAuth, res) => {
    try {
      if (!isId(req.params.id) || req.params.id === req.auth?.id) { res.status(400).json({ error: 'Suppression impossible.' }); return; }
      const deleted = await db.delete(users).where(eq(users.id, req.params.id)).returning({ id: users.id });
      if (deleted.length === 0) { res.status(404).json({ error: 'Utilisateur introuvable.' }); return; }
      res.json({ success: true });
    } catch (error) { errorResponse(res, error); }
  });

  app.get('/api/children', async (req: RequestWithAuth, res) => {
    try {
      const allChildren = isGlobalUser(req.auth)
        ? await db.select().from(children)
        : await db.select().from(children).where(eq(children.colorGroup, req.auth?.color_group || ''));
      res.json(allChildren.map(mapChild));
    }
    catch (error) { errorResponse(res, error); }
  });

  app.post('/api/children', requireRole('Dev', 'Admin', 'Pilote', 'Co-Pilote', 'Helper'), async (req: RequestWithAuth, res) => {
    try {
      const body = req.body;
      if (!isRecord(body) || !isId(body.id) || typeof body.first_name !== 'string' || typeof body.last_name !== 'string' ||
          !groups.includes(body.color_group) || body.first_name.trim().length === 0 || body.last_name.trim().length === 0) {
        res.status(400).json({ error: 'Données enfant invalides.' }); return;
      }
      if (!canAccessGroup(req.auth, body.color_group)) {
        res.status(403).json({ error: 'Droits insuffisants.' }); return;
      }
      const [created] = await db.insert(children).values({
        id: body.id, firstName: body.first_name.trim().slice(0, 80), lastName: body.last_name.trim().slice(0, 80),
        colorGroup: body.color_group, status: body.status === 'Qualified Astronaute' ? body.status : 'Recruit',
        qualificationProgress: isRecord(body.qualification_progress) ? body.qualification_progress : {
          consecutive_weeks: 0, recited_astronaut_verse: false, recited_motto: false, recited_nt_books: false,
        },
        currentRank: typeof body.current_rank === 'string' ? body.current_rank : 'Recruit',
        totalAccumulatedPoints: Number.isInteger(body.total_accumulated_points) && body.total_accumulated_points >= 0 ? body.total_accumulated_points : 0,
      }).returning();
      res.status(201).json(mapChild(created));
    } catch (error) { errorResponse(res, error); }
  });

  app.put('/api/children/:id', async (req: RequestWithAuth, res) => {
    try {
      if (!isId(req.params.id) || !isRecord(req.body)) { res.status(400).json({ error: 'Données invalides.' }); return; }
      const [existing] = await db.select().from(children).where(eq(children.id, req.params.id)).limit(1);
      if (!existing) { res.status(404).json({ error: 'Enfant introuvable.' }); return; }
      if (!canAccessGroup(req.auth, existing.colorGroup)) { res.status(403).json({ error: 'Droits insuffisants.' }); return; }
      const body = req.body;
      const updateData: Record<string, any> = {};
      if (body.first_name !== undefined && typeof body.first_name === 'string' && body.first_name.trim()) updateData.firstName = body.first_name.trim().slice(0, 80);
      if (body.last_name !== undefined && typeof body.last_name === 'string' && body.last_name.trim()) updateData.lastName = body.last_name.trim().slice(0, 80);
      if (body.color_group !== undefined) {
        if (!groups.includes(body.color_group) || !canAccessGroup(req.auth, body.color_group)) {
          res.status(403).json({ error: 'Droits insuffisants.' }); return;
        }
        updateData.colorGroup = body.color_group;
      }
      if (body.status !== undefined && ['Recruit', 'Qualified Astronaute'].includes(body.status)) updateData.status = body.status;
      if (body.qualification_progress !== undefined && isRecord(body.qualification_progress)) updateData.qualificationProgress = body.qualification_progress;
      if (body.current_rank !== undefined && typeof body.current_rank === 'string' && validRanks.has(body.current_rank)) updateData.currentRank = body.current_rank;
      if (body.total_accumulated_points !== undefined) {
        // Points are derived from persisted gradings; never trust a client total.
        const childGradings = await db.select({ points: dailyGradings.totalDayPoints })
          .from(dailyGradings).where(eq(dailyGradings.childId, req.params.id));
        updateData.totalAccumulatedPoints = childGradings.reduce((total, grading) => total + grading.points, 0);
      }
      if (Object.keys(updateData).length === 0) { res.status(400).json({ error: 'Aucun champ valide à mettre à jour.' }); return; }
      const [updated] = await db.update(children).set(updateData).where(eq(children.id, req.params.id)).returning();
      if (!updated) { res.status(404).json({ error: 'Enfant introuvable.' }); return; }
      res.json(mapChild(updated));
    } catch (error) { errorResponse(res, error); }
  });

  app.delete('/api/children/:id', requireRole('Dev', 'Admin'), async (req, res) => {
    try {
      if (!isId(req.params.id)) { res.status(400).json({ error: 'Identifiant invalide.' }); return; }
      const deleted = await db.delete(children).where(eq(children.id, req.params.id)).returning({ id: children.id });
      if (deleted.length === 0) { res.status(404).json({ error: 'Enfant introuvable.' }); return; }
      res.json({ success: true });
    } catch (error) { errorResponse(res, error); }
  });

  app.get('/api/gradings', async (req: RequestWithAuth, res) => {
    try {
      const all = await db.select().from(dailyGradings);
      const visibleChildIds = isGlobalUser(req.auth)
        ? null
        : new Set((await db.select({ id: children.id }).from(children)
          .where(eq(children.colorGroup, req.auth?.color_group || ''))).map(child => child.id));
      const visible = visibleChildIds ? all.filter(grading => visibleChildIds.has(grading.childId)) : all;
      res.json(visible.map(mapGrading));
    }
    catch (error) { errorResponse(res, error); }
  });

  app.post('/api/gradings', async (req: RequestWithAuth, res) => {
    try {
      const body = req.body;
      const bool = (key: string) => body[key] === undefined || typeof body[key] === 'boolean';
      if (!isRecord(body) || !isId(body.id) || !isId(body.child_id) || !isDate(body.date) || !bool('presence') || !bool('punctuality') ||
          !bool('good_behavior') || !bool('verse_of_the_day') || !bool('bible') || !bool('cleanliness') || !bool('scarf') ||
          (body.visitors_count !== undefined && (!Number.isInteger(body.visitors_count) || body.visitors_count < 0 || body.visitors_count > 100))) {
        res.status(400).json({ error: 'Évaluation invalide.' }); return;
      }
      const [child] = await db.select().from(children).where(eq(children.id, body.child_id)).limit(1);
      if (!child) { res.status(404).json({ error: 'Enfant introuvable.' }); return; }
      if (!canAccessGroup(req.auth, child.colorGroup)) { res.status(403).json({ error: 'Droits insuffisants.' }); return; }
      const visitorsCount = body.visitors_count || 0;
      const totalDayPoints = (body.presence ? 30 : 0) + (body.punctuality ? 40 : 0) +
        (body.good_behavior ? 40 : 0) + (body.verse_of_the_day ? 40 : 0) +
        (body.bible ? 50 : 0) + (body.cleanliness ? 30 : 0) + (body.scarf ? 20 : 0) +
        visitorsCount * 25;
      const values = {
        id: body.id, childId: body.child_id, date: body.date, recordedBy: req.auth?.id || '',
        presence: Boolean(body.presence), punctuality: Boolean(body.punctuality), goodBehavior: Boolean(body.good_behavior),
        verseOfTheDay: Boolean(body.verse_of_the_day), bible: Boolean(body.bible), cleanliness: Boolean(body.cleanliness),
        scarf: Boolean(body.scarf), visitorsCount, totalDayPoints,
      };
      const [saved] = await db.insert(dailyGradings).values(values).onConflictDoUpdate({
        target: [dailyGradings.childId, dailyGradings.date],
        set: {
          presence: values.presence, punctuality: values.punctuality, goodBehavior: values.goodBehavior,
          verseOfTheDay: values.verseOfTheDay, bible: values.bible, cleanliness: values.cleanliness,
          scarf: values.scarf, visitorsCount: values.visitorsCount, totalDayPoints: values.totalDayPoints,
          recordedBy: values.recordedBy,
        },
      }).returning();
      res.json(mapGrading(saved));
    } catch (error) { errorResponse(res, error); }
  });

  app.get('/api/attendances', async (req: RequestWithAuth, res) => {
    try {
      const all = await db.select().from(attendances);
      const visibleChildIds = isGlobalUser(req.auth)
        ? null
        : new Set((await db.select({ id: children.id }).from(children)
          .where(eq(children.colorGroup, req.auth?.color_group || ''))).map(child => child.id));
      const visible = visibleChildIds ? all.filter(attendance => visibleChildIds.has(attendance.childId)) : all;
      res.json(visible.map(a => ({ id: a.id, child_id: a.childId, date: a.date, status: a.status, recorded_by_user_id: a.recordedByUserId })));
    } catch (error) { errorResponse(res, error); }
  });

  app.post('/api/attendances', async (req: RequestWithAuth, res) => {
    try {
      const body = req.body;
      if (!isRecord(body) || !isId(body.id) || !isId(body.child_id) || !isDate(body.date) || !statuses.includes(body.status)) {
        res.status(400).json({ error: 'Présence invalide.' }); return;
      }
      const [child] = await db.select().from(children).where(eq(children.id, body.child_id)).limit(1);
      if (!child) { res.status(404).json({ error: 'Enfant introuvable.' }); return; }
      if (!canAccessGroup(req.auth, child.colorGroup)) { res.status(403).json({ error: 'Droits insuffisants.' }); return; }
      const [saved] = await db.insert(attendances).values({
        id: body.id, childId: body.child_id, date: body.date, status: body.status, recordedByUserId: req.auth?.id || '',
      }).onConflictDoUpdate({
        target: [attendances.childId, attendances.date],
        set: { status: body.status, recordedByUserId: req.auth?.id || '' },
      }).returning();
      res.json({ id: saved.id, child_id: saved.childId, date: saved.date, status: saved.status, recorded_by_user_id: saved.recordedByUserId });
    } catch (error) { errorResponse(res, error); }
  });

  app.get('/api/reports', async (req: RequestWithAuth, res) => {
    try {
      const all = isGlobalUser(req.auth)
        ? await db.select().from(monthlyReports)
        : await db.select().from(monthlyReports).where(eq(monthlyReports.colorGroup, req.auth?.color_group || ''));
      res.json(all.map(r => ({ id: r.id, color_group: r.colorGroup, month_year: r.monthYear, content: r.content, status: r.status })));
    } catch (error) { errorResponse(res, error); }
  });

  app.post('/api/reports', async (req: RequestWithAuth, res) => {
    try {
      const body = req.body;
      if (!isRecord(body) || !isId(body.id) || !groups.includes(body.color_group) || !isMonth(body.month_year) ||
          typeof body.content !== 'string' || (body.status !== undefined && !reportStatuses.includes(body.status))) {
        res.status(400).json({ error: 'Rapport invalide.' }); return;
      }
      if (body.status === 'Reviewed' && !['Admin', 'Dev'].includes(req.auth?.role || '')) {
        res.status(403).json({ error: 'Seuls les administrateurs peuvent valider un rapport.' }); return;
      }
      if (!canAccessGroup(req.auth, body.color_group)) {
        res.status(403).json({ error: 'Droits insuffisants.' }); return;
      }
      const [saved] = await db.insert(monthlyReports).values({
        id: body.id, colorGroup: body.color_group, monthYear: body.month_year, content: body.content.slice(0, 50_000),
        status: body.status || 'Draft',
      }).onConflictDoUpdate({
        target: monthlyReports.id,
        set: { content: body.content.slice(0, 50_000), status: body.status || 'Draft', updatedAt: new Date() },
      }).returning();
      res.json({ id: saved.id, color_group: saved.colorGroup, month_year: saved.monthYear, content: saved.content, status: saved.status });
    } catch (error) { errorResponse(res, error); }
  });

  app.post('/api/reset', requireRole('Dev'), async (_req, res) => {
    try {
      await db.delete(dailyGradings);
      await db.delete(attendances);
      await db.delete(children);
      await db.delete(monthlyReports);
      await db.delete(users);
      await db.insert(users).values(defaultBaseUsers.map(user => ({ ...user, pinCode: hashPin(user.pinCode) })));
      res.json({ success: true, message: 'Base réinitialisée.' });
    } catch (error) { errorResponse(res, error); }
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => errorResponse(res, error));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer().catch(error => {
  console.error('Unable to start server:', error);
  process.exitCode = 1;
});
