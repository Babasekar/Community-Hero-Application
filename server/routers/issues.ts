/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { db } from '../db';
import { authenticateToken } from './auth';

const router = express.Router();

router.get('/my-upvotes', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const userUpvotes = db.getUpvotes()
    .filter(u => u.user_id === currentUser.id)
    .map(u => u.issue_id);
  res.json(userUpvotes);
});

// Geodetic Distance calculator (Haversine Formula) in meters
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

router.get('/', (req, res) => {
  const { reporter_id, category, status, district, ward, sort } = req.query;
  let issues = db.getIssues();

  // Apply filters
  if (reporter_id) {
    issues = issues.filter(i => i.reporter_id === reporter_id);
  }
  if (category && category !== 'All') {
    issues = issues.filter(i => i.category === (category as string).toLowerCase());
  }
  if (status && status !== 'All') {
    issues = issues.filter(i => i.status === (status as string).toLowerCase());
  }
  if (district) {
    issues = issues.filter(i => i.district.toLowerCase() === (district as string).toLowerCase());
  }
  if (ward) {
    issues = issues.filter(i => i.ward.toLowerCase() === (ward as string).toLowerCase());
  }

  // Sorting
  if (sort === 'Most Upvoted') {
    issues.sort((a, b) => b.upvote_count - a.upvote_count);
  } else if (sort === 'Critical first') {
    issues.sort((a, b) => b.severity - a.severity);
  } else {
    issues.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  res.json(issues);
});

router.get('/nearby', (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const radiusMeters = parseFloat((req.query.radius as string) || '5000'); // default 5km

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Missing lat or lng coordinates' });
  }

  const issues = db.getIssues();
  const nearbyIssues = issues.filter(issue => {
    const d = calculateHaversineDistance(lat, lng, issue.lat, issue.lng);
    return d <= radiusMeters;
  });

  res.json(nearbyIssues);
});

router.get('/:id', (req, res) => {
  const issue = db.getIssueById(req.params.id);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  const timeline = db.getTimeline(issue.id);
  res.json({ issue, timeline });
});

router.post('/', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const { 
    photo_url, lat, lng, bearing, category, severity, 
    title, description, address, state, district, area, ward 
  } = req.body;

  if (!photo_url || !lat || !lng || !category || !severity || !title || !description) {
    return res.status(400).json({ error: 'Missing mandatory reporting fields' });
  }

  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 7);

  const issue = db.createIssue({
    reporter_id: currentUser.id,
    reporter_name: currentUser.name,
    photo_url,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    bearing: parseFloat(bearing || '0'),
    category,
    severity: parseInt(severity),
    title,
    description,
    address: address || 'Acquiring location...',
    state: state || 'Tamil Nadu',
    district: district || 'Chennai',
    area: area || 'Unknown Area',
    ward: ward || 'Ward Unknown',
    deadline: deadlineDate.toISOString()
  });

  db.awardPoints(currentUser.id, 10, 'reporting a civic issue');

  res.json(issue);
});

router.post('/:id/upvote', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const issueId = req.params.id;
  
  const isUpvotedNow = db.addUpvote(currentUser.id, issueId);
  if (isUpvotedNow) {
    db.awardPoints(currentUser.id, 2, 'voting on local issue');
    const issue = db.getIssueById(issueId);
    if (issue) {
      db.addTimelineEvent(
        issueId,
        'upvoted',
        currentUser.id,
        currentUser.name,
        'Citizen upvoted this issue'
      );
    }
    res.json({ success: true, upvoted: true, message: 'Upvoted successfully' });
  } else {
    const issue = db.getIssueById(issueId);
    if (issue) {
      db.addTimelineEvent(
        issueId,
        'upvoted',
        currentUser.id,
        currentUser.name,
        'Citizen retracted upvote'
      );
    }
    res.json({ success: true, upvoted: false, message: 'Upvote removed successfully' });
  }
});

