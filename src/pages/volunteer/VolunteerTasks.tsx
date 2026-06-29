/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { issueService } from '../../services/issueService';
import { aiService } from '../../services/aiService';
import { Issue, Resolution } from '../../types';
import { CategoryBadge } from '../../components/issue/CategoryBadge';
import { StatusBadge } from '../../components/issue/StatusBadge';
import { 
  ClipboardList, CheckCircle, Navigation, Compass, MapPin, UploadCloud, 
  Sparkles, Camera, X, AlertTriangle, ShieldCheck, CheckSquare, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { RenderIssueMedia } from '../../components/common/Logo';

export const VolunteerTasks: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Issue | null>(null);
  
  // Proof Submission States
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [gpsLat, setGpsLat] = useState(13.0018); // default mock Chennai
  const [gpsLng, setGpsLng] = useState(80.2443);
  const [bearing, setBearing] = useState(185);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [aiReport, setAiReport] = useState<Resolution | null>(null);

  // Live GPS geolocation coordinate and device orientation heading degree trace
  useEffect(() => {
    if (!photo) return;

    let watchId: number | null = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setGpsLat(position.coords.latitude);
          setGpsLng(position.coords.longitude);
        },
        (error) => {
          console.warn('Volunteer GPS tracing denied or failed:', error);
        },
        { enableHighAccuracy: true }
      );
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const heading = (event as any).webkitCompassHeading || (360 - (event.alpha || 0));
      if (heading !== undefined && heading !== null && !isNaN(heading)) {
        setBearing(Math.round(heading));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [photo]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const all = await issueService.getIssues();
      setTasks(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleClaim = async (task: Issue) => {
    try {
      await issueService.assignIssue(task.id, user?.id);
      fetchTasks();
    } catch (e) {
      alert('Unable to claim this civic task');
    }
  };

  const handleMarkProgress = async (task: Issue) => {
    try {
      await issueService.updateIssueStatus(task.id, 'in_progress', 'Volunteer has started on-ground diagnostics');
      fetchTasks();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        // Pre-fill mock coordinates close to target
        if (selectedTask) {
          setGpsLat(selectedTask.lat + (Math.random() - 0.5) * 0.0001); // very close
          setGpsLng(selectedTask.lng + (Math.random() - 0.5) * 0.0001);
          setBearing(selectedTask.bearing + Math.floor((Math.random() - 0.5) * 10)); // matched bearing
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !photo) return;

    setSubmittingProof(true);
    setAiReport(null);

    try {
      const res = await aiService.submitResolutionProof(selectedTask.id, {
        photo_url: photo,
        notes,
        resolver_lat: gpsLat,
        resolver_lng: gpsLng,
        resolver_bearing: bearing
      });

      if (res.success) {
        setAiReport(res.resolution);
        fetchTasks();
        refreshUser();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Proof submission failed');
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setPhoto(null);
    setNotes('');
    setAiReport(null);
  };

  if (!user) return null;

  // Split tasks into unclaimed/open tasks versus claimed/in-progress by current user
  const openTasks = tasks.filter(t => t.status === 'open' || t.status === 'escalated');
  const myClaimedTasks = tasks.filter(t => 
    (t.status === 'assigned' || t.status === 'in_progress') && t.assigned_to === user.id
  );

  return (
    <div id="volunteer-tasks-root" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: My Active Claims */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">My Claimed Tasks ({myClaimedTasks.length})</h3>
          </div>

          <div className="space-y-3">
            {myClaimedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                You have no active claimed tasks. Pick one from the boards!
              </p>
            ) : (
              myClaimedTasks.map(task => (
                <div key={task.id} className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-2.5">
                  <div className="flex gap-2.5">
                    <div className="w-12 h-12 shrink-0">
                      <RenderIssueMedia 
                        url={task.photo_url} 
                        className="w-full h-full object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{task.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{task.address}</p>
                      <span className="text-[9px] font-medium bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded mt-1 inline-block capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    {task.status === 'assigned' ? (
                      <button
                        id={`mark-progress-${task.id}`}
                        onClick={() => handleMarkProgress(task)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded text-[10px]"
                      >
                        Mark In Progress
                      </button>
                    ) : (
                      <button
                        id={`submit-proof-${task.id}`}
                        onClick={() => setSelectedTask(task)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded text-[10px] flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolve & Submit Proof
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Available Open Tasks Board */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Unclaimed Civic Task Boards ({openTasks.length})</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {loading ? (
              <p className="text-xs text-slate-400 italic text-center py-6 col-span-2">Loading open tasks board...</p>
            ) : openTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6 col-span-2">
                All reported civic tasks are claimed or resolved! Great job!
              </p>
            ) : (
              openTasks.map(task => (
                <div key={task.id} className="border border-slate-100 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-36 relative bg-slate-900 rounded-lg overflow-hidden border border-slate-200">
                      <RenderIssueMedia url={task.photo_url} className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                        <CategoryBadge category={task.category} className="text-[9px] px-1.5 py-0.5" />
                        <StatusBadge status={task.status} className="text-[9px] px-1.5 py-0.5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{task.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{task.description}</p>
                      <p className="text-[9px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        {task.address}
                      </p>
                    </div>
                  </div>

                  <button
                    id={`claim-btn-${task.id}`}
                    onClick={() => handleClaim(task)}
                    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded text-[10px]"
                  >
                    Claim Task
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RESOLUTION PROOF MODAL DIALOG */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <div id="proof-overlay" className="fixed inset-0 bg-black/60 z-40" onClick={handleCloseModal} />
            <motion.div
              id="proof-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 max-w-2xl w-full bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Submit Resolution Proof Ledger</h3>
                  <p className="text-[10px] text-slate-400">Task: {selectedTask.title}</p>
                </div>
                <button onClick={handleCloseModal} className="p-1 hover:bg-slate-200 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiReport ? (
                  // Gemini Verification Success summary details
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-3.5"
                  >
                    <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-800 uppercase">AI Verification Ledger Recorded!</h4>
                      <p className="text-xs text-slate-500">
                        Visual and geodetic proof parameters have been ingested and verified by Gemini.
                      </p>
                    </div>

                    <div className="bg-white p-3 border border-slate-100 rounded-xl space-y-2.5 text-xs text-left">
                      <div className="flex justify-between border-b border-slate-50 pb-1.5">
                        <span className="text-slate-400">Gemini confidence index:</span>
                        <span className="font-bold text-emerald-600">{(aiReport.ai_confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-1.5">
                        <span className="text-slate-400">GPS location delta:</span>
                        <span className="font-bold text-slate-800">{aiReport.distance_m.toFixed(1)} meters</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-1.5">
                        <span className="text-slate-400">Compass bearing delta:</span>
                        <span className="font-bold text-slate-800">{aiReport.bearing_delta.toFixed(1)}°</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Gemini rationale:</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed mt-1 font-medium italic">
                          "{aiReport.ai_reason}"
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-100 rounded-xl max-w-xs mx-auto flex items-center justify-center gap-2 shadow-sm">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold text-slate-700">+30 XP Volunteer Points Awarded!</span>
                    </div>

                    <button
                      id="proof-done"
                      onClick={handleCloseModal}
                      className="px-6 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow"
                    >
                      Done
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitProof} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Photo/Video Upload Box */}
                      {!photo ? (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="h-48 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-slate-50 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors space-y-2"
                        >
                          <UploadCloud className="w-8 h-8 text-slate-400 animate-pulse" />
                          <div>
                            <p className="text-xs font-bold text-slate-700">Upload Resolution Photo or Video</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Capture or select restored spot proof</p>
                          </div>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                            Select Photo/Video
                          </span>
                          <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*,video/*"
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative">
                          {photo.startsWith('data:video') ? (
                            <video src={photo} controls className="w-full h-full object-cover" />
                          ) : (
                            <img src={photo} alt="After resolution" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => setPhoto(null)}
                            className="absolute top-2 right-2 bg-slate-900/80 text-white hover:bg-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-lg backdrop-blur"
                          >
                            Change File
                          </button>
                        </div>
                      )}

                      {/* GPS & Compass validation widgets */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
                        <h4 className="font-bold text-slate-700 flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-indigo-500" />
                          On-Ground GPS Validation
                        </h4>
                        <div className="space-y-1.5">
                          <div>
                            <p className="text-[9px] text-slate-400">Simulated Lat Coordinates</p>
                            <input 
                              type="number" 
                              step="any" 
                              value={gpsLat} 
                              onChange={e => setGpsLat(parseFloat(e.target.value))} 
                              className="w-full mt-0.5 font-bold text-slate-800 bg-white border border-slate-100 rounded px-1.5 py-0.5 focus:outline-none"
                            />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400">Simulated Lng Coordinates</p>
                            <input 
                              type="number" 
                              step="any" 
                              value={gpsLng} 
                              onChange={e => setGpsLng(parseFloat(e.target.value))} 
                              className="w-full mt-0.5 font-bold text-slate-800 bg-white border border-slate-100 rounded px-1.5 py-0.5 focus:outline-none"
                            />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400">Simulated Compass Bearing (degrees)</p>
                            <input 
                              type="number" 
                              value={bearing} 
                              onChange={e => setBearing(parseInt(e.target.value))} 
                              className="w-full mt-0.5 font-bold text-slate-800 bg-white border border-slate-100 rounded px-1.5 py-0.5 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Resolution Notes</label>
                      <textarea
                        rows={2}
                        required
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Explain work executed (e.g. patched pothole, replaced municipal bulb, cleared sewer blockage)"
                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      id="proof-submit-btn"
                      type="submit"
                      disabled={submittingProof || !photo}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white font-bold py-2 rounded-lg text-xs shadow flex items-center justify-center gap-1.5"
                    >
                      {submittingProof ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          AI GEODETIC & VISION RUNNING...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Commit Resolution Ledger
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
