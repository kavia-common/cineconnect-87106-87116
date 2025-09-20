import React, { useEffect, useState } from 'react';
import { listVideos, uploadVideo } from '../services/AwsVideos';

/**
 * PUBLIC_INTERFACE
 * Upload page: allows uploading new videos via AWS API Gateway and lists available videos from the same API.
 */
export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [videos, setVideos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    try {
      setRefreshing(true);
      const data = await listVideos();
      // Accept either array or object shape
      if (Array.isArray(data)) setVideos(data);
      else if (data && Array.isArray(data.items)) setVideos(data.items);
      else setVideos([]);
    } catch (e) {
      setError(e.message || 'Failed to fetch videos');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file && !title) {
      setError('Please select a file or provide a title.');
      return;
    }
    try {
      setSubmitting(true);
      await uploadVideo({ file, title, description });
      // clear form and refresh
      setFile(null);
      setTitle('');
      setDescription('');
      await refresh();
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-upload">
      <div className="card section">
        <h2 style={{ margin: 0 }}>Upload Video</h2>
        <p className="muted">Post a new short film to Cinemadrops via AWS API.</p>
        <div style={{ height: 10 }} />
        <form onSubmit={onSubmit}>
          <div className="row">
            <input
              className="input"
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              aria-label="Video file"
            />
            <input
              className="input"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Title"
            />
          </div>
          <div style={{ height: 10 }} />
          <textarea
            className="input"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            aria-label="Description"
            style={{ width: '100%', resize: 'vertical' }}
          />
          <div style={{ height: 10 }} />
          <div className="row">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Uploading...' : 'Upload'}
            </button>
            <button className="btn secondary" type="button" onClick={refresh} disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh List'}
            </button>
            {error && <span className="muted" role="alert" style={{ color: 'var(--cd-error)' }}>{error}</span>}
          </div>
        </form>
      </div>

      <div style={{ height: 16 }} />

      <div className="card section">
        <strong>Videos</strong>
        <div style={{ height: 8 }} />
        {videos.length === 0 && <div className="muted">No videos yet.</div>}
        <div className="film-grid">
          {videos.map((v, idx) => {
            const id = v.id || v.key || v.videoKey || String(idx);
            const title = v.title || v.name || v.key || `Video ${idx + 1}`;
            const author = v.author || v.owner || 'Anonymous';
            const likes = v.likes || v.stars || 0;
            const duration = v.duration || v.length || 0;
            return (
              <div key={id} className="card film-card" style={{ textDecoration: 'none' }}>
                <div className="film-thumb">
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--cd-gradient)' }} />
                  <div className="badge">★ {likes} • ⏱ {duration}m</div>
                </div>
                <div className="film-meta">
                  <div className="film-title">{title}</div>
                  <div className="film-author">by {author}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
