import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const dbPath = path.resolve(process.cwd(), 'proflow.db');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#6366f1',
      icon TEXT DEFAULT '🚀',
      category TEXT DEFAULT 'Engineering',
      health TEXT DEFAULT 'on-track',
      status TEXT DEFAULT 'active',
      lead TEXT DEFAULT 'Project Lead',
      startDate TEXT,
      targetDate TEXT,
      budgetAllocated REAL DEFAULT 0,
      budgetSpent REAL DEFAULT 0,
      milestones TEXT DEFAULT '[]',
      notes TEXT DEFAULT '[]',
      activity TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      projectId TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'backlog',
      priority TEXT DEFAULT 'medium',
      assignees TEXT DEFAULT '[]',
      dueDate TEXT,
      startDate TEXT,
      estimatedHours REAL DEFAULT 0,
      loggedHours REAL DEFAULT 0,
      comments INTEGER DEFAULT 0,
      attachments INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      blockedBy TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      avatar TEXT,
      role TEXT DEFAULT 'Member',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'task',
      read INTEGER DEFAULT 0,
      time TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

