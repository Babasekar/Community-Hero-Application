/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from './apiClient';
import { Resolution } from '../types';

export interface AIAnalysisResult {
  category: 'road' | 'water' | 'lighting' | 'waste' | 'drainage' | 'other';
  severity: number;
  title: string;
  description: string;
}

export const aiService = {
  async categorizeImage(imageBase64: string): Promise<AIAnalysisResult> {
    return apiRequest<AIAnalysisResult>('/ai/categorize', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64 })
    });
  },

  async getAdvisoryReport(state?: string, city?: string): Promise<{ report: string }> {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (city) params.append('city', city);
    const queryString = params.toString();
    return apiRequest<{ report: string }>(`/ai/advisory-report${queryString ? '?' + queryString : ''}`, {
      method: 'GET'
    });
  },

  async verifyReport(
    imageBase64: string,
    category: string,
    title: string,
    description: string
  ): Promise<{ isRealIssue: boolean; categoryMatched: boolean; reason: string }> {
    return apiRequest<{ isRealIssue: boolean; categoryMatched: boolean; reason: string }>('/ai/verify-report', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64, category, title, description })
    });
  },

  async submitResolutionProof(
    issueId: string,
    proofData: {
      photo_url: string;
      video_url?: string;
      notes?: string;
      resolver_lat: number;
      resolver_lng: number;
      resolver_bearing: number;
    }
  ): Promise<{ success: boolean; resolution: Resolution }> {
    return apiRequest<{ success: boolean; resolution: Resolution }>(`/ai/resolution/${issueId}`, {
      method: 'POST',
      body: JSON.stringify(proofData)
    });
  }
};
