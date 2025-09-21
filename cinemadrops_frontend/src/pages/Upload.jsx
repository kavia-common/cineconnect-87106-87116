import React from 'react';
import { VideoUploadSection } from '../components';

/**
 * PUBLIC_INTERFACE
 * Upload page renders the Video Upload Section in its own dedicated route.
 * Mantiene la interfaz en español y respeta el tema actual (claro/oscuro).
 */
export default function Upload() {
  return (
    <div className="page-upload">
      <VideoUploadSection />
    </div>
  );
}
