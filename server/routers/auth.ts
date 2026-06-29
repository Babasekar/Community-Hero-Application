/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { db } from '../db';

const router = express.Router();

// Mock authentication middleware helper that router files can use locally or we can export
export function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const userId = token.startsWith('token-') ? token.replace('token-', '') : token;
  const user = db.getUserById(userId);

  if (!user) {
    return res.status(403).json({ error: 'Invalid or expired session' });
  }

  (req as any).user = user;
  next();
}

router.post('/signup', (req, res) => {
  const { 
    name, email, password, role,
    department, designation, employee_id, ward_number,
    state, district, place, id_proof_url, avatar_url 
  } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing registration details' });
  }

  // Verify email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address (e.g. name@example.com)' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const user = db.createUser({
    name,
    email,
    role,
    status: role === 'gov' ? 'pending' : 'active',
    notifications_enabled: true,
    department,
    designation,
    employee_id,
    ward_number,
    state,
    district,
    place,
    id_proof_url,
    avatar_url
  });

  res.json({
    user,
    token: `token-${user.id}`
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(400).json({ error: 'Account does not exist' });
  }

  res.json({
    user,
    token: `token-${user.id}`
  });
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: (req as any).user });
});

router.patch('/profile', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const { name, avatar_url, notifications_enabled } = req.body;

  const updated = db.updateUser(currentUser.id, {
    name,
    avatar_url,
    notifications_enabled
  });

  res.json({ user: updated });
});

router.post('/gov-register', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const { department, designation, employee_id, ward_number } = req.body;

  if (!department || !designation || !employee_id || !ward_number) {
    return res.status(400).json({ error: 'Missing department verification details' });
  }

  const updated = db.updateUser(currentUser.id, {
    department,
    designation,
    employee_id,
    ward_number,
    status: 'pending',
    verified: false
  });

  res.json({ user: updated });
});

export default router;
