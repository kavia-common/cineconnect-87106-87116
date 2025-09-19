import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * FilmCard renders a short film card with playful style.
 */
export default function FilmCard({ film }) {
  return (
    <Link to={`/film/${film.id}`} className="card film-card">
      <div className="film-thumb">
        <div style={{ position: 'absolute', inset: 0, background: 'var(--cd-gradient)' }} />
        <div className="badge">★ {film.likes} • ⏱ {film.duration}m</div>
      </div>
      <div className="film-meta">
        <div className="film-title">{film.title}</div>
        <div className="film-author">by {film.author}</div>
      </div>
    </Link>
  );
}
