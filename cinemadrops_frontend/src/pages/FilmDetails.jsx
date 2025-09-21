import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useApi } from '../services/Api';
import Comments from '../components/Comments';

/**
 * PUBLIC_INTERFACE
 * FilmDetails shows a single film page with content and social features.
 * Data source priority:
 *  1) If navigated from Discover (or elsewhere) with state, use state.film directly (instant render).
 *  2) Otherwise, try AWS Lambda API GET /videos_shortfilms/{filenameOrId}.
 *  3) Fallback to local backend GET /films/:id (used for tests/back-compat).
 *
 * It reads the route param as a generic "slug" which could be either a filename or an id.
 */
export default function FilmDetails() {
  const { id: slug } = useParams();
  const location = useLocation();
  const { useFetch } = useApi();

  // If we navigated with state, prefer it (instant)
  const filmFromState = location?.state?.film || null;

  // Local backend fetch (used for tests/backward compatibility) - only if no state and as fallback
  const { data: localFilm } = useFetch(filmFromState ? null : `/films/${slug}`, { fallbackData: filmFromState ? undefined : fallback(slug) });

  // AWS Lambda fetch for real shortfilm details by filename - only if no state
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || 'https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops';
  const buildAwsUrl = (filename) => `${API_BASE_URL.replace(/\/$/, '')}/videos_shortfilms/${encodeURIComponent(filename)}`;

  const [awsFilm, setAwsFilm] = useState(null);
  const [awsLoading, setAwsLoading] = useState(!filmFromState);
  const [awsError, setAwsError] = useState(null);

  // DEBUG STATE for API errors (details + raw)
  const [awsErrorDebug, setAwsErrorDebug] = useState(null); // { message, status, statusText, url, responseText? }

  useEffect(() => {
    if (filmFromState) {
      // We already have data; no need to fetch
      setAwsLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchAws() {
      setAwsLoading(true);
      setAwsError(null);
      setAwsErrorDebug(null);
      try {
        const url = buildAwsUrl(slug);
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) {
          // DEBUG: capture response text to expose in UI and console
          let responseText = '';
          try { responseText = await res.text(); } catch { /* ignore */ }
          const errObj = {
            message: `HTTP ${res.status} ${res.statusText}`,
            status: res.status,
            statusText: res.statusText,
            url,
            responseText,
          };
          // Console debug (raw)
          // DEBUG: AWS film fetch error (details)
          // eslint-disable-next-line no-console
          console.error('[FilmDetails][AWS fetch error]', errObj);
          throw Object.assign(new Error(errObj.message), errObj);
        }
        const ct = res.headers.get('content-type') || '';
        let body;
        if (ct.includes('application/json')) {
          body = await res.json();
        } else {
          const text = await res.text();
          try { body = JSON.parse(text); } catch { body = { raw: text }; }
        }
        const item = normalizeAwsFilm(body, slug);
        if (!cancelled) setAwsFilm(item);
      } catch (e) {
        if (!cancelled) {
          setAwsError(e);
          // DEBUG: set structured error for UI panel
          setAwsErrorDebug({
            message: e?.message || 'Unknown error',
            status: e?.status ?? undefined,
            statusText: e?.statusText ?? undefined,
            url: e?.url ?? undefined,
            responseText: e?.responseText ?? undefined,
          });
        }
      } finally {
        if (!cancelled) setAwsLoading(false);
      }
    }
    fetchAws();
    return () => { cancelled = true; };
  }, [slug, filmFromState]);

  // Choose which film to show: prefer state → aws → local
  const film = useMemo(() => filmFromState || awsFilm || localFilm, [filmFromState, awsFilm, localFilm]);

  // PUBLIC_INTERFACE
  /**
   * mapVideoDetails normalizes the video metadata fields to the expected UI labels,
   * aligning with the API field names requested in the task:
   *  - videoTitle:   videoData.title || videoData.filename || 'Unknown Title'
   *  - videoAuthor:  videoData.author || 'Unknown Author'
   *  - videoGenre:   videoData.genre || 'Unknown Genre'
   *  - videoDate:    videoData.upload_date (formatted with toLocaleDateString()) or '-'
   *  - videoSize:    videoData.size_mb + ' MB' if present, otherwise '-'
   *  - videoFilename: videoData.filename || '-'
   */
  function mapVideoDetails(videoData) {
    const safe = videoData || {};
    // Derive the best title:
    const videoTitle =
      safe.title ||
      (typeof safe.filename === 'string' ? safe.filename.replace(/\.[^/.]+$/, '') : safe.filename) ||
      'Unknown Title';

    // Derive other fields with defaults:
    const videoAuthor = safe.author || 'Unknown Author';
    const videoGenre = safe.genre || 'Unknown Genre';

    // Date: prefer upload_date from API; fallback to other common fields if present
    const rawDate =
      safe.upload_date ||
      safe.uploadDate ||
      safe.fecha_subida ||
      safe.date ||
      safe.createdAt ||
      safe.LastModified ||
      null;

    let videoDate = '-';
    try {
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          videoDate = d.toLocaleDateString();
        }
      }
    } catch {
      videoDate = '-';
    }

    // Size (MB): prefer size_mb; if numeric, append suffix, else '-'
    const sz = safe.size_mb;
    const videoSize =
      typeof sz === 'number' && isFinite(sz)
        ? `${sz} MB`
        : (typeof sz === 'string' && sz.trim() ? `${sz} MB` : '-');

    const videoFilename = safe.filename || '-';

    return {
      videoTitle,
      videoAuthor,
      videoGenre,
      videoDate,
      videoSize,
      videoFilename,
    };
  }

  // Compute normalized details for the currently selected film object so the UI can use stable names.
  const details = useMemo(() => mapVideoDetails(film || {}), [film]);

  // Loading/error states - show loading only if we don't have any film yet
  const isLoading = !film && (awsLoading);
  const isError = !film && (!!awsError);

  // Ultra-compact player/card styling so the individual short looks small and light
  const compactCard = {
    overflow: 'hidden',
    width: '100%',
    maxWidth: 640,
    margin: '0 auto',
    borderRadius: 16,
    border: '1px solid var(--cd-border)',
    background: 'var(--cd-surface)',
    boxShadow: '0 12px 30px rgba(0,0,0,.06)',
  };

  const compactHeader = {
    aspectRatio: '16/9',
    background:
      'radial-gradient(40% 50% at 20% 10%, rgba(15,163,177,.18), transparent 70%), var(--cd-gradient)',
    borderBottom: '1px solid var(--cd-border)',
  };

  const metaRow = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  };

  // Local-only reactions state (no backend persistence yet)
  const [reactions, setReactions] = useState(() => ({
    dislike: 0,
    like: film?.likes ? Math.max(0, Number(film.likes) || 0) : 0,
    love: 0,
    lifeChanging: 0,
  }));

  const inc = (key) => {
    setReactions((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  // Small helper for accessible reaction buttons
  const ReactionButton = ({ icon, label, count, onClick, ariaLabel }) => (
    <button
      type="button"
      className="pill"
      onClick={onClick}
      aria-label={ariaLabel || label}
      title={label}
      style={{
        background: 'var(--cd-chip-bg)',
        borderColor: 'var(--cd-border)',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--cd-text)',
        outline: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,163,177,0.35)';
        e.currentTarget.style.borderColor = 'var(--cd-primary)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--cd-border)';
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span aria-hidden="true" role="img" style={{ color: 'inherit', fontSize: 16, lineHeight: 1 }}>
        {icon}
      </span>
      <span style={{ color: 'inherit' }}>{label}</span>
      <span className="badge" style={{ fontWeight: 800, background: 'var(--cd-badge-bg)', color: 'var(--cd-badge-text)', borderColor: 'var(--cd-border)' }}>
        {count}
      </span>
    </button>
  );

  // --- Video playback state + logic ---
  // Holds the resolved playable URL (signed URL) or a data URI when API returns base64/blob
  const [videoSrc, setVideoSrc] = useState('');
  const [playLoading, setPlayLoading] = useState(false);
  const [playError, setPlayError] = useState('');

  // DEBUG STATE for video fetch play error
  const [playErrorDebug, setPlayErrorDebug] = useState(null); // { message, status, statusText, url, responseText? }

  // PUBLIC_INTERFACE
  async function handlePlay() {
    /**
     * Fetch the short film content or signed URL and attach it to the HTML5 video element.
     * Route used: GET /videos_shortfilms/{filename}?include_content=true
     * - If API returns JSON with { url } or similar, we use it directly.
     * - If API returns base64 or blob-like content, we build a data: URI.
     *
     * Connection explanation:
     * - The Play button triggers this function.
     * - We build the path using slug (usually filename from Discover).
     * - We always pass include_content=true so backends can decide to embed content.
     * - Loading and error states are reflected in UI elements under the player.
     */
    setPlayLoading(true);
    setPlayError('');
    setPlayErrorDebug(null);
    setVideoSrc('');
    try {
      const base = (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || 'https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops').replace(/\/$/, '');
      const endpoint = `${base}/videos_shortfilms/${encodeURIComponent(slug)}?include_content=true`;
      const res = await fetch(endpoint, { method: 'GET' });

      if (!res.ok) {
        // DEBUG: capture raw response for console + UI
        let responseText = '';
        try { responseText = await res.text(); } catch { /* ignore */ }
        const errObj = {
          message: `HTTP ${res.status} ${res.statusText}`,
          status: res.status,
          statusText: res.statusText,
          url: endpoint,
          responseText,
        };
        // DEBUG: Video fetch error (raw)
        // eslint-disable-next-line no-console
        console.error('[FilmDetails][Video fetch error]', errObj);
        throw Object.assign(new Error(errObj.message), errObj);
      }

      const contentType = res.headers.get('content-type') || '';

      // Try JSON first (common for API Gateway)
      if (contentType.includes('application/json')) {
        const body = await res.json();

        // normalize common fields that might carry the playable url
        const url =
          body?.url ||
          body?.link ||
          body?.Location ||
          body?.signedUrl ||
          body?.videoUrl ||
          body?.playbackUrl ||
          body?.body?.url ||
          body?.body?.signedUrl ||
          null;

        // If there's an embedded base64 content
        const base64 =
          body?.base64 ||
          body?.file_content ||
          body?.content ||
          body?.body?.base64 ||
          null;

        const contentTypeFromBody =
          body?.content_type ||
          body?.mime ||
          body?.mimeType ||
          'video/mp4';

        if (url) {
          setVideoSrc(url);
        } else if (base64) {
          // Ensure we prepend data URI header
          const dataUri = base64.startsWith('data:')
            ? base64
            : `data:${contentTypeFromBody};base64,${base64}`;
          setVideoSrc(dataUri);
        } else {
          // Fallback: if body is actually a string url
          if (typeof body === 'string' && /^https?:\/\//.test(body)) {
            setVideoSrc(body);
          } else {
            throw new Error('API did not return a playable URL or base64 content.');
          }
        }
      } else {
        // If API returns raw text, try to parse or treat as URL
        const text = await res.text();
        try {
          const body = JSON.parse(text);
          const url = body?.url || body?.signedUrl || body?.videoUrl || null;
          const base64 = body?.base64 || body?.content || null;
          const contentTypeFromBody = body?.content_type || 'video/mp4';
          if (url) {
            setVideoSrc(url);
          } else if (base64) {
            const dataUri = base64.startsWith('data:')
              ? base64
              : `data:${contentTypeFromBody};base64,${base64}`;
            setVideoSrc(dataUri);
          } else if (typeof body === 'string' && /^https?:\/\//.test(body)) {
            setVideoSrc(body);
          } else {
            // Sometimes API can return a plain signed URL string (not JSON)
            if (/^https?:\/\//.test(text.trim())) {
              setVideoSrc(text.trim());
            } else {
              throw new Error('Unrecognized response format for video content.');
            }
          }
        } catch {
          // Raw text not JSON. If looks like URL, use it
          if (/^https?:\/\//.test(text.trim())) {
            setVideoSrc(text.trim());
          } else if (text.startsWith('data:')) {
            setVideoSrc(text.trim());
          } else {
            throw new Error('Unrecognized non-JSON response for video content.');
          }
        }
      }
    } catch (err) {
      setPlayError(err?.message || 'Could not load the video.');
      // DEBUG: store full error for UI panel
      setPlayErrorDebug({
        message: err?.message || 'Unknown error',
        status: err?.status ?? undefined,
        statusText: err?.statusText ?? undefined,
        url: err?.url ?? undefined,
        responseText: err?.responseText ?? undefined,
      });
    } finally {
      setPlayLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="card section" role="status">
        Loading film...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card section" role="alert">
        Could not load the film details.
        {/* DEBUG PANEL: AWS details fetch error */}
        {awsErrorDebug && (
          <div
            className="pill"
            style={{
              marginTop: 10,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: 'var(--cd-chip-bg)',
              borderColor: 'var(--cd-error)',
              color: 'inherit',
              display: 'block'
            }}
          >
            <strong style={{ display: 'block', marginBottom: 6 }}>Debug Info (Film Details Error)</strong>
            <div><strong>Message:</strong> {String(awsErrorDebug.message || '')}</div>
            {awsErrorDebug.status !== undefined && (
              <div><strong>Status:</strong> {String(awsErrorDebug.status)} {awsErrorDebug.statusText ? `- ${awsErrorDebug.statusText}` : ''}</div>
            )}
            {awsErrorDebug.url && <div><strong>URL:</strong> {awsErrorDebug.url}</div>}
            {awsErrorDebug.responseText && (
              <details style={{ marginTop: 6 }}>
                <summary>Raw response</summary>
                <pre style={{ overflowX: 'auto' }}>{awsErrorDebug.responseText}</pre>
              </details>
            )}
          </div>
        )}
      </div>
    );
  }

  // Safety fallback (shouldn't happen usually due to fallback(local) in tests)
  if (!film) {
    return (
      <div className="card section">
        Film not found.
      </div>
    );
  }

  return (
    <div className="page-film">
      <div className="card" style={compactCard} aria-label={`Detalle del corto ${details.videoTitle}`}>
        {/* Hero cover with centered Play button overlay */}
        <div
          style={{
            ...compactHeader,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
          aria-label="Cover image"
        >
          <button
            type="button"
            onClick={handlePlay}
            disabled={playLoading}
            aria-label="Reproducir cortometraje"
            title="Play"
            style={{
              position: 'absolute',
              zIndex: 2,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: 88,
              height: 88,
              borderRadius: '999px',
              border: '3px solid rgba(255,255,255,.9)',
              background:
                'radial-gradient(120px 60px at 0% 0%, rgba(255,182,39,0.3), transparent 70%), var(--cd-primary)',
              color: '#fff',
              fontWeight: 900,
              fontSize: 20,
              boxShadow: '0 20px 50px rgba(0,0,0,.35), 0 8px 22px rgba(15,163,177,.35)',
              cursor: playLoading ? 'default' : 'pointer',
              transform: 'translateZ(0)',
              transition: 'transform .15s ease, box-shadow .2s ease, filter .2s ease, opacity .2s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,.38), 0 10px 26px rgba(255,182,39,.30)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1.0)';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,.35), 0 8px 22px rgba(15,163,177,.35)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(255,255,255,.6), 0 12px 30px rgba(0,0,0,.35)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,.35), 0 8px 22px rgba(15,163,177,.35)';
            }}
          >
            {playLoading ? '…' : '▶'}
          </button>

          {/* Optional decorative overlay to ensure contrast on any background */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,.35) 100%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </div>

        <div style={{ padding: 14 }}>
          <h2 style={{ margin: '6px 0', fontSize: '1.15rem', lineHeight: 1.3 }}>{details.videoTitle}</h2>
          <div className="row" style={metaRow}>
            <span className="pill" style={{ padding: '6px 10px', fontSize: 13 }}>by {details.videoAuthor}</span>
            <span className="pill" style={{ padding: '6px 10px', fontSize: 13 }}>⏱ {film.duration} min</span>
            <span className="pill" style={{ padding: '6px 10px', fontSize: 13 }}>★ {film.likes}</span>
          </div>

          {/* Additional normalized metadata aligned with API (genre, date, size, filename) */}
          <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <span className="pill" style={{ padding: '6px 10px', fontSize: 12 }}>🎭 {details.videoGenre}</span>
            <span className="pill" style={{ padding: '6px 10px', fontSize: 12 }}>📅 {details.videoDate}</span>
            <span className="pill" style={{ padding: '6px 10px', fontSize: 12 }}>💾 {details.videoSize}</span>
            <span className="pill" style={{ padding: '6px 10px', fontSize: 12 }}>📄 {details.videoFilename}</span>
          </div>

          {/* Reactions row */}
          <div style={{ height: 10 }} />
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <ReactionButton icon="👎" label="Dislike" ariaLabel="Dislike this short" count={reactions.dislike} onClick={() => inc('dislike')} />
            <ReactionButton icon="👍" label="Like" ariaLabel="Like this short" count={reactions.like} onClick={() => inc('like')} />
            <ReactionButton icon="❤️" label="Love" ariaLabel="Love this short" count={reactions.love} onClick={() => inc('love')} />
            <ReactionButton icon="🌟" label="Life changing" ariaLabel="This short is life changing" count={reactions.lifeChanging} onClick={() => inc('lifeChanging')} />
          </div>

          <p className="muted" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.45 }}>{film.description}</p>

          {/* Inline player status after clicking Play */}
          <div style={{ height: 10 }} />
          <div className="row" style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {playLoading && <span className="muted" role="status">Fetching video...</span>}
            {playError && (
              <span className="pill" role="alert" style={{ borderColor: 'var(--cd-error)', color: 'var(--cd-text)' }}>
                Error: {playError}
              </span>
            )}
          </div>

          {/* DEBUG PANEL: Video fetch error info (non-intrusive) */}
          {playErrorDebug && (
            <div
              className="pill"
              style={{
                marginTop: 10,
                background: 'var(--cd-chip-bg)',
                borderColor: 'var(--cd-error)',
                color: 'inherit',
                display: 'block',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
              role="status"
            >
              <strong style={{ display: 'block', marginBottom: 6 }}>Debug Info (Video Fetch)</strong>
              <div><strong>Message:</strong> {String(playErrorDebug.message || '')}</div>
              {playErrorDebug.status !== undefined && (
                <div><strong>Status:</strong> {String(playErrorDebug.status)} {playErrorDebug.statusText ? `- ${playErrorDebug.statusText}` : ''}</div>
              )}
              {playErrorDebug.url && <div><strong>URL:</strong> {playErrorDebug.url}</div>}
              {playErrorDebug.responseText && (
                <details style={{ marginTop: 6 }}>
                  <summary>Raw response</summary>
                  <pre style={{ overflowX: 'auto' }}>{playErrorDebug.responseText}</pre>
                </details>
              )}
            </div>
          )}

          {/* Video player appears after we have a source */}
          {videoSrc ? (
            <>
              <div style={{ height: 10 }} />
              <div style={{ background: '#000', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--cd-border)' }}>
                <video
                  controls
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  src={videoSrc}
                />
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                Source: {videoSrc.startsWith('data:') ? 'Embedded (base64)' : 'URL'}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="row" style={{ gap: 16, alignItems: 'stretch' }}>
        <div style={{ flex: 2 }}>
          <div className="card section">
            <strong>Behind the Scenes</strong>
            <div style={{ height: 8 }} />
            <p className="muted">Photos, stories, gear lists, and production notes coming from creators.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div style={{ aspectRatio: '4/3', background: 'var(--cd-chip-bg)', borderRadius: 12 }} />
              <div style={{ aspectRatio: '4/3', background: 'var(--cd-chip-bg)', borderRadius: 12 }} />
              <div style={{ aspectRatio: '4/3', background: 'var(--cd-chip-bg)', borderRadius: 12 }} />
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div className="card section">
            <strong>Script & Notes</strong>
            <div style={{ height: 8 }} />
            <div className="pill">Download PDF</div>
            <div style={{ height: 8 }} />
            <p className="muted">Short excerpt: "{film.scriptSnippet}"</p>
          </div>

          <div style={{ height: 16 }} />
          <Comments filmId={slug} />
        </div>

        <div className="rightbar" style={{ flex: 1 }}>
          <div className="card section">
            <strong>Cast & Crew</strong>
            <div style={{ height: 8 }} />
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {film.crew?.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div className="card section">
            <strong>More by {details.videoAuthor}</strong>
            <div style={{ height: 8 }} />
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {Array.isArray(film.more) ? film.more.map(m => <span key={m} className="pill" style={{ margin: 4 }}>{m}</span>) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Normalize AWS film shape to local film object.
 */
function normalizeAwsFilm(body, slug) {
  // Accept several shapes; if body contains a 'video' or 'item' field, unwrap it
  const src = body?.video || body?.item || body?.data || body;

  const title =
    src?.title ||
    src?.name ||
    src?.nombre ||
    src?.filename?.replace(/\.[^/.]+$/, '') ||
    String(slug);

  const author = src?.author || src?.creator || src?.autor || 'Unknown';
  const likes = src?.likes ?? src?.stars ?? 0;
  const duration = src?.duration ?? src?.length ?? 0;

  return {
    id: src?.id || src?._id || src?.key || String(slug),
    title,
    author,
    duration,
    likes,
    description:
      src?.description ||
      src?.descripcion ||
      'A short film shared on Cinemadrops.',
    scriptSnippet:
      src?.scriptSnippet ||
      src?.notes ||
      'Scene opens with a quiet street. Footsteps echo...',
    crew: src?.crew && Array.isArray(src.crew)
      ? src.crew
      : ['Director: Unknown', 'DOP: Unknown', 'Editor: Unknown'],
    more: Array.isArray(src?.more) ? src.more : [],
  };
}

/**
 * Fallback local film when backend not available.
 */
function fallback(id) {
  return {
    id,
    title: 'Echo Street',
    author: 'Sara Ali',
    duration: 8,
    likes: 581,
    description: 'A chance meeting on a rainy night changes a commuter’s routine forever.',
    scriptSnippet: 'Umbrellas collide. A glance. Silence speaks louder than words...',
    crew: ['Director: Sara Ali', 'DOP: L. Keller', 'Editor: M. Rios', 'Sound: T. Abebe'],
    more: ['Rain Lines', 'Midnight Bus', 'Crossing'],
  };
}
