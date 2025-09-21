import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../services/Theme';

/**
 * PUBLIC_INTERFACE
 * TopNav renders the top navigation bar with brand, search, and navigation links.
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
          <input className="input" placeholder="Buscar películas, creadores, hashtags..." aria-label="Buscar" />
        </div>
        <nav className="row">

          <NavLink to="/challenges" className="pill">Challenges</NavLink>
          <NavLink to="/forums" className="pill">Forums</NavLink>
          <NavLink to="/upload" className="pill" aria-label="Upload Video">Upload Video</NavLink>
          <NavLink to="/profile" className="pill" aria-label="Go to my profile">Profile</NavLink>
        </nav>
        <div className="space" />
        <button
          className="pill theme-switch"
          onClick={toggleTheme}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          style={{ width: 40, height: 40, justifyContent: 'center' }}
        >
          <span aria-hidden="true" role="img">{isDark ? '🌙' : '☀️'}</span>
        </button>
      </div>
    </div>
  );
}
