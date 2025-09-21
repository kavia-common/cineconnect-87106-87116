import React, { useId, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * FiltersBar renders a playful, collapsible set of discovery filters.
 * It is designed to sit above the film grid in the Discover (Home) page.
 *
 * Props:
 * - onChange: function(filters) -> void (optional). Called whenever a filter is changed.
 *   filters = { tags: string[], duration: 'any'|'lt5'|'5to15'|'gt15' }
 */
export default function FiltersBar({ onChange }) {
  const tags = ['Drama', 'Comedy', 'Sci-Fi', 'Documentary', 'Animation', 'Horror', 'Experimental'];

  const [open, setOpen] = useState(true);
  const [activeTags, setActiveTags] = useState([]);
  const [duration, setDuration] = useState('any');

  const contentId = useId();
  const labelId = `${contentId}-label`;

  const toggle = () => setOpen((v) => !v);

  const emit = (next) => {
    onChange?.(next);
  };

  const toggleTag = (t) => {
    const next = activeTags.includes(t) ? activeTags.filter(x => x !== t) : [...activeTags, t];
    setActiveTags(next);
    emit({ tags: next, duration });
  };

  const onChangeDuration = (e) => {
    const val = e.target.value;
    setDuration(val);
    emit({ tags: activeTags, duration: val });
  };

  return (
    <div className="card section" style={{ padding: 12, margin: 0 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="row" style={{ gap: 8 }}>
          <strong id={labelId}>Filters</strong>
          <span className="badge">New</span>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {activeTags.length > 0 && (
            <span className="pill" title="Active tags">{activeTags.join(', ')}</span>
          )}
          {duration !== 'any' && (
            <span className="pill" title="Duration filter">⏱ {durationLabel(duration)}</span>
          )}
          <button
            className="pill"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={contentId}
            aria-labelledby={labelId}
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
      </div>

      <div
        id={contentId}
        role="region"
        aria-labelledby={labelId}
        style={{
          overflow: 'hidden',
          transition: 'max-height .25s ease, opacity .25s ease',
          maxHeight: open ? 600 : 0,
          opacity: open ? 1 : 0
        }}
      >
        <div style={{ height: 8 }} />
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {tags.map((t) => {
            const active = activeTags.includes(t);
            return (
              <button
                key={t}
                className="pill"
                onClick={() => toggleTag(t)}
                aria-pressed={active}
                style={{
                  margin: 4,
                  borderColor: active ? 'var(--cd-primary)' : 'var(--cd-border)',
                  boxShadow: active ? '0 6px 18px rgba(15,163,177,0.20)' : 'none',
                  background: active ? 'rgba(15,163,177,0.10)' : 'var(--cd-chip-bg)',
                  fontWeight: 700,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div style={{ height: 12 }} />
        <div style={{ display: 'grid', gap: 6, maxWidth: 240 }}>
          <label className="muted" style={{ fontSize: 13 }} htmlFor={`${contentId}-duration`}>
            Duration
          </label>
          <select
            id={`${contentId}-duration`}
            className="input"
            value={duration}
            onChange={onChangeDuration}
            aria-label="Filter by duration"
          >
            <option value="any">Any</option>
            <option value="lt5">&lt; 5 min</option>
            <option value="5to15">5 - 15 min</option>
            <option value="gt15">&gt; 15 min</option>
          </select>
        </div>
        <div style={{ height: 4 }} />
      </div>
    </div>
  );
}

function durationLabel(value) {
  switch (value) {
    case 'lt5': return '< 5 min';
    case '5to15': return '5 - 15 min';
    case 'gt15': return '> 15 min';
    default: return 'Any';
  }
}
