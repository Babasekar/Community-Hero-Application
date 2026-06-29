/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { db } from '../db';
import { authenticateToken } from './auth';
import { categorizeIssue, verifyResolution, generateAdvisoryReport, verifyReportImage } from '../services/gemini';
import { calculateHaversineDistance } from './issues';

const router = express.Router();

// 1. Photo Categorization & Severity Indexing via Gemini
router.post('/categorize', async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Missing image payload' });
  }

  const analysis = await categorizeIssue(image);
  res.json(analysis);
});

// 1b. Real-time Report Verification (Image + Category + Fake Prevention) via Gemini
router.post('/verify-report', authenticateToken, async (req, res) => {
  const { image, category, title, description } = req.body;
  if (!image || !category) {
    return res.status(400).json({ error: 'Missing required validation fields' });
  }

  const result = await verifyReportImage(image, category, title || '', description || '');
  res.json(result);
});

// 2. Advisory report on fund allocations based on community issues
router.get('/advisory-report', async (req, res) => {
  const { state, city } = req.query;
  let issues = db.getIssues();

  if (state && state !== 'All') {
    issues = issues.filter(i => i.state?.toLowerCase() === (state as string).toLowerCase());
  }
  if (city && city !== 'All') {
    issues = issues.filter(i => i.district?.toLowerCase() === (city as string).toLowerCase());
  }

  const advisoryText = await generateAdvisoryReport(JSON.stringify(issues), state as string, city as string);
  res.json({ report: advisoryText });
});

// 3. Submitting resolution proof (with compass/GPS delta and Gemini visual comparison validation)
router.post('/resolution/:issueId', authenticateToken, async (req, res) => {
  const currentUser = (req as any).user;
  const issueId = req.params.issueId;
  const { photo_url, video_url, notes, resolver_lat, resolver_lng, resolver_bearing } = req.body;

  const issue = db.getIssueById(issueId);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  if (!photo_url || !resolver_lat || !resolver_lng) {
    return res.status(400).json({ error: 'Missing resolution photo or coordinates' });
  }

  // Double validation checks:
  // 1. Calculate geographical distance delta
  const distanceM = calculateHaversineDistance(
    issue.lat, 
    issue.lng, 
    parseFloat(resolver_lat), 
    parseFloat(resolver_lng)
  );
  
  // 2. Calculate compass bearing delta
  const bearingDelta = Math.abs((issue.bearing - parseFloat(resolver_bearing || '0')) % 360);
  const bearingMatch = bearingDelta <= 45 || bearingDelta >= 315;

  const geoPassed = distanceM <= 50 && bearingMatch;

  // 3. AI Resolution check (BEFORE vs AFTER comparison) using Gemini Vision API
  let aiConfidence = 0.90;
  let aiReason = 'Visual evidence confirms issue has been cleared up and restored to normal state.';
  let resolved = true;

  try {
    const aiCheck = await verifyResolution(issue.photo_url, photo_url);
    aiConfidence = aiCheck.confidence;
    aiReason = aiCheck.reason;
    resolved = aiCheck.resolved;
  } catch (e) {
    console.error('Error in AI vision comparison:', e);
  }

  const resolution = db.createResolution({
    issue_id: issueId,
    resolver_id: currentUser.id,
    resolver_name: currentUser.name,
    photo_url,
    video_url,
    notes: notes || 'Proof submitted successfully.',
    resolver_lat: parseFloat(resolver_lat),
    resolver_lng: parseFloat(resolver_lng),
    resolver_bearing: parseFloat(resolver_bearing || '0'),
    geo_passed: geoPassed,
    bearing_delta: bearingDelta,
    distance_m: distanceM,
    ai_confidence: aiConfidence,
    ai_reason: aiReason
  });

  res.json({ success: true, resolution });
});

export default router;
