import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * FilmCard renders a short film card with playful style.
 * Supports showing a cover/thumbnail image if available in:
 *  cover_image | cover | coverUrl | thumbnail | thumbnailUrl | poster.
 * If none is available, it shows a placeholder image or a themed gradient.
 */
export default function FilmCard({ film, placeholderImage }) {
  // Normalize possible asset fields for cover/thumbnail
  const normalizedCover =
    film?.cover_image ||
    film?.cover ||
    film?.coverUrl ||
    film?.thumbnail ||
    film?.thumbnailUrl ||
    film?.poster ||
    null;

  const [imgError, setImgError] = useState(false);

  // Placeholder content if we cannot render any image
  const Placeholder = (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
      <div
        className="pill"
        style={{
          background: 'var(--cd-chip-bg)',
          border: '1px solid var(--cd-border)',
          color: 'var(--cd-muted)'
        }}
      >
        Sin miniatura
      </div>
    </div>
  );

  const renderImage = () => {
    // If we have a valid normalized cover and no error, show it
    if (normalizedCover && !imgError) {
      return (
        <img
          src={normalizedCover}
          alt={`Portada de ${film.title}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgError(true)}
        />
      );
    }

    // If cover failed or is missing, try provided placeholder image
    if (placeholderImage) {
      return (
        <img
          src={placeholderImage}
          alt={`Portada alternativa de ${film.title}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            // If even the placeholder fails, hide it and revert to gradient
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    // No image available, show gradient with "Sin miniatura"
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--cd-gradient)' }} />
        {Placeholder}
      </>
    );
  };

  return (
    <Link to={`/film/${film.id}`} className="card film-card" style={{ textDecoration: 'none' }}>
      <div
        className="film-thumb"
        style={{ position: 'relative', background: 'var(--cd-bg)' }}
        aria-label={`Tarjeta de video ${film.title}`}
      >
        {renderImage()}
        <div className="badge">★ {film.likes} • ⏱ {film.duration}m</div>
      </div>
      <div className="film-meta">
        <div className="film-title">{film.title}</div>
        <div className="film-author">by {film.author}</div>
      </div>
    </Link>
  );
}
