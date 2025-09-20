import React from 'react';
import VideoUploadSection from '../components/VideoUploadSection';

/**
 * PUBLIC_INTERFACE
 * Upload is a dedicated page for uploading new short film videos.
 * It wraps the VideoUploadSection and provides page-level structure.
 */
export default function Upload() {
  return (
    <div className="page-upload">
      <div className="row" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Upload</h2>
        <div className="space" />
        <span className="pill">Video</span>
        <span className="pill">Metadata</span>
        <span className="pill">Draft</span>
      </div>

      <VideoUploadSection />
    </div>
  );
}
