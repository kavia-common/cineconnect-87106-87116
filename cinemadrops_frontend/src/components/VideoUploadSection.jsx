import React, { useMemo, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * VideoUploadSection renders a playful UI form for uploading a short film video with
 * metadata fields: name, author, genre (toggle), and rating. It manages local state
 * only and does not perform any backend calls.
 */
export default function VideoUploadSection() {
  const genreOptions = useMemo(() => ['Drama', 'Comedy', 'Documentary', 'Sci‑Fi', 'Animation'], []);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState(genreOptions[0]);
  const [rating, setRating] = useState(3);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    setSubmitted(false);
    if (!f) {
      setFile(null);
      setPreviewUrl('');
      return;
    }
    setFile(f);
    // For video, createObjectURL for simple preview. Note: Blob URLs should be revoked when replaced.
    const url = URL.createObjectURL(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(url);
  };

  const onSelectGenre = (g) => {
    setSubmitted(false);
    setGenre(g);
  };

  const onReset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setName('');
    setAuthor('');
    setGenre(genreOptions[0]);
    setRating(3);
    setSubmitted(false);
    inputRef.current && (inputRef.current.value = '');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // No backend yet — simulate submit and display a local confirmation
    setSubmitted(true);
  };

  const isValid = file && name.trim() && author.trim() && genre;

  return (
    <div className="card section" aria-label="Upload a new video">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Upload a Video</strong>
        <span className="badge">New</span>
      </div>

      <div style={{ height: 12 }} />

      <form onSubmit={onSubmit}>
        <div className="row" style={{ gap: 16, alignItems: 'stretch', flexWrap: 'wrap' }}>
          {/* Left: Video preview / picker */}
          <div style={{ flex: '1 1 320px', minWidth: 260 }}>
            <div
              className="card"
              style={{
                padding: 12,
                borderRadius: 'var(--cd-radius)',
                border: '1px dashed var(--cd-border)',
                background: '#fff',
              }}
            >
              <div style={{ aspectRatio: '16/9', background: '#eef6f7', borderRadius: 12, overflow: 'hidden' }}>
                {previewUrl ? (
                  <video
                    src={previewUrl}
                    controls
                    style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'var(--cd-gradient)',
                      color: '#3a2f58',
                      fontWeight: 800,
                    }}
                  >
                    Drop or Select Video
                  </div>
                )}
              </div>
              <div style={{ height: 10 }} />
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={onPickFile}
                aria-label="Choose video file"
                className="input"
              />
              {file && (
                <div className="row" style={{ marginTop: 8, justifyContent: 'space-between' }}>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {file.name} • {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <button type="button" className="pill" onClick={onReset}>
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Metadata form */}
          <div style={{ flex: '1 1 380px', minWidth: 280 }}>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="muted" style={{ fontSize: 13 }}>
                  Name
                </label>
                <input
                  className="input"
                  placeholder="e.g., Paper Boats"
                  value={name}
                  onChange={(e) => {
                    setSubmitted(false);
                    setName(e.target.value);
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="muted" style={{ fontSize: 13 }}>
                  Author
                </label>
                <input
                  className="input"
                  placeholder="e.g., Liu Chen"
                  value={author}
                  onChange={(e) => {
                    setSubmitted(false);
                    setAuthor(e.target.value);
                  }}
                />
              </div>
            </div>

            <div style={{ height: 12 }} />

            <div>
              <label className="muted" style={{ fontSize: 13 }}>
                Genre
              </label>
              <div className="row" style={{ flexWrap: 'wrap' }}>
                {genreOptions.map((g) => {
                  const selected = g === genre;
                  return (
                    <button
                      type="button"
                      key={g}
                      onClick={() => onSelectGenre(g)}
                      className="pill"
                      aria-pressed={selected}
                      style={{
                        margin: 4,
                        background: selected ? 'var(--cd-primary)' : '#fff',
                        color: selected ? '#fff' : 'inherit',
                        boxShadow: selected ? '0 8px 24px rgba(15, 163, 177, 0.25)' : 'none',
                        borderColor: selected ? 'transparent' : 'var(--cd-border)',
                      }}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ height: 12 }} />

            <div>
              <label className="muted" style={{ fontSize: 13 }}>
                Rating
              </label>
              <div className="row" style={{ alignItems: 'center' }}>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={rating}
                  onChange={(e) => {
                    setSubmitted(false);
                    setRating(parseInt(e.target.value, 10));
                  }}
                  aria-label="Rating from 1 to 5"
                  style={{ flex: 1 }}
                />
                <div className="pill" aria-label={`Current rating: ${rating} stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} aria-hidden="true">{i < rating ? '★' : '☆'}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ height: 16 }} />

            <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn secondary" onClick={onReset}>
                Clear
              </button>
              <button type="submit" className="btn" disabled={!isValid} aria-disabled={!isValid}>
                Save Draft
              </button>
            </div>

            {submitted && (
              <div
                className="pill"
                role="status"
                style={{
                  marginTop: 10,
                  background: '#f2fafb',
                  color: '#0f6c77',
                  borderColor: '#d8eef0',
                  fontWeight: 700,
                }}
              >
                Draft saved locally (no backend yet)
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
