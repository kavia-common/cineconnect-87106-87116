import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../services/Theme';

/**
 * PUBLIC_INTERFACE
 * TopNav renders the top navigation bar with brand, search, and quick actions.
 */
export default function TopNav({ onOpenChat, onOpenNotifications, onOpenQuick }) {
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
          <NavLink to="/curated" className="pill">Curated</NavLink>
          <NavLink to="/challenges" className="pill">Challenges</NavLink>
          <NavLink to="/forums" className="pill">Forums</NavLink>
          <NavLink to="/subir" className="pill" aria-label="Subir Video">Subir Video</NavLink>
          <NavLink to="/perfil" className="pill" aria-label="Ir a mi perfil">Perfil</NavLink>
        </nav>
        <div className="space" />
        <button
          className="pill theme-switch"
          onClick={toggleTheme}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark ? '🌙 Oscuro' : '☀️ Claro'}
        </button>
        <button className="btn secondary" onClick={onOpenQuick} aria-label="Acciones rápidas">⚡ Rápido</button>
        <button className="btn" onClick={onOpenChat} aria-label="Abrir chat">💬 Chat</button>
        <button className="btn" onClick={onOpenNotifications} aria-label="Abrir notificaciones">🔔</button>
      </div>
    </div>
  );
}
