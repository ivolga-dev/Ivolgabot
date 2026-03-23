import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from '../config.js';

const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');

export const runSchema = () => {
  const schemaPath = path.resolve('src/db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(sql);
};

export const tx = (fn) => db.transaction(fn)();
