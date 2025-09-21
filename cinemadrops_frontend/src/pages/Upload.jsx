import React, { useRef, useState } from 'react';
import { useApi } from '../services/Api';

/**
 * PUBLIC_INTERFACE
 * Upload provides a playful UI to upload user's short film with progress and success/error feedback.
 * Supports common video formats: mp4, avi, mov, webm, mkv.
 */
export default function Upload() {
  const { base } = useApi();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [error, setError] = useState('');

  const allowed = '.mp4,.avi,.mov,.webm,.mkv';

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError('');
    setProgress(0);
    setStatus('idle');
  };

  // PUBLIC_INTERFACE
  async function uploadVideo() {
    /** Uploads the selected video file and metadata using multipart/form-data to /uploads/videos */
    if (!file) {
      setError('Please select a video file.');
      return;
    }
    if (!title.trim()) {
      setError('Please add a title.');
      return;
    }
    setError('');
    setStatus('uploading');
    setProgress(5);

    try {
      // Using XMLHttpRequest to track upload progress (fetch doesn't expose it natively)
      const form = new FormData();
      form.append('file', file);
      form.append('title', title);
      form.append('description', description);

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${base}/uploads/videos`);
        xhr.withCredentials = true;

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setProgress(Math.max(10, pct));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve(xhr.responseText);
          } else {
            reject(new Error(xhr.responseText || `Upload failed with ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error while uploading'));
        xhr.send(form);
      });

      setStatus('success');
      // Reset after a bit while keeping success state visible
      setTimeout(() => {
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
        setTitle('');
        setDescription('');
        setProgress(0);
      }, 1200);
    } catch (e) {
      setStatus('error');
      setError(e.message || 'Upload failed. Please try again.');
    }
  }

  return (
    <div className="page-upload">
      <div className="card section">
        <h2 style={{ margin: 0 }}>Upload your short</h2>
        <p className="muted">Share your story with the community. Keep it playful and inspiring!</p>

        <div style={{ height: 12 }} />

        <div className="row" style={{ gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: 16, flex: '1 1 320px', minWidth: 280 }}>
            <strong>Video File</strong>
            <div style={{ height: 8 }} />
            <input
              ref={inputRef}
              type="file"
              accept={allowed}
              onChange={onFileChange}
              className="input"
              aria-label="Select video file"
            />
            <div style={{ height: 8 }} />
            <div className="muted" style={{ fontSize: 12 }}>
              Accepted: mp4, avi, mov, webm, mkv
            </div>
            {file && (
              <div className="pill" style={{ marginTop: 8, display: 'inline-flex' }}>
                🎬 {file.name} <span className="muted">({Math.round(file.size / 1024 / 1024)} MB)</span>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 16, flex: '2 1 480px', minWidth: 320 }}>
            <strong>Details</strong>
            <div style={{ height: 8 }} />
            <input
              className="input"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Title"
            />
            <div style={{ height: 8 }} />
            <textarea
              className="input"
              placeholder="Description (optional)"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Description"
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={{ height: 12 }} />
        {status === 'uploading' && (
          <div className="card" style={{ padding: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span>Uploading...</span>
              <span className="badge">{progress}%</span>
            </div>
            <div style={{ height: 8 }} />
            <div style={{ width: '100%', height: 10, background: '#eef3f4', borderRadius: 999 }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'var(--cd-primary)',
                  transition: 'width .2s ease',
                }}
              />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="card" style={{ padding: 12, borderColor: '#e6f7ec' }}>
            <div className="row" style={{ color: 'var(--cd-text)' }}>
              <span style={{ fontSize: 20 }}>🎉</span>
              <strong>Upload complete!</strong>
              <span className="pill" style={{ background: '#f4fff7', borderColor: '#e6f7ec' }}>
                Your film is processing...
              </span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="card" style={{ padding: 12, borderColor: '#ffe9e6' }}>
            <div className="row" style={{ color: 'var(--cd-error)' }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <strong>Upload failed</strong>
              <span className="muted">{error}</span>
            </div>
          </div>
        )}

        <div style={{ height: 12 }} />
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={uploadVideo} aria-label="Upload">
            ⬆️ Upload
          </button>
          <button
            className="btn secondary"
            onClick={() => {
              setFile(null);
              if (inputRef.current) inputRef.current.value = '';
              setTitle('');
              setDescription('');
              setProgress(0);
              setStatus('idle');
              setError('');
            }}
            aria-label="Reset form"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
