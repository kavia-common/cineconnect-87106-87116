import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useApi } from './Api';

/**
 * PUBLIC_INTERFACE
 * AuthProvider tries to resolve the current authenticated user from the backend.
 * It relies on cookies or existing session configured on the API domain (credentials: 'include').
 * If auth is not configured, it gracefully falls back to null user.
 *
 * Expected backend endpoint (suggested, but can be adapted):
 * - GET /auth/me -> { id, name, email, avatarUrl? }
 *
 * If your backend uses a different route or field names, adjust fetchMe() below accordingly.
 *
 * Environment variables:
 * - REACT_APP_API_BASE must be set and match the backend domain handling the session/cookies.
 */
export function AuthProvider({ children }) {
  const api = useApi();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchMe = async () => {
      try {
        // We attempt a conventional "current user" endpoint. If not available, we fail silently.
        const me = await api.get('/auth/me');
        if (!cancelled) {
          // Normalize to the fields we need across the app
          setUser({
            id: me.id || me.userId || me.uid || me.email || 'unknown',
            name: me.name || me.fullName || me.username || me.email || 'User',
            email: me.email || '',
            avatarUrl: me.avatarUrl || null,
          });
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    };

    fetchMe();

    return () => {
      cancelled = true;
    };
  }, [api]);

  const value = useMemo(() => ({
    user,
    authChecked,
    // PUBLIC_INTERFACE
    isAuthenticated: !!user,
  }), [user, authChecked]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

const AuthCtx = createContext(null);

/**
 * PUBLIC_INTERFACE
 * useAuth returns current user info and auth flags.
 */
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
