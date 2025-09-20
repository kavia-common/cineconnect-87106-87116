import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Usage:
 *   import VideoUpload from '../components/VideoUpload';
 *   <VideoUpload onUploaded={(url, metadata) => { console.log('Video URL:', url, metadata); }} />
 *
 * Requirements:
 * - Uses Firebase Storage instance from src/firebase.js
 * - Accepts only video files via input
 * - Uploads under the "videos/" folder in Firebase Storage
 * - Shows progress indicator, success download URL, and error text
 *
 * Notes:
 * - Ensure Firebase config is correctly set in src/firebase.js.
 * - For production, you should set appropriate Firebase Storage Security Rules.
 * - To save the URL in your backend DB, pass an onUploaded callback and persist the URL there.
 */

// PUBLIC_INTERFACE
export default function VideoUpload({ onUploaded, folder = 'videos', maxSizeMB = 1024 }) {
  /** Local UI state for file selection and upload lifecycle */
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const accept = useMemo(() => 'video/*', []);

  const onSelectFile = useCallback((e) => {
    setError('');
    setDownloadURL('');
    setProgress(0);
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      setFile(null);
      return;
    }
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`File is too large (${sizeMB.toFixed(1)} MB). Max allowed is ${maxSizeMB} MB.`);
      setFile(null);
      return;
    }
    setFile(f);
  }, [maxSizeMB]);

  const reset = useCallback(() => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setDownloadURL('');
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const startUpload = useCallback(() => {
    if (!file) return;
    setError('');
    setUploading(true);
    setProgress(0);

    // Build a unique path under "videos/". You may include user IDs or other context if needed.
    const timestamp = Date.now();
    // Sanitize filename a bit
    const cleanName = file.name.replace(/\s+/g, '_');
    const path = `${folder}/${timestamp}_${cleanName}`;

    const storageRef = ref(storage, path);
    const metadata = {
      contentType: file.type || 'video/mp4',
      customMetadata: {
        originalName: file.name,
      },
    };

    const task = uploadBytesResumable(storageRef, file, metadata);

    task.on('state_changed',
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(pct);
      },
      (err) => {
        console.error('Upload error:', err);
        setError(err?.message || 'Upload failed. Please try again.');
        setUploading(false);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          setDownloadURL(url);
          setUploading(false);
          // Provide callback for parent to use URL (save to DB, start playback, etc.)
          if (typeof onUploaded === 'function') {
            onUploaded(url, {
              path,
              contentType: metadata.contentType,
              size: file.size,
              name: file.name,
            });
          }
        } catch (e) {
          console.error('Error getting download URL:', e);
          setError(e?.message || 'Could not retrieve download URL.');
          setUploading(false);
        }
      }
    );
  }, [file, folder, onUploaded]);

  return (
    <div className="card section" style={{ display: 'grid', gap: 10 }}>
      <strong>Upload a Video</strong>
      <p className="muted" style={{ margin: 0 }}>
        Choose a video file to upload to Firebase Storage. URL will appear after a successful upload.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onSelectFile}
        aria-label="Video file input"
      />

      {file && (
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="pill" title={file.name} style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.name}
          </div>
          <div className="pill">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
        </div>
      )}

      <div className="row" style={{ gap: 8 }}>
        <button
          className="btn"
          onClick={startUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <button
          className="btn secondary"
          onClick={reset}
          disabled={uploading && !error}
          aria-label="Reset upload form"
        >
          Reset
        </button>
      </div>

      {uploading && (
        <div style={{ width: '100%' }}>
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
            Upload progress: {progress}%
          </div>
          <div style={{
            width: '100%',
            height: 10,
            background: '#f0f3f4',
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid var(--cd-border)'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'var(--cd-primary)',
              transition: 'width .2s ease'
            }} />
          </div>
        </div>
      )}

      {downloadURL && (
        <div style={{ display: 'grid', gap: 8 }}>
          <div className="pill" style={{ wordBreak: 'break-all' }}>
            Uploaded! URL: {downloadURL}
          </div>
          <video
            src={downloadURL}
            controls
            style={{ width: '100%', borderRadius: 12, background: '#000' }}
          />
        </div>
      )}

      {error && (
        <div className="pill" style={{ borderColor: '#f7c6c6', background: '#fff5f5', color: '#b00020' }}>
          {error}
        </div>
      )}
    </div>
  );
}
