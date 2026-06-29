/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './apiClient';
import { Broadcast, BroadcastMember, BroadcastMessage } from '../types';

export const broadcastService = {
  async getBroadcasts(): Promise<Broadcast[]> {
    return apiRequest<Broadcast[]>('/broadcasts', {
      method: 'GET'
    });
  },

  async createBroadcast(data: Omit<Broadcast, 'id' | 'created_at' | 'member_count' | 'status'>): Promise<Broadcast> {
    return apiRequest<Broadcast>('/broadcasts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getBroadcastDetail(id: string): Promise<{ broadcast: Broadcast; members: BroadcastMember[] }> {
    return apiRequest<{ broadcast: Broadcast; members: BroadcastMember[] }>(`/broadcasts/${id}`, {
      method: 'GET'
    });
  },

  async joinBroadcast(id: string, userName: string): Promise<BroadcastMember> {
    return apiRequest<BroadcastMember>(`/broadcasts/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ userName })
    });
  },

  async respondToRequest(broadcastId: string, memberId: string, accept: boolean): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/broadcasts/${broadcastId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ memberId, accept })
    });
  },

  async getMessages(broadcastId: string): Promise<BroadcastMessage[]> {
    return apiRequest<BroadcastMessage[]>(`/broadcasts/${broadcastId}/messages`, {
      method: 'GET'
    });
  },

  async sendMessage(broadcastId: string, content: string): Promise<BroadcastMessage> {
    return apiRequest<BroadcastMessage>(`/broadcasts/${broadcastId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }
};
