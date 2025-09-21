import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Profile mockup page showing:
 * - Mock avatar
 * - User name
 * - Short bio/description
 * - Following section (count and sample list)
 * - Grid of user's short films (mock data)
 * This version uses only hardcoded demo data and is visually playful and modern.
 */
export default function Profile() {
  // Demo/mock user data
  const user = {
    name: 'Jamie Rivers',
    username: '@jamier',
    bio: 'Storyteller. Cutting small moments into big feelings. Lover of neon lights and rainy nights.',
    avatarEmoji: '🎬',
    followers: 2_340,
    following: 187,
    followingList: [
      { id: 'u1', name: 'Ava Reynolds' },
      { id: 'u2', name: 'Leo Park' },
      { id: 'u3', name: 'Nora Patel' },
      { id: 'u4', name: 'Yuki Tanaka' },
      { id: 'u5', name: 'Sam Okafor' },
    ],
  };

  // Demo/mock films
  const films = [
    { id: 'f1', title: 'Under Neon', likes: 892, duration: 7, cover: '/assets/pexels-amar-29656074.jpg' },
    { id: 'f2', title: 'Paper Boats', likes: 641, duration: 6, cover: '/assets/pexels-jillyjillystudio-33962662.jpg' },
    { id: 'f3', title: 'Moonlit Alley', likes: 1240, duration: 10, cover: '/assets/pexels-guillermo-berlin-1524368912-30068229.jpg' },
    { id: 'f4', title: 'Quiet Wind', likes: 418, duration: 5, cover: '/assets/pexels-andreas-schnabl-1775843-19321355.jpg' },
    { id: 'f5', title: 'Blue Bicycle', likes: 305, duration: 9, cover: '/assets/pexels-chriszwettler-9407824.jpg' },
    { id: 'f6', title: 'Paint the Air', likes: 833, duration: 8, cover: '/assets/pexels-delot-29721171.jpg' },
  ];

  const headerStyle = {
    background: 'linear-gradient(135deg, rgba(255,182,39,.16), rgba(15,163,177,.18)), var(--cd-surface)',
    border: '1px solid var(--cd-border)',
    borderRadius: '16px',
    padding: 16,
  };

  const avatarStyle = {
    width: 96,
    height: 96,
    borderRadius: 28,
    display: 'grid',
    placeItems: 'center',
    fontSize: 42,
    fontWeight: 900,
    color: '#3a2f58',
    background: 'var(--cd-gradient)',
    boxShadow: '0 10px 30px rgba(0,0,0,.08)',
    border: '1px solid var(--cd-border)',
  };

  const pill = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 999,
    border: '1px solid var(--cd-border)',
    background: 'var(--cd-chip-bg)',
  };

  const smallMuted = { fontSize: 13, color: 'var(--cd-muted)' };

  return (
    <div className="page-profile">
      {/* Header / identity */}
      <div className="card section" style={headerStyle}>
        <div className="row" style={{ alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div aria-label="Profile avatar" style={avatarStyle} title="Mock avatar">
            {user.avatarEmoji}
          </div>
          <div style={{ display: 'grid', gap: 6, minWidth: 220 }}>
            <div style={{ fontWeight: 900, fontSize: 22 }}>{user.name}</div>
            <div style={smallMuted}>{user.username}</div>
            <div style={{ color: 'var(--cd-text)' }}>{user.bio}</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              <span className="pill" style={pill}>Followers: {user.followers}</span>
              <span className="pill" style={pill}>Following: {user.following}</span>
              <span className="pill" style={pill}>Films: {films.length}</span>
            </div>
          </div>
          <div className="space" />
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button className="btn">Edit Profile</button>
            <button className="btn secondary">Share</button>
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Following section */}
      <div className="card section">
        <div className="row" style={{ alignItems: 'baseline' }}>
          <strong>Following</strong>
          <div className="space" />
          <span className="pill" style={pill}>{user.following} total</span>
        </div>
        <div style={{ height: 10 }} />
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          {user.followingList.map((f) => (
            <span key={f.id} className="pill" style={pill} title={`Following ${f.name}`}>
              <span className="dot" />
              {f.name}
            </span>
          ))}
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Films grid */}
      <div className="card section">
        <div className="row" style={{ alignItems: 'baseline' }}>
          <strong>My Short Films</strong>
          <div className="space" />
          <span className="muted" style={smallMuted}>Playful mock gallery</span>
        </div>
        <div style={{ height: 10 }} />
        <div className="film-grid">
          {films.map((film) => (
            <div key={film.id} className="card film-card" style={{ textDecoration: 'none' }}>
              <div className="film-thumb" style={{ position: 'relative', background: 'var(--cd-bg)' }}>
                <img
                  src={film.cover}
                  alt={`Cover of ${film.title}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="badge">★ {film.likes} • ⏱ {film.duration}m</div>
              </div>
              <div className="film-meta">
                <div className="film-title">{film.title}</div>
                <div className="film-author" style={{ color: 'var(--cd-muted)' }}>
                  by {user.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
