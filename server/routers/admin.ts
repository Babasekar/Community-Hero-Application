/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { db } from '../db';
import { authenticateToken } from './auth';

const router = express.Router();

router.get('/pending-gov', authenticateToken, (req, res) => {
  const admin = (req as any).user;
  if (admin.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }

  let pendingList = db.getUsers().filter(u => u.role === 'gov' && u.status === 'pending');
  if (admin.state) {
    pendingList = pendingList.filter(u => u.state?.toLowerCase() === admin.state.toLowerCase());
  }
  res.json(pendingList);
});

router.post('/verify-gov', authenticateToken, (req, res) => {
  const admin = (req as any).user;
  if (admin.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }

  const { userId, approved } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const updated = db.updateUser(userId, {
    status: approved ? 'active' : 'rejected',
    verified: approved
  });

  if (updated) {
    db.createNotification(
      userId,
      'resolved',
      approved 
        ? 'Your Government Official account has been APPROVED. Accessing Portal now.' 
        : 'Your Government Official account was declined. Please verify your Employee ID and resubmit.'
    );
  }

  res.json({ success: true, user: updated });
});

router.get('/pending-resolutions', authenticateToken, (req, res) => {
  const admin = (req as any).user;
  if (admin.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }

  const pendingList = db.getResolutions().filter(r => r.admin_verified === null);
  
  const responseList = pendingList.map(r => {
    const issue = db.getIssueById(r.issue_id);
    return {
      ...r,
      issue_title: issue?.title || 'Unknown Issue',
      issue_before_photo: issue?.photo_url || '',
      issue_state: issue?.state || ''
    };
  });

  const filteredList = admin.state 
    ? responseList.filter(r => r.issue_state?.toLowerCase() === admin.state.toLowerCase())
    : responseList;

  res.json(filteredList);
});

router.post('/verify-resolution', authenticateToken, (req, res) => {
  const admin = (req as any).user;
  if (admin.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }

  const { resolutionId, approved } = req.body;
  if (!resolutionId) {
    return res.status(400).json({ error: 'Missing resolutionId' });
  }

  const success = db.verifyResolution(resolutionId, approved);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Verification failed' });
  }
});

export default router;
