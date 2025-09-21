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
      {/* Media wrapper: edge-to-edge image clipped by card's rounded corners */}
      <div className="film-thumb" aria-hidden="true">
        {showImage ? (
          <img
            src={image}
            alt=""
            role="presentation"
            className="film-thumb-img"
            loading="lazy"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="film-thumb-fallback" />
        )}
        {!showImage && (
          <span className="visually-hidden" aria-live="polite">
            Cover image unavailable; showing placeholder.
          </span>
        )}
        {/* Overlay badge stays inside media, spaced from edges by its own padding */}
        <div className="badge">★ {film.likes} • ⏱ {film.duration}m</div>
      </div>

      {/* Content/body with generous padding so text/buttons never hug edges */}
      <div className="film-meta">
        <div className="film-title">{film.title}</div>
        <div className="film-author">by {film.author}</div>
      </div>
    </Link>
  );
}
