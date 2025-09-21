import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * FilmCard renders a short film card with playful style.
 * Soporta mostrar una imagen de portada si está disponible en film.cover_image|cover|thumbnail|poster.
 */
export default function FilmCard({ film }) {
  const cover =
    film?.cover_image ||
    film?.cover ||
    film?.coverUrl ||
    film?.thumbnail ||
    film?.thumbnailUrl ||
    film?.poster ||
    null;

  return (
    <Link to={`/film/${film.id}`} className="card film-card">
      <div className="film-thumb" style={{ position: 'relative', background: '#eef6f7' }}>
        {cover ? (
          <img
            src={cover}
            alt={`Portada de ${film.title}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--cd-gradient)' }} />
        )}
        <div className="badge">★ {film.likes} • ⏱ {film.duration}m</div>
      </div>
      <div className="film-meta">
        <div className="film-title">{film.title}</div>
        <div className="film-author">by {film.author}</div>
      </div>
    </Link>
  );
}
