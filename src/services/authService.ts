/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest, setAuthToken, removeAuthToken } from './apiClient';
import { User } from '../types';

export const authService = {
  async signup(data: any): Promise<{ user: User; token: string }> {
    const res = await apiRequest<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setAuthToken(res.token);
    return res;
  },

  async login(data: any): Promise<{ user: User; token: string }> {
    const res = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setAuthToken(res.token);
    return res;
  },

  async me(): Promise<{ user: User }> {
    return apiRequest<{ user: User }>('/auth/me', {
      method: 'GET'
    });
  },

  async logout(): Promise<void> {
    removeAuthToken();
  },

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    return apiRequest<{ user: User }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async registerGov(data: {
    department: string;
    designation: string;
    employee_id: string;
    ward_number: string;
  }): Promise<{ user: User }> {
    return apiRequest<{ user: User }>('/auth/gov-register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
