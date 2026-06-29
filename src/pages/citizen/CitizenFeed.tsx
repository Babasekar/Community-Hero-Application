/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { issueService } from '../../services/issueService';
import { Issue, IssueTimelineEvent } from '../../types';
import { CategoryBadge } from '../../components/issue/CategoryBadge';
import { StatusBadge } from '../../components/issue/StatusBadge';
import { 
  Search, SlidersHorizontal, ThumbsUp, MapPin, Calendar, Clock, AlertTriangle, 
  X, Compass, Eye, ShieldAlert, Award, FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { RenderIssueMedia } from '../../components/common/Logo';

export const CitizenFeed: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [timeline, setTimeline] = useState<IssueTimelineEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [stats, setStats] = useState({ totalResolved: 2400, totalVolunteers: 180, totalWards: 12 });
  const [myUpvotes, setMyUpvotes] = useState<string[]>([]);

  const fetchMyUpvotes = async () => {
    try {
      const upvotes = await issueService.getMyUpvotes();
      setMyUpvotes(upvotes);
    } catch (e) {
      console.error('Error fetching my upvotes', e);
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await issueService.getIssues({
        category: category !== 'All' ? category : undefined,
        status: status !== 'All' ? status : undefined,
        sort: sortBy
      });
      setIssues(data);
    } catch (e) {
      console.error('Error fetching issues', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [category, status, sortBy]);

  useEffect(() => {
    fetchStats();
    fetchMyUpvotes();
  }, []);

  const handleUpvote = async (issueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const isAlreadyUpvoted = myUpvotes.includes(issueId);

    // Optimistically update the UI states immediately for a fast, zero-flicker experience
    setMyUpvotes(prev =>
      isAlreadyUpvoted ? prev.filter(id => id !== issueId) : [...prev, issueId]
    );

    setIssues(prevIssues =>
      prevIssues.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            upvote_count: isAlreadyUpvoted ? Math.max(0, issue.upvote_count - 1) : issue.upvote_count + 1
          };
        }
        return issue;
      })
    );

    try {
      const response = await issueService.upvoteIssue(issueId);
      // Synchronize state with backend response
      if (response && typeof response.upvoted !== 'undefined') {
        setMyUpvotes(prev => {
          const has = prev.includes(issueId);
          if (response.upvoted && !has) return [...prev, issueId];
          if (!response.upvoted && has) return prev.filter(id => id !== issueId);
          return prev;
        });
      }
      refreshUser();
    } catch (err: any) {
      // Revert states on failure
      setMyUpvotes(prev =>
        isAlreadyUpvoted ? [...prev, issueId] : prev.filter(id => id !== issueId)
      );
      setIssues(prevIssues =>
        prevIssues.map(issue => {
          if (issue.id === issueId) {
            return {
              ...issue,
              upvote_count: isAlreadyUpvoted ? issue.upvote_count + 1 : Math.max(0, issue.upvote_count - 1)
            };
          }
          return issue;
        })
      );
      console.error('Upvote toggle failed:', err);
    }
  };

  const handleEscalate = async (issueId: string) => {
    try {
      await issueService.escalateIssue(issueId);
      fetchIssues();
      if (selectedIssue && selectedIssue.id === issueId) {
        handleViewDetails(selectedIssue);
      }
    } catch (err: any) {
      alert(err.message || 'Escalation failed');
    }
  };

  const handleViewDetails = async (issue: Issue) => {
    setSelectedIssue(issue);
    setLoadingTimeline(true);
    try {
      const details = await issueService.getIssueDetail(issue.id);
      setTimeline(details.timeline);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const filteredIssues = issues.filter(issue => 
    issue.title.toLowerCase().includes(search.toLowerCase()) || 
    issue.address.toLowerCase().includes(search.toLowerCase()) ||
    issue.ward.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="feed-root" className="space-y-6">
      {/* Dynamic Local Stats Widget bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RESOLVED CASES</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{stats.totalResolved}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ACTIVE HEROES</p>
          <p className="text-xl font-black text-indigo-600 mt-1">{stats.totalVolunteers}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ACTIVE WARDS</p>
          <p className="text-xl font-black text-amber-600 mt-1">{stats.totalWards}</p>
        </div>
      </div>

      {/* SEARCH AND FILTERS PANEL */}
      <div id="filter-section" className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reports by description, address, or ward..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option>Latest</option>
            <option>Most Upvoted</option>
            <option>Critical first</option>
          </select>
        </div>

        {/* Desktop Filters (pill buttons) */}
        <div className="hidden md:block space-y-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Category:</span>
            {['All', 'road', 'water', 'lighting', 'waste', 'drainage', 'other'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  category === cat 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat === 'other' ? 'other issues' : cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-4">Status:</span>
            {['All', 'open', 'assigned', 'in_progress', 'escalated', 'resolved'].map(st => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  status === st 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filters (dropdowns aligned with design color) */}
        <div className="md:hidden grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Category Filter</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold capitalize focus:outline-none focus:border-indigo-500 shadow-sm"
            >
              {['All', 'road', 'water', 'lighting', 'waste', 'drainage', 'other'].map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat === 'other' ? 'Other Issues' : cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Status Filter</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold capitalize focus:outline-none focus:border-indigo-500 shadow-sm"
            >
              {['All', 'open', 'assigned', 'in_progress', 'escalated', 'resolved'].map(st => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FEED RESULTS */}
      <div id="results-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs font-medium">
            Fetching active reports...
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
            No active civic reports found matching filters.
          </div>
        ) : (
          filteredIssues.map(issue => {
            const isOverdue = new Date() > new Date(issue.deadline) && issue.status !== 'resolved';
            return (
              <motion.div
                key={issue.id}
                id={`issue-card-${issue.id}`}
                layoutId={`card-${issue.id}`}
                onClick={() => handleViewDetails(issue)}
                className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <RenderIssueMedia 
                      url={issue.photo_url} 
                      className="w-full h-full object-cover animate-fade-in"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                      <CategoryBadge category={issue.category} />
                      <StatusBadge status={issue.status} />
                    </div>
                    {isOverdue && (
                      <div className="absolute bottom-2 right-2 bg-rose-500 text-white font-bold text-[9px] px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        OVERDUE BY {Math.ceil((Date.now() - new Date(issue.deadline).getTime()) / (1000 * 60 * 60 * 24))} DAYS
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{issue.title}</h3>
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-bold border border-amber-100 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        Severity {issue.severity}/5
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{issue.description}</p>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1.5 border-t border-slate-50">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{issue.address}</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      id={`upvote-btn-${issue.id}`}
                      type="button"
                      onClick={(e) => handleUpvote(issue.id, e)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                        myUpvotes.includes(issue.id)
                          ? 'text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100'
                          : 'text-slate-500 border border-transparent hover:text-indigo-600 hover:bg-slate-100'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 transition-all ${myUpvotes.includes(issue.id) ? 'fill-indigo-600 text-indigo-600' : 'text-slate-400'}`} />
                      <span>{issue.upvote_count} Upvotes</span>
                    </button>
                    {issue.duplicate_count > 0 && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 font-semibold px-2 py-0.5 rounded">
                        {issue.duplicate_count} Duplicates
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    Reported {new Date(issue.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL DRAWER */}
      <AnimatePresence>
        {selectedIssue && (
          <>
            <div id="modal-overlay" className="fixed inset-0 bg-black/60 z-40" onClick={() => setSelectedIssue(null)} />
            <motion.div
              id="detail-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 max-w-2xl w-full bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-slate-800 truncate max-w-[400px]">
                    {selectedIssue.title}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {selectedIssue.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Contents */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Photo details */}
                  <div className="h-48 md:h-60 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200">
                    <RenderIssueMedia 
                      url={selectedIssue.photo_url} 
                      className="w-full h-full object-cover animate-fade-in"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                      Before Proof Photo
                    </span>
                  </div>

                  {/* Visual Compass metadata details */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                      <Compass className="w-4 h-4 text-indigo-500" />
                      Visual Compass Alignment
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-2 border border-slate-100 rounded">
                        <p className="text-[10px] text-slate-400">Capture Latitude</p>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedIssue.lat.toFixed(5)}</p>
                      </div>
                      <div className="bg-white p-2 border border-slate-100 rounded">
                        <p className="text-[10px] text-slate-400">Capture Longitude</p>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedIssue.lng.toFixed(5)}</p>
                      </div>
                      <div className="bg-white p-2 border border-slate-100 rounded">
                        <p className="text-[10px] text-slate-400">Compass Bearing</p>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedIssue.bearing}° (W)</p>
                      </div>
                      <div className="bg-white p-2 border border-slate-100 rounded">
                        <p className="text-[10px] text-slate-400">Escalation Deadline</p>
                        <p className="font-bold text-rose-600 mt-0.5">
                          {new Date(selectedIssue.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {selectedIssue.status === 'open' && (
                      <button
                        id="modal-escalate-btn"
                        onClick={() => handleEscalate(selectedIssue.id)}
                        className="w-full mt-2 bg-rose-50 border border-rose-200 text-rose-700 font-bold py-1.5 rounded text-xs hover:bg-rose-100 flex items-center justify-center gap-1.5"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Manually Escalate to Ward Councilor
                      </button>
                    )}
                  </div>
                </div>

                {/* Description & Address */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Case Summary</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedIssue.description}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Location reported: <b>{selectedIssue.address} (Ward: {selectedIssue.ward})</b></span>
                  </p>
                </div>

                {/* Interactive Timeline progress tracking */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Issue Lifecycle Progress</h4>
                  {loadingTimeline ? (
                    <div className="py-4 text-center text-xs text-slate-400">Loading timeline tracker...</div>
                  ) : (
                    <div className="relative pl-4 border-l border-slate-200 space-y-4">
                      {timeline.map((event, idx) => {
                        const isLatest = idx === timeline.length - 1;
                        return (
                          <div key={event.id} className="relative">
                            <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              isLatest ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-slate-400'
                            }`} />
                            <div className="pl-3">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-800 capitalize">
                                  {event.event_type.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(event.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{event.notes}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Actor: {event.actor_name}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
