import React from 'react';
import { Link } from 'react-router-dom';
import { getAssetUrl } from '../utils/assets';

/**
 * PUBLIC_INTERFACE
 * FilmCard renders a short film card with playful style.
 * For Discover testing it can display a provided preview image.
 * If previewImage is not provided, it falls back to placeholderImage.
 */
// PUBLIC_INTERFACE
export default function FilmCard({
  film,
  placeholderImage = '/assets/pexels-amar-29656074.jpg',
  previewImage,
}) {
  // Prefer previewImage when provided, otherwise use placeholderImage.
  const rawSrc = previewImage || placeholderImage;
  const src = getAssetUrl(rawSrc);

  // Prefer filename if available (API detail pages are expected at /videos_shortfilms/{filename})
  const toHref = `/film/${encodeURIComponent(film.filename || film.id)}`;

  return (
    <Link to={toHref} className="card film-card" style={{ textDecoration: 'none' }}>
      <div
        className="film-thumb"
        style={{ position: 'relative', background: 'var(--cd-bg)' }}
        aria-label={`Tarjeta de video ${film.title}`}
      >
        <img
          src={src}
          alt={`Preview de ${film.title}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            // Fallback to placeholder if preview fails
            if (rawSrc !== placeholderImage) {
              e.currentTarget.src = getAssetUrl(placeholderImage);
            }
          }}
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
