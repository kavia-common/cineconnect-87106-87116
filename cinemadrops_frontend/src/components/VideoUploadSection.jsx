import React, { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';

// Allowed types and sizes
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const API_ENDPOINT = 'https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops/videos_shortfilms';

/**
 * PUBLIC_INTERFACE
 * Section component to upload and list videos.
 * - Controlled inputs: name, genre, author, file.
 * - Drag & drop and manual selection with validation.
 * - Reads file as base64 data URL and uploads JSON payload to AWS endpoint.
 * - Progress indicator for file reading/upload.
 * - Success/error feedback and link to uploaded video.
 * - Fetches and displays uploaded videos with a manual refresh.
 */
export default function VideoUploadSection() {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('Drama');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState(null);

  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error'|'info', text: string, link?: string }
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const inputRef = useRef(null);

  const genres = useMemo(
    () => ['Drama', 'Comedy', 'Action', 'Documentary', 'Animation', 'Horror', 'Experimental', 'Sci-Fi'],
    []
  );

  const humanFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) return bytes + ' B';
    const units = ['KB', 'MB', 'GB', 'TB'];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
  };

  const validateAndSetVideo = (f) => {
    if (!f) return;
    if (!ALLOWED_VIDEO_TYPES.includes(f.type)) {
      setStatus({
        type: 'error',
        text: 'Unsupported file type. Please upload MP4, WebM, OGG, MOV, AVI or MKV.',
      });
      return;
    }
    if (f.size > MAX_VIDEO_SIZE) {
      setStatus({
        type: 'error',
        text: 'The file exceeds the maximum allowed size (100MB).',
      });
      return;
    }
    setStatus(null);
    setFile(f);
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    validateAndSetVideo(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) {
      const f = e.dataTransfer.files[0];
      validateAndSetVideo(f);
    }
  };

  const fetchList = async () => {
    try {
      setListLoading(true);
      const res = await fetch(API_ENDPOINT);
      let data;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = [];
        }
      }
      if (Array.isArray(data)) setList(data);
      else if (data && Array.isArray(data.items)) setList(data.items);
      else if (data && Array.isArray(data.data)) setList(data.data);
      else setList([]);
    } catch (e) {
      setStatus({ type: 'error', text: 'Error loading videos list.' });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleUpload = async () => {
    if (!name.trim() || !author.trim() || !file) {
      setStatus({ type: 'error', text: 'Complete required fields and select a video file.' });
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus({ type: 'info', text: 'Reading file...' });

    try {
      // Read as base64 Data URL (e.g. "data:video/mp4;base64,AAAA...")
      const fileAsDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setProgress(pct);
          }
        };
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Error reading the file.'));
        reader.readAsDataURL(file);
      });

      // Extract the base64 content part after the first comma, with fallback to the entire string
      let base64Content = '';
      if (typeof fileAsDataUrl === 'string') {
        const commaIdx = fileAsDataUrl.indexOf(',');
        base64Content = commaIdx >= 0 ? fileAsDataUrl.slice(commaIdx + 1) : fileAsDataUrl;
      } else {
        throw new Error('Invalid file content read.');
      }

      setStatus({ type: 'info', text: 'Uploading to server...' });
      setProgress(100); // reading complete

      // Prepare JSON payload required by AWS API
      // The backend expects:
      //  - file_content: base64 string (no data: prefix)
      //  - nombre: video name/title
      //  - autor: author/creator
      //  - genre: genre string
      //  - content_type: MIME type (e.g., video/mp4)
      //  - filename: original filename (extra metadata)
      const payload = {
        file_content: base64Content,
        nombre: name,
        autor: author,
        genre,
        content_type: file.type || 'application/octet-stream',
        filename: file.name,
      };

      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';
      let body;
      if (contentType.includes('application/json')) {
        body = await res.json();
      } else {
        const text = await res.text();
        try { body = JSON.parse(text); } catch { body = { raw: text }; }
      }

      if (!res.ok) {
        const msg = body?.message || body?.error || `Upload failed: ${res.status}`;
        throw new Error(msg);
      }

      const uploadedUrl = body?.url || body?.link || body?.Location || body?.videoUrl || '';
      setStatus({
        type: 'success',
        text: 'Video uploaded successfully!',
        link: uploadedUrl || '',
      });

      // Reset form
      setName('');
      setAuthor('');
      setGenre('Drama');
      setFile(null);
      setProgress(0);

      // Refresh videos list
      await fetchList();
    } catch (err) {
      setStatus({ type: 'error', text: `Could not upload the video. ${err?.message || ''}` });
    } finally {
      setLoading(false);
    }
  };

  const placeholderThumb = (
    <div className="film-thumb" style={{ background: 'var(--cd-bg)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--cd-muted)' }}>
        <div className="pill">No cover</div>
      </div>
    </div>
  );

  return (
    <div className="card section" style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Upload Video</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        Share your short with the community. Max size 100MB. Types: MP4, WebM, OGG, MOV, AVI, MKV.
      </p>

      {/* Status messages */}
      {status && (
        <div
          className="pill"
          role={status.type === 'error' ? 'alert' : 'status'}
          style={{
            borderColor: status.type === 'error' ? 'var(--cd-error)' : 'var(--cd-secondary)',
            background: 'var(--cd-chip-bg)',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span>{status.text}</span>
          {status.type === 'success' && status.link ? (
            <a
              href={status.link}
              target="_blank"
              rel="noreferrer"
              className="pill"
              style={{ marginLeft: 8 }}
            >
              Open uploaded video
            </a>
          ) : null}
        </div>
      )}

      {/* Form */}
      <div className="row" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ minWidth: 220, flex: 1 }}>
          <label className="muted" style={{ fontSize: 13 }}>Video name</label>
          <input
            className="input"
            placeholder="E.g. Sunrise in the City"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <label className="muted" style={{ fontSize: 13 }}>Genre</label>
          <select className="input" value={genre} onChange={(e) => setGenre(e.target.value)}>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: 220, flex: 1 }}>
          <label className="muted" style={{ fontSize: 13 }}>Author / Creator</label>
          <input
            className="input"
            placeholder="Your artist name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
      </div>

      {/* Drag and drop area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed var(--cd-border)',
          borderColor: dragOver ? 'var(--cd-primary)' : 'var(--cd-border)',
          borderRadius: 16,
          padding: 20,
          background: 'var(--cd-surface)',
          cursor: 'pointer',
        }}
        aria-label="Drag & drop area for video file"
        role="button"
        tabIndex={0}
      >
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className="badge">Drag & drop your video here</span>
        </div>
        <div style={{ height: 8 }} />
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className="muted">or</span>
          <button
            type="button"
            className="btn secondary"
            style={{ marginLeft: 8 }}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Choose file
          </button>
        </div>
        <input
          type="file"
          ref={inputRef}
          accept={ALLOWED_VIDEO_TYPES.join(',')}
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
        {file && (
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <strong>Selected:</strong> {file.name} — {humanFileSize(file.size)}
          </div>
        )}
      </div>

      {/* Progress + Upload button */}
      <div className="row" style={{ alignItems: 'center', gap: 12 }}>
        <button className="btn" onClick={handleUpload} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
        {(loading || progress > 0) && (
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: '100%',
                height: 10,
                background: 'var(--cd-chip-bg)',
                borderRadius: 999,
                overflow: 'hidden',
                border: '1px solid var(--cd-border)',
              }}
              aria-label="Upload progress bar"
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'var(--cd-primary)',
                  transition: 'width .2s ease',
                }}
              />
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{progress}%</div>
          </div>
        )}
      </div>

      {/* Uploaded videos list with refresh */}
      <div className="card section" style={{ border: '1px dashed var(--cd-border)' }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Uploaded videos</strong>
          <div className="row" style={{ gap: 8 }}>
            {listLoading && <span className="muted">Loading...</span>}
            <button className="pill" onClick={fetchList} type="button">Refresh</button>
          </div>
        </div>
        <div style={{ height: 8 }} />
        {(!list || list.length === 0) && !listLoading && (
          <div className="muted">No videos yet. Be the first to share!</div>
        )}
        {(list || []).map((v, idx) => {
          const title = v.name || v.title || v.filename || `Video ${idx + 1}`;
          const size = v.size || v.filesize || v.contentLength || v.length || null;
          const dateRaw = v.date || v.createdAt || v.LastModified || v.uploadedAt || v.timestamp;
          const dateFmt = dateRaw ? (dayjs(dateRaw).isValid() ? dayjs(dateRaw).format('YYYY-MM-DD HH:mm') : String(dateRaw)) : '—';
          const url = v.url || v.link || v.Location || v.signedUrl || v.videoUrl || '';
          return (
            <div
              key={v.id || title + idx}
              className="row"
              style={{
                justifyContent: 'space-between',
                padding: '12px 0',
                borderTop: '1px solid var(--cd-border)',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{ display: 'grid', minWidth: 0, flex: 1 }}>
                <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
                <span className="muted" style={{ fontSize: 12 }}>
                  {size ? humanFileSize(size) : 'Unknown size'} • {dateFmt}
                </span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                {url ? (
                  <a className="btn secondary" href={url} target="_blank" rel="noreferrer">
                    View / Play
                  </a>
                ) : (
                  <span className="pill">No link</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
