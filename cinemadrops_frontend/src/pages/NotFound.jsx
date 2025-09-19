import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * NotFound displayed for unknown routes.
 */
export default function NotFound() {
  return (
    <div className="card section">
      <h2>Page not found</h2>
      <p className="muted">Oops! This page got lost in the edit room.</p>
      <Link className="btn" to="/">Back Home</Link>
    </div>
  );
}
