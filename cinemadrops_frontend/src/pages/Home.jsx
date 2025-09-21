import React from 'react';
import Discover from './Discover';

/**
 * PUBLIC_INTERFACE
 * Home renders the Discover feed from the backend.
 * Filters UI previously present has been replaced with the Discover component that fetches S3 videos.
 */
export default function Home() {
  return (
    <div className="page-home">
      <Discover />
    </div>
  );
}
