/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './apiClient';
import { Issue, IssueTimelineEvent } from '../types';

export const issueService = {
  async getIssues(params: {
    reporter_id?: string;
    category?: string;
    status?: string;
    district?: string;
    ward?: string;
    sort?: string;
  } = {}): Promise<Issue[]> {
    return apiRequest<Issue[]>('/issues', {
      method: 'GET',
      params
    });
  },

  async getNearbyIssues(lat: number, lng: number, radius?: number): Promise<Issue[]> {
    return apiRequest<Issue[]>('/issues/nearby', {
      method: 'GET',
      params: { lat, lng, radius }
    });
  },

  async getIssueDetail(id: string): Promise<{ issue: Issue; timeline: IssueTimelineEvent[] }> {
    return apiRequest<{ issue: Issue; timeline: IssueTimelineEvent[] }>(`/issues/${id}`, {
      method: 'GET'
    });
  },

  async reportIssue(issueData: Omit<Issue, 'id' | 'created_at' | 'upvote_count' | 'duplicate_count' | 'status' | 'reporter_id' | 'deadline'>): Promise<Issue> {
    return apiRequest<Issue>('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData)
    });
  },

  async upvoteIssue(id: string): Promise<{ success: boolean; upvoted?: boolean; message: string }> {
    return apiRequest<{ success: boolean; upvoted?: boolean; message: string }>(`/issues/${id}/upvote`, {
      method: 'POST'
    });
  },

  async getMyUpvotes(): Promise<string[]> {
    return apiRequest<string[]>('/issues/my-upvotes', {
      method: 'GET'
    });
  },

  async approveClaim(id: string): Promise<Issue> {
    return apiRequest<Issue>(`/issues/${id}/approve-claim`, {
      method: 'POST'
    });
  },

  async rejectClaim(id: string): Promise<Issue> {
    return apiRequest<Issue>(`/issues/${id}/reject-claim`, {
      method: 'POST'
    });
  },

  async assignIssue(id: string, assigneeId?: string): Promise<Issue> {
    return apiRequest<Issue>(`/issues/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigneeId })
    });
  },

  async updateIssueStatus(id: string, status: string, notes?: string): Promise<Issue> {
    return apiRequest<Issue>(`/issues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  },

  async escalateIssue(id: string): Promise<Issue> {
    return apiRequest<Issue>(`/issues/${id}/escalate`, {
      method: 'POST'
    });
  }
};
