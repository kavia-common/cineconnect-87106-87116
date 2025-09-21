import React from 'react';
import { useApi } from '../services/Api';
import FilmCard from '../components/FilmCard';
import VideoUploadSection from '../components/VideoUploadSection';

/**
 * PUBLIC_INTERFACE
 * Home displays the discover feed and film grid.
 */
export default function Home() {
  const { useFetch } = useApi();
  const { data: films } = useFetch('/films', { fallbackData: demoFilms });

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

      {/* Video upload and listing section visible on entry */}
      <div style={{ marginBottom: 16 }}>
        <VideoUploadSection />
      </div>

      <div className="film-grid">
        {films.map(f => <FilmCard key={f.id} film={f} />)}
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
