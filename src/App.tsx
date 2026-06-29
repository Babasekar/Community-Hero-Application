/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/auth/Login';

// Citizen Views
import { CitizenFeed } from './pages/citizen/CitizenFeed';
import { ReportIssue } from './pages/citizen/ReportIssue';
import { CitizenHub } from './pages/citizen/CitizenHub';
import { LeaderboardView } from './pages/citizen/LeaderboardView';

// Volunteer Views
import { VolunteerTasks } from './pages/volunteer/VolunteerTasks';
import { VolunteerDrives } from './pages/volunteer/VolunteerDrives';
import { VolunteerChat } from './pages/volunteer/VolunteerChat';

// Government Views
import { GovDashboard } from './pages/gov/GovDashboard';
import { WardExplorer } from './pages/gov/WardExplorer';

// Admin Views
import { AdminDashboard } from './pages/admin/AdminDashboard';

import { Shield, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { LogoIcon } from './components/common/Logo';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('');
  const [showSplash, setShowSplash] = useState(true);

  // Auto-dismiss splash screen after 1.8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-set default active tab based on user role when logged in
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'citizen':
          setActiveTab('feed');
          break;
        case 'volunteer':
          setActiveTab('tasks');
          break;
        case 'gov':
          setActiveTab('dashboard');
          break;
        case 'admin':
          setActiveTab('verifications');
          break;
        default:
          setActiveTab('');
      }
    } else {
      setActiveTab('');
    }
  }, [user]);

  if (showSplash) {
    return (
      <div id="splash-launch" className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="flex flex-col items-center max-w-sm space-y-6">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: [0.85, 1.05, 1], opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-36 h-36 flex items-center justify-center"
          >
            <LogoIcon size={120} />
          </motion.div>
          
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-2"
          >
            <h1 className="text-2xl font-black tracking-wider text-slate-800 uppercase leading-none">COMMUNITY</h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="w-6 h-0.5 bg-amber-500 rounded-full"></span>
              <h2 className="text-lg font-black text-indigo-600 tracking-widest uppercase leading-none">HERO</h2>
              <span className="w-6 h-0.5 bg-emerald-500 rounded-full"></span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2.5">
              AI-Powered Hyperlocal Civic Resolution Portal
            </p>
          </motion.div>

          <div className="pt-6 flex items-center gap-1.5 justify-center">
            <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Initializing Portal Ledger...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div id="app-loading" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <Shield className="w-12 h-12 text-indigo-500 animate-pulse mb-4" />
        <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
        <p className="text-xs font-bold text-slate-400 mt-4 tracking-widest uppercase">Initializing Ledger...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Intercept and display gorgeous pending audit screen for unverified gov officials
  if (user && user.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-100 animate-pulse">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Verification Under Process</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Welcome, <b>{user.name}</b>. Your municipal credentials have been logged and are under compliance audit.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between border-b border-slate-200/40 pb-1.5">
              <span className="font-bold text-slate-400 uppercase text-[9px]">Official ID:</span>
              <span className="font-mono text-slate-800 font-bold">{user.employee_id || 'Pending'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/40 pb-1.5">
              <span className="font-bold text-slate-400 uppercase text-[9px]">Department:</span>
              <span className="text-slate-800 font-semibold">{user.department}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/40 pb-1.5">
              <span className="font-bold text-slate-400 uppercase text-[9px]">Jurisdiction:</span>
              <span className="text-slate-800 font-semibold">{user.state} &gt; {user.district}</span>
            </div>
            {user.id_proof_url && (
              <div className="pt-1 text-center">
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  ✓ ID Document Securely Uploaded
                </span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Your profile is routed to the designated State Administrator. Please wait for authorization or sign out below.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('community_hero_token');
              localStorage.removeItem('community_hero_user');
              window.location.reload();
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors uppercase tracking-wider text-[10px]"
          >
            Sign Out / Switch Account
          </button>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (user.role) {
      case 'citizen':
        switch (activeTab) {
          case 'feed':
            return <CitizenFeed />;
          case 'report':
            return <ReportIssue />;
          case 'activity':
            return <CitizenHub />;
          case 'leaderboard':
            return <LeaderboardView />;
          default:
            return <CitizenFeed />;
        }
      case 'volunteer':
        switch (activeTab) {
          case 'tasks':
            return <VolunteerTasks />;
          case 'drives':
            return <VolunteerDrives />;
          case 'chat':
            return <VolunteerChat />;
          case 'leaderboard':
            return <LeaderboardView />;
          default:
            return <VolunteerTasks />;
        }
      case 'gov':
        switch (activeTab) {
          case 'dashboard':
            return <GovDashboard />;
          case 'explorer':
            return <WardExplorer />;
          case 'delegated':
            return <VolunteerTasks />;
          default:
            return <GovDashboard />;
        }
      case 'admin':
        switch (activeTab) {
          case 'verifications':
          case 'analytics':
            return <AdminDashboard />;
          default:
            return <AdminDashboard />;
        }
      default:
        return (
          <div className="p-8 text-center text-slate-400 text-xs">
            Unknown portal profile. Please sign out.
          </div>
        );
    }
  };

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveView()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
