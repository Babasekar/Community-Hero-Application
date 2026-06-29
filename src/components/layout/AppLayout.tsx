/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, Bell, Trophy, MapPin, ClipboardList, Shield,
  PlusCircle, UserCheck, MessageSquare, BarChart, Calendar, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FullLogo } from '../common/Logo';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout, notifications, markNotificationsRead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!user) return <>{children}</>;

  const getTabsByRole = () => {
    switch (user.role) {
      case 'citizen':
        return [
          { id: 'feed', label: 'Explore Feed', icon: Globe },
          { id: 'report', label: 'Report Issue', icon: PlusCircle },
          { id: 'activity', label: 'My Hub', icon: MapPin },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
        ];
      case 'volunteer':
        return [
          { id: 'tasks', label: 'Civic Tasks', icon: ClipboardList },
          { id: 'drives', label: 'Cleanup Drives', icon: Calendar },
          { id: 'chat', label: 'Group Chats', icon: MessageSquare },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
        ];
      case 'gov':
        return [
          { id: 'dashboard', label: 'Gov Dashboard', icon: BarChart },
          { id: 'explorer', label: 'Ward Explorer', icon: MapPin },
          { id: 'delegated', label: 'Delegations', icon: ClipboardList }
        ];
      case 'admin':
        return [
          { id: 'verifications', label: 'Verifications', icon: UserCheck },
          { id: 'analytics', label: 'AI Advisory', icon: Shield }
        ];
      default:
        return [];
    }
  };

  const tabs = getTabsByRole();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      markNotificationsRead();
    }
  };

  return (
    <div id="layout-root" className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16 md:pb-0 md:pl-64">
      {/* TOP BAR */}
      <header id="top-bar" className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <FullLogo iconSize={32} />
          </div>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 capitalize">
              {user.role} Portal
            </span>
            {user.role === 'gov' && user.verified && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Button */}
          <div className="relative">
            <button 
              id="notif-bell"
              onClick={handleNotificationClick}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div 
                    id="notif-dropdown"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 divide-y divide-slate-100"
                  >
                    <div className="px-4 py-2 font-bold text-sm text-slate-800 flex justify-between items-center">
                      <span>Notifications</span>
                      {unreadCount > 0 && <span className="text-xs text-indigo-600 font-normal">Marked as read</span>}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No notifications yet</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 text-xs transition-colors hover:bg-slate-50 ${!n.read ? 'bg-indigo-50/50' : ''}`}>
                          <p className="text-slate-700 font-medium leading-normal">{n.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              id="user-profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-full md:px-3 md:py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <motion.div 
                    id="profile-dropdown"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    {user.role === 'citizen' || user.role === 'volunteer' ? (
                      <div className="px-4 py-2 text-[10px] bg-slate-50 flex justify-between border-b border-slate-100">
                        <span>XP Points:</span>
                        <span className="font-bold text-indigo-600">{user.points} XP</span>
                      </div>
                    ) : null}
                    <button 
                      id="logout-btn"
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout Session
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside id="desktop-sidebar" className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-40 text-white">
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <FullLogo iconSize={32} isDarkBg={true} />
        </div>

        {/* User stats widget in sidebar */}
        <div className="p-4 mx-4 my-6 bg-slate-800/50 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-extrabold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h4 className="text-xs font-bold truncate max-w-[140px]">{user.name}</h4>
            <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
            {(user.role === 'citizen' || user.role === 'volunteer') && (
              <p className="text-[10px] text-indigo-400 font-semibold mt-0.5">{user.points} XP Total</p>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1">
          {tabs.filter(tab => tab.id !== 'report').map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`sidebar-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-4 text-center border-t border-slate-800 text-[10px] text-slate-500 font-sans uppercase tracking-widest">
          Community Hero Portal
        </div>
      </aside>

      {/* MAIN VIEW CONTENT */}
      <main id="main-scroll" className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav id="mobile-bottom-nav" className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-slate-200 z-30 flex justify-around items-center">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px]">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
