import React from 'react';
import Discover from './Discover';

/**
 * PUBLIC_INTERFACE
 * Home renders the Discover feed from the backend.
 * Uses the real AWS Lambda-backed GET /videos_shortfilms via Discover component.
 */
export default function Home() {
  return (
    <div className="page-home">
      <Discover />
    </div>
  );
}
