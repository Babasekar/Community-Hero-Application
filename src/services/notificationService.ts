/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './apiClient';
import { Notification } from '../types';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    return apiRequest<Notification[]>('/notifications', {
      method: 'GET'
    });
  },

  async markAllRead(): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>('/notifications/read-all', {
      method: 'POST'
    });
  }
};
