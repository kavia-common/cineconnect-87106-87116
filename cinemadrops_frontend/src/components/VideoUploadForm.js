import React, { useMemo, useState } from 'react';
import VideoUpload from './VideoUpload';
import { useApi } from '../services/Api';

/**
 * PUBLIC_INTERFACE
 * VideoUploadForm is a reusable component that contains:
 * - Video upload to Firebase Storage (via child VideoUpload)
 * - Metadata form (name, creator, categories, rated)
 * - Submission to backend via POST /videos
 *
 * Props:
 * - onSuccess?: function(createdVideo) -> void
 *   Called when metadata is successfully saved to the backend.
 *
 * Notes:
 * - This component manages all related state internally for modularity.
 * - Categories input is a comma-separated string, normalized to an array.
 */
export default function VideoUploadForm({ onSuccess }) {
  const { post } = useApi();

  // Upload state from child
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadMeta, setUploadMeta] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [creator, setCreator] = useState('');
  const [categories, setCategories] = useState(''); // comma-separated
  const [rated, setRated] = useState('');

  // Save status flags
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const disabledSave = useMemo(() => {
    return !videoUrl || !name.trim() || !creator.trim() || !rated.trim();
  }, [videoUrl, name, creator, rated]);

  const handleUploaded = (url, meta) => {
    setVideoUrl(url);
    setUploadMeta(meta || null);
  };

  const onSave = async () => {
    if (disabledSave) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const cats = categories
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      // Backend expects: { videoUrl, name, creator, categories, rated, dislikes?, likes?, loves? }
      const payload = {
        videoUrl,
        name: name.trim(),
        creator: creator.trim(),
        categories: cats,
        rated: rated.trim(),
        // Counters are optional; backend defaults to 0, but we can be explicit if desired:
        dislikes: 0,
        likes: 0,
        loves: 0,
        // Optional upload metadata for informational purposes
        uploadMeta,
      };

      const created = await post('/videos', payload);
      setSaveSuccess(true);
      if (typeof onSuccess === 'function') {
        onSuccess(created);
      }
    } catch (e) {
      setSaveError(e?.message || 'Failed to save metadata.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-upload">
      <div className="card section" style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Upload a Short Film</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Add your video, fill in details, and share it with the community.
        </p>
      </div>

      <div style={{ height: 16 }} />

      <VideoUpload onUploaded={handleUploaded} />

      <div style={{ height: 16 }} />

      <div className="card section" style={{ display: 'grid', gap: 10 }}>
        <strong>Details</strong>
        <div className="row">
          <label className="pill" style={{ minWidth: 120 }}>Name</label>
          <input
            className="input"
            placeholder="e.g., Moonlit Alley"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="row">
          <label className="pill" style={{ minWidth: 120 }}>Creator</label>
          <input
            className="input"
            placeholder="e.g., Ava Reynolds"
            value={creator}
            onChange={e => setCreator(e.target.value)}
          />
        </div>
        <div className="row">
          <label className="pill" style={{ minWidth: 120 }}>Categories</label>
          <input
            className="input"
            placeholder="Comma-separated, e.g., Drama, Festival, #award"
            value={categories}
            onChange={e => setCategories(e.target.value)}
          />
        </div>
        <div className="row">
          <label className="pill" style={{ minWidth: 120 }}>Rated</label>
          <select
            className="input"
            value={rated}
            onChange={e => setRated(e.target.value)}
          >
            <option value="">Select rating</option>
            <option value="G">G — General Audiences</option>
            <option value="PG">PG — Parental Guidance</option>
            <option value="PG-13">PG-13 — Parents Strongly Cautioned</option>
            <option value="R">R — Restricted</option>
            <option value="NC-17">NC-17 — Adults Only</option>
            <option value="NR">NR — Not Rated</option>
          </select>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <button
            className="btn"
            onClick={onSave}
            disabled={disabledSave || saving}
          >
            {saving ? 'Saving...' : 'Save metadata'}
          </button>
          {videoUrl ? (
            <span className="pill" title={videoUrl} style={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Video URL ready ✓
            </span>
          ) : (
            <span className="pill">Upload a video to enable saving</span>
          )}
        </div>

        {saveSuccess && (
          <div className="pill" style={{ borderColor: '#d0f0d6', background: '#f1fff4', color: '#0f7d31' }}>
            Saved! Your film metadata has been recorded.
          </div>
        )}
        {saveError && (
          <div className="pill" style={{ borderColor: '#f7c6c6', background: '#fff5f5', color: '#b00020' }}>
            {saveError}
          </div>
        )}
      </div>
    </div>
  );
}
