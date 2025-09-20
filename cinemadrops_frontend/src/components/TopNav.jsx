import React from 'react';
import { Link, NavLink } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * TopNav renders the top navigation bar with brand, search, and quick actions.
 */
export default function TopNav({ onOpenChat, onOpenNotifications, onOpenQuick }) {
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
          <NavLink to="/curated" className="pill">Curated</NavLink>
          <NavLink to="/challenges" className="pill">Challenges</NavLink>
          <NavLink to="/forums" className="pill">Forums</NavLink>
          <NavLink to="/upload" className="pill">Upload</NavLink>
        </nav>
        <div className="space" />
        <button className="btn secondary" onClick={onOpenQuick} aria-label="Quick actions">⚡ Quick</button>
        <button className="btn" onClick={onOpenChat} aria-label="Open chat">💬 Chat</button>
        <button className="btn" onClick={onOpenNotifications} aria-label="Open notifications">🔔</button>
      </div>
    </div>
  );
}
