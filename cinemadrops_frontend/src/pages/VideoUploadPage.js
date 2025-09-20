import React from 'react';
import VideoUploadForm from '../components/VideoUploadForm';

/**
 * PUBLIC_INTERFACE
 * VideoUploadPage now delegates to the reusable VideoUploadForm component.
 * This page is intentionally thin to keep concerns separated.
 */
export default function VideoUploadPage() {
  const handleSuccess = (createdVideo) => {
    // You can navigate or show a toast here in future.
    // For now, this is a no-op placeholder.
    // console.log('Created video:', createdVideo);
  };

  return <VideoUploadForm onSuccess={handleSuccess} />;
}
