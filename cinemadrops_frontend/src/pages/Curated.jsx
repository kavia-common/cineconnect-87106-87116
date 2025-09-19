import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Curated highlights handpicked lists and staff picks.
 */
export default function Curated() {
  const lists = [
    { id: 'l1', title: 'Staff Picks: Joyful Shorts', count: 12 },
    { id: 'l2', title: 'Bold Debuts under 10 min', count: 15 },
    { id: 'l3', title: 'Inventive Animation', count: 10 },
  ];
  return (
    <div className="page-curated">
      <div className="card section">
        <h2 style={{ margin: 0 }}>Curated</h2>
        <p className="muted">Delightful picks across genres, themes, and styles.</p>
        <div style={{ height: 8 }} />
        {lists.map(l => (
          <div key={l.id} className="row" style={{ justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--cd-border)' }}>
            <span>{l.title}</span>
            <span className="pill">{l.count} films</span>
          </div>
        ))}
      </div>
    </div>
  );
}
