import React, { useMemo, useState } from 'react';
import { useApi } from '../services/Api';
import FilmCard from '../components/FilmCard';

/**
 * PUBLIC_INTERFACE
 * Home displays the discover feed and film grid.
 * Filters are positioned above the videos grid in the main content.
 */
export default function Home() {
  const { useFetch } = useApi();
  const { data: films } = useFetch('/films', { fallbackData: demoFilms });

  // Local state for filters (client-side filtering for now)
  const TAGS = ['Drama', 'Comedy', 'Sci-Fi', 'Documentary', 'Animation', 'Horror', 'Experimental'];
  const [activeTags, setActiveTags] = useState(new Set());
  const [duration, setDuration] = useState('any');

  const toggleTag = (tag) => {
    setActiveTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return films.filter(f => {
      // Duration filter (using demo/fallback duration minutes)
      const d = f.duration ?? f.duracion ?? 0;
      if (duration === 'lt5' && !(d < 5)) return false;
      if (duration === '5to15' && !(d >= 5 && d <= 15)) return false;
      if (duration === 'gt15' && !(d > 15)) return false;

      // Tags filter (demo: match by title keywords when tags selected)
      if (activeTags.size > 0) {
        const title = (f.title || '').toLowerCase();
        const hasMatch = [...activeTags].some(t => title.includes(t.toLowerCase()));
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [films, duration, activeTags]);

  // Build a gallery of asset images to rotate through for visual variety.
  const assetGallery = [
    '/assets/pexels-amar-29656074.jpg',
    '/assets/pexels-jillyjillystudio-33962662.jpg',
    '/assets/pexels-delot-29721171.jpg',
    '/assets/pexels-andreas-schnabl-1775843-19321355.jpg',
    '/assets/pexels-chriszwettler-9407824.jpg',
    '/assets/pexels-alvarobalderas-20747775.jpg',
    '/assets/pexels-kalistro666-29263909.jpg',
    '/assets/pexels-guillermo-berlin-1524368912-30068229.jpg',
  ];

  // Default placeholder if no assets resolve for any reason.
  const defaultPlaceholder = assetGallery[0];

  // Helper to pick an image for each card:
  // 1) Respect film-provided cover fields if they exist.
  // 2) Otherwise assign one from assetGallery, cycling by index.
  const pickPreviewImage = (film, index) => {
    const filmImage =
      film.cover_image ||
      film.cover ||
      film.coverUrl ||
      film.thumbnail ||
      film.thumbnailUrl ||
      film.poster ||
      null;

    if (filmImage) return filmImage;

    if (assetGallery.length === 0) return defaultPlaceholder;
    return assetGallery[index % assetGallery.length];
  };

  return (
    <div className="page-home">
      <div className="row" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Discover</h2>
        <div className="space" />
        <span className="pill">For you</span>
        <span className="pill">New</span>
        <span className="pill">Rising</span>
        <span className="pill">Awarded</span>
      </div>

      {/* Filters moved from sidebar into main content */}
      <div className="card section" role="region" aria-label="Filtros de videos">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong>Filters</strong>
          <span className="badge">New</span>
        </div>
        <div style={{ height: 8 }} />
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {TAGS.map((t) => {
            const active = activeTags.has(t);
            return (
              <button
                key={t}
                className="pill"
                aria-pressed={active}
                onClick={() => toggleTag(t)}
                style={{
                  margin: 4,
                  borderColor: active ? 'var(--cd-primary)' : 'var(--cd-border)',
                  boxShadow: active ? '0 6px 18px rgba(15,163,177,.22)' : 'none'
                }}
              >
                {active ? '✓ ' : ''}{t}
              </button>
            );
          })}
        </div>
        <div style={{ height: 12 }} />
        <label className="muted" style={{ fontSize: 13 }}>Duration</label>
        <select
          className="input"
          aria-label="Filter by duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          <option value="any">Any</option>
          <option value="lt5">&lt; 5 min</option>
          <option value="5to15">5 - 15 min</option>
          <option value="gt15">&gt; 15 min</option>
        </select>
      </div>

      <div style={{ height: 12 }} />

      <div className="film-grid">
        {filtered.map((f, idx) => (
          <FilmCard
            key={f.id}
            film={f}
            placeholderImage={defaultPlaceholder}
            previewImage={pickPreviewImage(f, idx)}
          />
        ))}
      </div>
    </div>
  );
}

// Demo films now include asset images for thumbnails/covers to showcase Discover previews.
const demoFilms = [
  {
    id: '1',
    title: 'Paper Boats',
    author: 'Liu Chen',
    likes: 312,
    duration: 7,
    thumbnail: '/assets/pexels-jillyjillystudio-33962662.jpg'
  },
  {
    id: '2',
    title: 'Under Neon',
    author: 'Samir Khan',
    likes: 922,
    duration: 12,
    cover: '/assets/pexels-delot-29721171.jpg'
  },
  {
    id: '3',
    title: 'Glass Orchard',
    author: 'Ivy Gomez',
    likes: 154,
    duration: 5,
    coverUrl: '/assets/pexels-andreas-schnabl-1775843-19321355.jpg'
  },
  {
    id: '4',
    title: 'Tides',
    author: 'Mika Ito',
    likes: 708,
    duration: 9,
    poster: '/assets/pexels-chriszwettler-9407824.jpg'
  },
  {
    id: '5',
    title: 'Static',
    author: 'Jon Ruiz',
    likes: 421,
    duration: 15,
    thumbnailUrl: '/assets/pexels-alvarobalderas-20747775.jpg'
  },
  {
    id: '6',
    title: 'Driftwood',
    author: 'R. Okoye',
    likes: 267,
    duration: 8,
    // intentionally no image to exercise placeholder
  },
  {
    id: '7',
    title: 'Echo Street',
    author: 'Sara Ali',
    likes: 581,
    duration: 6,
    cover_image: '/assets/pexels-kalistro666-29263909.jpg'
  },
  {
    id: '8',
    title: 'Dust to Light',
    author: 'Ana Costa',
    likes: 835,
    duration: 14,
    thumbnail: '/assets/pexels-guillermo-berlin-1524368912-30068229.jpg'
  },
];
