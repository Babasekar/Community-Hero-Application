/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { broadcastService } from '../../services/broadcastService';
import { Broadcast, BroadcastMember } from '../../types';
import { 
  Calendar, MapPin, Users, PlusCircle, Globe, ListFilter, 
  Send, Sparkles, CheckCircle, Package, ArrowUpRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export const VolunteerDrives: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [drives, setDrives] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<Broadcast | null>(null);
  const [driveMembers, setDriveMembers] = useState<BroadcastMember[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [bcState, setBcState] = useState('Tamil Nadu');
  const [bcDistrict, setBcDistrict] = useState('Chennai');
  const [bcPlace, setBcPlace] = useState('Velachery');
  const [activityDate, setActivityDate] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(20);
  const [resources, setResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const data = await broadcastService.getBroadcasts();
      setDrives(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !activityDate) return;

    setSubmitting(true);
    try {
      await broadcastService.createBroadcast({
        creator_id: user?.id || '',
        creator_name: user?.name || '',
        title,
        description,
        location,
        state: bcState,
        district: bcDistrict,
        place: bcPlace,
        activity_date: activityDate,
        resources_needed: resources,
        max_participants: maxParticipants,
        target_districts: [bcDistrict]
      });
      fetchDrives();
      setShowCreateForm(false);
      // Reset
      setTitle('');
      setDescription('');
      setLocation('');
      setActivityDate('');
      setResources([]);
    } catch (err) {
      console.error(err);
      alert('Failed to schedule drive');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespondToRequest = async (memberUserId: string, accept: boolean) => {
    if (!selectedDrive) return;
    try {
      await broadcastService.respondToRequest(selectedDrive.id, memberUserId, accept);
      // Refresh details
      handleViewDetails(selectedDrive);
      fetchDrives();
    } catch (err: any) {
      alert(err.message || 'Failed to update member status');
    }
  };

  const handleJoin = async (id: string) => {
    try {
      await broadcastService.joinBroadcast(id, user?.name || '');
      fetchDrives();
      if (selectedDrive && selectedDrive.id === id) {
        handleViewDetails(selectedDrive);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to join group drive');
    }
  };

  const handleViewDetails = async (bc: Broadcast) => {
    setSelectedDrive(bc);
    setLoadingDetails(true);
    try {
      const details = await broadcastService.getBroadcastDetail(bc.id);
      setDriveMembers(details.members);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddResource = () => {
    if (newResource.trim()) {
      setResources([...resources, newResource.trim()]);
      setNewResource('');
    }
  };

  if (!user) return null;

  return (
    <div id="drives-root" className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Hyperlocal Cleanup Broadcasts
          </h2>
          <p className="text-xs text-slate-400">Coordinated community drives, trash cleanup campaigns, and infrastructure restoration</p>
        </div>
        <button
          id="toggle-create-drive"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          Schedule Campaign
        </button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
          >
            <form onSubmit={handleCreateDrive} className="space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Schedule Local Cleanup Campaign</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Velachery Lake Bund Cleanup Drive"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Location Landmark Address</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Velachery Lake Entrance Gate, Chennai"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target State</label>
                  <select
                    value={bcState}
                    onChange={e => setBcState(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target District</label>
                  <select
                    value={bcDistrict}
                    onChange={e => setBcDistrict(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Chennai">Chennai</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Place (Area/Ward)</label>
                  <input
                    type="text"
                    required
                    value={bcPlace}
                    onChange={e => setBcPlace(e.target.value)}
                    placeholder="e.g. Velachery, Ward 42"
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Campaign Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explain goals, gathering points, trash handling mechanics..."
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Activity Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={activityDate}
                    onChange={e => setActivityDate(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Max Volunteer Intake</label>
                  <input
                    type="number"
                    value={maxParticipants}
                    onChange={e => setMaxParticipants(parseInt(e.target.value))}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Resources Needed</label>
                  <div className="flex gap-1.5 mt-1">
                    <input
                      type="text"
                      value={newResource}
                      onChange={e => setNewResource(e.target.value)}
                      placeholder="e.g. Gloves"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddResource}
                      className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {resources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  {resources.map((r, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <Package className="w-3 h-3 text-slate-400" />
                      {r}
                    </span>
                  ))}
                </div>
              )}

              <button
                id="create-drive-submit"
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs"
              >
                {submitting ? 'Registering Campaign Ledger...' : 'Publish Cleanup Campaign Broadcast'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRIVES LIST BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-xs text-slate-400 italic text-center py-8 col-span-full">Loading campaigns...</p>
        ) : drives.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-8 col-span-full border border-dashed border-slate-200 rounded-xl bg-white">
            No active campaign drives scheduled in this ward yet. Feel free to publish one!
          </p>
        ) : (
          drives.map(drive => {
            const isCreator = drive.creator_id === user.id;
            // Check if user has joined this drive.
            // Wait, we can assume or let the details fetch verify it. We can check if drive.member_count has incremented or if user is creator. Let's make it easy to join.
            return (
              <div
                key={drive.id}
                id={`drive-card-${drive.id}`}
                className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase">
                      Campaign Broadcast
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1 font-mono">
                      <Users className="w-4 h-4 text-indigo-500" />
                      {drive.member_count} joined
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-800 truncate">{drive.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{drive.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{drive.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{new Date(drive.activity_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    id={`view-drive-btn-${drive.id}`}
                    onClick={() => handleViewDetails(drive)}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 font-bold py-1.5 rounded-lg text-xs hover:bg-slate-100 flex items-center justify-center gap-1"
                  >
                    View Details
                  </button>
                  <button
                    id={`join-drive-btn-${drive.id}`}
                    onClick={() => handleJoin(drive.id)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded-lg text-xs"
                  >
                    Join Campaign
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL DRAWER / POPUP */}
      <AnimatePresence>
        {selectedDrive && (
          <>
            <div id="drive-overlay" className="fixed inset-0 bg-black/60 z-40" onClick={() => setSelectedDrive(null)} />
            <motion.div
              id="drive-details-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Campaign Assembly Ledger</h3>
                  <p className="text-[10px] text-slate-400">ID: {selectedDrive.id}</p>
                </div>
                <button onClick={() => setSelectedDrive(null)} className="p-1 hover:bg-slate-200 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800">{selectedDrive.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {selectedDrive.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold">Assembly Point</p>
                    <p className="font-bold text-slate-800 mt-1">{selectedDrive.location}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold">Scheduled Time</p>
                    <p className="font-bold text-slate-800 mt-1">{new Date(selectedDrive.activity_date).toLocaleString()}</p>
                  </div>
                </div>

                {selectedDrive.resources_needed.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Material Logistics Checklist</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDrive.resources_needed.map((r, idx) => (
                        <span key={idx} className="bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                          ✓ {r} Required
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Participant Roll Call */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Volunteer Roll Call Assembly</p>
                  {loadingDetails ? (
                    <p className="text-xs text-slate-400 italic text-center py-3">Fetching active campaign members...</p>
                  ) : driveMembers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-2">No volunteers assembled yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {driveMembers.map(m => {
                        const isCreator = selectedDrive.creator_id === user.id;
                        return (
                          <div key={m.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-800 font-semibold">{m.user_name}</span>
                              <span className="text-[9px] text-slate-400 capitalize">{m.role}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {m.status === 'pending' && isCreator ? (
                                <div className="flex gap-1">
                                  <button
                                    id={`approve-member-${m.id}`}
                                    onClick={() => handleRespondToRequest(m.user_id, true)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] rounded-lg uppercase"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    id={`decline-member-${m.id}`}
                                    onClick={() => handleRespondToRequest(m.user_id, false)}
                                    className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] rounded-lg uppercase"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg uppercase ${
                                  m.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 
                                  m.status === 'declined' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {m.status}
                                </span>
                              )}
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
