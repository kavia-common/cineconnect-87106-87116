import React from 'react';

/**
 * PUBLIC_INTERFACE
 * LeftSidebar now focuses on auxiliary content (filters moved to main content).
 */
export default function LeftSidebar() {
  return (
    <>
      <div className="card section">
        <strong>Browse</strong>
        <div style={{ height: 8 }} />
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <span className="pill" style={{ margin: 4 }}>Genres</span>
          <span className="pill" style={{ margin: 4 }}>Staff Picks</span>
          <span className="pill" style={{ margin: 4 }}>Awarded</span>
          <span className="pill" style={{ margin: 4 }}>Indie</span>
        </div>
      </div>
    </>
  );
}
