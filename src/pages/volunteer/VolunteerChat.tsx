/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { broadcastService } from '../../services/broadcastService';
import { Broadcast, BroadcastMessage } from '../../types';
import { MessageSquare, Send, Calendar, Users, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const VolunteerChat: React.FC = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState<Broadcast[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<Broadcast | null>(null);
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const [content, setContent] = useState('');
  const [loadingDrives, setLoadingDrives] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchJoinedDrives = async () => {
    setLoadingDrives(true);
    try {
      const all = await broadcastService.getBroadcasts();
      setDrives(all);
      if (all.length > 0) {
        setSelectedDrive(all[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDrives(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedDrive) return;
    setLoadingMessages(true);
    try {
      const list = await broadcastService.getMessages(selectedDrive.id);
      setMessages(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchJoinedDrives();
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // poll every 5s for chat updates
    return () => clearInterval(interval);
  }, [selectedDrive]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrive || !content.trim()) return;

    try {
      const msg = await broadcastService.sendMessage(selectedDrive.id, content.trim());
      setMessages([...messages, msg]);
      setContent('');
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    }
  };

  if (!user) return null;

  return (
    <div id="volunteer-chat-root" className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)]">
      
      {/* Sidebar: Chat Groups Selection */}
      <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col overflow-y-auto">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
          <MessageSquare className="w-4.5 h-4.5 text-indigo-600" />
          Assembly Groups
        </h3>

        <div className="space-y-2 mt-3 flex-1">
          {loadingDrives ? (
            <p className="text-xs text-slate-400 italic text-center py-4">Loading assembly groups...</p>
          ) : drives.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4">No active chat groups. Join a cleanup drive to open channels!</p>
          ) : (
            drives.map(d => (
              <button
                key={d.id}
                id={`chat-group-btn-${d.id}`}
                onClick={() => setSelectedDrive(d)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-colors block ${
                  selectedDrive?.id === d.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="block truncate font-bold">{d.title}</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(d.activity_date).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Panel: Conversation logs and sending controls */}
      <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between overflow-hidden">
        {selectedDrive ? (
          <>
            {/* Group Channel Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{selectedDrive.title} Logistics Channel</h4>
                <p className="text-[10px] text-slate-400">Collaborative volunteer group chat feed</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1 text-[10px] font-bold text-slate-500">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                {selectedDrive.member_count} Members
              </div>
            </div>

            {/* Chat message history log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
              {loadingMessages && messages.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">Syncing secure connection...</p>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-1.5 max-w-sm mx-auto">
                  <Info className="w-5 h-5 text-indigo-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Logistics channel is empty</p>
                  <p className="text-[10px] text-slate-400">Introduce yourself and coordinate logistics for tools, supplies, gloves, or trash bags!</p>
                </div>
              ) : (
                messages.map(m => {
                  const isMe = m.user_id === user.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-2xl border text-xs space-y-1 shadow-sm ${
                        isMe 
                          ? 'bg-indigo-600 border-indigo-700 text-white rounded-tr-none' 
                          : 'bg-white border-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        {!isMe && (
                          <span className="block text-[9px] font-bold text-indigo-600 uppercase">
                            {m.user_name} ({m.user_role})
                          </span>
                        )}
                        <p className="leading-relaxed font-medium">{m.content}</p>
                        <span className={`block text-[8px] text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input submission box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
              <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Type your message to coordinated volunteers..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                id="send-chat-message"
                type="submit"
                disabled={!content.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white p-2.5 rounded-xl transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 text-slate-300 mb-2 animate-bounce" />
            <p className="text-xs font-bold text-slate-700">No Channels Joined</p>
            <p className="text-[10px] text-slate-400 max-w-xs mt-1">Please join a scheduled cleanup drive under the Cleanup Campaigns tab to participate in channel dialogues.</p>
          </div>
        )}
      </div>
    </div>
  );
};
