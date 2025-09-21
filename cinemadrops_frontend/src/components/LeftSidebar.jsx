import React from 'react';

/**
 * PUBLIC_INTERFACE
 * LeftSidebar is currently minimal; previous "Browse" shortcuts were removed.
 */
export default function LeftSidebar() {
  return (
    <>
      {/* Sidebar intentionally minimal after removing 'Browse' */}
      <div className="card section">
        <div className="muted" style={{ fontSize: 14 }}>
          Sidebar
        </div>
      </div>
    </>
  );
}
