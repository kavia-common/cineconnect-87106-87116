import React, { useId, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * LeftSidebar shows playful filter controls and discovery tags.
 * Now includes an accessible collapsible panel for Filters.
 */
export default function LeftSidebar() {
  const tags = ['Drama', 'Comedy', 'Sci-Fi', 'Documentary', 'Animation', 'Horror', 'Experimental'];

  // Collapsible state for Filters section
  const [open, setOpen] = useState(true);
  const contentId = useId(); // used for aria-controls (unique per render)

  const toggle = () => setOpen((v) => !v);

  return (
    <>
      <div className="card section">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="row" style={{ gap: 8 }}>
            <strong id={`${contentId}-label`}>Filters</strong>
            <span className="badge">New</span>
          </div>
          <button
            className="pill"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={contentId}
            aria-labelledby={`${contentId}-label`}
            title={open ? 'Hide filters' : 'Show filters'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {open ? 'Hide' : 'Show'}{' '}
            <span aria-hidden="true" style={{ display: 'inline-block', transform: `rotate(${open ? 180 : 0}deg)`, transition: 'transform .2s ease' }}>
              ▼
            </span>
          </button>
        </div>

        {/* Collapsible container with smooth height transition for better UX */}
        <div
          id={contentId}
          role="region"
          aria-labelledby={`${contentId}-label`}
          style={{
            overflow: 'hidden',
            transition: 'max-height .25s ease, opacity .25s ease',
            maxHeight: open ? 600 : 0,
            opacity: open ? 1 : 0
          }}
        >
          <div style={{ height: 8 }} />
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {tags.map((t) => (
              <button key={t} className="pill" style={{ margin: 4 }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ height: 12 }} />
          <label className="muted" style={{ fontSize: 13 }} htmlFor={`${contentId}-duration`}>
            Duration
          </label>
          <select id={`${contentId}-duration`} className="input" defaultValue="any" aria-label="Filter by duration">
            <option value="any">Any</option>
            <option value="lt5">&lt; 5 min</option>
            <option value="5to15">5 - 15 min</option>
            <option value="gt15">&gt; 15 min</option>
          </select>
          <div style={{ height: 4 }} />
        </div>
      </div>

      <div className="card section">
        <strong>Discover</strong>
        <div style={{ height: 10 }} />
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {['#behindthescenes', '#script', '#newvoices', '#award', '#festival'].map((h) => (
            <span key={h} className="pill" style={{ margin: 4 }}>
              {h}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
