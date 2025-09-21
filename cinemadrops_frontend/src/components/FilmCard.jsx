import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * FilmCard renders a short film card with playful style.
 * Soporta mostrar una imagen de portada si está disponible en:
 *  cover_image | cover | coverUrl | thumbnail | thumbnailUrl | poster.
 * Si no hay portada, se muestra un placeholder por defecto con el gradiente del tema.
 */
export default function FilmCard({ film }) {
  // Normaliza los posibles campos de asset para portada
  const cover =
    film?.cover_image ||
    film?.cover ||
    film?.coverUrl ||
    film?.thumbnail ||
    film?.thumbnailUrl ||
    film?.poster ||
    null;

  // Imagen por defecto/placeholder: usamos un bloque con el gradiente del tema para mantener el estilo
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

  return (
    <Link to={`/film/${film.id}`} className="card film-card" style={{ textDecoration: 'none' }}>
      <div
        className="film-thumb"
        style={{ position: 'relative', background: 'var(--cd-bg)' }}
        aria-label={`Tarjeta de video ${film.title}`}
      >
        {/* Portada desde assets si existe; si falla la carga, caemos al placeholder */}
        {cover ? (
          <img
            src={cover}
            alt={`Portada de ${film.title}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              // Fallback visual si la URL no carga
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.style.background = 'var(--cd-gradient)';
              }
            }}
          />
        ) : (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--cd-gradient)' }} />
            {Placeholder}
          </>
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
