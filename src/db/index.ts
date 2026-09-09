import 'dotenv/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AttendanceRecord,
  ChildRecord,
  DailyGradingRecord,
  MonthlyReportRecord,
  UserRecord,
} from './schema.ts';

type UserRow = {
  id: string;
  name: string;
  role: string;
  color_group: string | null;
  pin_code: string;
  created_at: string;
};

type ChildRow = {
  id: string;
  first_name: string;
  last_name: string;
  color_group: string;
  status: string;
  qualification_progress: Record<string, unknown>;
  current_rank: string;
  total_accumulated_points: number;
  created_at: string;
};

type DailyGradingRow = {
  id: string;
  child_id: string;
  date: string;
  recorded_by: string;
  presence: boolean;
  punctuality: boolean;
  good_behavior: boolean;
  verse_of_the_day: boolean;
  bible: boolean;
  cleanliness: boolean;
  scarf: boolean;
  visitors_count: number;
  total_day_points: number;
  created_at: string;
};

type AttendanceRow = {
  id: string;
  child_id: string;
  date: string;
  status: string;
  recorded_by_user_id: string;
  created_at: string;
};

type MonthlyReportRow = {
  id: string;
  color_group: string;
  month_year: string;
  content: string;
  status: string;
  updated_at: string;
};

type Database = {
  public: {
    Tables: {
      users: { Row: UserRow; Insert: Partial<UserRow>; Update: Partial<UserRow> };
      children: { Row: ChildRow; Insert: Partial<ChildRow>; Update: Partial<ChildRow> };
      daily_gradings: { Row: DailyGradingRow; Insert: Partial<DailyGradingRow>; Update: Partial<DailyGradingRow> };
      attendances: { Row: AttendanceRow; Insert: Partial<AttendanceRow>; Update: Partial<AttendanceRow> };
      monthly_reports: { Row: MonthlyReportRow; Insert: Partial<MonthlyReportRow>; Update: Partial<MonthlyReportRow> };
    };
  };
};

let client: SupabaseClient | undefined;

function getConfig(): { url: string; key: string } {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }
  return { url, key };
}

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const { url, key } = getConfig();
    client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
  }
  return client;
}

function requireData<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error('Supabase returned no data.');
  return data;
}

function userFromRow(row: UserRow): UserRecord {
  return { id: row.id, name: row.name, role: row.role, color_group: row.color_group, pinCode: row.pin_code, createdAt: row.created_at };
}

function childFromRow(row: ChildRow): ChildRecord {
  return {
    id: row.id, firstName: row.first_name, lastName: row.last_name, colorGroup: row.color_group,
    status: row.status, qualificationProgress: row.qualification_progress, currentRank: row.current_rank,
    totalAccumulatedPoints: row.total_accumulated_points, createdAt: row.created_at,
  };
}

function gradingFromRow(row: DailyGradingRow): DailyGradingRecord {
  return {
    id: row.id, childId: row.child_id, date: row.date, recordedBy: row.recorded_by,
    presence: row.presence, punctuality: row.punctuality, goodBehavior: row.good_behavior,
    verseOfTheDay: row.verse_of_the_day, bible: row.bible, cleanliness: row.cleanliness,
    scarf: row.scarf, visitorsCount: row.visitors_count, totalDayPoints: row.total_day_points,
    createdAt: row.created_at,
  };
}

function attendanceFromRow(row: AttendanceRow): AttendanceRecord {
  return { id: row.id, childId: row.child_id, date: row.date, status: row.status, recordedByUserId: row.recorded_by_user_id, createdAt: row.created_at };
}

function reportFromRow(row: MonthlyReportRow): MonthlyReportRecord {
  return { id: row.id, colorGroup: row.color_group, monthYear: row.month_year, content: row.content, status: row.status, updatedAt: row.updated_at };
}

export async function ensureSchema(): Promise<void> {
  const { error } = await getSupabaseClient().from('users').select('id').limit(1);
  if (error) throw new Error(`Supabase schema check failed: ${error.message}`);
}

export async function listUsers(): Promise<UserRecord[]> {
  const { data, error } = await getSupabaseClient().from('users').select('*');
  return (requireData(data, error) as UserRow[]).map(userFromRow);
}

export async function findUser(id: string): Promise<UserRecord | undefined> {
  const { data, error } = await getSupabaseClient().from('users').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? userFromRow(data as UserRow) : undefined;
}

export async function insertUsers(values: Array<Omit<UserRecord, 'createdAt'>>): Promise<UserRecord[]> {
  const rows = values.map(user => ({
    id: user.id, name: user.name, role: user.role, color_group: user.color_group, pin_code: user.pinCode,
  }));
  const { data, error } = await getSupabaseClient().from('users').insert(rows).select('*');
  return (requireData(data, error) as UserRow[]).map(userFromRow);
}

export async function insertUser(value: Omit<UserRecord, 'createdAt'>): Promise<UserRecord> {
  return (await insertUsers([value]))[0];
}

export async function updateUserPin(id: string, pinCode: string): Promise<UserRecord | undefined> {
  const { data, error } = await getSupabaseClient().from('users').update({ pin_code: pinCode }).eq('id', id).select('*').maybeSingle();
  if (error) throw new Error(error.message);
  return data ? userFromRow(data as UserRow) : undefined;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { data, error } = await getSupabaseClient().from('users').delete().eq('id', id).select('id');
  return (requireData(data, error) as Array<{ id: string }>).length > 0;
}

