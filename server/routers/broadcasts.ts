/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { db } from '../db';
import { authenticateToken } from './auth';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const broadcasts = db.getBroadcasts();
  res.json(broadcasts);
});

router.post('/', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const { 
    title, 
    description, 
    location, 
    state, 
    district, 
    place, 
    issue_id, 
    activity_date, 
    resources_needed, 
    max_participants, 
    target_districts 
  } = req.body;

  if (!title || !description || !location || !activity_date) {
    return res.status(400).json({ error: 'Missing mandatory broadcast parameters' });
  }

  const bc = db.createBroadcast({
    creator_id: currentUser.id,
    creator_name: currentUser.name,
    title,
    description,
    location,
    state: state || 'Tamil Nadu',
    district: district || 'Chennai',
    place: place || 'Velachery',
    issue_id: issue_id || undefined,
    activity_date,
    resources_needed: resources_needed || [],
    max_participants: parseInt(max_participants || '10'),
    target_districts: target_districts || [district || 'Chennai']
  });

  res.json(bc);
});

router.get('/:id', authenticateToken, (req, res) => {
  const bc = db.getBroadcastById(req.params.id);
  if (!bc) {
    return res.status(404).json({ error: 'Cleanup drive not found' });
  }

  const members = db.getBroadcastMembers(bc.id);
  res.json({ broadcast: bc, members });
});

router.post('/:id/join', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const broadcastId = req.params.id;

  const member = db.joinBroadcast(broadcastId, currentUser.id, currentUser.name);
  if (!member) {
    return res.status(400).json({ error: 'Unable to join cleanup drive' });
  }

  res.json(member);
});

router.post('/:id/respond', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const broadcastId = req.params.id;
  const { memberId, accept } = req.body;

  const bc = db.getBroadcastById(broadcastId);
  if (!bc || bc.creator_id !== currentUser.id) {
    return res.status(403).json({ error: 'Only the drive creator can approve members' });
  }

  const success = db.respondToJoinRequest(broadcastId, memberId, accept);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Unable to process member join request' });
  }
});

// Broadcast Group Chat Endpoints
router.get('/:id/messages', authenticateToken, (req, res) => {
  const messages = db.getBroadcastMessages(req.params.id);
  res.json(messages);
});

router.post('/:id/messages', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Missing chat content' });
  }

  const msg = db.addBroadcastMessage(
    req.params.id,
    currentUser.id,
    currentUser.name,
    currentUser.role,
    content
  );

  res.json(msg);
});

export default router;
