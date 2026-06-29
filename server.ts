/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db';

// Import Modular API Routers
import authRouter from './server/routers/auth';
import issuesRouter from './server/routers/issues';
import broadcastsRouter from './server/routers/broadcasts';
import notificationsRouter from './server/routers/notifications';
import leaderboardRouter from './server/routers/leaderboard';
import adminRouter from './server/routers/admin';
import aiRouter from './server/routers/ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser limits to support base64 photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- MOUNT MODULAR ROUTERS ---
app.use('/api/auth', authRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/broadcasts', broadcastsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/stats', (req, res) => {
  res.json(db.getStats());
});

// Background scheduler for checking overdue deadlines and auto-escalating issues
setInterval(() => {
  try {
    console.log('[Scheduler] Checking overdue deadlines and auto-escalating issues...');
    db.checkDeadlinesAndEscalate();
  } catch (e) {
    console.error('[Scheduler] Error running deadline check:', e);
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// --- VITE MIDDLEWARE CONFIGURATION ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Community Hero Server] Full-Stack running on http://localhost:${PORT}`);
  });
}

startServer();
