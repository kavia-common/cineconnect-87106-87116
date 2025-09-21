import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../services/Api';
import Comments from '../components/Comments';

/**
 * PUBLIC_INTERFACE
 * FilmDetails shows a single film page with content and social features.
 * It supports two data sources:
 *  - AWS Lambda API: GET /videos_shortfilms/{filename}
 *  - Local backend (tests/back-compat): GET /films/:id
 *
 * It reads the route param as a generic "slug" which could be either a filename or an id.
 */
export default function FilmDetails() {
  const { id: slug } = useParams();
  const { useFetch } = useApi();

  // Local backend fetch (used for tests/backward compatibility)
  const { data: localFilm } = useFetch(`/films/${slug}`, { fallbackData: fallback(slug) });

  // AWS Lambda fetch for real shortfilm details by filename
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE || 'https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops';
  const buildAwsUrl = (filename) => `${API_BASE_URL.replace(/\/$/, '')}/videos_shortfilms/${encodeURIComponent(filename)}`;

  const [awsFilm, setAwsFilm] = useState(null);
  const [awsLoading, setAwsLoading] = useState(true);
  const [awsError, setAwsError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchAws() {
      setAwsLoading(true);
      setAwsError(null);
      try {
        // Heuristic: treat slug as a filename if it contains a dot or looks like a name (non-uuid simple ids also allowed)
        const url = buildAwsUrl(slug);
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        // Some gateways return 404 if not found; in that case, we simply fall back to localFilm
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const ct = res.headers.get('content-type') || '';
        let body;
        if (ct.includes('application/json')) {
          body = await res.json();
        } else {
          const text = await res.text();
          try { body = JSON.parse(text); } catch { body = { raw: text }; }
        }

        // Normalize AWS response
        const item = normalizeAwsFilm(body, slug);
        if (!cancelled) setAwsFilm(item);
      } catch (e) {
        if (!cancelled) setAwsError(e);
      } finally {
        if (!cancelled) setAwsLoading(false);
      }
    }
    fetchAws();
    return () => { cancelled = true; };
  }, [slug]);

  // Choose which film to show: prefer awsFilm if loaded successfully
  const film = useMemo(() => {
    return awsFilm || localFilm;
  }, [awsFilm, localFilm]);

  // Loading/error states (only show AWS states if we didn't get any film yet)
  const isLoading = awsLoading && !awsFilm && !localFilm;
  const isError = awsError && !awsFilm && !localFilm;

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
    like: film?.likes ? Math.max(0, Number(film.likes) || 0) : 0, // seed likes if available
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
        // Ensure the pill uses themed background and border from global CSS variables
        background: 'var(--cd-chip-bg)',
        borderColor: 'var(--cd-border)',
        // Improve accessibility and interaction
        cursor: 'pointer',
        userSelect: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        // Themed text/icon color for both modes
        color: 'var(--cd-text)',
        // Focus visibility for keyboard users
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
      <span
        aria-hidden="true"
        role="img"
        style={{
          // Ensure emoji/icons inherit themed text color for dark/light contrast
          color: 'inherit',
          // Slightly larger for readability
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        {icon}
      </span>
      <span style={{ color: 'inherit' }}>{label}</span>
      <span
        className="badge"
        style={{
          fontWeight: 800,
          // Badge already themed in index.css, ensure readable contrast in dark mode
          background: 'var(--cd-badge-bg)',
          color: 'var(--cd-badge-text)',
          borderColor: 'var(--cd-border)',
        }}
      >
        {count}
      </span>
    </button>
  );

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
      </div>
    );
  }

  return (
    <div className="page-film">
      <div className="card" style={compactCard} aria-label={`Detalle del corto ${film.title}`}>
        <div style={compactHeader} aria-hidden="true" />
        <div style={{ padding: 14 }}>
          <h2 style={{ margin: '6px 0', fontSize: '1.15rem', lineHeight: 1.3 }}>{film.title}</h2>
          <div className="row" style={metaRow}>
            <span className="pill" style={{ padding: '6px 10px', fontSize: 13 }}>by {film.author}</span>
            <span className="pill" style={{ padding: '6px 10px', fontSize: 13 }}>⏱ {film.duration} min</span>
            <span className="pill" style={{ padding: '6px 10px', fontSize: 13 }}>★ {film.likes}</span>
          </div>

          {/* Reactions row */}
          <div style={{ height: 10 }} />
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <ReactionButton
              icon="👎"
              label="Dislike"
              ariaLabel="Dislike this short"
              count={reactions.dislike}
              onClick={() => inc('dislike')}
            />
            <ReactionButton
              icon="👍"
              label="Like"
              ariaLabel="Like this short"
              count={reactions.like}
              onClick={() => inc('like')}
            />
            <ReactionButton
              icon="❤️"
              label="Love"
              ariaLabel="Love this short"
              count={reactions.love}
              onClick={() => inc('love')}
            />
            <ReactionButton
              icon="🌟"
              label="Life changing"
              ariaLabel="This short is life changing"
              count={reactions.lifeChanging}
              onClick={() => inc('lifeChanging')}
            />
          </div>

          <p className="muted" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.45 }}>{film.description}</p>
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
              {film.crew.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div className="card section">
            <strong>More by {film.author}</strong>
            <div style={{ height: 8 }} />
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {film.more.map(m => <span key={m} className="pill" style={{ margin: 4 }}>{m}</span>)}
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
