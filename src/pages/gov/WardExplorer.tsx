/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { issueService } from '../../services/issueService';
import { Issue } from '../../types';
import { MapPin, Compass, Shield, Activity, RefreshCw } from 'lucide-react';
import { CategoryBadge } from '../../components/issue/CategoryBadge';
import { StatusBadge } from '../../components/issue/StatusBadge';

export const WardExplorer: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState<Issue | null>(null);

  const fetchPins = async () => {
    setLoading(true);
    try {
      const all = await issueService.getIssues();
      setIssues(all);
      if (all.length > 0) {
        setSelectedPin(all[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  return (
    <div id="ward-explorer-root" className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center justify-center gap-2">
          <Compass className="w-5 h-5 text-indigo-600" />
          MUNICIPAL GEOSPATIAL WARD EXPLORER
        </h2>
        <p className="text-xs text-slate-400">Hyperlocal geodetic mapping of community reports, potholes, leaks, and municipal blockages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Geographic Hotspots Board */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col justify-between h-[500px] overflow-hidden relative">
          
          {/* Custom Visual Map Representation */}
          <div className="absolute inset-0 bg-slate-100 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] z-0 flex items-center justify-center">
            {loading ? (
              <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
            ) : (
              issues.map((issue, idx) => {
                // Map Latitude & Longitude to pixel percentages inside Chennai bounds (e.g. 12.95 to 13.05)
                const latMin = 12.92;
                const latMax = 13.08;
                const lngMin = 80.18;
                const lngMax = 80.32;

                const topPercent = 100 - ((issue.lat - latMin) / (latMax - latMin)) * 100;
                const leftPercent = ((issue.lng - lngMin) / (lngMax - lngMin)) * 100;

                const isSelected = selectedPin?.id === issue.id;

                return (
                  <button
                    key={issue.id}
                    id={`map-pin-${issue.id}`}
                    onClick={() => setSelectedDrivePin(issue)}
                    className="absolute z-10 transition-all focus:outline-none"
                    style={{ 
                      top: `${Math.max(10, Math.min(90, topPercent))}%`, 
                      left: `${Math.max(10, Math.min(90, leftPercent))}%` 
                    }}
                  >
                    <div className="relative group">
                      <MapPin className={`w-6 h-6 ${
                        isSelected 
                          ? 'text-indigo-600 scale-125 filter drop-shadow-[0_4px_6px_rgba(79,70,229,0.4)]' 
                          : issue.status === 'resolved' 
                            ? 'text-emerald-500' 
                            : issue.status === 'escalated'
                              ? 'text-rose-500 animate-bounce'
                              : 'text-indigo-400 hover:text-indigo-600'
                      }`} />
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-6 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow">
                        {issue.title}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Compass Rose UI accent */}
          <div className="absolute top-4 right-4 bg-white/80 border border-slate-200 rounded-xl p-2 backdrop-blur z-20 flex flex-col items-center gap-1">
            <Compass className="w-5 h-5 text-slate-500 animate-pulse" />
            <span className="text-[8px] font-bold text-slate-400">NORTH</span>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white/80 border border-slate-200 rounded-xl p-2.5 backdrop-blur z-20 flex gap-4 text-[9px] font-bold text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Open</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Escalated</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Resolved</span>
            </div>
          </div>
        </div>

        {/* Selected hotspot inspect card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4 h-[500px] flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Geodetic Inspect</h3>
            </div>

            {selectedPin ? (
              <div className="space-y-4 pt-2">
                <div className="h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-950">
                  <img src={selectedPin.photo_url} alt={selectedPin.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{selectedPin.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">{selectedPin.description}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-400">Lat Alignment:</span>
                    <span className="font-bold text-slate-800">{selectedPin.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-400">Lng Alignment:</span>
                    <span className="font-bold text-slate-800">{selectedPin.lng.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-400">Bearing:</span>
                    <span className="font-bold text-slate-800">{selectedPin.bearing}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ward:</span>
                    <span className="font-bold text-slate-800">{selectedPin.ward}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <CategoryBadge category={selectedPin.category} className="text-[9px] px-2 py-0.5" />
                  <StatusBadge status={selectedPin.status} className="text-[9px] px-2 py-0.5" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-12">Click any map pins to inspect geodetic parameters.</p>
            )}
          </div>
          <p className="text-[9px] text-slate-400 text-center italic mt-4">
            Hotspots are derived using the Haversine formula delta against ward centroids.
          </p>
        </div>
      </div>
    </div>
  );

  function setSelectedDrivePin(issue: Issue) {
    setSelectedPin(issue);
  }
};
