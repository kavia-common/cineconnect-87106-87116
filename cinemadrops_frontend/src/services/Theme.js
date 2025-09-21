import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * ThemeProvider handles light/dark theme with system preference fallback and localStorage persistence.
 * It sets data-theme on <html> for CSS variable theming.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // restore from localStorage or use system preference
    const saved = safeGet('cd_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return prefersDark() ? 'dark' : 'light';
  });

  // apply to <html> for global CSS variable switching
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    safeSet('cd_theme', theme);
    // set color-scheme for form controls
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  }, [theme]);

  // respond to system preference changes if the user hasn't explicitly saved a choice
  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mql || typeof mql.addEventListener !== 'function') return;

    const handler = (e) => {
      const saved = safeGet('cd_theme');
      if (saved !== 'light' && saved !== 'dark') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const value = useMemo(() => ({
    theme,
    // PUBLIC_INTERFACE
    isDark: theme === 'dark',
    // PUBLIC_INTERFACE
    setTheme,
    // PUBLIC_INTERFACE
    toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
  }), [theme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

const ThemeCtx = createContext(null);

/**
 * PUBLIC_INTERFACE
 * useTheme returns theme state and a toggle method.
 */
export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

function prefersDark() {
  return !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {
    // ignore in restricted environments
  }
}
