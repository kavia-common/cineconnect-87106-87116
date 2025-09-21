import React from 'react';
import { Link } from 'react-router-dom';
import FilmCard from '../components/FilmCard';
import { getCoverByIndex } from '../assets/images';

/**
 * PUBLIC_INTERFACE
 * UserProfile shows current user's profile with basic editable fields, avatar, uploads and challenge badges.
 */
export default function UserProfile() {
  const [user, setUser] = React.useState(demoUser());
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState({ name: user.name, bio: user.bio });
  const [avatarSeed, setAvatarSeed] = React.useState(0);

  const save = () => {
    setUser((u) => ({ ...u, name: form.name.trim() || u.name, bio: form.bio }));
    setEditing(false);
  };

  return (
    <div className="page-user-profile">
      <div className="card section" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div
          role="img"
          aria-label="User avatar"
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            background: 'var(--cd-gradient)',
            border: '1px solid var(--cd-border)',
          }}
        />
        <div style={{ flex: 1, minWidth: 260 }}>
          {editing ? (
            <>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                aria-label="Name"
              />
              <div style={{ height: 8 }} />
              <textarea
                className="input"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                aria-label="Bio"
                style={{ resize: 'vertical' }}
              />
            </>
          ) : (
            <>
              <h2 style={{ margin: 0 }}>{user.name}</h2>
              <div className="muted">{user.bio}</div>
              <div style={{ height: 8 }} />
              <div className="row">
                <span className="pill">Followers: {user.followers}</span>
                <span className="pill">Uploads: {user.uploads.length}</span>
              </div>
            </>
          )}
        </div>
        <div className="row" style={{ gap: 8 }}>
          {editing ? (
            <>
              <button className="btn" onClick={save}>Save</button>
              <button className="btn secondary" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setEditing(true)}>Edit Profile</button>
              <Link className="pill" to="/upload">⬆️ Upload</Link>
            </>
          )}
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="card section">
        <strong>Your uploads</strong>
        <div style={{ height: 10 }} />
        <div className="film-grid">
          {user.uploads.map((f, i) => (
            <FilmCard key={f.id} film={f} index={i + avatarSeed} image={getCoverByIndex(i + avatarSeed)} />
          ))}
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="card section">
        <strong>Challenges & Badges</strong>
        <div style={{ height: 10 }} />
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {user.badges.map((b) => (
            <span key={b.id} className="pill" style={{ margin: 4 }}>
              🏅 {b.title}
            </span>
          ))}
          {user.badges.length === 0 && <span className="muted">Join a challenge to earn your first badge!</span>}
        </div>
        <div style={{ height: 10 }} />
        <Link to="/challenges" className="btn">Explore Challenges</Link>
      </div>
    </div>
  );
}

function demoUser() {
  return {
    id: 'me',
    name: 'You',
    bio: 'Filmmaker in progress. I love playful stories and cozy aesthetics.',
    followers: 128,
    uploads: [
      { id: 'u1', title: 'Morning Light', author: 'You', likes: 41, duration: 3 },
      { id: 'u2', title: 'Echo Cup', author: 'You', likes: 77, duration: 2 },
      { id: 'u3', title: 'Street Smile', author: 'You', likes: 19, duration: 1 },
    ],
    badges: [{ id: 'b1', title: 'One Room Story — Participant' }],
  };
}
