import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCoverByIndex } from '../assets/images';

/**
 * PUBLIC_INTERFACE
 * FilmCard renders a short film card with playful style.
 */
export default function FilmCard({ film, index = 0 }) {
  // Pick a cover based on index or id hash to keep it stable and playful
  const computedIndex = useMemo(() => {
    if (typeof index === 'number') return index;
    // derive a number from id if index not provided
    const s = String(film?.id ?? '');
    return Array.from(s).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  }, [film?.id, index]);

  const initialSrc = getCoverByIndex(computedIndex);
  const [src, setSrc] = useState(initialSrc);
  const [broken, setBroken] = useState(false);

  return (
    <Link to={`/film/${film.id}`} className="card film-card" aria-label={`${film.title} by ${film.author}`}>
      <div className="film-thumb" style={{ position: 'relative', overflow: 'hidden' }}>
        {!broken && src ? (
          <img
            src={src}
            alt={`${film.title} cover`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => { setBroken(true); setSrc(null); }}
            loading="lazy"
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
        <div className="badge">★ {film.likes} • ⏱ {film.duration}m</div>
      </div>
      <div className="film-meta">
        <div className="film-title">{film.title}</div>
        <div className="film-author">by {film.author}</div>
      </div>
    </Link>
  );
}
