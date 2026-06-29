/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './apiClient';
import { User, Resolution } from '../types';

export interface PendingResolutionResponse extends Resolution {
  issue_title: string;
  issue_before_photo: string;
}

export const adminService = {
  async getPendingGovOfficials(): Promise<User[]> {
    return apiRequest<User[]>('/admin/pending-gov', {
      method: 'GET'
    });
  },

  async verifyGovOfficial(userId: string, approved: boolean): Promise<{ success: boolean; user: User }> {
    return apiRequest<{ success: boolean; user: User }>('/admin/verify-gov', {
      method: 'POST',
      body: JSON.stringify({ userId, approved })
    });
  },

  async getPendingResolutions(): Promise<PendingResolutionResponse[]> {
    return apiRequest<PendingResolutionResponse[]>('/admin/pending-resolutions', {
      method: 'GET'
    });
  },

  async verifyResolution(resolutionId: string, approved: boolean): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>('/admin/verify-resolution', {
      method: 'POST',
      body: JSON.stringify({ resolutionId, approved })
    });
  }
};
