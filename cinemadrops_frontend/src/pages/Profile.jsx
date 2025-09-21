import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useApi } from '../services/Api';
import { useAuth } from '../services/Auth';

/**
 * PUBLIC_INTERFACE
 * Profile displays the authenticated user's profile page with:
 * - User banner (avatar, name, bio)
 * - Social stats (followers, following, uploads)
 * - Tabs: Uploads and Liked (liked is a placeholder until backend is wired)
 * - Recent uploads gallery with playful style
 * - Video spotlight modal
 * All labels and UI strings are in English.
 */
export default function Profile() {
  const { useFetch } = useApi();
  const { user, isAuthenticated, authChecked } = useAuth();
  const [spotlight, setSpotlight] = useState(null); // { id, title, url, ... } | null
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'liked'

  // Always compute identifiers to keep hooks order
  const userId = user?.id;
  const email = user?.email;
  const query = userId
    ? `?authorId=${encodeURIComponent(userId)}`
    : (email ? `?email=${encodeURIComponent(email)}` : '');

  // Fetch uploads for this user when authenticated
  const { data: userVideos = [] } = useFetch(
    authChecked && isAuthenticated ? `/videos${query}` : null,
    { fallbackData: [] }
  );

  // Normalize data for UI
  const profile = useMemo(() => {
    const displayName = (user?.name || user?.email || 'You');
    const followers = 0; // backend can provide later
    const following = 0; // backend can provide later

    const uploads = (userVideos || []).map((v, idx) => ({
      id: v.id || v._id || `v-${idx}`,
      title: v.title || v.name || v.filename || `Video ${idx + 1}`,
      url: v.url || v.videoUrl || v.link || '',
      likes: v.likes ?? v.stars ?? 0,
      duration: v.duration ?? v.length ?? 0,
      createdAt: v.createdAt || v.date || v.uploadedAt || v.timestamp || null,
      // cover support (optional)
      cover: v.cover_image || v.cover || v.coverUrl || v.thumbnail || v.thumbnailUrl || v.poster || null,
    }));

    return {
      id: userId || 'unknown',
      name: displayName,
      bio: user?.bio || 'Your creative corner to manage and showcase your short films.',
      followers,
      following,
      uploads,
      liked: [], // placeholder list for "Liked" tab (to be populated when backend endpoint is ready)
    };
  }, [user?.name, user?.email, userId, userVideos, user?.bio]);

  // Auth loading state
  if (!authChecked) {
    return (
      <div className="card section" role="status">
        <strong>Loading your profile...</strong>
      </div>
    );
  }

  // If not authenticated, block personal profile
  if (!isAuthenticated) {
    return (
      <div className="card section">
        <h2>Your Profile</h2>
        <p className="muted">
          You are not signed in. To view and manage your personal videos, please sign in or configure authentication on the backend.
        </p>
        <div className="pill" style={{ marginTop: 8 }}>
          Requirements: a GET /auth/me endpoint that returns your identity, and video storage that includes author/email/userId fields.
        </div>
      </div>
    );
  }

  return (
    <div className="page-profile" style={{ color: '#e8f6f8' }}>
      {/* Banner / Bio */}
      <div
        className="card section"
        style={{
          background: 'linear-gradient(180deg, #121619 0%, #0b1013 100%)',
          borderColor: '#1e2a31',
        }}
      >
        <div className="row" style={{ gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            aria-label="User avatar"
            style={{
              width: 86,
              height: 86,
              borderRadius: 24,
              background:
                'radial-gradient(120px 60px at 0% 0%, rgba(255,182,39,0.2), transparent 70%), var(--cd-gradient)',
              border: '2px solid #26363f',
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'grid', gap: 6, minWidth: 220 }}>
            <h2 style={{ margin: 0, color: '#eafcff' }}>{profile.name}</h2>
            <div className="muted" style={{ color: '#9fb4bd' }}>
              {profile.bio}
            </div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <span className="pill" style={pillDark} aria-label="Followers count">
                Followers: {profile.followers}
              </span>
              <span className="pill" style={pillDark} aria-label="Following count">
                Following: {profile.following}
              </span>
              <span className="pill" style={pillDark} aria-label="Uploads count">
                🎬 {profile.uploads.length} uploads
              </span>
            </div>
          </div>
          <div className="space" />
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" style={{ boxShadow: '0 8px 24px rgba(15,163,177,.35)' }}>
              Edit Profile
            </button>
            <button className="btn secondary" title="Share your profile">
              Share Profile
            </button>
          </div>
        </div>

        {/* Quick actions row */}
        <div style={{ height: 10 }} />
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }} aria-label="Quick actions">
          <span className="pill" style={pillDark}>Create Playlist</span>
          <span className="pill" style={pillDark}>Invite Collaborators</span>
          <span className="pill" style={pillDark}>Account Settings</span>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Tabs: Uploads / Liked */}
      <div className="card section" style={{ background: '#0f1417', borderColor: '#1e2a31' }}>
        <div className="row" role="tablist" aria-label="Profile content tabs" style={{ gap: 8 }}>
          <button
            role="tab"
            aria-selected={activeTab === 'uploads' ? 'true' : 'false'}
            className="pill"
            onClick={() => setActiveTab('uploads')}
            style={{ ...pillDark, borderColor: activeTab === 'uploads' ? 'var(--cd-primary)' : pillDark.border }}
          >
            Uploads
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'liked' ? 'true' : 'false'}
            className="pill"
            onClick={() => setActiveTab('liked')}
            style={{ ...pillDark, borderColor: activeTab === 'liked' ? 'var(--cd-primary)' : pillDark.border }}
          >
            Liked
          </button>
        </div>
      </div>

      <div style={{ height: 12 }} />

      {/* Uploads tab */}
      {activeTab === 'uploads' && (
        <div
          className="card section"
          style={{ background: '#0f1417', borderColor: '#1e2a31' }}
          aria-label="User uploads gallery"
        >
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <strong style={{ color: '#d8f2f6' }}>Your uploads</strong>
            <span className="muted" style={{ color: '#94a9b1', fontSize: 13 }}>
              Click a card to open a large player
            </span>
          </div>

          <div style={{ height: 12 }} />

          {(!profile.uploads || profile.uploads.length === 0) && (
            <div className="muted" style={{ color: '#94a9b1' }}>
              You have no videos yet. Upload your first short to get started.
            </div>
          )}

          <div className="film-grid">
            {(profile.uploads || []).map((v) => (
              <button
                key={v.id}
                className="card film-card"
                onClick={() => setSpotlight(v)}
                style={{
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: 'linear-gradient(180deg, #11181c 0%, #0d1316 100%)',
                  borderColor: '#22323b',
                }}
                aria-label={`Open video ${v.title}`}
                title={v.title}
              >
                <div
                  className="film-thumb"
                  style={{
                    background:
                      'radial-gradient(40% 50% at 20% 10%, rgba(15,163,177,.16), transparent 70%), #0a0f12',
                    position: 'relative'
                  }}
                >
                  {/* Cover if available */}
                  {v.cover ? (
                    <img
                      src={v.cover}
                      alt={`Cover of ${v.title}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : null}
                  <div
                    className="badge"
                    style={{
                      background: 'rgba(9,13,15,.8)',
                      borderColor: '#20313a',
                      color: '#d6eef2',
                      padding: '6px 10px',
                      fontSize: 13
                    }}
                  >
                    ★ {v.likes} • ⏱ {v.duration}m
                  </div>
                </div>
                <div className="film-meta">
                  <div className="film-title" style={{ color: '#eafcff' }}>
                    {v.title}
                  </div>
                  <div className="film-author" style={{ color: '#93a8b0' }}>
                    {v.createdAt && dayjs(v.createdAt).isValid()
                      ? dayjs(v.createdAt).format('YYYY-MM-DD HH:mm')
                      : '—'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liked tab (placeholder content) */}
      {activeTab === 'liked' && (
        <div className="card section" style={{ background: '#0f1417', borderColor: '#1e2a31' }}>
          <strong style={{ color: '#d8f2f6' }}>Liked films</strong>
          <div style={{ height: 8 }} />
          <p className="muted" style={{ color: '#94a9b1' }}>
            Your liked films will appear here when the backend endpoint is connected.
          </p>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span className="pill" style={pillDark}>Tip: Explore Discover and press the Like button</span>
            <span className="pill" style={pillDark}>You can unlike from film pages</span>
          </div>
        </div>
      )}

      {/* Spotlight modal with large player */}
      {spotlight && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Player for ${spotlight.title}`}
          style={modalBackdrop}
          onClick={() => setSpotlight(null)}
        >
          <div
            className="card"
            style={modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="row" style={{ padding: 12, borderBottom: '1px solid #22323b' }}>
              <strong style={{ color: '#eafcff' }}>{spotlight.title}</strong>
              <div className="space" />
              <button
                className="pill"
                style={pillDark}
                onClick={() => setSpotlight(null)}
                aria-label="Close player"
              >
                Close ✕
              </button>
            </div>
            <div style={{ background: '#000', position: 'relative' }}>
              <video
                controls
                style={{ width: '100%', height: 'auto', display: 'block' }}
                src={spotlight.url}
                poster=""
              />
            </div>
            <div className="row" style={{ padding: 12, borderTop: '1px solid #22323b' }}>
              <span className="pill" style={pillDark}>★ {spotlight.likes}</span>
              <span className="pill" style={pillDark}>⏱ {spotlight.duration} min</span>
              <div className="space" />
              <button className="btn secondary">Share</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const pillDark = {
  background: '#0c1114',
  border: '1px solid #22323b',
  color: '#cfe6ea',
};

const modalBackdrop = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(5,8,10,.72)',
  backdropFilter: 'blur(4px)',
  display: 'grid',
  placeItems: 'center',
  padding: 16,
  zIndex: 80,
};

const modalCard = {
  width: 'min(1100px, 100%)',
  background: 'linear-gradient(180deg, #0e1316 0%, #0a0f12 100%)',
  border: '1px solid #22323b',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,.45)',
};
