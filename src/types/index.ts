/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'citizen' | 'volunteer' | 'gov' | 'admin';
export type UserStatus = 'active' | 'pending' | 'rejected';
export type IssueCategory = 'road' | 'water' | 'lighting' | 'waste' | 'drainage' | 'other';
export type IssueStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'escalated' | 'claim_pending';
export type BroadcastStatus = 'active' | 'cancelled' | 'completed';
export type BroadcastMemberStatus = 'pending' | 'accepted' | 'declined';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  points: number;
  streak_weeks: number;
  avatar_url?: string;
  notifications_enabled: boolean;
  created_at: string;
  // Government details
  department?: string;
  designation?: string;
  employee_id?: string;
  ward_number?: string;
  verified?: boolean;
  state?: string;
  district?: string;
  place?: string;
  id_proof_url?: string;
}

export interface Issue {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  photo_url: string;
  lat: number;
  lng: number;
  bearing: number;
  category: IssueCategory;
  severity: number; // 1 to 5
  title: string;
  description: string;
  address: string;
  state: string;
  district: string;
  area: string;
  ward: string;
  status: IssueStatus;
  assigned_to?: string; // volunteer or gov official id
  assigned_to_name?: string;
  upvote_count: number;
  duplicate_count: number;
  deadline: string; // ISO String
  created_at: string;
}

export interface Upvote {
  id: string;
  user_id: string;
  issue_id: string;
  created_at: string;
}

export interface IssueTimelineEvent {
  id: string;
  issue_id: string;
  event_type: 'reported' | 'assigned' | 'in_progress' | 'escalated' | 'resolved' | 'resolution_submitted' | 'upvoted' | 'volunteer_assigned';
  actor_id?: string;
  actor_name: string;
  notes?: string;
  created_at: string;
}

export interface Resolution {
  id: string;
  issue_id: string;
  resolver_id: string;
  resolver_name?: string;
  photo_url: string;
  video_url?: string;
  notes: string;
  resolver_lat: number;
  resolver_lng: number;
  resolver_bearing: number;
  geo_passed: boolean;
  bearing_delta: number;
  distance_m: number;
  ai_confidence: number;
  ai_reason: string;
  admin_verified: boolean | null; // null = pending, true = approved, false = rejected
  created_at: string;
}

export interface Broadcast {
  id: string;
  creator_id: string;
  creator_name: string;
  title: string;
  description: string;
  location: string;
  state: string;
  district: string;
  place: string;
  issue_id?: string;
  activity_date: string;
  resources_needed: string[];
  max_participants: number;
  target_districts: string[];
  status: BroadcastStatus;
  member_count: number;
  created_at: string;
}

export interface BroadcastMember {
  id: string;
  broadcast_id: string;
  user_id: string;
  user_name: string;
  role: 'creator' | 'member';
  status: BroadcastMemberStatus;
  created_at: string;
}

export interface BroadcastMessage {
  id: string;
  broadcast_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'issue_assigned' | 'points_earned' | 'badge_unlocked' | 'escalation' | 'resolved' | 'broadcast_joined';
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_key: string;
  unlocked_at: string;
}

export interface BadgeConfig {
  key: string;
  name: string;
  description: string;
  icon: string;
  field: keyof User | 'issues_reported' | 'streak_weeks' | 'issues_resolved' | 'points' | 'upvotes_given';
  threshold: number;
}
