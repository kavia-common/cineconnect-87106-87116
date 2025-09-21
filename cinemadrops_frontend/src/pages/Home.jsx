import React from 'react';
import { useApi } from '../services/Api';
import FilmCard from '../components/FilmCard';
import { getCoverByIndex } from '../assets/images';

/**
 * PUBLIC_INTERFACE
 * Home displays the discover feed and film grid with responsive two-column layout and dropdown menus.
 */
export default function Home() {
  const { useFetch } = useApi();
  const { data: films } = useFetch('/films', { fallbackData: demoFilms });

  // Discover selector dropdown
  const [discoverOpen, setDiscoverOpen] = React.useState(false);
  const [discoverOption, setDiscoverOption] = React.useState('For you');
  const discoverRef = React.useRef(null);

  // Filters dropdown
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const filtersRef = React.useRef(null);
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [duration, setDuration] = React.useState('any');

  const discoverOptions = ['For you', 'New', 'Rising', 'Awarded', 'Trending'];
  const tags = ['Drama', 'Comedy', 'Sci-Fi', 'Documentary', 'Animation', 'Horror', 'Experimental'];

  // Close on outside click/escape
  React.useEffect(() => {
    const onDocClick = (e) => {
      if (discoverOpen && discoverRef.current && !discoverRef.current.contains(e.target)) {
        setDiscoverOpen(false);
      }
      if (filtersOpen && filtersRef.current && !filtersRef.current.contains(e.target)) {
        setFiltersOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setDiscoverOpen(false);
        setFiltersOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [discoverOpen, filtersOpen]);

  const toggleTag = (t) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  return (
    <div className="page-home">
      {/* Header row with two dropdown triggers */}
      <div className="row home-controls" style={{ marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Discover</h2>
        <div className="space" />
        {/* Discover selector dropdown */}
        <div
          className="dropdown"
          ref={discoverRef}
        >
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

        {/* Filters dropdown */}
        <div
          className="dropdown"
          ref={filtersRef}
        >
          <button
            className="pill dropdown-trigger"
            aria-haspopup="dialog"
            aria-expanded={filtersOpen}
            aria-controls="filters-menu"
            onClick={() => setFiltersOpen(v => !v)}
          >
            🎛 Filters
            <span aria-hidden="true">▾</span>
          </button>
          {filtersOpen && (
            <div
              id="filters-menu"
              role="dialog"
              aria-label="Filter films"
              className="dropdown-menu playful"
              style={{ width: 280 }}
            >
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Genres</div>
              <div className="row" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
                {tags.map(t => (
                  <button
                    key={t}
                    className={`pill chip ${selectedTags.includes(t) ? 'selected' : ''}`}
                    onClick={() => toggleTag(t)}
                    aria-pressed={selectedTags.includes(t)}
                    style={{ margin: 4 }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="muted" style={{ fontSize: 12, marginBottom: 6, marginTop: 6 }}>Duration</div>
              <label className="visually-hidden" htmlFor="duration-select">Duration</label>
              <select
                id="duration-select"
                className="input"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="any">Any</option>
                <option value="lt5">&lt; 5 min</option>
                <option value="5to15">5 - 15 min</option>
                <option value="gt15">&gt; 15 min</option>
              </select>

              <div style={{ height: 10 }} />
              <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                <button
                  className="btn secondary"
                  onClick={() => {
                    setSelectedTags([]);
                    setDuration('any');
                    setFiltersOpen(false);
                  }}
                >
                  Reset
                </button>
                <button
                  className="btn"
                  onClick={() => setFiltersOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Callout card */}
      <div className="card section" style={{ marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="muted">Are you a creator? Share your short with the community.</div>
          <a className="btn" href="/upload" aria-label="Go to upload">⬆️ Upload your short</a>
        </div>
      </div>

      {/* Two-column responsive layout: grid with main film grid + sidebar-like section */}
      <div className="discover-layout">
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

        <aside aria-label="Quick tags and promos" className="card section">
          <strong>Quick Picks</strong>
          <div style={{ height: 8 }} />
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {['#behindthescenes', '#script', '#newvoices', '#award', '#festival'].map(h => (
              <button
                key={h}
                className="pill chip"
                style={{ margin: 4 }}
                onClick={() => { /* optional hook-in */ }}
              >
                {h}
              </button>
            ))}
          </div>
          <div style={{ height: 12 }} />
          <div className="mini-promo">
            <div className="mini-visual" aria-hidden="true" />
            <div>
              <div style={{ fontWeight: 700 }}>Join Weekly Challenge</div>
              <div className="muted" style={{ fontSize: 12 }}>Theme: "Unexpected Kindness"</div>
              <div style={{ height: 8 }} />
              <a className="btn" href="/challenges">Participate</a>
            </div>
          </div>
        </aside>
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
