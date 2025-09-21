import React from 'react';
import { VideoUploadSection } from '../components';

/**
 * PUBLIC_INTERFACE
 * Upload page renders the Video Upload Section in its own dedicated route.
 * Keeps a playful style and respects current light/dark theme.
 */
export default function Upload() {
  return (
    <div className="page-upload">
      <VideoUploadSection />
    </div>
  );
}
