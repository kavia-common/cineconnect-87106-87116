import React, { useMemo, useState } from 'react';
import { useApi } from '../services/Api';
import FilmCard from '../components/FilmCard';
import FiltersBar from '../components/FiltersBar';

/**
 * PUBLIC_INTERFACE
 * Home displays the discover feed and film grid.
 * Now includes a collapsible FiltersBar above the grid.
 */
export default function Home() {
  const { useFetch } = useApi();
  const { data: films } = useFetch('/films', { fallbackData: demoFilms });

  // Local UI-only filtering (client-side) for a playful preview.
  // Backend integration can later map FiltersBar onChange to API query params.
  const [filters, setFilters] = useState({ tags: [], duration: 'any' });

  const filtered = useMemo(() => {
    // Since demoFilms lack genres, we'll only apply duration as a demo
    // In a real integration, apply tags when film.genres/tags is available.
    return (films || []).filter(f => {
      const d = Number(f.duration) || 0;
      if (filters.duration === 'lt5' && !(d < 5)) return false;
      if (filters.duration === '5to15' && !(d >= 5 && d <= 15)) return false;
      if (filters.duration === 'gt15' && !(d > 15)) return false;
      return true;
    });
  }, [films, filters]);

  return (
    <div className="page-home">
      <div className="container" style={{ padding: '0 0 12px 0' }}>
        <FiltersBar onChange={setFilters} />
      </div>
      <div className="discover-section card section" style={{ marginTop: 0 }}>
        <div className="film-grid">
          {filtered.map(f => <FilmCard key={f.id} film={f} />)}
        </div>
      </div>
    </div>
  );
}

const demoFilms = [
  { id: '1', title: 'Paper Boats', author: 'Liu Chen', likes: 312, duration: 7 },
  { id: '2', title: 'Under Neon', author: 'Samir Khan', likes: 922, duration: 12 },
  { id: '3', title: 'Glass Orchard', author: 'Ivy Gomez', likes: 154, duration: 5 },
  { id: '4', title: 'Tides', author: 'Mika Ito', likes: 708, duration: 9 },
  { id: '5', title: 'Static', author: 'Jon Ruiz', likes: 421, duration: 15 },
  { id: '6', title: 'Driftwood', author: 'R. Okoye', likes: 267, duration: 8 },
  { id: '7', title: 'Echo Street', author: 'Sara Ali', likes: 581, duration: 6 },
  { id: '8', title: 'Dust to Light', author: 'Ana Costa', likes: 835, duration: 14 },
];
