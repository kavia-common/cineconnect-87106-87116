import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../services/Theme';

/**
 * PUBLIC_INTERFACE
 * TopNav renders the top navigation bar with brand, search, and navigation links.
 * Layout: brand + search + left links | spacer | right actions (Upload, Profile, Theme).
 */
export default function TopNav() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="topnav">
      <div className="topnav-inner container">
        {/* Left cluster: brand, search, primary nav */}
        <Link to="/" className="brand">
          <div className="brand-badge">CD</div>
          <span style={{ color: 'var(--cd-text)', fontSize: 18 }}>Cinemadrops</span>
        </Link>

        <div className="pill" style={{ flex: 1, maxWidth: 640, marginLeft: 12 }}>
          <span className="dot" />
          <input className="input" placeholder="Buscar películas, creadores, hashtags..." aria-label="Buscar" />
        </div>

        <nav className="row" style={{ marginLeft: 8 }}>
          <NavLink to="/challenges" className="pill">Challenges</NavLink>
          <NavLink to="/forums" className="pill">Forums</NavLink>
        </nav>

        {/* Spacer pushes right actions to the far right */}
        <div className="space" />

        {/* Right cluster: Upload, Profile, Theme toggle */}
        <nav className="row" aria-label="User actions" style={{ gap: 10 }}>
          <NavLink to="/upload" className="pill" aria-label="Upload Video">Upload Video</NavLink>
          <NavLink to="/profile" className="pill" aria-label="Go to my profile">Profile</NavLink>
          <button
            className="pill theme-switch"
            onClick={toggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <span aria-hidden="true" role="img">
              {isDark ? '🌙' : '☀️'}
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
