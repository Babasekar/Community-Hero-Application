/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { adminService, PendingResolutionResponse } from '../../services/adminService';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { 
  UserCheck, ShieldAlert, Sparkles, Check, X, ClipboardCheck, 
  RefreshCw, TrendingUp, HelpCircle, FileText, AlertTriangle, MapPin, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const locationsData: Record<string, Record<string, string[]>> = {
  "Tamil Nadu": {
    "Chennai": ["Adyar", "Velachery", "Mylapore", "Nungambakkam"],
    "Coimbatore": ["Gandhipuram", "Peelamedu", "Singanallur"],
    "Madurai": ["Tallakulam", "K.Pudur", "Simmakkal"]
  },
  "Karnataka": {
    "Bengaluru": ["Indiranagar", "Koramangala", "Jayanagar", "Whitefield"],
    "Mysuru": ["Gokulam", "Vidyaranyapuram", "Jayalakshmipuram"]
  },
  "Maharashtra": {
    "Mumbai": ["Andheri", "Bandra", "Colaba", "Dadar"],
    "Pune": ["Kothrud", "Kalyani Nagar", "Hinjawadi"]
  }
};

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [govList, setGovList] = useState<User[]>([]);
  const [resolutions, setResolutions] = useState<PendingResolutionResponse[]>([]);
  const [loadingGov, setLoadingGov] = useState(true);
  const [loadingRes, setLoadingRes] = useState(true);

  // Filter & Location States
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [selectedCity, setSelectedCity] = useState('All');

  // AI advisory report state
  const [report, setReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Set default state lock based on logged-in Admin's assigned state
  useEffect(() => {
    if (user?.state) {
      setSelectedState(user.state);
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoadingGov(true);
    setLoadingRes(true);
    try {
      const pendingGov = await adminService.getPendingGovOfficials();
      setGovList(pendingGov);

      const pendingRes = await adminService.getPendingResolutions();
      setResolutions(pendingRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGov(false);
      setLoadingRes(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleGovAction = async (userId: string, approved: boolean) => {
    try {
      await adminService.verifyGovOfficial(userId, approved);
      fetchAdminData();
    } catch (e) {
      alert('Action failed');
    }
  };

  const handleResolutionAction = async (resId: string, approved: boolean) => {
    try {
      await adminService.verifyResolution(resId, approved);
      fetchAdminData();
    } catch (e) {
      alert('Action failed');
    }
  };

  const handleGenerateAdvisory = async () => {
    setLoadingReport(true);
    setReport(null);
    try {
      const res = await aiService.getAdvisoryReport(selectedState, selectedCity);
      setReport(res.report);
    } catch (e) {
      console.error(e);
      setReport('Fail to generate report from Gemini API. Please make sure GEMINI_API_KEY is configured in Secrets.');
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div id="admin-dashboard-root" className="space-y-6 font-sans text-slate-900 bg-white">
      
      {/* Title & Scope badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600 animate-pulse" />
            CHIEF STATE ADMINISTRATOR CONSOLE
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Audit local government registrations, verify physical resolutions, and model dynamic municipal allocation recommendations</p>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-100/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start md:self-auto">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
            Jurisdiction: {user?.state ? `${user.state} (Locked)` : 'Universal Scope'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: AI advisory report + dynamic filters */}
        <div className="space-y-6">
          
          {/* AI Funding Advisory Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Gemini Fund Advisory Panel</h3>
            </div>

            {/* Dynamic Dropdown Location Filters */}
            <div className="space-y-3 p-3 bg-white border border-slate-200/80 rounded-xl">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase">State</label>
                <select
                  disabled={!!user?.state}
                  value={selectedState}
                  onChange={e => {
                    setSelectedState(e.target.value);
                    setSelectedCity('All');
                  }}
                  className="w-full mt-1 bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {Object.keys(locationsData).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase">City / District</label>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Cities</option>
                  {Object.keys(locationsData[selectedState] || {}).map(dt => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Simulated Live Google Maps Visualizer Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Live Google Maps Grounding
                </span>
                <span className="text-[8px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {selectedCity === 'All' ? 'State Scope' : selectedCity} Map
                </span>
              </div>
              
              {/* Google Maps Visual Canvas */}
              <div className="h-36 bg-slate-100 border border-slate-200 rounded-lg relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="text-center z-10 px-3">
                  <Globe className="w-8 h-8 text-slate-400 mx-auto mb-1.5 animate-spin" style={{ animationDuration: '20s' }} />
                  <p className="text-[10px] text-slate-700 font-bold">{selectedCity === 'All' ? `Map of ${selectedState}` : `${selectedCity}, ${selectedState}`}</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Fetching location coordinates &amp; geo-tag issues...</p>
                </div>

                {/* Simulated Pins */}
                <div className="absolute top-1/3 left-1/4 flex flex-col items-center">
                  <MapPin className="w-4 h-4 text-indigo-600 animate-bounce" />
                  <span className="text-[7px] bg-slate-900 text-white px-1 rounded-full scale-75 font-bold">Road</span>
                </div>
                <div className="absolute bottom-1/4 right-1/3 flex flex-col items-center">
                  <MapPin className="w-4 h-4 text-emerald-600 animate-bounce" style={{ animationDelay: '0.5s' }} />
                  <span className="text-[7px] bg-slate-900 text-white px-1 rounded-full scale-75 font-bold">Water</span>
                </div>
              </div>
            </div>

            <button
              id="generate-advisory-btn"
              onClick={handleGenerateAdvisory}
              disabled={loadingReport}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              {loadingReport ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Auditing Location Ledgers...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4.5 h-4.5" />
                  Generate {selectedCity === 'All' ? 'State' : 'City'} Advisory Report
                </>
              )}
            </button>

            {/* Display generated advisory report details */}
            <AnimatePresence>
              {report && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-2 mt-3 overflow-hidden"
                >
                  <p className="text-[10px] text-indigo-700 font-bold uppercase flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    GEMINI {selectedCity === 'All' ? 'STATE-LEVEL' : 'CITY-LEVEL'} REPORT
                  </p>
                  <div className="text-[11px] text-slate-700 leading-relaxed max-h-56 overflow-y-auto pr-1">
                    {report}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pending Government Registrations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Gov Profile Verifications ({govList.length})</h3>
            </div>

            <div className="space-y-3">
              {loadingGov ? (
                <p className="text-xs text-slate-400 italic text-center py-4">Checking profile ledgers...</p>
              ) : govList.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl">
                  No pending government profiles under review.
                </p>
              ) : (
                govList.map(g => (
                  <div key={g.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">{g.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{g.email}</p>
                        <span className="inline-block mt-1 text-[8px] bg-indigo-50 border border-indigo-100/50 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold uppercase">
                          {g.state} &gt; {g.district}
                        </span>
                      </div>
                      {g.avatar_url && (
                        <img src={g.avatar_url} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      )}
                    </div>
                    
                    <div className="p-2.5 bg-white rounded-lg border border-slate-150 text-[10px] space-y-1 text-slate-600 font-medium">
                      <p>Department: <span className="font-bold text-slate-800">{g.department}</span></p>
                      <p>Designation: <span className="font-bold text-slate-800">{g.designation}</span></p>
                      <p>Employee ID: <span className="font-bold text-slate-800">{g.employee_id}</span></p>
                      <p>Ward Assigned: <span className="font-bold text-slate-800">{g.ward_number}</span></p>
                    </div>

                    {g.id_proof_url && (
                      <div className="p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                        <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Official ID Proof Submitted
                        </span>
                        <div className="mt-1.5 border border-slate-200 rounded overflow-hidden max-h-24">
                          <img src={g.id_proof_url} alt="ID Proof" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2.5 pt-1">
                      <button
                        id={`gov-approve-${g.id}`}
                        onClick={() => handleGovAction(g.id, true)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve Profile
                      </button>
                      <button
                        id={`gov-decline-${g.id}`}
                        onClick={() => handleGovAction(g.id, false)}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Pending resolution verifications */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">On-Ground Resolutions Audit Ledger ({resolutions.length})</h3>
          </div>

          <div className="space-y-4">
            {loadingRes ? (
              <p className="text-xs text-slate-400 italic text-center py-6">Checking resolution ledgers...</p>
            ) : resolutions.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                All submitted volunteer resolutions have been verified and settled!
              </p>
            ) : (
              resolutions.map(res => (
                <div key={res.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/40 space-y-4 animate-fade-in">
                  
                  {/* Before vs After Visual Comparison */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">BEFORE (CITIZEN REPORT)</span>
                      <div className="h-44 bg-slate-900 rounded-lg overflow-hidden border border-slate-200">
                        <img src={res.issue_before_photo} alt="Before" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">AFTER (VOLUNTEER RESTORATION)</span>
                      <div className="h-44 bg-slate-900 rounded-lg overflow-hidden border border-slate-200">
                        <img src={res.photo_url} alt="After" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  {/* Metadata Audit ledger details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 truncate">Task ID: {res.issue_title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Resolver: {res.resolver_name}</p>
                      <p className="text-[11px] text-slate-600 font-medium">Notes: "{res.notes}"</p>
                      <span className="inline-block text-[8px] bg-slate-200 border border-slate-300 text-slate-700 px-2 py-0.5 rounded-full font-bold uppercase">
                        State: {res.issue_state || 'N/A'}
                      </span>
                    </div>

                    <div className="bg-white p-3 border border-slate-200 rounded-xl space-y-1.5 font-medium text-slate-600 text-[10px]">
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                        <span>GPS Coordinates match:</span>
                        <span className={`font-bold ${res.geo_passed ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {res.geo_passed ? 'PASSED' : 'OUT OF BOUNDS'} ({res.distance_m.toFixed(1)}m delta)
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                        <span>Compass bearing delta:</span>
                        <span className="font-bold text-slate-800">{res.bearing_delta.toFixed(1)}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-600 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Gemini Visual Match:
                        </span>
                        <span className="font-bold text-indigo-700">{(res.ai_confidence * 100).toFixed(0)}% Confidence</span>
                      </div>
                      <p className="text-[9px] text-slate-400 italic leading-relaxed mt-1 border-t border-slate-50 pt-1">
                        "{res.ai_reason}"
                      </p>
                    </div>
                  </div>

                  {/* Admin Settlement buttons */}
                  <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      id={`verify-approve-${res.id}`}
                      onClick={() => handleResolutionAction(res.id, true)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Approve Payout & Award +30 XP
                    </button>
                    <button
                      id={`verify-decline-${res.id}`}
                      onClick={() => handleResolutionAction(res.id, false)}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Reject Verification
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
