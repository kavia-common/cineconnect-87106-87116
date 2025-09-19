import React from 'react';

/**
 * PUBLIC_INTERFACE
 * LeftSidebar shows playful filter controls and discovery tags.
 */
export default function LeftSidebar() {
  const tags = ['Drama', 'Comedy', 'Sci-Fi', 'Documentary', 'Animation', 'Horror', 'Experimental'];
  return (
    <>
      <div className="card section">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong>Filters</strong>
          <span className="badge">New</span>
        </div>
        <div style={{ height: 8 }} />
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {tags.map(t => (
            <button key={t} className="pill" style={{ margin: 4 }}>{t}</button>
          ))}
        </div>
        <div style={{ height: 12 }} />
        <label className="muted" style={{ fontSize: 13 }}>Duration</label>
        <select className="input" defaultValue="any">
          <option value="any">Any</option>
          <option value="lt5">&lt; 5 min</option>
          <option value="5to15">5 - 15 min</option>
          <option value="gt15">&gt; 15 min</option>
        </select>
      </div>

      <div className="card section">
        <strong>Discover</strong>
        <div style={{ height: 10 }} />
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {['#behindthescenes', '#script', '#newvoices', '#award', '#festival'].map(h => (
            <span key={h} className="pill" style={{ margin: 4 }}>{h}</span>
          ))}
        </div>
      </div>
    </>
  );
}
