import React from 'react';
import { useParams, Link } from 'react-router-dom';
import FilmCard from '../components/FilmCard';
import { getCoverByIndex } from '../assets/images';

/**
 * PUBLIC_INTERFACE
 * ChallengeDetails shows the selected challenge with sample submissions.
 */
export default function ChallengeDetails() {
  const { id } = useParams();
  const challenge = fallbackChallenge(id);
  return (
    <div className="page-challenge-details">
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ position: 'relative', aspectRatio: '21/9', background: 'var(--cd-gradient)' }} />
        <div style={{ padding: 16 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>{challenge.title}</h2>
            <span className="pill">Due: {challenge.deadline}</span>
          </div>
          <p className="muted">{challenge.description}</p>
          <div className="row" style={{ gap: 8 }}>
            <span className="pill">Theme</span>
            <span className="pill">{challenge.submissions.length} submissions</span>
          </div>
          <div style={{ height: 8 }} />
          <Link to="/challenges" className="pill">← Back to Challenges</Link>
        </div>
      </div>

      <div style={{ height: 16 }} />
      <div className="card section">
        <strong>Submissions</strong>
        <div style={{ height: 10 }} />
        <div className="film-grid">
          {challenge.submissions.map((f, i) => (
            <FilmCard key={f.id} film={f} index={i} image={getCoverByIndex(i)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function fallbackChallenge(id) {
  return {
    id,
    title: id === 'c-uxk' ? 'Unexpected Kindness' : id === 'c-ors' ? 'One Room Story' : 'No Lines Spoken',
    deadline: id === 'c-ors' ? 'Ended' : 'Sun',
    description:
      id === 'c-uxk'
        ? 'Capture a moment of kindness in under 3 minutes.'
        : id === 'c-ors'
        ? 'Tell a compelling story in a single room.'
        : 'Convey story without dialogue; rely on visuals and sound.',
    submissions: [
      { id: 's1', title: 'Door Held', author: 'Kai Noor', likes: 120, duration: 2 },
      { id: 's2', title: 'Blue Umbrella', author: 'Emi Kato', likes: 310, duration: 3 },
      { id: 's3', title: 'Coffee Coin', author: 'L. Singh', likes: 89, duration: 2 },
      { id: 's4', title: 'Warm Bench', author: 'Ari Hale', likes: 45, duration: 1 },
    ],
  };
}
