import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * RightSidebar shows trending films, weekly challenge, and creators.
 */
export default function RightSidebar() {
  const trending = [
    { id: 't1', title: 'Moonlit Alley', views: '12.4k' },
    { id: 't2', title: 'Paper Stars', views: '9.1k' },
    { id: 't3', title: 'Silent Notes', views: '7.7k' },
  ];
  const creators = [
    { id: 'c1', name: 'Ava Reynolds' },
    { id: 'c2', name: 'Leo Park' },
    { id: 'c3', name: 'Nora Patel' },
  ];
  return (
    <>
      <div className="card section">
        <strong>Trending</strong>
        <div style={{ height: 10 }} />
        {trending.map(t => (
          <Link key={t.id} to={`/film/${t.id}`} className="row" style={{ justifyContent: 'space-between', padding: '8px 0' }}>
            <span>{t.title}</span>
            <span className="muted">👁 {t.views}</span>
          </Link>
        ))}
      </div>

      <div className="card section">
        <strong>Weekly Challenge</strong>
        <div style={{ height: 8 }} />
        <div className="muted" style={{ fontSize: 14 }}>Theme: "Unexpected Kindness"</div>
        <div style={{ height: 10 }} />
        <Link to="/challenges" className="btn">Join Challenge</Link>
      </div>

      <div className="card section">
        <strong>Top Creators</strong>
        <div style={{ height: 10 }} />
        {creators.map(c => (
          <Link key={c.id} to={`/creator/${c.id}`} className="pill" style={{ marginBottom: 8 }}>{c.name}</Link>
        ))}
      </div>
    </>
  );
}
