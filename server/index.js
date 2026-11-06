import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { db, initDb } from './db.js';

initDb();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Built-in secure password hashing using Node crypto (scrypt)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────────────────────

app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const id = `usr-${crypto.randomUUID().slice(0, 8)}`;
    const passwordHash = hashPassword(password);
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    db.prepare(`
      INSERT INTO users (id, name, email, passwordHash, avatar, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, email.toLowerCase().trim(), passwordHash, initials, 'Project Lead');

    const user = { id, name, email: email.toLowerCase().trim(), avatar: initials, role: 'Project Lead' };
    res.status(201).json({ user, token: `token-${id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!userRow) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = verifyPassword(password, userRow.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      avatar: userRow.avatar,
      role: userRow.role,
    };

    res.json({ user, token: `token-${userRow.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/change-password', (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!userRow) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = verifyPassword(currentPassword, userRow.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const newHash = hashPassword(newPassword);
    db.prepare('UPDATE users SET passwordHash = ? WHERE id = ?').run(newHash, userId);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/update-profile', (req, res) => {
  try {
    const { userId, name, role } = req.body;
    if (!userId || !name) {
      return res.status(400).json({ error: 'User ID and name are required' });
    }

    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US';

    db.prepare('UPDATE users SET name = ?, role = ?, avatar = ? WHERE id = ?').run(
      name,
      role || 'Project Lead',
      initials,
      userId
    );

    const updated = db.prepare('SELECT id, name, email, avatar, role FROM users WHERE id = ?').get(userId);
    res.json({ user: updated, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper parsers for JSON columns
function formatProject(row) {
  if (!row) return null;
  return {
    ...row,
    budget: {
      allocated: row.budgetAllocated || 0,
      spent: row.budgetSpent || 0,
    },
    milestones: JSON.parse(row.milestones || '[]'),
    notes: JSON.parse(row.notes || '[]'),
    activity: JSON.parse(row.activity || '[]'),
  };
}

function formatTask(row) {
  if (!row) return null;
  return {
    ...row,
    assignees: JSON.parse(row.assignees || '[]'),
    tags: JSON.parse(row.tags || '[]'),
    blockedBy: JSON.parse(row.blockedBy || '[]'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS API
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/projects', (req, res) => {
  try {
    const userId = req.query.userId;
    let rows;
    if (userId) {
      rows = db.prepare('SELECT * FROM projects WHERE userId = ? ORDER BY createdAt DESC').all(userId);
    } else {
      rows = db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();
    }
    res.json(rows.map(formatProject));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const p = req.body;
    const stmt = db.prepare(`
      INSERT INTO projects (
        id, userId, name, key, description, color, icon, category, health, status, lead, startDate, targetDate, budgetAllocated, budgetSpent, milestones, notes, activity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      p.id || `prj-${Date.now()}`,
      p.userId || null,
      p.name,
      p.key,
      p.description || '',
      p.color || '#6366f1',
      p.icon || '🚀',
      p.category || 'Engineering',
      p.health || 'on-track',
      p.status || 'active',
      p.lead || 'Engineering Lead',
      p.startDate || new Date().toISOString().split('T')[0],
      p.targetDate || new Date().toISOString().split('T')[0],
      p.budget?.allocated || 0,
      p.budget?.spent || 0,
      JSON.stringify(p.milestones || []),
      JSON.stringify(p.notes || []),
      JSON.stringify(p.activity || [])
    );

    const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(p.id);
    res.status(201).json(formatProject(created));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

    const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(p.id);
    res.status(201).json(formatProject(created));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const p = req.body;
    const stmt = db.prepare(`
      UPDATE projects SET
        name = COALESCE(?, name),
        key = COALESCE(?, key),
        description = COALESCE(?, description),
        color = COALESCE(?, color),
        category = COALESCE(?, category),
        health = COALESCE(?, health),
        status = COALESCE(?, status),
        lead = COALESCE(?, lead),
        targetDate = COALESCE(?, targetDate),
        budgetAllocated = COALESCE(?, budgetAllocated),
        budgetSpent = COALESCE(?, budgetSpent),
        milestones = COALESCE(?, milestones),
        notes = COALESCE(?, notes),
        activity = COALESCE(?, activity)
      WHERE id = ?
    `);

    stmt.run(
      p.name,
      p.key,
      p.description,
      p.color,
      p.category,
      p.health,
      p.status,
      p.lead,
      p.targetDate,
      p.budget?.allocated,
      p.budget?.spent,
      p.milestones ? JSON.stringify(p.milestones) : undefined,
      p.notes ? JSON.stringify(p.notes) : undefined,
      p.activity ? JSON.stringify(p.activity) : undefined,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json(formatProject(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TASKS API
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/tasks', (req, res) => {
  try {
    const userId = req.query.userId;
    let rows;
    if (userId) {
      rows = db.prepare('SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC').all(userId);
    } else {
      rows = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
    }
    res.json(rows.map(formatTask));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const t = req.body;
    const stmt = db.prepare(`
      INSERT INTO tasks (
        id, userId, projectId, title, description, status, priority, assignees, dueDate, startDate, estimatedHours, loggedHours, comments, attachments, progress, tags, blockedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      t.id || `t-${Date.now()}`,
      t.userId || null,
      t.projectId || null,
      t.title,
      t.description || '',
      t.status || 'backlog',
      t.priority || 'medium',
      JSON.stringify(t.assignees || []),
      t.dueDate || new Date().toISOString().split('T')[0],
      t.startDate || null,
      t.estimatedHours || 0,
      t.loggedHours || 0,
      t.comments || 0,
      t.attachments || 0,
      t.progress || 0,
      JSON.stringify(t.tags || []),
      JSON.stringify(t.blockedBy || [])
    );

    const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(t.id);
    res.status(201).json(formatTask(created));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  try {
    const t = req.body;
    const stmt = db.prepare(`
      UPDATE tasks SET
        projectId = COALESCE(?, projectId),
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        assignees = COALESCE(?, assignees),
        dueDate = COALESCE(?, dueDate),
        startDate = COALESCE(?, startDate),
        estimatedHours = COALESCE(?, estimatedHours),
        loggedHours = COALESCE(?, loggedHours),
        comments = COALESCE(?, comments),
        attachments = COALESCE(?, attachments),
        progress = COALESCE(?, progress),
        tags = COALESCE(?, tags),
        blockedBy = COALESCE(?, blockedBy)
      WHERE id = ?
    `);

    stmt.run(
      t.projectId,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.assignees ? JSON.stringify(t.assignees) : undefined,
      t.dueDate,
      t.startDate,
      t.estimatedHours,
      t.loggedHours,
      t.comments,
      t.attachments,
      t.progress,
      t.tags ? JSON.stringify(t.tags) : undefined,
      t.blockedBy ? JSON.stringify(t.blockedBy) : undefined,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(formatTask(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed endpoint to populate SQLite with initial projects/tasks if empty
app.post('/api/seed', (req, res) => {
  try {
    const { projects, tasks } = req.body;
    const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;

    if (projectCount === 0 && projects && projects.length > 0) {
      const pStmt = db.prepare(`
        INSERT INTO projects (
          id, name, key, description, color, icon, category, health, status, lead, startDate, targetDate, budgetAllocated, budgetSpent, milestones, notes, activity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of projects) {
        pStmt.run(
          p.id, p.name, p.key, p.description || '', p.color || '#6366f1', p.icon || '🚀',
          p.category || 'Engineering', p.health || 'on-track', p.status || 'active', p.lead || 'Lead',
          p.startDate, p.targetDate, p.budget?.allocated || 0, p.budget?.spent || 0,
          JSON.stringify(p.milestones || []), JSON.stringify(p.notes || []), JSON.stringify(p.activity || [])
        );
      }
    }

    const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    if (taskCount === 0 && tasks && tasks.length > 0) {
      const tStmt = db.prepare(`
        INSERT INTO tasks (
          id, projectId, title, description, status, priority, assignees, dueDate, startDate, estimatedHours, loggedHours, comments, attachments, progress, tags, blockedBy
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of tasks) {
        tStmt.run(
          t.id, t.projectId || null, t.title, t.description || '', t.status || 'backlog', t.priority || 'medium',
          JSON.stringify(t.assignees || []), t.dueDate, t.startDate || null,
          t.estimatedHours || 0, t.loggedHours || 0, t.comments || 0, t.attachments || 0, t.progress || 0,
          JSON.stringify(t.tags || []), JSON.stringify(t.blockedBy || [])
        );
      }
    }

    res.json({ seeded: true, projectCount: projects?.length, taskCount: tasks?.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ProFlow API] Server running on http://localhost:${PORT}`);
});

