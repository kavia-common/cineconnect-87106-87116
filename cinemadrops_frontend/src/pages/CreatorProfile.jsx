import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../services/Api';
import FilmCard from '../components/FilmCard';

/**
 * PUBLIC_INTERFACE
 * CreatorProfile shows creator info, portfolio, and social elements.
 */
export default function CreatorProfile() {
  const { id } = useParams();
  const { useFetch } = useApi();
  const { data: creator } = useFetch(`/creators/${id}`, { fallbackData: fallback(id) });

  return (
    <div className="page-creator">
      <div className="card section" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--cd-gradient)' }} />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{creator.name}</h2>
          <div className="muted">{creator.bio}</div>
          <div style={{ height: 8 }} />
          <div className="row">
            <span className="pill">Followers: {creator.followers}</span>
            <span className="pill">Films: {creator.films.length}</span>
          </div>
        </div>
        <button className="btn">Follow</button>
      </div>

      <div style={{ height: 16 }} />

      <div className="card section">
        <strong>Films</strong>
        <div style={{ height: 10 }} />
        <div className="film-grid">
          {creator.films.map(f => <FilmCard key={f.id} film={f} />)}
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="card section">
        <strong>Q&A</strong>
        <div style={{ height: 8 }} />
        <p className="muted">Join the forum to ask {creator.name} questions.</p>
        <Link to="/forums" className="btn">Go to Forums</Link>
      </div>
    </div>
  );
}

function fallback(id) {
  return {
    id,
    name: 'Ava Reynolds',
    bio: 'Writer-director exploring small, intimate stories with big feelings.',
    followers: 2312,
    films: [
      { id: 'a1', title: 'Moonlit Alley', author: 'Ava Reynolds', likes: 1200, duration: 10 },
      { id: 'a2', title: 'Paint the Air', author: 'Ava Reynolds', likes: 830, duration: 6 },
      { id: 'a3', title: 'Quiet Wind', author: 'Ava Reynolds', likes: 410, duration: 9 },
      { id: 'a4', title: 'Blue Bicycle', author: 'Ava Reynolds', likes: 305, duration: 7 },
    ],
  };
}
