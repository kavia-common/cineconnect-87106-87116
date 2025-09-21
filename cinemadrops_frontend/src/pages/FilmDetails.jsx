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
 * IMPORTANT (Playback):
 * - For video playback we ALWAYS construct a direct S3 URL using the s3_key field returned by the API.
 * - We do NOT use base64/file_content for the <video> player source.
 * - If S3 load fails (404 or CORS), we show clear debug info and a warning.
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
          let responseText = '';
          try { responseText = await res.text(); } catch { /* ignore */ }
          const errObj = {
            message: `HTTP ${res.status} ${res.statusText}`,
            status: res.status,
            statusText: res.statusText,
            url,
            responseText,
          };
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
   * aligning with typical fields:
   *  - videoTitle:   title || filename
   *  - videoAuthor:  author
   *  - videoGenre:   genre
   *  - videoDate:    upload_date formatted or '-'
   *  - videoSize:    size_mb -> "X MB" or '-'
   *  - videoFilename: filename or '-'
   *  - s3Key: s3_key (for constructing S3 URLs)
   */
  function mapVideoDetails(videoData) {
    const safe = videoData || {};
    const videoTitle =
      safe.title ||
      (typeof safe.filename === 'string' ? safe.filename.replace(/\.[^/.]+$/, '') : safe.filename) ||
      'Unknown Title';

    const videoAuthor = safe.author || 'Unknown Author';
    const videoGenre = safe.genre || 'Unknown Genre';

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
      s3Key: safe.s3_key || safe.key || safe.s3Key || null,
    };
  }

  // Compute normalized details for the current film
  const details = useMemo(() => mapVideoDetails(film || {}), [film]);

  // Loading/error states
  const isLoading = !film && awsLoading;
  const isError = !film && !!awsError;

  // Styles
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

  // Reactions (local)
  const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const [reactions, setReactions] = useState(() => ({
    dislike: randomBetween(1, 1000),
    like: film?.likes ? Math.max(0, Number(film.likes) || 0) : randomBetween(1, 1000),
    love: randomBetween(1, 1000),
    lifeChanging: randomBetween(1, 1000),
  }));
  const [activeReaction, setActiveReaction] = useState(null);
  const toggleReaction = (key) => setActiveReaction((prev) => (prev === key ? null : key));

  const ReactionButton = ({ icon, label, count, onClick, ariaLabel, active }) => (
    <button
      type="button"
      className="pill"
      onClick={onClick}
      aria-label={ariaLabel || label}
      aria-pressed={active ? 'true' : 'false'}
      title={label}
      style={{
        background: 'var(--cd-chip-bg)',
        borderColor: active ? 'var(--cd-primary)' : 'var(--cd-border)',
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
        e.currentTarget.style.borderColor = active ? 'var(--cd-primary)' : 'var(--cd-border)';
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

  // --- Robust S3-based video playback ---
  // State for constructed S3 URL + debug
  const [videoSrc, setVideoSrc] = useState('');
  const [playLoading, setPlayLoading] = useState(false);
  const [playError, setPlayError] = useState('');
  const [playErrorDebug, setPlayErrorDebug] = useState(null);
  const [playDebugInfo, setPlayDebugInfo] = useState(null);

  // PUBLIC_INTERFACE
  async function handlePlay() {
    /**
     * Always use direct S3 URL built from s3_key.
     * Steps:
     *  1) Determine s3_key: prefer film.s3_key; else request AWS details and extract s3_key.
     *  2) Build S3 URL using env var REACT_APP_S3_PUBLIC_BASE or fallback pattern.
     *  3) Set <video src> to S3 URL. Do NOT use base64/file_content.
     *  4) If the request or the <video> playback fails (404/CORS), expose debug info with constructed URL.
     *
     * Env:
     *  - REACT_APP_S3_PUBLIC_BASE (Optional): e.g., https://your-bucket.s3.amazonaws.com
     *    If missing, we attempt to infer from API fields (bucket or region) or use a generic
     *    https://s3.amazonaws.com/<bucket>/<key> pattern when bucket is known.
     */
    setPlayLoading(true);
    setPlayError('');
    setPlayErrorDebug(null);
    setPlayDebugInfo(null);

    try {
      // 1) ensure we have AWS details to extract s3_key if not present locally
      let candidate = film || {};
      // If we came from tests/local fallback, film likely has no s3_key - attempt to fetch AWS details
      if (!candidate.s3_key && !candidate.s3Key) {
        try {
          const url = buildAwsUrl(slug);
          const res = await fetch(url, { headers: { Accept: 'application/json' } });
          const ct = res.headers.get('content-type') || '';
          let body;
          if (ct.includes('application/json')) {
            body = await res.json();
          } else {
            const text = await res.text();
            try { body = JSON.parse(text); } catch { body = { raw: text }; }
          }
          const normalized = normalizeAwsFilmFull(body);
          candidate = { ...normalized, ...candidate };
        } catch (e) {
          // Non-fatal; we still show debug below
        }
      }

      // Extract possible fields
      const s3Key = candidate.s3_key || candidate.s3Key || candidate.key || candidate.filename || null;
      const s3Bucket =
        candidate.bucket ||
        candidate.s3_bucket ||
        candidate.Bucket ||
        candidate.bucketName ||
        null;
      const region =
        candidate.region ||
        candidate.aws_region ||
        candidate.s3_region ||
        process.env.REACT_APP_AWS_REGION ||
        null;

      if (!s3Key) {
        throw new Error('Missing s3_key for this short film. Cannot construct S3 URL.');
      }

      // 2) Build S3 base
      const ENV_S3_BASE = (process.env.REACT_APP_S3_PUBLIC_BASE || '').replace(/\/$/, '');
      let s3Url = '';
      if (ENV_S3_BASE) {
        // Case: explicit S3 public base provided
        s3Url = `${ENV_S3_BASE}/${encodeURIComponent(s3Key)}`;
      } else if (s3Bucket && region) {
        // Virtual-hosted–style URL with region
        s3Url = `https://${s3Bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(s3Key)}`;
      } else if (s3Bucket) {
        // Generic global endpoint
        s3Url = `https://s3.amazonaws.com/${s3Bucket}/${encodeURIComponent(s3Key)}`;
      } else {
        // As a last resort, if API exposes a direct URL field, allow it (still S3-based)
        const direct = candidate.url || candidate.link || candidate.Location || candidate.videoUrl || null;
        if (direct && /^https?:\/\//.test(direct)) {
          s3Url = direct;
        } else {
          throw new Error('Could not determine S3 bucket URL. Provide REACT_APP_S3_PUBLIC_BASE or ensure API returns bucket/region.');
        }
      }

      // 3) Set the video player to use S3 URL
      setVideoSrc(s3Url);

      // 4) Prepare debug info block with constructed S3 URL
      setPlayDebugInfo({
        status: 'constructed',
        statusText: 'Using S3 URL',
        url: s3Url,
        headers: {},
        raw: '',
        json: {
          note: 'Player is using direct S3 URL built from s3_key',
          s3_key: s3Key,
          bucket: s3Bucket,
          region,
          envBase: process.env.REACT_APP_S3_PUBLIC_BASE || null,
        },
        chosenSrc: s3Url,
      });
    } catch (err) {
      setPlayError(err?.message || 'Could not build the S3 video URL.');
      setPlayErrorDebug({
        message: err?.message || 'Unknown error',
        url: (typeof err?.url === 'string' ? err.url : undefined),
      });
    } finally {
      setPlayLoading(false);
    }
  }

  // Helper: safe JSON parse for debug panel
  function tryParseJson(text) {
    try { return JSON.parse(text); } catch { return undefined; }
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
            <ReactionButton
              icon="👎"
              label="Dislike"
              ariaLabel="Dislike this short"
              count={reactions.dislike}
              active={activeReaction === 'dislike'}
              onClick={() => toggleReaction('dislike')}
            />
            <ReactionButton
              icon="👍"
              label="Like"
              ariaLabel="Like this short"
              count={reactions.like}
              active={activeReaction === 'like'}
              onClick={() => toggleReaction('like')}
            />
            <ReactionButton
              icon="❤️"
              label="Love"
              ariaLabel="Love this short"
              count={reactions.love}
              active={activeReaction === 'love'}
              onClick={() => toggleReaction('love')}
            />
            <ReactionButton
              icon="🌟"
              label="Life changing"
              ariaLabel="This short is life changing"
              count={reactions.lifeChanging}
              active={activeReaction === 'lifeChanging'}
              onClick={() => toggleReaction('lifeChanging')}
            />
          </div>

          <p className="muted" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.45 }}>{film.description}</p>

          {/* Inline player status after clicking Play */}
          <div style={{ height: 10 }} />
          <div className="row" style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {playLoading && <span className="muted" role="status">Loading video from S3...</span>}
            {playError && (
              <span className="pill" role="alert" style={{ borderColor: 'var(--cd-error)', color: 'var(--cd-text)' }}>
                Error: {playError}
              </span>
            )}
          </div>

          {/* DEBUG PANEL: Video fetch/URL construction info */}
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
              <strong style={{ display: 'block', marginBottom: 6 }}>Debug Info (Video Load)</strong>
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
              <div style={{ marginTop: 8 }} className="muted">
                If the video fails to play, verify:
                <ul style={{ marginTop: 6 }}>
                  <li>S3 object exists at the constructed path (404 indicates missing key).</li>
                  <li>CORS configuration on the S3 bucket allows GET from this origin.</li>
                </ul>
              </div>
            </div>
          )}

          {playDebugInfo && (
            <div
              className="card section"
              style={{
                marginTop: 10,
                border: '1px dashed var(--cd-border)',
                background: 'var(--cd-chip-bg)',
                color: 'inherit',
              }}
              role="status"
            >
              <strong>Debug: Video Source</strong>
              <div style={{ height: 6 }} />
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <span className="pill">{String(playDebugInfo.status)}</span>
                <span className="pill">URL</span>
                <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{playDebugInfo.url}</code>
              </div>
              <div style={{ height: 8 }} />
              <details>
                <summary>JSON</summary>
                <pre style={{ overflowX: 'auto' }}>{JSON.stringify(playDebugInfo.json || {}, null, 2)}</pre>
              </details>
              <div style={{ height: 8 }} />
              <div>
                <strong>Chosen video src:</strong>
                <div className="pill" style={{ display: 'inline-flex', marginTop: 6 }}>
                  {playDebugInfo.chosenSrc || '—'}
                </div>
              </div>
              <div style={{ height: 8 }} />
              <div className="muted" style={{ fontSize: 12 }}>
                Note: If this S3 URL returns 404 or is blocked by CORS, the player will not load. Check S3 ACL/CORS.
              </div>
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
                  onError={(e) => {
                    // Surface a succinct warning with the exact source that failed
                    const media = e?.currentTarget;
                    const src = media?.currentSrc || videoSrc;
                    setPlayError('Video failed to load. Possible 404 or CORS issue with the S3 URL.');
                    setPlayErrorDebug((prev) => ({
                      ...(prev || {}),
                      message: 'HTML5 video error on S3 URL',
                      url: src,
                      statusText: 'Playback error (network/CORS/404)',
                    }));
                  }}
                />
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                Source: S3 URL
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
 * Normalize AWS film shape into a richer object that may include fields needed to build S3 URL.
 */
function normalizeAwsFilmFull(body) {
  const root = body?.video || body?.item || body?.data || body?.body || body || {};
  const filename = root.filename || root.name || root.key || null;
  return {
    id: root.id || root._id || root.key || filename || null,
    title: root.title || root.name || root.nombre || (filename ? filename.replace(/\.[^/.]+$/, '') : 'Unknown Title'),
    author: root.author || root.creator || root.autor || 'Unknown',
    duration: root.duration ?? root.length ?? 0,
    likes: root.likes ?? root.stars ?? 0,
    description: root.description || root.descripcion || 'A short film shared on Cinemadrops.',
    scriptSnippet: root.scriptSnippet || root.notes || 'Scene opens with a quiet street. Footsteps echo...',
    crew: Array.isArray(root.crew) ? root.crew : ['Director: Unknown', 'DOP: Unknown', 'Editor: Unknown'],
    more: Array.isArray(root.more) ? root.more : [],
    // Fields relevant for playback
    filename,
    s3_key: root.s3_key || root.key || filename || null,
    bucket: root.bucket || root.s3_bucket || root.Bucket || null,
    region: root.region || root.aws_region || root.s3_region || null,
  };
}

/**
 * Normalize AWS film shape to local film object (basic metadata).
 */
function normalizeAwsFilm(body, slug) {
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
    // carry-through potential playback fields if present
    s3_key: src?.s3_key || src?.key || src?.filename || null,
    bucket: src?.bucket || src?.s3_bucket || src?.Bucket || null,
    region: src?.region || src?.aws_region || src?.s3_region || null,
    filename: src?.filename || null,
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
