import React from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../services/Api';
import Comments from '../components/Comments';

/**
 * PUBLIC_INTERFACE
 * FilmDetails shows a single film page with content and social features.
 */
export default function FilmDetails() {
  const { id } = useParams();
  const { useFetch } = useApi();
  const { data: film } = useFetch(`/films/${id}`, { fallbackData: fallback(id) });

  return (
    <div className="page-film">
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ aspectRatio: '16/9', background: 'var(--cd-gradient)' }} />
        <div style={{ padding: 16 }}>
          <h2 style={{ margin: '8px 0' }}>{film.title}</h2>
          <div className="row">
            <span className="pill">by {film.author}</span>
            <span className="pill">⏱ {film.duration} min</span>
            <span className="pill">★ {film.likes}</span>
          </div>
          <p style={{ color: 'var(--cd-muted)' }}>{film.description}</p>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="row" style={{ gap: 16, alignItems: 'stretch' }}>
        <div style={{ flex: 2 }}>
          <div className="card section">
            <strong>Behind the Scenes</strong>
            <div style={{ height: 8 }} />
            <p className="muted">Photos, stories, gear lists, and production notes coming from creators.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div style={{ aspectRatio: '4/3', background: 'rgba(15,163,177,0.10)', borderRadius: 12 }} />
              <div style={{ aspectRatio: '4/3', background: 'rgba(15,163,177,0.10)', borderRadius: 12 }} />
              <div style={{ aspectRatio: '4/3', background: 'rgba(15,163,177,0.10)', borderRadius: 12 }} />
            </div>
          </div>

          <div style={{ height: 16 }} />

          <div className="card section">
            <strong>Script & Notes</strong>
            <div style={{ height: 8 }} />
            <div className="pill">Download PDF</div>
            <div style={{ height: 8 }} />
            <p className="muted">Short excerpt: "{film.scriptSnippet}"</p>
          </div>

          <div style={{ height: 16 }} />
          <Comments filmId={id} />
        </div>

        <div className="rightbar" style={{ flex: 1 }}>
          <div className="card section">
            <strong>Cast & Crew</strong>
            <div style={{ height: 8 }} />
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {film.crew.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div className="card section">
            <strong>More by {film.author}</strong>
            <div style={{ height: 8 }} />
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {film.more.map(m => <span key={m} className="pill" style={{ margin: 4 }}>{m}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function fallback(id) {
  return {
    id,
    title: 'Echo Street',
    author: 'Sara Ali',
    duration: 8,
    likes: 581,
    description: 'A chance meeting on a rainy night changes a commuter’s routine forever.',
    scriptSnippet: 'Umbrellas collide. A glance. Silence speaks louder than words...',
    crew: ['Director: Sara Ali', 'DOP: L. Keller', 'Editor: M. Rios', 'Sound: T. Abebe'],
    more: ['Rain Lines', 'Midnight Bus', 'Crossing'],
  };
}
