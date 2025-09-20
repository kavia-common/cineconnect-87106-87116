import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * QuickActionsDrawer offers shortcuts to key flows.
 */
export default function QuickActionsDrawer({ open, onClose }) {
  return (
    <div className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Quick actions drawer">
      <div className="drawer-header">
        <strong>Quick Actions</strong>
        <button className="pill" onClick={onClose}>Close</button>
      </div>
      <div className="drawer-body">
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn" to="/challenges" onClick={onClose}>⚡ Join Challenge</Link>
          <Link className="btn secondary" to="/curated" onClick={onClose}>🌟 Staff Picks</Link>
          <Link className="btn" to="/upload" onClick={onClose}>⬆️ Upload Short</Link>
          {/* Write Script option intentionally removed per requirements */}
        </div>
      </div>
    </div>
  );
}
