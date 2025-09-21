import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * FilmCard renders a short film card with playful style.
 * Expects a real, already-imported image URL via the `image` prop.
 */
export default function FilmCard({ film, index = 0, image }) {
  // The image must be a real import (e.g., from src/assets) or an absolute public path (/assets/*).
  // We do not compute or fetch images here; no fallback logic that could block rendering.
  const [imgOk, setImgOk] = React.useState(true);

  const showImage = Boolean(image) && imgOk;

  return (
    <Link to={`/film/${film.id}`} className="card film-card" aria-label={`${film.title} by ${film.author}`}>
      <div className="film-thumb" style={{ position: 'relative', overflow: 'hidden' }}>
        {showImage ? (
          <img
            src={image}
            alt={`${film.title} cover`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--cd-gradient)',
            }}
          />
        )}
        {!showImage && (
          <span className="visually-hidden" aria-live="polite">
            Cover image unavailable; showing placeholder.
          </span>
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
