import React from 'react';

/**
 * PUBLIC_INTERFACE
 * LeftSidebar now only holds non-filter content (filters moved to Home page).
 * Keeping a friendly placeholder and room for future sidebar widgets.
 */
export default function LeftSidebar() {
  return (
    <>
      <div className="card section">
        <strong>Discover Tips</strong>
        <div style={{ height: 8 }} />
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li className="muted">Use the filters above the grid to refine by duration and vibe.</li>
          <li className="muted">Hover cards to see quick stats.</li>
          <li className="muted">Try the Curated tab for staff picks.</li>
        </ul>
      </div>
    </>
  );
}
