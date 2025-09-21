import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../services/Theme';

/**
 * PUBLIC_INTERFACE
 * TopNav renders the top navigation bar with brand, search, and primary navigation.
 */
export default function TopNav() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="topnav">
      <div className="topnav-inner container">
        <Link to="/" className="brand">
          <div className="brand-badge">CD</div>
          <span style={{ color: 'var(--cd-text)', fontSize: 18 }}>Cinemadrops</span>
        </Link>

        <div className="pill" style={{ flex: 1, maxWidth: 640, marginLeft: 12 }}>
          <span className="dot" />
          <input className="input" placeholder="Search films, creators, hashtags..." aria-label="Search" />
        </div>

        <nav className="row">
          <button
            className="pill"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ gap: 6 }}
          >
            <span aria-hidden="true" role="img">{isDark ? '🌞' : '🌙'}</span>
            <span className="visually-hidden">{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <NavLink to="/curated" className="pill">Curated</NavLink>
          <NavLink to="/challenges" className="pill">Challenges</NavLink>
          <NavLink to="/forums" className="pill">Forums</NavLink>
          <NavLink to="/profile" className="pill">Profile</NavLink>
          <NavLink to="/upload" className="btn" aria-label="Upload short">⬆️ Upload</NavLink>
        </nav>
      </div>
    </div>
  );
}
