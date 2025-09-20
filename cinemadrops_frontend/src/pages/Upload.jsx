import React, { useEffect, useMemo, useState } from 'react';
import { listVideos, uploadVideo } from '../services/AwsVideos';
import { useReactions } from '../services/Reactions';

/**
 * PUBLIC_INTERFACE
 * Upload page: allows uploading new videos via AWS API Gateway and lists available videos from the same API.
 * Competition/Challenge selection is optional.
 */
export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [videos, setVideos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Competition state (optional)
  const [competitionId, setCompetitionId] = useState('');
  const [competitionName, setCompetitionName] = useState('');
  const [useCustomCompetition, setUseCustomCompetition] = useState(false);

  // Mock competitions; could be loaded by API in the future.
  const competitions = useMemo(() => ([
    { id: 'weekly-unexpected-kindness', name: 'Weekly: Unexpected Kindness' },
    { id: 'one-room-story', name: 'Weekly: One Room Story' },
    { id: 'staff-picks', name: 'Curated: Staff Picks' },
    { id: 'festival-spring', name: 'Festival: Spring Shorts' },
  ]), []);

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

    // Validation: competition is optional; validate only file or title presence
    if (!file && !title) {
      setError('Please select a file or provide a title.');
      return;
    }

    try {
      setSubmitting(true);
      await uploadVideo({
        file,
        title,
        description,
        // Only include competition info if provided; service ignores empty values
        competitionId: useCustomCompetition ? undefined : competitionId,
        competitionName: useCustomCompetition ? competitionName : (competitions.find(c => c.id === competitionId)?.name || ''),
      });
      // clear form and refresh
      setFile(null);
      setTitle('');
      setDescription('');
      setCompetitionId('');
      setCompetitionName('');
      setUseCustomCompetition(false);
      await refresh();
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const { getReaction, setReaction } = useReactions();
  const options = useMemo(() => ([
    { key: 'dislike', label: 'Dislike', icon: '👎', color: 'var(--cd-error)' },
    { key: 'like', label: 'Like', icon: '👍', color: 'var(--cd-primary)' },
    { key: 'love', label: 'Love', icon: '❤️', color: '#e83e8c' },
    { key: 'life changing', label: 'Life Changing', icon: '🌟', color: 'var(--cd-secondary)' },
  ]), []);

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

          <div className="card section" style={{ background: '#fffefd' }}>
            <strong>Competition (optional)</strong>
            <div style={{ height: 8 }} />
            <div className="row" role="group" aria-label="Competition selection mode">
              <label className="pill" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="comp-mode"
                  checked={!useCustomCompetition}
                  onChange={() => setUseCustomCompetition(false)}
                  style={{ marginRight: 8 }}
                />
                Choose from list
              </label>
              <label className="pill" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="comp-mode"
                  checked={useCustomCompetition}
                  onChange={() => setUseCustomCompetition(true)}
                  style={{ marginRight: 8 }}
                />
                Enter custom
              </label>
            </div>
            <div style={{ height: 8 }} />

            {!useCustomCompetition ? (
              <div className="row">
                <select
                  className="input"
                  value={competitionId}
                  onChange={(e) => setCompetitionId(e.target.value)}
                  aria-label="Select competition"
                >
                  <option value="">No competition</option>
                  {competitions.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="row">
                <input
                  className="input"
                  placeholder="Enter competition name (leave blank for none)"
                  value={competitionName}
                  onChange={(e) => setCompetitionName(e.target.value)}
                  aria-label="Competition name"
                />
              </div>
            )}
            <div style={{ height: 6 }} />
            <div className="muted" style={{ fontSize: 12 }}>
              You can upload without associating a competition. If provided, we will include competitionId/competitionName.
            </div>
          </div>

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
            const current = getReaction(id);

            const clickReact = (key) => {
              const next = current === key ? null : key;
              setReaction(id, next);
            };

            return (
              <div key={id} className="card film-card" style={{ textDecoration: 'none' }}>
                <div className="film-thumb">
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--cd-gradient)' }} />
                  <div className="badge">★ {likes} • ⏱ {duration}m</div>
                </div>
                <div className="film-meta">
                  <div className="film-title">{title}</div>
                  <div className="film-author">by {author}</div>
                  <div style={{ height: 8 }} />
                  <div className="reactions-row" role="group" aria-label={`React to ${title}`}>
                    {options.map(opt => {
                      const active = current === opt.key;
                      return (
                        <button
                          key={opt.key}
                          className={`reaction-btn ${active ? 'active' : ''}`}
                          onClick={() => clickReact(opt.key)}
                          aria-pressed={active}
                          aria-label={`${opt.label}${active ? ' (selected)' : ''}`}
                          title={opt.label}
                          style={{
                            borderColor: active ? opt.color : 'var(--cd-border)',
                            color: active ? opt.color : 'inherit'
                          }}
                          type="button"
                        >
                          <span className="reaction-icon" aria-hidden="true">{opt.icon}</span>
                          <span className="reaction-label" role="tooltip">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
