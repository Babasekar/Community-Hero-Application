/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { 
  User, Issue, Upvote, IssueTimelineEvent, Resolution, 
  Broadcast, BroadcastMember, BroadcastMessage, Notification, UserBadge 
} from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Real database connection configuration using the Pooler connection string
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || 'postgresql://postgres.nqowmhfbyndlgicuhfdr:123ommunityapp@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

interface DatabaseSchema {
  users: User[];
  issues: Issue[];
  upvotes: Upvote[];
  timelineEvents: IssueTimelineEvent[];
  resolutions: Resolution[];
  broadcasts: Broadcast[];
  broadcastMembers: BroadcastMember[];
  broadcastMessages: BroadcastMessage[];
  notifications: Notification[];
  badges: UserBadge[];
  stats: {
    totalResolved: number;
    totalVolunteers: number;
    totalWards: number;
  }
}

// Initial seed data that matches the visuals exactly and conforms strictly to src/types/index.ts
const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: 'user-priya',
      email: 'priya.rajan@gmail.com',
      name: 'Priya Rajan',
      role: 'citizen',
      status: 'active',
      points: 480,
      streak_weeks: 4,
      avatar_url: '',
      notifications_enabled: true,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      state: 'Tamil Nadu',
      district: 'Chennai',
      place: 'Velachery'
    },
    {
      id: 'user-suresh',
      email: 'suresh.kumar@gmail.com',
      name: 'Suresh Kumar',
      role: 'volunteer',
      status: 'active',
      points: 980,
      streak_weeks: 6,
      avatar_url: '',
      notifications_enabled: true,
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      ward_number: 'Ward 17',
      state: 'Tamil Nadu',
      district: 'Chennai',
      place: 'Porur'
    },
    {
      id: 'user-meenakshi',
      email: 'meenakshi.devi@gmail.com',
      name: 'Meenakshi Devi',
      role: 'volunteer',
      status: 'active',
      points: 870,
      streak_weeks: 8,
      avatar_url: '',
      notifications_enabled: true,
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      ward_number: 'Ward 6',
      state: 'Tamil Nadu',
      district: 'Chennai',
      place: 'Adyar'
    },
    {
      id: 'user-gov-official',
      email: 'muthu.selvam@gov.in',
      name: 'Eng. Muthu Selvam',
      role: 'gov',
      status: 'active',
      points: 120,
      streak_weeks: 0,
      avatar_url: '',
      notifications_enabled: true,
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      department: 'PWD',
      designation: 'Junior Engineer',
      employee_id: 'PWD-2023-0412',
      ward_number: 'Ward 42',
      verified: true,
      state: 'Tamil Nadu',
      district: 'Chennai',
      place: 'Velachery'
    },
    {
      id: 'user-admin',
      email: 'admin@communityhero.in',
      name: 'System Admin',
      role: 'admin',
      status: 'active',
      points: 0,
      streak_weeks: 0,
      notifications_enabled: true,
      created_at: new Date().toISOString(),
      state: 'Tamil Nadu',
      district: 'Chennai',
      place: 'Adyar'
    }
  ],
  issues: [
    {
      id: 'issue-1',
      reporter_id: 'user-priya',
      reporter_name: 'Priya Rajan',
      photo_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&h=300&q=80',
      lat: 13.0012,
      lng: 80.2436,
      bearing: 270,
      category: 'road',
      severity: 4,
      title: 'Pothole on Velachery Main Road',
      description: 'A deep pothole has formed right in front of the phoenix market city entrance. Highly dangerous for two-wheelers especially after rain.',
      address: 'Velachery Main Road, Chennai',
      state: 'Tamil Nadu',
      district: 'Chennai',
      area: 'Velachery',
      ward: 'Ward 42',
      status: 'open',
      upvote_count: 47,
      duplicate_count: 12,
      deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'issue-2',
      reporter_id: 'user-suresh',
      reporter_name: 'Suresh Kumar',
      photo_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&h=300&q=80',
      lat: 13.0382,
      lng: 80.1544,
      bearing: 90,
      category: 'water',
      severity: 3,
      title: 'Burst water main near Porur Signal',
      description: 'Drinking water is gushing out of the underground main pipe pipeline near the junction signal. Flooding the left side road lane.',
      address: 'Porur Junction, Chennai',
      state: 'Tamil Nadu',
      district: 'Chennai',
      area: 'Porur',
      ward: 'Ward 17',
      status: 'in_progress',
      assigned_to: 'user-gov-official',
      assigned_to_name: 'Eng. Muthu Selvam',
      upvote_count: 83,
      duplicate_count: 0,
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'issue-3',
      reporter_id: 'user-meenakshi',
      reporter_name: 'Meenakshi Devi',
      photo_url: 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=600&h=300&q=80',
      lat: 13.0063,
      lng: 80.2574,
      bearing: 0,
      category: 'lighting',
      severity: 2,
      title: 'Broken Streetlamp on LB Road',
      description: 'The streetlamp pole outside the public library is completely dark. High risk of accidents during night hours.',
      address: 'Adyar, Chennai',
      state: 'Tamil Nadu',
      district: 'Chennai',
      area: 'Adyar',
      ward: 'Ward 6',
      status: 'resolved',
      upvote_count: 12,
      duplicate_count: 1,
      deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  upvotes: [
    {
      id: 'up-1',
      user_id: 'user-suresh',
      issue_id: 'issue-1',
      created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'up-2',
      user_id: 'user-meenakshi',
      issue_id: 'issue-1',
      created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'up-3',
      user_id: 'user-priya',
      issue_id: 'issue-2',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  timelineEvents: [
    {
      id: 'ev-1',
      issue_id: 'issue-1',
      event_type: 'reported',
      actor_name: 'Priya Rajan',
      notes: 'Issue filed with photo upload',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ev-2',
      issue_id: 'issue-2',
      event_type: 'reported',
      actor_name: 'Suresh Kumar',
      notes: 'Issue filed with photo upload',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ev-3',
      issue_id: 'issue-2',
      event_type: 'assigned',
      actor_name: 'Eng. Muthu Selvam',
      notes: 'Assigned to Ward Junior Engineer for rectification within the 7 days timeline.',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ev-4',
      issue_id: 'issue-3',
      event_type: 'reported',
      actor_name: 'Meenakshi Devi',
      notes: 'Issue filed with photo upload',
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ev-5',
      issue_id: 'issue-3',
      event_type: 'resolution_submitted',
      actor_name: 'Suresh Kumar',
      notes: 'Replaced broken LED tube, street lighting successfully restored.',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ev-6',
      issue_id: 'issue-3',
      event_type: 'resolved',
      actor_name: 'System Admin',
      notes: 'Resolution verified and approved.',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  resolutions: [
    {
      id: 'res-3',
      issue_id: 'issue-3',
      resolver_id: 'user-suresh',
      resolver_name: 'Suresh Kumar',
      notes: 'Replaced broken LED tube, street lighting successfully restored.',
      photo_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&h=300&q=80',
      resolver_lat: 13.0063,
      resolver_lng: 80.2574,
      resolver_bearing: 0,
      geo_passed: true,
      bearing_delta: 0,
      distance_m: 5,
      ai_confidence: 94,
      ai_reason: 'Highly confident that the street lighting issue has been resolved.',
      admin_verified: true,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  broadcasts: [
    {
      id: 'b-1',
      creator_id: 'user-suresh',
      creator_name: 'Suresh Kumar',
      title: 'Velachery Pothole Filling Cleanup Drive',
      description: 'We are organizing a local group to help spread cold-mix asphalt and set up warning barricades at the severe potholes on Velachery Main Road. Tools and mix provided.',
      location: 'Phoenix Market City entrance gate, Velachery',
      state: 'Tamil Nadu',
      district: 'Chennai',
      place: 'Velachery',
      activity_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      resources_needed: ['Cold mix bags', 'Shovels', 'Rakes', 'Safety vests', 'Traffic cones'],
      max_participants: 15,
      target_districts: ['Chennai', 'Kanchipuram'],
      status: 'active',
      member_count: 2,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  broadcastMembers: [
    {
      id: 'bm-1',
      broadcast_id: 'b-1',
      user_id: 'user-suresh',
      user_name: 'Suresh Kumar',
      role: 'creator',
      status: 'accepted',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'bm-2',
      broadcast_id: 'b-1',
      user_id: 'user-priya',
      user_name: 'Priya Rajan',
      role: 'member',
      status: 'accepted',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  broadcastMessages: [
    {
      id: 'bmsg-1',
      broadcast_id: 'b-1',
      user_id: 'user-suresh',
      user_name: 'Suresh Kumar',
      user_role: 'volunteer',
      content: 'Hello everyone! Thank you for joining. I have ordered 10 bags of cold mix asphalt. Please bring gloves if you have them!',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'bmsg-2',
      broadcast_id: 'b-1',
      user_id: 'user-priya',
      user_name: 'Priya Rajan',
      user_role: 'citizen',
      content: 'I live nearby so I can bring an extra couple of rakes! See you all on Sunday morning.',
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ],
  notifications: [
    {
      id: 'nt-1',
      user_id: 'user-priya',
      type: 'points_earned',
      message: 'You earned +30 points for reporter bonus of a resolved issue',
      read: false,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'nt-2',
      user_id: 'user-suresh',
      type: 'badge_unlocked',
      message: 'Badge unlocked: Fixer!',
      read: true,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'nt-3',
      user_id: 'user-priya',
      type: 'broadcast_joined',
      message: 'New Cleanup Drive announced in your ward: Velachery Pothole Filling Cleanup Drive',
      link: '/broadcast/b-1',
      read: false,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  badges: [
    {
      id: 'bdg-1',
      user_id: 'user-priya',
      badge_key: 'street_watcher',
      unlocked_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'bdg-2',
      user_id: 'user-priya',
      badge_key: 'problem_solver',
      unlocked_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'bdg-3',
      user_id: 'user-priya',
      badge_key: 'community_voice',
      unlocked_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'bdg-4',
      user_id: 'user-priya',
      badge_key: 'early_adopter',
      unlocked_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  stats: {
    totalResolved: 2400,
    totalVolunteers: 180,
    totalWards: 12
  }
};

class JSONDatabase {
  private data: DatabaseSchema;
  private isSupabaseConnected = false;

  constructor() {
    this.data = INITIAL_DB;
    this.load();
    this.initSupabase();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading database, using default init state', e);
      this.data = INITIAL_DB;
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing database file', e);
    }
  }

  async initSupabase() {
    console.log('Initializing Supabase connection...');
    try {
      // 1. Create all schema tables matching index.ts types perfectly
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT NOT NULL,
          points INTEGER DEFAULT 0,
          streak_weeks INTEGER DEFAULT 0,
          avatar_url TEXT,
          notifications_enabled BOOLEAN DEFAULT true,
          created_at TEXT NOT NULL,
          ward_number TEXT,
          department TEXT,
          designation TEXT,
          employee_id TEXT,
          verified BOOLEAN DEFAULT false,
          state TEXT,
          district TEXT,
          place TEXT,
          id_proof_url TEXT
        );

        -- Safe column alterations for existing database instances
        ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS district TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS place TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS id_proof_url TEXT;

        CREATE TABLE IF NOT EXISTS issues (
          id TEXT PRIMARY KEY,
          reporter_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          reporter_name TEXT,
          photo_url TEXT NOT NULL,
          lat DOUBLE PRECISION NOT NULL,
          lng DOUBLE PRECISION NOT NULL,
          bearing DOUBLE PRECISION NOT NULL DEFAULT 0,
          category TEXT NOT NULL,
          severity INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          address TEXT NOT NULL,
          state TEXT NOT NULL,
          district TEXT NOT NULL,
          area TEXT NOT NULL,
          ward TEXT NOT NULL,
          status TEXT NOT NULL,
          upvote_count INTEGER DEFAULT 0,
          duplicate_count INTEGER DEFAULT 0,
          deadline TEXT NOT NULL,
          created_at TEXT NOT NULL,
          assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
          assigned_to_name TEXT
        );

        CREATE TABLE IF NOT EXISTS upvotes (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
          created_at TEXT NOT NULL,
          CONSTRAINT unique_user_issue_upvote UNIQUE(user_id, issue_id)
        );

        CREATE TABLE IF NOT EXISTS timeline_events (
          id TEXT PRIMARY KEY,
          issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
          event_type TEXT NOT NULL,
          actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
          actor_name TEXT NOT NULL,
          notes TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS resolutions (
          id TEXT PRIMARY KEY,
          issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE UNIQUE,
          resolver_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          resolver_name TEXT,
          photo_url TEXT NOT NULL,
          video_url TEXT,
          notes TEXT NOT NULL,
          resolver_lat DOUBLE PRECISION NOT NULL,
          resolver_lng DOUBLE PRECISION NOT NULL,
          resolver_bearing DOUBLE PRECISION NOT NULL,
          geo_passed BOOLEAN NOT NULL,
          bearing_delta DOUBLE PRECISION NOT NULL,
          distance_m DOUBLE PRECISION NOT NULL,
          ai_confidence DOUBLE PRECISION NOT NULL,
          ai_reason TEXT NOT NULL,
          admin_verified BOOLEAN,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS broadcasts (
          id TEXT PRIMARY KEY,
          creator_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          creator_name TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          location TEXT NOT NULL,
          state TEXT NOT NULL,
          district TEXT NOT NULL,
          place TEXT NOT NULL,
          issue_id TEXT,
          activity_date TEXT NOT NULL,
          resources_needed JSONB NOT NULL DEFAULT '[]'::jsonb,
          max_participants INTEGER NOT NULL,
          target_districts JSONB NOT NULL DEFAULT '[]'::jsonb,
          status TEXT NOT NULL,
          member_count INTEGER DEFAULT 1,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS broadcast_members (
          id TEXT PRIMARY KEY,
          broadcast_id TEXT REFERENCES broadcasts(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          user_name TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL,
          CONSTRAINT unique_broadcast_user UNIQUE(broadcast_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS broadcast_messages (
          id TEXT PRIMARY KEY,
          broadcast_id TEXT REFERENCES broadcasts(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          user_name TEXT NOT NULL,
          user_role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          message TEXT NOT NULL,
          link TEXT,
          read BOOLEAN DEFAULT false,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS badges (
          id TEXT PRIMARY KEY,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          badge_key TEXT NOT NULL,
          unlocked_at TEXT NOT NULL,
          CONSTRAINT unique_user_badge UNIQUE(user_id, badge_key)
        );

        CREATE TABLE IF NOT EXISTS stats (
          id INTEGER PRIMARY KEY DEFAULT 1,
          total_resolved INTEGER DEFAULT 2400,
          total_volunteers INTEGER DEFAULT 180,
          total_wards INTEGER DEFAULT 12
        );
      `);

      // 2. Insert stats row if missing
      await pool.query(`
        INSERT INTO stats (id, total_resolved, total_volunteers, total_wards)
        VALUES (1, 2400, 180, 12)
        ON CONFLICT (id) DO NOTHING;
      `);

      // 3. Seed initial mock data if the users table is currently empty
      const userCheck = await pool.query('SELECT COUNT(*) FROM users');
      const count = parseInt(userCheck.rows[0].count, 10);

      if (count === 0) {
        console.log('Supabase tables are empty. Seeding highly-polished mock datasets...');
        
        // Seed users
        for (const u of INITIAL_DB.users) {
          await pool.query(
            `INSERT INTO users (id, email, name, role, status, points, streak_weeks, avatar_url, notifications_enabled, created_at, ward_number, department, designation, employee_id, verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) ON CONFLICT DO NOTHING`,
            [u.id, u.email, u.name, u.role, u.status, u.points, u.streak_weeks, u.avatar_url || '', u.notifications_enabled, u.created_at, u.ward_number || null, u.department || null, u.designation || null, u.employee_id || null, u.verified || false]
          );
        }

        // Seed issues
        for (const i of INITIAL_DB.issues) {
          await pool.query(
            `INSERT INTO issues (id, reporter_id, reporter_name, photo_url, lat, lng, bearing, category, severity, title, description, address, state, district, area, ward, status, upvote_count, duplicate_count, deadline, created_at, assigned_to, assigned_to_name)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) ON CONFLICT DO NOTHING`,
            [i.id, i.reporter_id, i.reporter_name || null, i.photo_url, i.lat, i.lng, i.bearing, i.category, i.severity, i.title, i.description, i.address, i.state, i.district, i.area, i.ward, i.status, i.upvote_count, i.duplicate_count, i.deadline, i.created_at, i.assigned_to || null, i.assigned_to_name || null]
          );
        }

        // Seed upvotes
        for (const uv of INITIAL_DB.upvotes) {
          await pool.query(
            `INSERT INTO upvotes (id, user_id, issue_id, created_at)
             VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [uv.id, uv.user_id, uv.issue_id, uv.created_at]
          );
        }

        // Seed timelineEvents
        for (const te of INITIAL_DB.timelineEvents) {
          await pool.query(
            `INSERT INTO timeline_events (id, issue_id, event_type, actor_id, actor_name, notes, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
            [te.id, te.issue_id, te.event_type, te.actor_id || null, te.actor_name, te.notes || null, te.created_at]
          );
        }

        // Seed resolutions
        for (const r of INITIAL_DB.resolutions) {
          await pool.query(
            `INSERT INTO resolutions (id, issue_id, resolver_id, resolver_name, photo_url, video_url, notes, resolver_lat, resolver_lng, resolver_bearing, geo_passed, bearing_delta, distance_m, ai_confidence, ai_reason, admin_verified, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT DO NOTHING`,
            [r.id, r.issue_id, r.resolver_id, r.resolver_name || null, r.photo_url, r.video_url || null, r.notes, r.resolver_lat, r.resolver_lng, r.resolver_bearing, r.geo_passed, r.bearing_delta, r.distance_m, r.ai_confidence, r.ai_reason, r.admin_verified, r.created_at]
          );
        }

        // Seed broadcasts
        for (const b of INITIAL_DB.broadcasts) {
          await pool.query(
            `INSERT INTO broadcasts (id, creator_id, creator_name, title, description, location, state, district, place, issue_id, activity_date, resources_needed, max_participants, target_districts, status, member_count, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT DO NOTHING`,
            [b.id, b.creator_id, b.creator_name, b.title, b.description, b.location, b.state, b.district, b.place, b.issue_id || null, b.activity_date, JSON.stringify(b.resources_needed), b.max_participants, JSON.stringify(b.target_districts), b.status, b.member_count, b.created_at]
          );
        }

        // Seed broadcastMembers
        for (const bm of INITIAL_DB.broadcastMembers) {
          await pool.query(
            `INSERT INTO broadcast_members (id, broadcast_id, user_id, user_name, role, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
            [bm.id, bm.broadcast_id, bm.user_id, bm.user_name, bm.role, bm.status, bm.created_at]
          );
        }

        // Seed broadcastMessages
        for (const bmsg of INITIAL_DB.broadcastMessages) {
          await pool.query(
            `INSERT INTO broadcast_messages (id, broadcast_id, user_id, user_name, user_role, content, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
            [bmsg.id, bmsg.broadcast_id, bmsg.user_id, bmsg.user_name, bmsg.user_role, bmsg.content, bmsg.created_at]
          );
        }

        // Seed notifications
        for (const n of INITIAL_DB.notifications) {
          await pool.query(
            `INSERT INTO notifications (id, user_id, type, message, link, read, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
            [n.id, n.user_id, n.type, n.message, n.link || null, n.read, n.created_at]
          );
        }

        // Seed badges
        for (const bd of INITIAL_DB.badges) {
          await pool.query(
            `INSERT INTO badges (id, user_id, badge_key, unlocked_at)
             VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [bd.id, bd.user_id, bd.badge_key, bd.unlocked_at]
          );
        }

        console.log('Seed of highly-polished mock datasets to Supabase complete!');
      } else {
        console.log('Existing Supabase records detected. Fetching current states and syncing cache...');
        
        // Load users
        const usersRes = await pool.query('SELECT * FROM users');
        const dbUsers: User[] = usersRes.rows.map(row => ({
          id: row.id,
          email: row.email,
          name: row.name,
          role: row.role as any,
          status: row.status as any,
          points: parseInt(row.points || '0'),
          streak_weeks: parseInt(row.streak_weeks || '0'),
          avatar_url: row.avatar_url || '',
          notifications_enabled: !!row.notifications_enabled,
          created_at: row.created_at,
          ward_number: row.ward_number || undefined,
          department: row.department || undefined,
          designation: row.designation || undefined,
          employee_id: row.employee_id || undefined,
          verified: !!row.verified,
          state: row.state || undefined,
          district: row.district || undefined,
          place: row.place || undefined,
          id_proof_url: row.id_proof_url || undefined
        }));

        // Load issues
        const issuesRes = await pool.query('SELECT * FROM issues');
        const dbIssues: Issue[] = issuesRes.rows.map(row => ({
          id: row.id,
          reporter_id: row.reporter_id,
          reporter_name: row.reporter_name || undefined,
          photo_url: row.photo_url,
          lat: parseFloat(row.lat),
          lng: parseFloat(row.lng),
          bearing: row.bearing !== null && row.bearing !== undefined ? parseFloat(row.bearing) : 0,
          category: row.category,
          severity: parseInt(row.severity),
          title: row.title,
          description: row.description,
          address: row.address,
          state: row.state,
          district: row.district,
          area: row.area,
          ward: row.ward,
          status: row.status,
          upvote_count: parseInt(row.upvote_count || '0'),
          duplicate_count: parseInt(row.duplicate_count || '0'),
          deadline: row.deadline,
          created_at: row.created_at,
          assigned_to: row.assigned_to || undefined,
          assigned_to_name: row.assigned_to_name || undefined
        }));

        // Load upvotes
        const upvotesRes = await pool.query('SELECT * FROM upvotes');
        const dbUpvotes: Upvote[] = upvotesRes.rows.map(row => ({
          id: row.id,
          user_id: row.user_id,
          issue_id: row.issue_id,
          created_at: row.created_at
        }));

        // Load timelineEvents
        const timelineRes = await pool.query('SELECT * FROM timeline_events');
        const dbTimeline: IssueTimelineEvent[] = timelineRes.rows.map(row => ({
          id: row.id,
          issue_id: row.issue_id,
          event_type: row.event_type as any,
          actor_id: row.actor_id || undefined,
          actor_name: row.actor_name,
          notes: row.notes || undefined,
          created_at: row.created_at
        }));

        // Load resolutions
        const resolutionsRes = await pool.query('SELECT * FROM resolutions');
        const dbResolutions: Resolution[] = resolutionsRes.rows.map(row => ({
          id: row.id,
          issue_id: row.issue_id,
          resolver_id: row.resolver_id,
          resolver_name: row.resolver_name || undefined,
          photo_url: row.photo_url,
          video_url: row.video_url || undefined,
          notes: row.notes,
          resolver_lat: parseFloat(row.resolver_lat || '0'),
          resolver_lng: parseFloat(row.resolver_lng || '0'),
          resolver_bearing: parseFloat(row.resolver_bearing || '0'),
          geo_passed: !!row.geo_passed,
          bearing_delta: parseFloat(row.bearing_delta || '0'),
          distance_m: parseFloat(row.distance_m || '0'),
          ai_confidence: parseFloat(row.ai_confidence || '0'),
          ai_reason: row.ai_reason || '',
          admin_verified: row.admin_verified,
          created_at: row.created_at
        }));

        // Load broadcasts
        const broadcastsRes = await pool.query('SELECT * FROM broadcasts');
        const dbBroadcasts: Broadcast[] = broadcastsRes.rows.map(row => {
          let resources_needed: string[] = [];
          try {
            resources_needed = typeof row.resources_needed === 'string' 
              ? JSON.parse(row.resources_needed) 
              : row.resources_needed || [];
          } catch(e) {}
          
          let target_districts: string[] = [];
          try {
            target_districts = typeof row.target_districts === 'string' 
              ? JSON.parse(row.target_districts) 
              : row.target_districts || [];
          } catch(e) {}

          return {
            id: row.id,
            creator_id: row.creator_id,
            creator_name: row.creator_name,
            title: row.title,
            description: row.description,
            location: row.location,
            state: row.state,
            district: row.district,
            place: row.place,
            issue_id: row.issue_id || undefined,
            activity_date: row.activity_date,
            resources_needed,
            max_participants: parseInt(row.max_participants || '0'),
            target_districts,
            status: row.status as any,
            member_count: parseInt(row.member_count || '0'),
            created_at: row.created_at
          };
        });

        // Load broadcastMembers
        const membersRes = await pool.query('SELECT * FROM broadcast_members');
        const dbMembers: BroadcastMember[] = membersRes.rows.map(row => ({
          id: row.id,
          broadcast_id: row.broadcast_id,
          user_id: row.user_id,
          user_name: row.user_name,
          role: row.role as any,
          status: row.status as any,
          created_at: row.created_at
        }));

        // Load broadcastMessages
        const messagesRes = await pool.query('SELECT * FROM broadcast_messages');
        const dbMessages: BroadcastMessage[] = messagesRes.rows.map(row => ({
          id: row.id,
          broadcast_id: row.broadcast_id,
          user_id: row.user_id,
          user_name: row.user_name,
          user_role: row.user_role,
          content: row.content,
          created_at: row.created_at
        }));

        // Load notifications
        const notifsRes = await pool.query('SELECT * FROM notifications');
        const dbNotifs: Notification[] = notifsRes.rows.map(row => ({
          id: row.id,
          user_id: row.user_id,
          type: row.type as any,
          message: row.message,
          link: row.link || undefined,
          read: !!row.read,
          created_at: row.created_at
        }));

        // Load badges
        const badgesRes = await pool.query('SELECT * FROM badges');
        const dbBadges: UserBadge[] = badgesRes.rows.map(row => ({
          id: row.id,
          user_id: row.user_id,
          badge_key: row.badge_key,
          unlocked_at: row.unlocked_at
        }));

        // Load stats
        const statsRes = await pool.query('SELECT * FROM stats WHERE id = 1');
        const dbStats = statsRes.rows[0] ? {
          totalResolved: parseInt(statsRes.rows[0].total_resolved || '2400'),
          totalVolunteers: parseInt(statsRes.rows[0].total_volunteers || '180'),
          totalWards: parseInt(statsRes.rows[0].total_wards || '12')
        } : INITIAL_DB.stats;

        // Apply back to the memory cache safely
        this.data = {
          users: dbUsers,
          issues: dbIssues,
          upvotes: dbUpvotes,
          timelineEvents: dbTimeline,
          resolutions: dbResolutions,
          broadcasts: dbBroadcasts,
          broadcastMembers: dbMembers,
          broadcastMessages: dbMessages,
          notifications: dbNotifs,
          badges: dbBadges,
          stats: dbStats
        };

        this.save();
        console.log('In-memory cache fully synchronized with your Supabase database!');
      }

      this.isSupabaseConnected = true;
    } catch (err) {
      console.error('Failed to initialize or fetch data from Supabase. Falling back to local state.', err);
    }
  }

  // Helper method to safely run queries asynchronously in the background
  private runQuery(query: string, params: any[]) {
    pool.query(query, params).catch(err => {
      console.error(`Supabase write-back synchronization failed:`, err);
    });
  }

  // --- UPSERT SYNC METHODS ---
  private upsertUser(user: User) {
    this.runQuery(
      `INSERT INTO users (id, email, name, role, status, points, streak_weeks, avatar_url, notifications_enabled, created_at, ward_number, department, designation, employee_id, verified, state, district, place, id_proof_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         status = EXCLUDED.status,
         points = EXCLUDED.points,
         streak_weeks = EXCLUDED.streak_weeks,
         avatar_url = EXCLUDED.avatar_url,
         notifications_enabled = EXCLUDED.notifications_enabled,
         ward_number = EXCLUDED.ward_number,
         department = EXCLUDED.department,
         designation = EXCLUDED.designation,
         employee_id = EXCLUDED.employee_id,
         verified = EXCLUDED.verified,
         state = EXCLUDED.state,
         district = EXCLUDED.district,
         place = EXCLUDED.place,
         id_proof_url = EXCLUDED.id_proof_url`,
      [
        user.id, 
        user.email, 
        user.name, 
        user.role, 
        user.status, 
        user.points, 
        user.streak_weeks, 
        user.avatar_url || '', 
        user.notifications_enabled, 
        user.created_at, 
        user.ward_number || null, 
        user.department || null, 
        user.designation || null, 
        user.employee_id || null, 
        user.verified || false,
        user.state || null,
        user.district || null,
        user.place || null,
        user.id_proof_url || null
      ]
    );
  }

  private upsertIssue(issue: Issue) {
    this.runQuery(
      `INSERT INTO issues (id, reporter_id, reporter_name, photo_url, lat, lng, bearing, category, severity, title, description, address, state, district, area, ward, status, upvote_count, duplicate_count, deadline, created_at, assigned_to, assigned_to_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
       ON CONFLICT (id) DO UPDATE SET
         reporter_id = EXCLUDED.reporter_id,
         reporter_name = EXCLUDED.reporter_name,
         photo_url = EXCLUDED.photo_url,
         lat = EXCLUDED.lat,
         lng = EXCLUDED.lng,
         bearing = EXCLUDED.bearing,
         category = EXCLUDED.category,
         severity = EXCLUDED.severity,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         address = EXCLUDED.address,
         state = EXCLUDED.state,
         district = EXCLUDED.district,
         area = EXCLUDED.area,
         ward = EXCLUDED.ward,
         status = EXCLUDED.status,
         upvote_count = EXCLUDED.upvote_count,
         duplicate_count = EXCLUDED.duplicate_count,
         deadline = EXCLUDED.deadline,
         assigned_to = EXCLUDED.assigned_to,
         assigned_to_name = EXCLUDED.assigned_to_name`,
      [issue.id, issue.reporter_id, issue.reporter_name || null, issue.photo_url, issue.lat, issue.lng, issue.bearing, issue.category, issue.severity, issue.title, issue.description, issue.address, issue.state, issue.district, issue.area, issue.ward, issue.status, issue.upvote_count, issue.duplicate_count, issue.deadline, issue.created_at, issue.assigned_to || null, issue.assigned_to_name || null]
    );
  }

  private upsertUpvote(upvote: Upvote) {
    this.runQuery(
      `INSERT INTO upvotes (id, user_id, issue_id, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [upvote.id, upvote.user_id, upvote.issue_id, upvote.created_at]
    );
  }

  private upsertTimelineEvent(event: IssueTimelineEvent) {
    this.runQuery(
      `INSERT INTO timeline_events (id, issue_id, event_type, actor_id, actor_name, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         notes = EXCLUDED.notes`,
      [event.id, event.issue_id, event.event_type, event.actor_id || null, event.actor_name, event.notes || null, event.created_at]
    );
  }

  private upsertResolution(resolution: Resolution) {
    this.runQuery(
      `INSERT INTO resolutions (id, issue_id, resolver_id, resolver_name, photo_url, video_url, notes, resolver_lat, resolver_lng, resolver_bearing, geo_passed, bearing_delta, distance_m, ai_confidence, ai_reason, admin_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO UPDATE SET
         admin_verified = EXCLUDED.admin_verified`,
      [resolution.id, resolution.issue_id, resolution.resolver_id, resolution.resolver_name || null, resolution.photo_url, resolution.video_url || null, resolution.notes, resolution.resolver_lat, resolution.resolver_lng, resolution.resolver_bearing, resolution.geo_passed, resolution.bearing_delta, resolution.distance_m, resolution.ai_confidence, resolution.ai_reason, resolution.admin_verified, resolution.created_at]
    );
  }

  private upsertBroadcast(broadcast: Broadcast) {
    this.runQuery(
      `INSERT INTO broadcasts (id, creator_id, creator_name, title, description, location, state, district, place, issue_id, activity_date, resources_needed, max_participants, target_districts, status, member_count, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         member_count = EXCLUDED.member_count`,
      [broadcast.id, broadcast.creator_id, broadcast.creator_name, broadcast.title, broadcast.description, broadcast.location, broadcast.state, broadcast.district, broadcast.place, broadcast.issue_id || null, broadcast.activity_date, JSON.stringify(broadcast.resources_needed), broadcast.max_participants, JSON.stringify(broadcast.target_districts), broadcast.status, broadcast.member_count, broadcast.created_at]
    );
  }

  private upsertBroadcastMember(member: BroadcastMember) {
    this.runQuery(
      `INSERT INTO broadcast_members (id, broadcast_id, user_id, user_name, role, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status`,
      [member.id, member.broadcast_id, member.user_id, member.user_name, member.role, member.status, member.created_at]
    );
  }

  private upsertBroadcastMessage(message: BroadcastMessage) {
    this.runQuery(
      `INSERT INTO broadcast_messages (id, broadcast_id, user_id, user_name, user_role, content, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [message.id, message.broadcast_id, message.user_id, message.user_name, message.user_role, message.content, message.created_at]
    );
  }

  private upsertNotification(notification: Notification) {
    this.runQuery(
      `INSERT INTO notifications (id, user_id, type, message, link, read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         read = EXCLUDED.read`,
      [notification.id, notification.user_id, notification.type, notification.message, notification.link || null, notification.read, notification.created_at]
    );
  }

  private upsertBadge(badge: UserBadge) {
    this.runQuery(
      `INSERT INTO badges (id, user_id, badge_key, unlocked_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [badge.id, badge.user_id, badge.badge_key, badge.unlocked_at]
    );
  }

  private upsertStats(stats: DatabaseSchema['stats']) {
    this.runQuery(
      `INSERT INTO stats (id, total_resolved, total_volunteers, total_wards)
       VALUES (1, $1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         total_resolved = EXCLUDED.total_resolved,
         total_volunteers = EXCLUDED.total_volunteers,
         total_wards = EXCLUDED.total_wards`,
      [stats.totalResolved, stats.totalVolunteers, stats.totalWards]
    );
  }

  // --- STATS ---
  getStats() {
    return this.data.stats;
  }

  // --- USERS ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<User, 'id' | 'created_at' | 'points' | 'streak_weeks'>): User {
    const newUser: User = {
      ...user,
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      points: 0,
      streak_weeks: 1,
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    this.upsertUser(newUser);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    const { role, id: _, created_at: __, ...allowedUpdates } = updates;
    
    this.data.users[index] = {
      ...this.data.users[index],
      ...allowedUpdates
    };
    this.save();
    this.upsertUser(this.data.users[index]);
    return this.data.users[index];
  }

  awardPoints(userId: string, points: number, reason: string) {
    const user = this.getUserById(userId);
    if (user) {
      user.points += points;
      this.save();
      this.upsertUser(user);
      
      this.createNotification(
        userId,
        'points_earned',
        `You earned +${points} points for ${reason}`
      );
      this.checkBadges(userId);
    }
  }

  // --- ISSUES ---
  getIssues(): Issue[] {
    return this.data.issues;
  }

  getIssueById(id: string): Issue | undefined {
    return this.data.issues.find(i => i.id === id);
  }

  createIssue(issue: Omit<Issue, 'id' | 'created_at' | 'upvote_count' | 'duplicate_count' | 'status'>): Issue {
    const newIssue: Issue = {
      ...issue,
      id: `issue-${Math.random().toString(36).substr(2, 9)}`,
      status: 'open',
      upvote_count: 0,
      duplicate_count: 0,
      created_at: new Date().toISOString()
    };
    this.data.issues.push(newIssue);
    this.save();
    this.upsertIssue(newIssue);

    this.addTimelineEvent(
      newIssue.id,
      'reported',
      newIssue.reporter_id,
      newIssue.reporter_name || 'Citizen',
      'Issue filed with photo upload'
    );

    return newIssue;
  }

  updateIssue(id: string, updates: Partial<Issue>): Issue | undefined {
    const index = this.data.issues.findIndex(i => i.id === id);
    if (index === -1) return undefined;

    this.data.issues[index] = {
      ...this.data.issues[index],
      ...updates
    };
    this.save();
    this.upsertIssue(this.data.issues[index]);
    return this.data.issues[index];
  }

  // --- UPVOTES ---
  addUpvote(userId: string, issueId: string): boolean {
    const index = this.data.upvotes.findIndex(u => u.user_id === userId && u.issue_id === issueId);
    if (index !== -1) {
      // Already upvoted -> Toggle Off / Un-upvote!
      this.data.upvotes.splice(index, 1);
      
      const issue = this.getIssueById(issueId);
      if (issue) {
        issue.upvote_count = Math.max(0, issue.upvote_count - 1);
        this.upsertIssue(issue);
      }
      
      // Delete from PostgreSQL
      this.runQuery(
        `DELETE FROM upvotes WHERE user_id = $1 AND issue_id = $2`,
        [userId, issueId]
      );
      
      this.save();
      return false; // indicates un-upvoted now
    } else {
      // Add upvote
      const newUpvote: Upvote = {
        id: `upvote-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        issue_id: issueId,
        created_at: new Date().toISOString()
      };
      this.data.upvotes.push(newUpvote);

      const issue = this.getIssueById(issueId);
      if (issue) {
        issue.upvote_count += 1;
        this.upsertIssue(issue);
        
        if (issue.upvote_count >= 10 && issue.status === 'open') {
          issue.status = 'escalated';
          this.upsertIssue(issue);
          
          this.addTimelineEvent(
            issueId,
            'escalated',
            undefined,
            'System',
            'Auto-escalated to Councilor due to high community upvotes (>=10)'
          );
          this.createNotification(
            issue.reporter_id,
            'escalation',
            `Your reported issue '${issue.title}' has been auto-escalated due to high upvotes`,
            `/issue/${issue.id}`
          );
        }
      }

      this.save();
      this.upsertUpvote(newUpvote);
      return true; // indicates upvoted now
    }
  }

  getUpvotes(): Upvote[] {
    return this.data.upvotes || [];
  }

  // --- TIMELINE EVENTS ---
  getTimeline(issueId: string): IssueTimelineEvent[] {
    return this.data.timelineEvents
      .filter(e => e.issue_id === issueId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  addTimelineEvent(
    issueId: string, 
    eventType: IssueTimelineEvent['event_type'], 
    actorId: string | undefined, 
    actorName: string, 
    notes?: string
  ): IssueTimelineEvent {
    const newEvent: IssueTimelineEvent = {
      id: `ev-${Math.random().toString(36).substr(2, 9)}`,
      issue_id: issueId,
      event_type: eventType,
      actor_id: actorId,
      actor_name: actorName,
      notes,
      created_at: new Date().toISOString()
    };
    this.data.timelineEvents.push(newEvent);
    this.save();
    this.upsertTimelineEvent(newEvent);
    return newEvent;
  }

  // --- RESOLUTIONS ---
  getResolutions(): Resolution[] {
    return this.data.resolutions;
  }

  getResolutionById(id: string): Resolution | undefined {
    return this.data.resolutions.find(r => r.id === id);
  }

  getResolutionByIssueId(issueId: string): Resolution | undefined {
    return this.data.resolutions.find(r => r.issue_id === issueId);
  }

  createResolution(resolution: Omit<Resolution, 'id' | 'created_at' | 'admin_verified'>): Resolution {
    const newResolution: Resolution = {
      ...resolution,
      id: `res-${Math.random().toString(36).substr(2, 9)}`,
      admin_verified: null,
      created_at: new Date().toISOString()
    };
    
    this.data.resolutions = this.data.resolutions.filter(r => r.issue_id !== resolution.issue_id);
    this.data.resolutions.push(newResolution);

    const issue = this.getIssueById(resolution.issue_id);
    if (issue) {
      issue.status = 'in_progress';
      this.upsertIssue(issue);
      
      this.addTimelineEvent(
        issue.id,
        'resolution_submitted',
        resolution.resolver_id,
        resolution.resolver_name || 'Resolver',
        'Resolution proof submitted. Pending admin verification.'
      );
    }

    this.save();
    this.upsertResolution(newResolution);
    return newResolution;
  }

  verifyResolution(resolutionId: string, approved: boolean): boolean {
    const res = this.getResolutionById(resolutionId);
    if (!res) return false;

    res.admin_verified = approved;
    const issue = this.getIssueById(res.issue_id);
    
    if (issue) {
      if (approved) {
        issue.status = 'resolved';
        this.upsertIssue(issue);
        
        this.addTimelineEvent(
          issue.id,
          'resolved',
          undefined,
          'System Admin',
          'Resolution verified and approved.'
        );

        this.awardPoints(issue.reporter_id, 30, 'reporter bonus of a resolved issue');
        this.awardPoints(res.resolver_id, 50, 'successfully resolving an issue');
        
        this.data.stats.totalResolved += 1;
        this.upsertStats(this.data.stats);
      } else {
        issue.status = issue.assigned_to ? 'assigned' : 'open';
        this.upsertIssue(issue);
        
        this.addTimelineEvent(
          issue.id,
          'in_progress',
          undefined,
          'System Admin',
          'Resolution proof rejected. Issue returned to active status.'
        );
        
        this.createNotification(
          res.resolver_id,
          'resolved',
          `The resolution submitted for issue '${issue.title}' was rejected by the administration.`,
          `/issue/${issue.id}`
        );
      }
    }

    this.save();
    this.upsertResolution(res);
    return true;
  }

  // --- BROADCASTS ---
  getBroadcasts(): Broadcast[] {
    return this.data.broadcasts;
  }

  getBroadcastById(id: string): Broadcast | undefined {
    return this.data.broadcasts.find(b => b.id === id);
  }

  createBroadcast(broadcast: Omit<Broadcast, 'id' | 'created_at' | 'member_count' | 'status'>): Broadcast {
    const newBroadcast: Broadcast = {
      ...broadcast,
      id: `b-${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      member_count: 1,
      created_at: new Date().toISOString()
    };
    this.data.broadcasts.push(newBroadcast);
    
    const creatorMember: BroadcastMember = {
      id: `bm-${Math.random().toString(36).substr(2, 9)}`,
      broadcast_id: newBroadcast.id,
      user_id: broadcast.creator_id,
      user_name: broadcast.creator_name,
      role: 'creator',
      status: 'accepted',
      created_at: new Date().toISOString()
    };
    this.data.broadcastMembers.push(creatorMember);

    this.save();
    this.upsertBroadcast(newBroadcast);
    this.upsertBroadcastMember(creatorMember);
    return newBroadcast;
  }

  // --- BROADCAST MEMBERS ---
  getBroadcastMembers(broadcastId: string): BroadcastMember[] {
    return this.data.broadcastMembers.filter(bm => bm.broadcast_id === broadcastId);
  }

  joinBroadcast(broadcastId: string, userId: string, userName: string): BroadcastMember | null {
    const exists = this.data.broadcastMembers.find(bm => bm.broadcast_id === broadcastId && bm.user_id === userId);
    if (exists) return exists;

    const bc = this.getBroadcastById(broadcastId);
    if (!bc) return null;

    const newMember: BroadcastMember = {
      id: `bm-${Math.random().toString(36).substr(2, 9)}`,
      broadcast_id: broadcastId,
      user_id: userId,
      user_name: userName,
      role: 'member',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    this.data.broadcastMembers.push(newMember);
    this.save();
    this.upsertBroadcastMember(newMember);

    this.createNotification(
      bc.creator_id,
      'broadcast_joined',
      `${userName} requested to join your cleanup drive '${bc.title}'`,
      `/broadcast/${broadcastId}`
    );

    return newMember;
  }

  respondToJoinRequest(broadcastId: string, memberId: string, accept: boolean): boolean {
    const memberIndex = this.data.broadcastMembers.findIndex(
      bm => bm.broadcast_id === broadcastId && bm.user_id === memberId
    );
    if (memberIndex === -1) return false;

    const member = this.data.broadcastMembers[memberIndex];
    member.status = accept ? 'accepted' : 'declined';

    if (accept) {
      const bc = this.getBroadcastById(broadcastId);
      if (bc) {
        bc.member_count += 1;
        this.upsertBroadcast(bc);
      }
      this.createNotification(
        memberId,
        'broadcast_joined',
        `Your request to join '${bc?.title}' has been APPROVED!`,
        `/broadcast/${broadcastId}`
      );
    }

    this.save();
    this.upsertBroadcastMember(member);
    return true;
  }

  // --- MESSAGES ---
  getBroadcastMessages(broadcastId: string): BroadcastMessage[] {
    return this.data.broadcastMessages.filter(msg => msg.broadcast_id === broadcastId);
  }

  addBroadcastMessage(broadcastId: string, userId: string, userName: string, role: string, content: string): BroadcastMessage {
    const newMessage: BroadcastMessage = {
      id: `msg-${Math.random().toString(36).substr(2, 9)}`,
      broadcast_id: broadcastId,
      user_id: userId,
      user_name: userName,
      user_role: role,
      content,
      created_at: new Date().toISOString()
    };
    this.data.broadcastMessages.push(newMessage);
    this.save();
    this.upsertBroadcastMessage(newMessage);
    return newMessage;
  }

  // --- NOTIFICATIONS ---
  getNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createNotification(userId: string, type: Notification['type'], message: string, link?: string): Notification {
    const newNotif: Notification = {
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type,
      message,
      link,
      read: false,
      created_at: new Date().toISOString()
    };
    this.data.notifications.push(newNotif);
    this.save();
    this.upsertNotification(newNotif);
    return newNotif;
  }

  markAllNotificationsRead(userId: string) {
    this.data.notifications
      .filter(n => n.user_id === userId)
      .forEach(n => { 
        n.read = true; 
        this.upsertNotification(n);
      });
    this.save();
  }

  // --- BADGES ---
  getBadges(userId: string): UserBadge[] {
    return this.data.badges.filter(b => b.user_id === userId);
  }

  unlockBadge(userId: string, badgeKey: string): UserBadge | null {
    const exists = this.data.badges.some(b => b.user_id === userId && b.badge_key === badgeKey);
    if (exists) return null;

    const newBadge: UserBadge = {
      id: `bdg-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      badge_key: badgeKey,
      unlocked_at: new Date().toISOString()
    };
    this.data.badges.push(newBadge);
    
    const BADGES: Record<string, string> = {
      first_hero: 'First Hero',
      street_watcher: 'Street Watcher',
      quick_reporter: 'Quick Reporter',
      fixer: 'Fixer',
      area_hero: 'Area Hero',
      amplifier: 'Amplifier'
    };
    
    this.createNotification(
      userId,
      'badge_unlocked',
      `Badge unlocked: ${BADGES[badgeKey] || badgeKey}!`
    );

    this.save();
    this.upsertBadge(newBadge);
    return newBadge;
  }

  private checkBadges(userId: string) {
    const user = this.getUserById(userId);
    if (!user) return;

    const reportedIssues = this.getIssues().filter(i => i.reporter_id === userId).length;
    const resolvedIssues = this.getResolutions().filter(r => r.resolver_id === userId && r.admin_verified === true).length;
    const upvotesGiven = this.data.upvotes.filter(u => u.user_id === userId).length;

    if (reportedIssues >= 1) {
      this.unlockBadge(userId, 'first_hero');
    }
    if (reportedIssues >= 10) {
      this.unlockBadge(userId, 'street_watcher');
    }
    if (user.streak_weeks >= 4) {
      this.unlockBadge(userId, 'quick_reporter');
    }
    if (resolvedIssues >= 5) {
      this.unlockBadge(userId, 'fixer');
    }
    if (user.points >= 1000) {
      this.unlockBadge(userId, 'area_hero');
    }
    if (upvotesGiven >= 50) {
      this.unlockBadge(userId, 'amplifier');
    }
  }

  // --- BACKGROUND JOBS & OVERDUE CHECKS ---
  checkDeadlinesAndEscalate() {
    let changed = false;
    const now = new Date();
    this.data.issues.forEach(issue => {
      if (issue.status !== 'resolved' && issue.status !== 'escalated') {
        const deadline = new Date(issue.deadline);
        if (now > deadline) {
          issue.status = 'escalated';
          this.upsertIssue(issue);
          
          this.addTimelineEvent(
            issue.id,
            'escalated',
            undefined,
            'System Deadline Tracker',
            'Issue automatically escalated due to inactivity beyond the 7-day resolution timeline.'
          );
          
          this.createNotification(
            issue.reporter_id,
            'escalation',
            `Your reported issue '${issue.title}' has been auto-escalated to the Councilor as the official resolution deadline was missed.`,
            `/issue/${issue.id}`
          );
          
          changed = true;
        }
      }
    });

    if (changed) {
      this.save();
    }
  }
}

export const db = new JSONDatabase();
