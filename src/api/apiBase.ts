// src/apiBase.ts
export const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Centralized fetch utility with proper CORS configuration
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  const config: RequestInit = {
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, config);
}
