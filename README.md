<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🦸 Community Hero — Hyperlocal Civic Issue Reporting Platform

> **Vibe2Ship Hackathon 2026** · Coding Ninjas × Google for Developers  
> **Problem Statement 2** — Community Hero: Hyperlocal Problem Solver

**Live App:** [community-hero-100012385991.asia-southeast1.run.app](https://community-hero-100012385991.asia-southeast1.run.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Solution](#solution)
- [User Roles & Flows](#user-roles--flows)
  - [Citizen](#-citizen)
  - [Volunteer](#-volunteer)
  - [Government Officer](#-government-officer)
  - [Super Admin](#-super-admin)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Google Technologies Used](#google-technologies-used)
- [Getting Started](#getting-started)

---

## Overview

**Community Hero** is a full-stack, gamified civic engagement platform that connects three roles — **Citizens**, **Volunteers**, and **Government Ward Officers** — into a single coordinated loop for reporting, tracking, and resolving local civic issues such as potholes, water leakages, broken streetlights, and waste management problems.

Gemini AI sits at the centre: verifying every submitted photo, classifying the issue, detecting duplicates, routing the case to the correct ward representative, and generating data-driven advisory reports for decision-makers.

---

## The Problem

Communities across India face daily civic issues, yet existing reporting mechanisms are broken in three key ways:

| Problem | Impact |
|---|---|
| **Fake & unverifiable reports** | Citizens upload stock photos or screenshots, making ground-level verification impossible |
| **Spoofed or inaccurate GPS** | Field teams waste resources locating incidents that may not exist where claimed |
| **Siloed response chains** | Citizens, volunteers, and government officials have no shared channel for coordination or tracking |

---

## Solution

Community Hero solves this with:

- **Camera-only capture** — no gallery uploads, so every report is on-ground live proof
- **Embedded GPS + compass bearing** — tamper-resistant location metadata on every photo
- **Gemini Vision verification** — AI validates the photo shows a real civic concern before it enters the system
- **Three-role ecosystem** — Citizen → Volunteer → Government, all connected on one platform
- **Automatic MLA/MP routing** — issues are routed to the correct ward representative based on GPS-resolved jurisdiction

---

## User Roles & Flows

### 👤 Citizen

Citizens are the core reporters of civic issues. Here is the complete flow:

**1. Browse the Explore Feed**  
The home screen displays all active civic reports across the city. Citizens can search by description, filter by category (Road, Water, Lighting, Waste, Drainage) and filter by status (Open, In Progress, Resolved, Escalated).

**2. Capture Live Proof**  
Tapping "Report" opens the camera directly. The platform accepts:
- Up to **5 live photos** (Camera Photo Mode)
- A **live video** (Video Mode)

Gallery uploads are disabled. This ensures every submission is captured at the actual location.

**3. Gemini AI Auto-Detection**  
After capture, the image is sent to the Gemini Vision API server-side. Gemini:
- Verifies the photo shows a genuine civic concern
- Auto-generates an **issue title**
- Identifies the correct **category**
- Assigns a **severity score from 1 to 5**
- Drafts a plain-language **issue description**
- **Rejects** submissions that are not genuine civic issues, with a reason

**4. GPS + Compass Commit**  
Before submitting, the platform displays:
- Live latitude & longitude coordinates
- Compass bearing
- Reverse-geocoded address

The citizen reviews and commits the report to the civic ledger.

**5. Duplicate Detection & Upvoting**  
When a new report is submitted near an existing open issue of the same type, the system automatically:
- Flags it as a **duplicate**
- Merges it as an **upvote** on the original report
- Increases the issue's visibility to ward officers

**6. Track Reports & Earn XP**  
Under "My" section, citizens see all their submitted reports with live status tracking:  
`Open → In Progress → Resolved`

XP is earned for every verified contribution. Weekly reporting streaks unlock **streak multipliers**. Badges are awarded automatically:
- 🔵 **Street Watcher** — 10+ validated issue reports
- ⚡ **Quick Reporter** — 4+ week reporting streak

**7. Join Cleanup Campaigns**  
Citizens can discover nearby volunteer-organized cleanup drives and join with one tap. Once joined, they are automatically added to the campaign's **Assembly Group Channel** for logistics coordination.

---

### 🙋 Volunteer

Volunteers organise local action and physically resolve issues on the ground.

**1. Schedule a Cleanup Campaign**  
Volunteers create a campaign by providing:
- Campaign title
- Landmark address
- Target state, district, and ward
- Date and time
- Campaign description

This is broadcast to all citizens in the targeted area.

**2. Campaign Broadcast**  
Citizens in the ward see the campaign card with participant count. They can join in one tap.

**3. Assembly Group Channel**  
Every campaign gets its own dedicated **logistics group channel**. The volunteer coordinates supplies, meeting points, and task assignments here. All citizens who join are automatically added to this channel — no external messaging app needed.

**4. Claim & Resolve Open Ward Issues**  
Volunteers can browse unclaimed civic task boards and claim individual issues to work on. After resolving the issue on-ground, they submit an **after-resolution proof photo**.

> The resolution proof is validated against the original incident's GPS location (see Live Location Verification under Key Features).

**5. Leaderboard**  
Volunteers appear on the **Hyperlocal Civic Leaderboard** ranked by total XP earned. The leaderboard can be scoped to All India or narrowed to a specific ward.

---

### 🏛️ Government Officer

Government ward officers — PWD engineers, MLAs, MPs — access a dedicated portal for ward-level incident management.

**1. Government Profile Verification**  
Government accounts are not self-activated. During sign-up, officers submit:
- Department
- Designation
- Employee ID
- Assigned Ward

A super admin reviews and approves or rejects access before the officer can log in. This prevents non-officials from accessing ward analytics or resolution workflows.

**2. Ward Incident Routing Dashboard**  
The dashboard shows:
- Total Department Cases
- Pending Issues
- Escalations
- Cases Resolved

A **Case Status Proportion chart** gives a quick visual of the ward's current health.

> Each submitted report is automatically routed to the MLA or MP whose jurisdiction matches the GPS-resolved location. The concerned representative receives an **in-app notification** immediately.

**3. Issue Category Analytics & Density Hotspots**  
The analytics tab shows:
- Issue breakdown by category with percentages (Road, Water, Lighting, Waste, Drainage)
- **Issue Density Hotspot table** — areas ranked by report volume, directly identifying where urgent fund allocation is needed

**4. Gemini Ward Advisory Report**  
Officers trigger a Gemini-generated advisory scoped to their ward or district. Gemini analyses live issue data and produces structured recommendations — for example, which ward needs priority road repair vs water pipe maintenance — along with an **allocation optimality index score**.

**5. Municipal Geospatial Ward Explorer (Live Map)**  
A live ward map plots all incidents as colour-coded pins:
- 🔵 **Blue** — Open
- 🔴 **Red** — Escalated
- 🟢 **Green** — Resolved

Officers can visually identify clusters and cross-reference geographic patterns across their ward.

**6. Task Delegation Board**  
Unclaimed civic tasks are listed under Delegations. Officers can:
- Assign tasks to specific department teams
- Track claimed vs unclaimed cases
- Review and approve resolution proofs before closing a case and awarding XP

---

### ✨ Super Admin

**1. Gemini Fund Advisory Panel**  
The admin selects state and district scope, views a Google Maps-grounded issue overview, and triggers Gemini to generate a state-level executive advisory report identifying infrastructure bottlenecks and priority districts for fund allocation.

**2. Government Profile Verification**  
Reviews all pending government officer sign-up requests and approves or rejects based on submitted credentials.

---

## Key Features

### 📱 Camera-Only Anti-Fraud Capture
All civic reports are restricted to direct camera capture. Gallery uploads are blocked. Every image carries embedded GPS coordinates, a timestamp, and compass bearing — forming a tamper-resistant proof chain.

### 🧠 Gemini Vision Classification & Anti-Spam
Every submission is processed server-side by the Gemini Flash Vision API. It verifies the photo, auto-generates a title, assigns category and severity (1–5), drafts a description, and rejects fake or irrelevant submissions before they reach the database.

### 🔁 Duplicate Detection & Upvoting
New reports submitted near an existing open issue of the same type are automatically identified as duplicates and merged as upvotes — consolidating signal and surfacing high-priority issues faster.

### 📍 Live Location-Verified Resolution Proof
When a volunteer or officer submits a resolution proof photo, the platform cross-references its GPS coordinates against the original incident location. If the photo was not taken within an acceptable proximity radius, the resolution is **automatically rejected** as false proof — ensuring genuine field verification before case closure.

### 🗺️ Municipal Geospatial Ward Explorer
Interactive live map with colour-coded incident pins. Enables officers to visualise issue clusters and cross-reference geographic patterns across ward boundaries.

### 🏛️ Automatic MLA / MP Routing & Notification
Every submitted report is automatically routed to the MLA or MP whose ward boundary matches the GPS-resolved incident location. The concerned representative is notified in-app immediately — no manual routing required.

### 🎮 Gamified XP, Badges & Leaderboard
Citizens and volunteers earn XP for every verified civic action. Streak multipliers reward consistent contributors. Badges unlock automatically. The Civic Leaderboard ranks participants by XP and can be filtered to All-India or ward scope.

### 🤝 Volunteer Assembly & Campaign Group Channels
Volunteers schedule hyperlocal cleanup drives. Citizens join in one tap and are automatically added to the campaign's Assembly Group Channel for real-time logistics coordination.

### 📊 Gemini Executive AI Advisories
Ward officers and state admins can trigger Gemini advisory reports at district or state scope. Gemini analyses live issue data — categories, upvote density, unresolved durations — and generates structured recommendations with an allocation optimality index score.

### ✅ Government Profile Verification
Government accounts require super admin approval before access is granted. Officers submit Department, Designation, Employee ID, and Ward Assignment — all reviewed before login is enabled.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, Esbuild |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Gemini Flash Vision API |
| **Deployment** | Google Cloud Run via Google AI Studio |
| **Maps** | Google Maps (Grounding & Geospatial) |
| **Device APIs** | Camera API, Geolocation API, Device Orientation API (Compass) |

---

## Google Technologies Used

| Technology | Usage |
|---|---|
| **Gemini Flash Vision API** | Photo verification, issue classification, severity scoring, duplicate detection, advisory report generation |
| **Google AI Studio** | Build and deployment environment |
| **Google Cloud Run** | Hosts the full-stack containerised application |
| **Google Maps** | Geospatial grounding, ward map explorer, location-based issue routing |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (for database)
- Gemini API key
- Google Maps API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Babasekar/Community-Hero-Application.git
cd Community-Hero-Application

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_MAPS_API_KEY

# Run in development
npm run dev

# Build for production
npm run build
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## Project Links

| Item | Link |
|---|---|
| **Live Application** | [community-hero-100012385991.asia-southeast1.run.app](https://community-hero-100012385991.asia-southeast1.run.app) |
| **GitHub Repository** | [github.com/Babasekar/Community-Hero-Application](https://github.com/Babasekar/Community-Hero-Application/tree/main) |
| **Documentation with UI** | [Link](https://communityappdocumentation.netlify.app/)) |

---

*Built for Vibe2Ship Hackathon 2026 · Coding Ninjas × Google for Developers*

