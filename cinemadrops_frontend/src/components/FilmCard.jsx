import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * FilmCard renders a short film card with playful style.
 * For Discover testing, it always displays a static image in the preview area,
 * without requiring any asset/thumbnail fields from the film object.
 */
export default function FilmCard({ film, placeholderImage = '/assets/pexels-amar-29656074.jpg' }) {
  // Always render a static image in the preview area for test/demo purposes.
  // We ignore any asset/thumbnail fields to ensure consistency across all cards.

  return (
    <Link to={`/film/${film.id}`} className="card film-card" style={{ textDecoration: 'none' }}>
      <div
        className="film-thumb"
        style={{ position: 'relative', background: 'var(--cd-bg)' }}
        aria-label={`Tarjeta de video ${film.title}`}
      >
        <img
          src={placeholderImage}
          alt={`Preview de ${film.title}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="badge">★ {film.likes} • ⏱ {film.duration}m</div>
      </div>
      <div className="film-meta">
        <div className="film-title">{film.title}</div>
        <div className="film-author">by {film.author}</div>
      </div>
    </Link>
  );
}
