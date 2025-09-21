import React from 'react';
import { Link } from 'react-router-dom';
import { getCoverByIndex } from '../assets/images';

/**
 * PUBLIC_INTERFACE
 * ChallengesHub lists active and recent challenges with playful visuals.
 */
export default function ChallengesHub() {
  const active = [
    { id: 'c-uxk', title: 'Unexpected Kindness', description: 'Capture a moment of kindness in under 3 minutes.', deadline: 'Sun', submissions: 142 },
    { id: 'c-ors', title: 'One Room Story', description: 'Tell a compelling story that takes place in a single room.', deadline: 'Ended', submissions: 289 },
    { id: 'c-nls', title: 'No Lines Spoken', description: 'Convey a story without any dialogue. Sound design is your friend!', deadline: '2 weeks', submissions: 87 },
  ];

  return (
    <div className="page-challenges">
      <div className="card section">
        <div className="row" style={{ alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Challenges</h2>
          <span className="pill" style={{ marginLeft: 'auto' }}>Weekly fun</span>
        </div>
        <p className="muted">Join community challenges, submit your short, and unlock playful badges.</p>

        <div style={{ height: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
          {active.map((c, i) => (
            <div key={c.id} className="card" style={{ gridColumn: 'span 3', overflow: 'hidden' }}>
              <div style={{ position: 'relative', aspectRatio: '21/9', background: 'rgba(15,163,177,0.10)' }}>
                <img
                  src={getCoverByIndex(i)}
                  alt={`${c.title} cover`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="badge">Due: {c.deadline}</div>
              </div>
              <div style={{ padding: 14 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: 16 }}>{c.title}</strong>
                  <span className="pill">{c.submissions} films</span>
                </div>
                <p className="muted" style={{ marginTop: 8 }}>{c.description}</p>
                <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                  <Link to={`/challenges/${c.id}`} className="pill">Explore</Link>
                  <Link to={`/challenges/${c.id}`} className="btn">Participate</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 16 }} />
        <div className="card" style={{ padding: 14 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="muted">Tip: Upload your film first, then attach it to a challenge submission.</span>
            <Link to="/upload" className="btn" aria-label="Upload short">⬆️ Upload short</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
