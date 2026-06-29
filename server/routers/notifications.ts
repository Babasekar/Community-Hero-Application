/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { db } from '../db';
import { authenticateToken } from './auth';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const list = db.getNotifications(currentUser.id);
  res.json(list);
});

router.post('/read-all', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  db.markAllNotificationsRead(currentUser.id);
  res.json({ success: true });
});

export default router;
