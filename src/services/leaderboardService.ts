/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './apiClient';
import { User } from '../types';

export const leaderboardService = {
  async getLeaderboard(role?: string, scope?: string, state?: string, place?: string): Promise<User[]> {
    return apiRequest<User[]>('/leaderboard', {
      method: 'GET',
      params: { role, scope, state, place }
    });
  }
};
