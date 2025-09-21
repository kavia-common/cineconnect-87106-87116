import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * FilmCard renders a short film card with playful style.
 * Soporta mostrar una imagen de portada si está disponible en film.cover_image|cover|thumbnail|poster.
 * Si no hay portada provista por API, intenta cargar una imagen desde /assets basada en el título o id.
 */
export default function FilmCard({ film, trending = false }) {
  // Prefer fields coming from API
  let cover =
    film?.cover_image ||
    film?.cover ||
    film?.coverUrl ||
    film?.thumbnail ||
    film?.thumbnailUrl ||
    film?.poster ||
    null;

  // If no cover from API, attempt to resolve an asset from /public/assets using a slug of title or id.
  if (!cover) {
    const slug = toSlug(film?.title || film?.name || film?.id || '');
    // Common portrait extensions to try. CRA serves /public as root, so /assets/* is valid if images are placed in public/assets.
    const candidates = [`/assets/${slug}.jpg`, `/assets/${slug}.png`, `/assets/${slug}.webp`];
    // We cannot synchronously check file existence in client reliably without fetch; try first candidate.
    // Browsers will show a broken image if missing; to avoid that, we use a small trick:
    // Use the first candidate, but attach onError handler to swap to next. If all fail, fall back to gradient.
    cover = candidates[0];

    // We will render an <img> with onError rotation across candidates.
    return (
      <Link to={`/film/${film.id}`} className={`card film-card${trending ? ' trending' : ''}`} style={{ textDecoration: 'none' }}>
        <div className="film-thumb" style={{ position: 'relative', background: 'var(--cd-bg)' }}>
          <AssetCyclingImage
            srcs={candidates}
            alt={`Portada de ${film.title}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            fallback={<div style={{ position: 'absolute', inset: 0, background: 'var(--cd-gradient)' }} />}
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

  // If cover was resolved from API fields, render normally
  return (
    <Link to={`/film/${film.id}`} className={`card film-card${trending ? ' trending' : ''}`} style={{ textDecoration: 'none' }}>
      <div className="film-thumb" style={{ position: 'relative', background: 'var(--cd-bg)' }}>
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

/**
 * Convert a string to a URL/filename-friendly slug.
 */
function toSlug(s) {
  return String(s || '')
    .normalize?.('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * AssetCyclingImage renders the first working src from a list of candidates.
 * If all sources fail to load, it renders the provided fallback element.
 */
// PUBLIC_INTERFACE
function AssetCyclingImage({ srcs, alt, style, className, fallback }) {
  /** This is a public function component that tries multiple image sources gracefully. */
  const [index, setIndex] = React.useState(0);
  const [failedAll, setFailedAll] = React.useState(false);

  if (failedAll || !srcs || srcs.length === 0) {
    return fallback || null;
  }

  const onError = () => {
    if (index < srcs.length - 1) {
      setIndex(index + 1);
    } else {
      setFailedAll(true);
    }
  };

  return (
    <img
      src={srcs[index]}
      alt={alt}
      style={style}
      className={className}
      onError={onError}
    />
  );
}