router.post('/:id/assign', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const issueId = req.params.id;
  const { assigneeId } = req.body;

  const issue = db.getIssueById(issueId);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  let finalAssigneeId = currentUser.id;
  let finalAssigneeName = currentUser.name;

  if (currentUser.role === 'gov' && assigneeId) {
    const target = db.getUserById(assigneeId);
    if (target) {
      finalAssigneeId = target.id;
      finalAssigneeName = target.name;
    }
  }

  if (issue.assigned_to && issue.assigned_to !== finalAssigneeId) {
    return res.status(400).json({ error: 'This issue has already been claimed by another volunteer' });
  }

  let targetStatus: any = 'assigned';
  if (currentUser.role === 'volunteer') {
    // If category is anything other than 'waste' or 'other', require approval
    if (issue.category !== 'waste' && issue.category !== 'other') {
      targetStatus = 'claim_pending';
    }
  }

  issue.status = targetStatus;
  issue.assigned_to = finalAssigneeId;
  issue.assigned_to_name = finalAssigneeName;

  db.addTimelineEvent(
    issueId,
    targetStatus,
    finalAssigneeId,
    finalAssigneeName,
    targetStatus === 'claim_pending' 
      ? `Volunteer claimed issue. Awaiting government approval.` 
      : `Assigned to ${finalAssigneeName}`
  );

  db.createNotification(
    finalAssigneeId,
    'issue_assigned',
    targetStatus === 'claim_pending'
      ? `Your claim for '${issue.title}' is pending government approval.`
      : `You have been assigned to resolve: '${issue.title}'`,
    `/issue/${issueId}`
  );

  db.save();
  res.json(issue);
});

router.post('/:id/approve-claim', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const issueId = req.params.id;

  if (currentUser.role !== 'gov') {
    return res.status(403).json({ error: 'Government official role required to approve claims' });
  }

  const issue = db.getIssueById(issueId);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  if (issue.status !== 'claim_pending') {
    return res.status(400).json({ error: 'Issue is not in a pending claim state' });
  }

  issue.status = 'assigned';
  db.addTimelineEvent(
    issueId,
    'assigned',
    issue.assigned_to,
    issue.assigned_to_name || 'Volunteer',
    `Government official ${currentUser.name} approved the volunteer claim.`
  );

  if (issue.assigned_to) {
    db.createNotification(
      issue.assigned_to,
      'issue_assigned',
      `Your claim for '${issue.title}' has been APPROVED by ${currentUser.name}! You can now start resolution.`,
      `/issue/${issueId}`
    );
  }

  db.save();
  res.json(issue);
});

router.post('/:id/reject-claim', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const issueId = req.params.id;

  if (currentUser.role !== 'gov') {
    return res.status(403).json({ error: 'Government official role required to reject claims' });
  }

  const issue = db.getIssueById(issueId);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  if (issue.status !== 'claim_pending') {
    return res.status(400).json({ error: 'Issue is not in a pending claim state' });
  }

  const volunteerId = issue.assigned_to;
  
  issue.status = 'open';
  issue.assigned_to = undefined;
  issue.assigned_to_name = undefined;

  db.addTimelineEvent(
    issueId,
    'open' as any,
    currentUser.id,
    currentUser.name,
    `Government official ${currentUser.name} declined the volunteer claim. The issue is open again.`
  );

  if (volunteerId) {
    db.createNotification(
      volunteerId,
      'issue_assigned',
      `Your claim for '${issue.title}' was declined by the government official.`,
      `/issue/${issueId}`
    );
  }

  db.save();
  res.json(issue);
});

router.patch('/:id/status', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const issueId = req.params.id;
  const { status, notes } = req.body;

  const issue = db.getIssueById(issueId);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  issue.status = status;
  db.addTimelineEvent(
    issueId,
    status === 'in_progress' ? 'in_progress' : 'assigned',
    currentUser.id,
    currentUser.name,
    notes || `Status marked as: ${status.replace('_', ' ')}`
  );

  db.save();
  res.json(issue);
});

router.post('/:id/escalate', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const issueId = req.params.id;

  const issue = db.getIssueById(issueId);
  if (!issue) {
    return res.status(404).json({ error: 'Issue not found' });
  }

  issue.status = 'escalated';
  db.addTimelineEvent(
    issueId,
    'escalated',
    currentUser.id,
    currentUser.name,
    'Citizen manually escalated this issue to the Ward Councilor.'
  );

  db.createNotification(
    issue.reporter_id,
    'escalation',
    `Issue escalated: '${issue.title}' has been flagged to the Ward Councilor.`,
    `/issue/${issueId}`
  );

  db.save();
  res.json(issue);
});

export default router;
export { calculateHaversineDistance };
