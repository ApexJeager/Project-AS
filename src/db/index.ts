import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import * as schema from './schema.ts';

declare global {
  var _postgresPool: pg.Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return global._postgresPool;
};

export const pool = createPool();
export const db = drizzle(pool, { schema });

/** Provision the small application schema for fresh Cloud SQL databases. */
export async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      color_group TEXT,
      pin_code TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      color_group TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Recruit',
      qualification_progress JSONB NOT NULL DEFAULT '{"consecutive_weeks":0,"recited_astronaut_verse":false,"recited_motto":false,"recited_nt_books":false}'::jsonb,
      current_rank TEXT NOT NULL DEFAULT 'Recruit',
      total_accumulated_points INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS daily_gradings (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      recorded_by TEXT NOT NULL,
      presence BOOLEAN NOT NULL DEFAULT false,
      punctuality BOOLEAN NOT NULL DEFAULT false,
      good_behavior BOOLEAN NOT NULL DEFAULT false,
      verse_of_the_day BOOLEAN NOT NULL DEFAULT false,
      bible BOOLEAN NOT NULL DEFAULT false,
      cleanliness BOOLEAN NOT NULL DEFAULT false,
      scarf BOOLEAN NOT NULL DEFAULT false,
      visitors_count INTEGER NOT NULL DEFAULT 0,
      total_day_points INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS attendances (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      recorded_by_user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS monthly_reports (
      id TEXT PRIMARY KEY,
      color_group TEXT NOT NULL,
      month_year TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Draft',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    DELETE FROM daily_gradings a USING daily_gradings b
      WHERE a.ctid < b.ctid AND a.child_id = b.child_id AND a.date = b.date;
    DELETE FROM attendances a USING attendances b
      WHERE a.ctid < b.ctid AND a.child_id = b.child_id AND a.date = b.date;
    CREATE UNIQUE INDEX IF NOT EXISTS daily_gradings_child_date_idx ON daily_gradings(child_id, date);
    CREATE UNIQUE INDEX IF NOT EXISTS attendances_child_date_idx ON attendances(child_id, date);
  `);
}
