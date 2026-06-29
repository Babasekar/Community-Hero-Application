# Hackathon Submission Documentation: Community Hero Portal

This document serves as the master template for your hackathon submission. You can copy the sections below directly into your **Google Doc (Project Description)** and your **GitHub Repository's README.md**.

---

## 1. Project Description (Google Doc Link Content)

### 📋 Problem Statement Selected
**Theme:** Hyperlocal Smart Cities & Civic Engagement
**Problem:** Municipal ward administration faces high friction in verifying reported civic issues (e.g., road damages, water leaks, failed streetlights, waste dumping). Traditional systems suffer from:
1. **Fake or Ambiguous Reports:** Users uploading stock photos or screenshots from other regions.
2. **Lack of Trustworthy Geotagging:** Inaccurate or spoofed GPS data making it difficult for field teams to locate the exact incident.
3. **Slow Resolution & Poor Volunteer Coordination:** Lack of a real-time, gamified community platform that brings citizens, volunteers, and local governments together.

---

### 💡 Solution Overview: Community Hero Portal
The **Community Hero Portal** is a full-stack, gamified civic engagement platform that connects citizens, local volunteer groups, and ward administrations.
- **Verification Engine:** By restricting reporting exclusively to mobile devices and utilizing on-ground camera/camcorder capture, the platform ensures live on-site proof. 
- **AI-Powered Diagnostics (Gemini):** A server-side Gemini intelligence layer automatically analyzes uploaded photos or video frames to verify whether a real civic concern is shown, classifies the issue category, determines the severity level, titles the incident, and drafts an initial description to prevent spam.
- **Three-Way Ecosystem:**
  1. **Citizens:** Capture live on-site telemetry, track resolution status on a timeline, and upvote/escalate critical local cases.
  2. **Volunteers:** Claim active ward tasks, organize local clean-up drives, coordinate via live chats, and submit "after-resolution" proof.
  3. **Government / Ward Officers:** Track ward performance indicators, delegate tasks to departments, inspect real-time geographic maps of issues, and verify resolution proofs to award civic XP points.

---

### ✨ Key Features

#### 🛡️ 1. Real-Time Telemetry & Capture Rules (Mobile)
* **Proof Validation:** Civic reports are limited strictly to mobile devices with direct camera/video captures (`capture="environment"`). Up to 5 images can be submitted for a single concern, or a live motion video.
* **Reshoot & Review:** Native-feeling carousel interface to inspect recorded proof, delete photos, or reshoot videos.

#### 🧠 2. Gemini Cognitive Scanning (AI Assistant)
* **Real-Time Classification:** Server-side Gemini API parses the media uploads to identify the category (e.g., Road, Waste, lighting, Drainage, Water).
* **Anti-Spam Verification:** Prevents joke submissions or stock image uploads by scanning for true urban civic problems and rejecting fake entries with precise explanations.

#### 🗺️ 3. Geographic Ward Explorer
* **Geospatial Tracking:** Visual, interactive maps showing precise pinned issue clusters mapped by coordinates.
* **Incident Routing Board:** Filter ward issues by status, category, and state/district hierarchies.

#### 🎮 4. Gamified Leaderboard & Civic XP
* **Action Reward System:** Citizens and volunteers earn points (XP) for filing verified reports, upvoting critical problems, or completing resolutions.
* **Regional Leaderboard:** Highlights top-performing civic heroes in the community to foster healthy positive competition.

#### 🤝 5. Volunteer Hub & Coordination
* **Task Claiming:** Registered volunteers claim outstanding ward issues, coordinate resolving strategies in dedicated, real-time-like coordination group chats.
* **Community Drives:** Organize, schedule, and sign up for public cleanup or repair drives.

#### 📊 6. Executive AI Advisories (Admin)
* **AI Report Generator:** Administrators can select state or city scopes and click to trigger Gemini to generate structured executive action reports, summaries of critical alerts, and resource allocation suggestions.

---

### 🛠️ Technologies Used
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide icons, Motion (Framer Motion)
* **Backend:** Node.js, Express, tsx
* **Build Tools:** Esbuild (compiles the CJS backend bundle), TypeScript
* **State Management:** React Context (Auth State, User XP)

---

### 🚀 Google Technologies Utilized
* **Gemini API:** Performs image & video frame cognitive analysis, verifies civic issue validity, extracts tags/categories, and compiles executive city-level reports for administrators.
* **Google Cloud Run:** Hosts the full-stack container environment, ensuring instant scaling, reliable low-latency rendering, and security.

---

# 2. Step-by-Step Submission Guide

Follow these simple steps to successfully export, deploy, and submit your project to the hackathon!

### 🌐 Step A: Retrieve Your Public Deployed Link
1. Look at your **Google AI Studio Build** environment.
2. The platform automatically deploys your applet to a secure **Google Cloud Run** container!
3. Your public live application links are:
   * **Pre-release / Public Share Link:** `https://ais-pre-mjvrfedqumy2wwv3n43lrq-847273317905.asia-east1.run.app`
   * **Development Link:** `https://ais-dev-mjvrfedqumy2wwv3n43lrq-847273317905.asia-east1.run.app`
4. Use the **Pre-release Link** as your **Deployed Application Link** for the hackathon submission.

---

### 💻 Step B: Create Your GitHub Repository
To export your fully developed codebase directly to GitHub:
1. Open the **Settings Menu** in the AI Studio sidebar (look for the gear icon ⚙️ at the bottom left).
2. Click **Export to GitHub** (or **Download ZIP** if you prefer to push it manually).
3. Follow the authentication prompts to connect your GitHub account.
4. AI Studio will automatically create a new repository (or push to an existing one) containing all your clean TypeScript source code, `package.json`, asset files, and configurations.
5. Set your repository to **Public** so that hackathon judges can inspect the code.
6. Commit this `HACKATHON_SUBMISSION.md` as your repository's primary `README.md`.

---

### 📝 Step C: Set Up Your Project Description Google Doc
1. Go to [Google Docs](https://docs.google.com) and create a new blank document.
2. Copy the content under **"Section 1. Project Description"** above and paste it into your Google Doc.
3. Style the document with clear headings, bold texts, and bullet points to look highly professional.
4. Click the **Share** button in the top right corner of the Google Doc.
5. Change the access option to **"Anyone with the link can view"** (this is mandatory for the evaluation team).
6. Copy the shareable link.

---

### 🎉 Step D: Submit!
Go to the hackathon submission portal and fill in:
1. **Deployed Application Link:** `https://ais-pre-mjvrfedqumy2wwv3n43lrq-847273317905.asia-east1.run.app`
2. **GitHub Repository Link:** *(The URL of the repository you created in Step B)*
3. **Project Description Google Doc Link:** *(The shareable view link you copied in Step C)*

---
*Created with care by Google AI Studio Coding Assistant. Good luck with the hackathon evaluation! 🚀*
