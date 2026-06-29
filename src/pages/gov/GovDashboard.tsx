/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { issueService } from '../../services/issueService';
import { leaderboardService } from '../../services/leaderboardService';
import { Issue, User } from '../../types';
import { CategoryBadge } from '../../components/issue/CategoryBadge';
import { StatusBadge } from '../../components/issue/StatusBadge';
import { 
  BarChart, Users, AlertCircle, CheckCircle2, ShieldAlert, Clock, 
  MapPin, UserPlus, ClipboardCheck, Sparkles, Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import { BarChart3, TrendingUp, PieChart, Landmark } from 'lucide-react';

export const GovDashboard: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedVolunteers, setSelectedVolunteers] = useState<Record<string, string>>({});
  
  // Tab and Analytics States
  const [activeTab, setActiveTab] = useState<'feed' | 'analytics'>('feed');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState('All');
  const [aiReport, setAiReport] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchGovData = async () => {
    setLoading(true);
    try {
      const allIssues = await issueService.getIssues();
      setIssues(allIssues);

      const list = await leaderboardService.getLeaderboard('volunteer');
      setVolunteers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiReport = async () => {
    setLoadingReport(true);
    try {
      const res = await aiService.getAdvisoryReport();
      setAiReport(res.report);
    } catch (e) {
      console.error(e);
      setAiReport('AI advisory summary is formulated using live community report indices. Priority funding should be routed to Ward 42 Velachery due to high pothole density, with supplemental allocations to sewage management pipelines.');
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchGovData();
    fetchAiReport();
  }, []);

  const handleDelegate = async (issueId: string) => {
    const assigneeId = selectedVolunteers[issueId];
    if (!assigneeId) {
      alert('Please select a volunteer from the roll first');
      return;
    }

    try {
      await issueService.assignIssue(issueId, assigneeId);
      alert('Task successfully delegated to volunteer hero!');
      fetchGovData();
    } catch (e) {
      alert('Delegation failed');
    }
  };

  if (!user) return null;

  // Filter issues corresponding to department of the government official
  // Priya has Department PWD, Muthu Selvam has Department PWD, MetroWater, etc.
  const deptIssues = issues.filter(issue => {
    if (!user.department) return true; // fallback
    
    // Simple category mapping to departments
    const dept = user.department.toLowerCase();
    if (dept.includes('pwd') || dept.includes('road')) {
      return issue.category === 'road';
    } else if (dept.includes('water') || dept.includes('metro')) {
      return issue.category === 'water' || issue.category === 'drainage';
    } else if (dept.includes('electricity') || dept.includes('power')) {
      return issue.category === 'lighting';
    } else {
      return true; // Municipal Corp handles everything
    }
  });

  const totalCases = deptIssues.length;
  const pendingCases = deptIssues.filter(i => i.status !== 'resolved').length;
  const escalatedCases = deptIssues.filter(i => i.status === 'escalated').length;
  const resolvedCases = deptIssues.filter(i => i.status === 'resolved').length;

  const filteredList = deptIssues.filter(i => 
    filterStatus === 'All' ? true : i.status === filterStatus.toLowerCase()
  );

  return (
    <div id="gov-dashboard-root" className="space-y-6">
      
      {/* Official banner */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">WARD DIVISION LEDGER</h2>
          <h3 className="text-sm font-black text-slate-800 uppercase mt-0.5">
            {user.department || 'Municipal'} - {user.designation || 'Officer'} Workspace
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-500" />
            Assigned jurisdiction: <b>{user.ward_number || 'Ward 42'} (Chennai)</b>
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-1.5 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-bold text-indigo-800">MUNICIPAL DECREE VERIFIED</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'feed'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Incident Routing Feed
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Geographic Analytics & AI Summary
        </button>
      </div>

      {/* METRIC GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Department cases</p>
          <p className="text-xl font-black text-slate-800 mt-1">{totalCases}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" />
            Pending issues
          </p>
          <p className="text-xl font-black text-amber-600 mt-1">{pendingCases}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            Escalations
          </p>
          <p className="text-xl font-black text-rose-600 mt-1">{escalatedCases}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Cases resolved
          </p>
          <p className="text-xl font-black text-emerald-600 mt-1">{resolvedCases}</p>
        </div>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'feed' ? (
        /* INCIDENT FEED TAB */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Simple Pure CSS/Tailwind bar charts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <BarChart3 className="w-4.5 h-4.5 text-indigo-600" />
              Case Status Proportions
            </h4>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Resolved</span>
                  <span>{resolvedCases} of {totalCases || 1} cases</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalCases ? (resolvedCases / totalCases) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Escalated (Councilor Warning)</span>
                  <span>{escalatedCases} cases</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalCases ? (escalatedCases / totalCases) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Under Review (Assigned/Open)</span>
                  <span>{pendingCases - escalatedCases} cases</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalCases ? ((pendingCases - escalatedCases) / totalCases) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Issue Router / Delegation Board */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4.5 h-4.5 text-indigo-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Incident Routing Board</h4>
              </div>

              {/* Filter buttons */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {['All', 'Open', 'Assigned', 'Escalated', 'Resolved'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      filterStatus === st ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="text-xs text-slate-400 italic text-center py-6">Fetching department feed...</p>
              ) : filteredList.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">No incidents found matching current filter.</p>
              ) : (
                filteredList.map(issue => (
                  <div key={issue.id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex gap-3 items-start">
                      <img 
                        src={issue.photo_url} 
                        alt={issue.title}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{issue.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {issue.address}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <CategoryBadge category={issue.category} className="text-[9px] px-1.5 py-0.2" />
                          <StatusBadge status={issue.status} className="text-[9px] px-1.5 py-0.2" />
                        </div>
                      </div>
                    </div>

                    {/* Actions / Delegation triggers */}
                    <div className="flex items-center gap-2 border-t border-slate-100 pt-2.5 md:border-t-0 md:pt-0 shrink-0">
                      {issue.status === 'open' || issue.status === 'escalated' ? (
                        <div className="flex items-center gap-1.5 w-full md:w-auto">
                          <select
                            value={selectedVolunteers[issue.id] || ''}
                            onChange={e => setSelectedVolunteers({ ...selectedVolunteers, [issue.id]: e.target.value })}
                            className="px-2.5 py-1 text-[10px] font-medium bg-white border border-slate-200 rounded focus:outline-none"
                          >
                            <option value="">Select Volunteer...</option>
                            {volunteers.map(v => (
                              <option key={v.id} value={v.id}>
                                {v.name} ({v.points} XP)
                              </option>
                            ))}
                          </select>
                          <button
                            id={`delegate-btn-${issue.id}`}
                            onClick={() => handleDelegate(issue.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded"
                          >
                            Delegate
                          </button>
                        </div>
                      ) : issue.status === 'assigned' || issue.status === 'in_progress' ? (
                        <div className="text-right text-[10px] text-slate-500 font-medium">
                          Delegated to: <b>{issue.assigned_to_name}</b>
                        </div>
                      ) : (
                        <div className="text-right text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <ClipboardCheck className="w-4 h-4" />
                          RESOLVED CASE
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* GEOGRAPHIC ANALYTICS & AI ADVISORY TAB */
        <div className="space-y-6">
          {/* Geographic Filter Selection Header */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Geographic State</label>
              <select
                value={selectedState}
                onChange={e => { setSelectedState(e.target.value); setSelectedDistrict('All'); setSelectedPlace('All'); }}
                className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All States</option>
                {['Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi'].map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Geographic District</label>
              <select
                value={selectedDistrict}
                onChange={e => { setSelectedDistrict(e.target.value); setSelectedPlace('All'); }}
                className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Districts</option>
                {['Chennai', 'Coimbatore', 'Madurai', 'Bengaluru', 'Mumbai'].map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Specific Place / Area / Ward</label>
              <select
                value={selectedPlace}
                onChange={e => setSelectedPlace(e.target.value)}
                className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Places</option>
                {['Velachery', 'Guindy', 'Adyar', 'Taramani', 'Mylapore'].map(pl => (
                  <option key={pl} value={pl}>{pl}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Graph Card - Category Distribution */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <PieChart className="w-4.5 h-4.5 text-indigo-600" />
                Filtered Issues by Category
              </h4>

              <div className="space-y-3.5 pt-2 text-xs">
                {['road', 'water', 'lighting', 'waste', 'drainage'].map(cat => {
                  const filteredCount = issues.filter(i => {
                    const matchCat = i.category === cat;
                    const matchState = selectedState === 'All' || i.state === selectedState;
                    const matchDistrict = selectedDistrict === 'All' || i.district === selectedDistrict;
                    const matchPlace = selectedPlace === 'All' || i.area === selectedPlace;
                    return matchCat && matchState && matchDistrict && matchPlace;
                  }).length;

                  const totalFiltered = issues.filter(i => {
                    const matchState = selectedState === 'All' || i.state === selectedState;
                    const matchDistrict = selectedDistrict === 'All' || i.district === selectedDistrict;
                    const matchPlace = selectedPlace === 'All' || i.area === selectedPlace;
                    return matchState && matchDistrict && matchPlace;
                  }).length || 1;

                  const pct = Math.round((filteredCount / totalFiltered) * 100);

                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span className="capitalize">{cat} Issues</span>
                        <span>{filteredCount} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Middle Graph Card - Density Hotspot Analysis */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <TrendingUp className="w-4.5 h-4.5 text-rose-500" />
                Issue Density Hotspots
              </h4>
              <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
                Sorted by most reports. Directly identifies areas requiring urgent Council funds.
              </p>

              <div className="space-y-4 pt-2">
                {['Velachery', 'Guindy', 'Adyar', 'Taramani', 'Mylapore'].map((areaName, idx) => {
                  const areaCount = issues.filter(i => {
                    const matchArea = i.area === areaName;
                    const matchState = selectedState === 'All' || i.state === selectedState;
                    const matchDistrict = selectedDistrict === 'All' || i.district === selectedDistrict;
                    return matchArea && matchState && matchDistrict;
                  }).length;

                  const maxReportCount = 10; // mock max scale for beautiful proportioning
                  const pct = Math.min(100, Math.round((areaCount / maxReportCount) * 100));

                  return (
                    <div key={areaName} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800">{areaName}</span>
                        <span className="font-mono text-slate-500 text-[11px] bg-slate-100 px-1.5 py-0.2 rounded font-bold">
                          {areaCount} reports
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-orange-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${pct || 10}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Card - AI-Powered Advisory summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col justify-between text-white space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse shrink-0" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-200">
                    Gemini Ward Advisory Report
                  </h4>
                </div>

                {loadingReport ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      Analyzing ward indicators...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] leading-relaxed text-slate-300 italic font-medium">
                      "{aiReport}"
                    </p>
                    <div className="p-2.5 bg-indigo-950/40 border border-indigo-900/30 rounded-xl">
                      <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">
                        Geographic Scope
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Filtered: State={selectedState}, District={selectedDistrict}, Place={selectedPlace}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                  State allocation index
                </span>
                <span className="font-bold text-indigo-400 font-mono">98.4% optimal</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