export async function listChildren(colorGroup?: string): Promise<ChildRecord[]> {
  let query = getSupabaseClient().from('children').select('*');
  if (colorGroup !== undefined) query = query.eq('color_group', colorGroup);
  const { data, error } = await query;
  return (requireData(data, error) as ChildRow[]).map(childFromRow);
}

export async function findChild(id: string): Promise<ChildRecord | undefined> {
  const { data, error } = await getSupabaseClient().from('children').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? childFromRow(data as ChildRow) : undefined;
}

export async function insertChild(value: Omit<ChildRecord, 'createdAt'>): Promise<ChildRecord> {
  const { data, error } = await getSupabaseClient().from('children').insert({
    id: value.id, first_name: value.firstName, last_name: value.lastName, color_group: value.colorGroup,
    status: value.status, qualification_progress: value.qualificationProgress, current_rank: value.currentRank,
    total_accumulated_points: value.totalAccumulatedPoints,
  }).select('*').single();
  return childFromRow(requireData(data, error) as ChildRow);
}

export async function updateChild(id: string, value: Partial<Omit<ChildRecord, 'id' | 'createdAt'>>): Promise<ChildRecord | undefined> {
  const update: Partial<ChildRow> = {};
  if (value.firstName !== undefined) update.first_name = value.firstName;
  if (value.lastName !== undefined) update.last_name = value.lastName;
  if (value.colorGroup !== undefined) update.color_group = value.colorGroup;
  if (value.status !== undefined) update.status = value.status;
  if (value.qualificationProgress !== undefined) update.qualification_progress = value.qualificationProgress;
  if (value.currentRank !== undefined) update.current_rank = value.currentRank;
  if (value.totalAccumulatedPoints !== undefined) update.total_accumulated_points = value.totalAccumulatedPoints;
  const { data, error } = await getSupabaseClient().from('children').update(update).eq('id', id).select('*').maybeSingle();
  if (error) throw new Error(error.message);
  return data ? childFromRow(data as ChildRow) : undefined;
}

export async function deleteChild(id: string): Promise<boolean> {
  const { data, error } = await getSupabaseClient().from('children').delete().eq('id', id).select('id');
  return (requireData(data, error) as Array<{ id: string }>).length > 0;
}

export async function listGradings(): Promise<DailyGradingRecord[]> {
  const { data, error } = await getSupabaseClient().from('daily_gradings').select('*');
  return (requireData(data, error) as DailyGradingRow[]).map(gradingFromRow);
}

export async function upsertGrading(value: Omit<DailyGradingRecord, 'createdAt'>): Promise<DailyGradingRecord> {
  const { data, error } = await getSupabaseClient().from('daily_gradings').upsert({
    id: value.id, child_id: value.childId, date: value.date, recorded_by: value.recordedBy,
    presence: value.presence, punctuality: value.punctuality, good_behavior: value.goodBehavior,
    verse_of_the_day: value.verseOfTheDay, bible: value.bible, cleanliness: value.cleanliness, scarf: value.scarf,
    visitors_count: value.visitorsCount, total_day_points: value.totalDayPoints,
  }, { onConflict: 'child_id,date' }).select('*').single();
  return gradingFromRow(requireData(data, error) as DailyGradingRow);
}

export async function listAttendances(): Promise<AttendanceRecord[]> {
  const { data, error } = await getSupabaseClient().from('attendances').select('*');
  return (requireData(data, error) as AttendanceRow[]).map(attendanceFromRow);
}

export async function upsertAttendance(value: Omit<AttendanceRecord, 'createdAt'>): Promise<AttendanceRecord> {
  const { data, error } = await getSupabaseClient().from('attendances').upsert({
    id: value.id, child_id: value.childId, date: value.date, status: value.status, recorded_by_user_id: value.recordedByUserId,
  }, { onConflict: 'child_id,date' }).select('*').single();
  return attendanceFromRow(requireData(data, error) as AttendanceRow);
}

export async function listReports(colorGroup?: string): Promise<MonthlyReportRecord[]> {
  let query = getSupabaseClient().from('monthly_reports').select('*');
  if (colorGroup !== undefined) query = query.eq('color_group', colorGroup);
  const { data, error } = await query;
  return (requireData(data, error) as MonthlyReportRow[]).map(reportFromRow);
}

export async function upsertReport(value: Omit<MonthlyReportRecord, 'updatedAt'>): Promise<MonthlyReportRecord> {
  const { data, error } = await getSupabaseClient().from('monthly_reports').upsert({
    id: value.id, color_group: value.colorGroup, month_year: value.monthYear, content: value.content,
    status: value.status, updated_at: new Date().toISOString(),
  }).select('*').single();
  return reportFromRow(requireData(data, error) as MonthlyReportRow);
}

export async function resetDatabase(defaultUsers: Array<Omit<UserRecord, 'createdAt'>>): Promise<void> {
  const client = getSupabaseClient();
  for (const table of ['daily_gradings', 'attendances', 'children', 'monthly_reports', 'users'] as const) {
    const { error } = await client.from(table).delete().not('id', 'is', null);
    if (error) throw new Error(error.message);
  }
  await insertUsers(defaultUsers);
}
