// Counter storage: one SQLite row per counter name. A view from the same IP within a few
// seconds is not counted twice, so a reload loop cannot pump a counter.
import Database from 'better-sqlite3';
import { config } from './config.js';

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS counters (
  name TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)`);

const bump = db.prepare(`INSERT INTO counters (name, value, created_at, updated_at) VALUES (?, 1, ?, ?)
  ON CONFLICT(name) DO UPDATE SET value = value + 1, updated_at = excluded.updated_at RETURNING value`);
const read = db.prepare(`SELECT value FROM counters WHERE name = ?`);

export const COUNTER_NAME = /^[A-Za-z0-9._@:-]{1,64}$/;
const DEDUP_MS = 5_000;
const recent = new Map<string, number>();

export function view(name: string, ip: string): number {
  const key = `${name}|${ip}`;
  const now = Date.now();
  const last = recent.get(key);
  if (last && now - last < DEDUP_MS) return current(name);
  recent.set(key, now);
  if (recent.size > 50_000) for (const [k, t] of recent) if (now - t > DEDUP_MS) recent.delete(k);
  return (bump.get(name, now, now) as { value: number }).value;
}

export function current(name: string): number {
  return (read.get(name) as { value: number } | undefined)?.value ?? 0;
}
