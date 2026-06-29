/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('community_hero_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('community_hero_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('community_hero_token');
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  
  // Build headers
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Build query string if params are provided
  let url = `${API_BASE}${endpoint}`;
  if (options.params) {
    const cleanParams = Object.entries(options.params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (cleanParams) {
      url += `?${cleanParams}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // JSON parsing failed, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses gracefully
  if (response.status === 204) {
    return {} as T;
  }

  try {
    return await response.json() as T;
  } catch (e) {
    return {} as any;
  }
}
