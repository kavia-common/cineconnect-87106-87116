import React, { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/**
 * API base configuration using env vars.
 * Note: Ask user to set REACT_APP_API_BASE_URL (preferred for API Gateway) or REACT_APP_API_BASE.
 */
const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:4000';
export const WS_BASE = process.env.REACT_APP_WS_BASE || 'ws://localhost:4000';

/** Simple JSON fetcher with error handling */
async function fetcher(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...opts
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

const ApiCtx = createContext(null);

/**
 * PUBLIC_INTERFACE
 * ApiProvider provides API helpers and SWR fetcher context.
 */
export function ApiProvider({ children }) {
  const value = useMemo(() => ({
    base: API_BASE,
    // PUBLIC_INTERFACE
    get: (path) => fetcher(`${API_BASE}${path}`),
    // PUBLIC_INTERFACE
    post: (path, body) => fetcher(`${API_BASE}${path}`, { method: 'POST', body: JSON.stringify(body) }),
    // PUBLIC_INTERFACE
    put: (path, body) => fetcher(`${API_BASE}${path}`, { method: 'PUT', body: JSON.stringify(body) }),
    // PUBLIC_INTERFACE
    del: (path) => fetcher(`${API_BASE}${path}`, { method: 'DELETE' }),
    // PUBLIC_INTERFACE
    useFetch: (path, config = {}) => useSWR(path ? `${API_BASE}${path}` : null, (url) => fetcher(url), config),
  }), []);

  return <ApiCtx.Provider value={value}>{children}</ApiCtx.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useApi returns HTTP helpers and SWR bound fetchers.
 */
export function useApi() {
  const ctx = useContext(ApiCtx);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}
