import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useReactions, REACTION_TYPES } from '../services/Reactions';

/**
 * PUBLIC_INTERFACE
 * FilmCard renders a short film card with playful style.
 * Adds reaction controls (Dislike, Like, Love, Life Changing).
 */
export default function FilmCard({ film }) {
  const { getReaction, setReaction } = useReactions();
  const current = getReaction(film.id);

  const options = useMemo(() => ([
    { key: 'dislike', label: 'Dislike', icon: '👎', color: 'var(--cd-error)' },
    { key: 'like', label: 'Like', icon: '👍', color: 'var(--cd-primary)' },
    { key: 'love', label: 'Love', icon: '❤️', color: '#e83e8c' },
    { key: 'life changing', label: 'Life Changing', icon: '🌟', color: 'var(--cd-secondary)' },
  ]), []);

  const onReact = (key) => {
    const next = current === key ? null : key;
    setReaction(film.id, next);
  };

  return (
    <div className="card film-card" style={{ textDecoration: 'none' }}>
      <Link to={`/film/${film.id}`} style={{ display: 'block' }}>
        <div className="film-thumb">
          <div style={{ position: 'absolute', inset: 0, background: 'var(--cd-gradient)' }} />
          <div className="badge">★ {film.likes} • ⏱ {film.duration}m</div>
        </div>
      </Link>
      <div className="film-meta">
        <Link to={`/film/${film.id}`} className="film-title">{film.title}</Link>
        <div className="film-author">by {film.author}</div>
        <div style={{ height: 8 }} />
        <div className="reactions-row" role="group" aria-label={`React to ${film.title}`}>
          {options.map(opt => {
            const active = current === opt.key;
            return (
              <button
                key={opt.key}
                className={`reaction-btn ${active ? 'active' : ''}`}
                onClick={() => onReact(opt.key)}
                aria-pressed={active}
                aria-label={`${opt.label}${active ? ' (selected)' : ''}`}
                title={opt.label}
                style={{
                  borderColor: active ? opt.color : 'var(--cd-border)',
                  color: active ? opt.color : 'inherit'
                }}
                type="button"
              >
                <span className="reaction-icon" aria-hidden="true">{opt.icon}</span>
                <span className="reaction-label" role="tooltip">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
