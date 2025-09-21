import React from 'react';
import { useApi } from '../services/Api';
import FilmCard from '../components/FilmCard';
import { getCoverByIndex } from '../assets/images';

/**
 * PUBLIC_INTERFACE
 * Home displays only the discover feed/grid without quick tags or promos.
 */
export default function Home() {
  const { useFetch } = useApi();
  const { data: films } = useFetch('/films', { fallbackData: demoFilms });

  // Discover selector dropdown
  const [discoverOpen, setDiscoverOpen] = React.useState(false);
  const [discoverOption, setDiscoverOption] = React.useState('For you');
  const discoverRef = React.useRef(null);

  const discoverOptions = ['For you', 'New', 'Rising', 'Awarded', 'Trending'];

  // Close on outside click/escape
  React.useEffect(() => {
    const onDocClick = (e) => {
      if (discoverOpen && discoverRef.current && !discoverRef.current.contains(e.target)) {
        setDiscoverOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setDiscoverOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [discoverOpen]);

  return (
    <div className="page-home">
      {/* Header row with Discover selector only */}
      <div className="row home-controls" style={{ marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Discover</h2>
        <div className="space" />
        {/* Discover selector dropdown */}
        <div className="dropdown" ref={discoverRef}>
          <button
            className="pill dropdown-trigger"
            aria-haspopup="menu"
            aria-expanded={discoverOpen}
            aria-controls="discover-menu"
            onClick={() => setDiscoverOpen(v => !v)}
          >
            🌈 {discoverOption}
            <span aria-hidden="true">▾</span>
          </button>
          {discoverOpen && (
            <div
              id="discover-menu"
              role="menu"
              aria-label="Discover options"
              className="dropdown-menu playful"
            >
              {discoverOptions.map((opt) => (
                <button
                  key={opt}
                  role="menuitemradio"
                  aria-checked={discoverOption === opt}
                  className={`dropdown-item ${discoverOption === opt ? 'active' : ''}`}
                  onClick={() => {
                    setDiscoverOption(opt);
                    setDiscoverOpen(false);
                  }}
                >
                  {opt}
                  {discoverOption === opt && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Callout & Highlights moved from previous right sidebar */}
      <div className="row" style={{ gap: 16, alignItems: 'stretch', flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="card section" style={{ flex: '2 1 420px', minWidth: 280 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="muted">Are you a creator? Share your short with the community.</div>
            <a className="btn" href="/upload" aria-label="Go to upload">⬆️ Upload your short</a>
          </div>
        </div>

        <div className="card section" style={{ flex: '1 1 300px', minWidth: 260 }}>
          <strong>Weekly Challenge</strong>
          <div style={{ height: 8 }} />
          <div className="muted" style={{ fontSize: 14 }}>Theme: "Unexpected Kindness"</div>
          <div style={{ height: 10 }} />
          <a href="/challenges" className="btn">Join Challenge</a>
        </div>
      </div>

      <div className="row" style={{ gap: 16, alignItems: 'stretch', flexWrap: 'wrap', marginBottom: 12 }}>
        <div className="card section" style={{ flex: '1 1 380px', minWidth: 280 }}>
          <strong>Trending</strong>
          <div style={{ height: 10 }} />
          {[
            { id: 't1', title: 'Moonlit Alley', views: '12.4k' },
            { id: 't2', title: 'Paper Stars', views: '9.1k' },
            { id: 't3', title: 'Silent Notes', views: '7.7k' },
          ].map(t => (
            <a key={t.id} href={`/film/${t.id}`} className="row" style={{ justifyContent: 'space-between', padding: '8px 0' }}>
              <span>{t.title}</span>
              <span className="muted">👁 {t.views}</span>
            </a>
          ))}
        </div>

        <div className="card section" style={{ flex: '1 1 300px', minWidth: 260 }}>
          <strong>Top Creators</strong>
          <div style={{ height: 10 }} />
          {[
            { id: 'c1', name: 'Ava Reynolds' },
            { id: 'c2', name: 'Leo Park' },
            { id: 'c3', name: 'Nora Patel' },
          ].map(c => (
            <a key={c.id} href={`/creator/${c.id}`} className="pill" style={{ marginBottom: 8 }}>{c.name}</a>
          ))}
        </div>
      </div>

      {/* Main film grid only */}
      <section aria-label="Film results">
        <div className="film-grid">
          {films.map((f, i) => (
            <FilmCard
              key={f.id}
              film={f}
              index={i}
              image={getCoverByIndex(i)}
            />
          ))}
        </div>
      </section>
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
