/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../../services/leaderboardService';
import { User } from '../../types';
import { Trophy, Star, Medal, ArrowUp, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

export const LeaderboardView: React.FC = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<'citizen' | 'volunteer'>('citizen');
  const [scope, setScope] = useState<'all' | 'state' | 'place'>('place');
  const [selectedState, setSelectedState] = useState(user?.state || 'Tamil Nadu');
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const userState = user?.state || 'Tamil Nadu';
  const userPlace = user?.place || 'Velachery';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const fetchState = scope === 'state' ? selectedState : scope === 'place' ? userState : undefined;
        const fetchPlace = scope === 'place' ? userPlace : undefined;
        const users = await leaderboardService.getLeaderboard(role, scope, fetchState, fetchPlace);
        setList(users);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [role, scope, selectedState, userState, userPlace]);

  return (
    <div id="leaderboard-root" className="max-w-3xl mx-auto space-y-6">
      {/* Title block */}
      <div className="text-center space-y-1">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500 fill-amber-100" />
          Hyperlocal Civic Leaderboard
        </h2>
        <p className="text-xs text-slate-400">Citizens and Volunteers ranked by active hyperlocal resolution contributions</p>
      </div>

      {/* Scope Selector Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 flex flex-col gap-4 max-w-3xl mx-auto shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
              <Medal className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Select Competition Scope</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {scope === 'place' && `Viewing active leaders in ${userPlace}, ${userState} (My Place)`}
                {scope === 'state' && `Viewing active leaders in the state of ${selectedState}`}
                {scope === 'all' && "Viewing active leaders in All Over India"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              id="scope-selector"
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              className="px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none focus:border-indigo-500 shadow-sm transition-all cursor-pointer"
            >
              <option value="place">🏘️ My Place ({userPlace})</option>
              <option value="state">📍 State Wise</option>
              <option value="all">All Over India</option>
            </select>
          </div>
        </div>

        {/* Dynamic Secondary State Selector for State Wise Scope */}
        {scope === 'state' && (
          <div className="pt-3 border-t border-slate-200/60 animate-fade-in">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-500" /> Choose State
            </label>
            <select
              id="state-filter-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer transition-all"
            >
              {INDIAN_STATES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 max-w-sm mx-auto">
        <button
          id="lead-toggle-citizen"
          onClick={() => setRole('citizen')}
          className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
            role === 'citizen' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Citizen Watchers
        </button>
        <button
          id="lead-toggle-volunteer"
          onClick={() => setRole('volunteer')}
          className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
            role === 'volunteer' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Volunteer Heroes
        </button>
      </div>

      {/* Leaderboard list container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            Fetching hero rankings...
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs italic">
            No active heroes registered in this ward yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {list.map((u, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const trophies = ['🏆', '🥈', '🥉'];
              
              return (
                <div 
                  key={u.id} 
                  className={`p-4 flex items-center justify-between transition-colors hover:bg-slate-50/50 ${
                    rank === 1 ? 'bg-amber-50/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Index */}
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                      {isTop3 ? (
                        <span className="text-lg">{trophies[idx]}</span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-400">#{rank}</span>
                      )}
                    </div>

                    {/* Avatar Initials */}
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                      {u.name.charAt(0)}
                    </div>

                    {/* User profile details */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {u.name}
                        {rank === 1 && (
                          <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            WARD LEADER
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>Level {Math.floor(u.points / 200) + 1}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-black text-indigo-600">{u.points} XP</p>
                      <p className="text-[9px] text-slate-400 font-medium">Total Points</p>
                    </div>
                    <div className="p-1 bg-slate-50 text-emerald-500 rounded border border-slate-100 shrink-0">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
