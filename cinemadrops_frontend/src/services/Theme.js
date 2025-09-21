import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * ThemeProvider maneja el modo claro/oscuro global usando data-theme en <html>.
 * - Persiste la preferencia en localStorage ('cd-theme')
 * - Respeta la preferencia del sistema al inicio si no hay valor guardado
 * - Expone toggle y estado actual
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('cd-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('cd-theme', theme);
    } catch {}
  }, [theme]);

  // Escuchar cambios del sistema cuando el usuario no ha establecido preferencia manualmente
  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mql) return;
    const listener = (e) => {
      const stored = localStorage.getItem('cd-theme');
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mql.addEventListener?.('change', listener);
    return () => mql.removeEventListener?.('change', listener);
  }, []);

  const value = useMemo(() => ({
    theme,
    // PUBLIC_INTERFACE
    toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    // PUBLIC_INTERFACE
    setTheme,
    // PUBLIC_INTERFACE
    isDark: theme === 'dark',
  }), [theme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

const ThemeCtx = createContext(null);

/**
 * PUBLIC_INTERFACE
 * useTheme devuelve { theme, isDark, toggleTheme, setTheme }
 */
export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
