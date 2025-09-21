import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useApi } from '../services/Api';
import { useAuth } from '../services/Auth';

/**
 * PUBLIC_INTERFACE
 * Profile muestra los videos subidos por el usuario autenticado.
 * Si no hay autenticación, muestra un mensaje e impide ver el perfil personal.
 */
export default function Profile() {
  const { useFetch } = useApi();
  const { user, isAuthenticated, authChecked } = useAuth();
  const [destacado, setDestacado] = useState(null); // { id, titulo, url, ... } | null

  // Construimos parámetros aunque aún no tengamos auth, para mantener orden de hooks.
  const userId = user?.id;
  const email = user?.email;
  const query = userId
    ? `?authorId=${encodeURIComponent(userId)}`
    : (email ? `?email=${encodeURIComponent(email)}` : '');

  // Llamamos al hook SIEMPRE. Si no hay autenticación lista, pasamos null como key (ApiProvider usa SWR y no hará fetch)
  const { data: userVideos = [] } = useFetch(
    authChecked && isAuthenticated ? `/videos${query}` : null,
    { fallbackData: [] }
  );

  // Normalización de datos a estructura usada por la UI
  const usuario = useMemo(() => {
    const nombre = (user?.name || user?.email || 'Tú');
    const seguidores = 0;
    const siguiendo = 0;

    const videos = (userVideos || []).map((v, idx) => ({
      id: v.id || v._id || `v-${idx}`,
      titulo: v.title || v.name || v.filename || `Video ${idx + 1}`,
      url: v.url || v.videoUrl || v.link || '',
      likes: v.likes ?? v.stars ?? 0,
      duracion: v.duration ?? v.length ?? 0,
      creado: v.createdAt || v.date || v.uploadedAt || v.timestamp || null,
      // soporte para portada
      portada: v.cover_image || v.cover || v.coverUrl || v.thumbnail || v.thumbnailUrl || v.poster || null,
    }));

    return {
      id: userId || 'unknown',
      nombre,
      bio: '',
      seguidores,
      siguiendo,
      videos,
    };
  }, [user?.name, user?.email, userId, userVideos]);

  // Estado de carga de autenticación
  if (!authChecked) {
    return (
      <div className="card section">
        <strong>Cargando perfil...</strong>
      </div>
    );
  }

  // Si no hay usuario autenticado, bloquear perfil personal real
  if (!isAuthenticated) {
    return (
      <div className="card section">
        <h2>Tu perfil</h2>
        <p className="muted">
          Aún no has iniciado sesión. Para ver y gestionar tus videos personales, inicia sesión o configura autenticación en el backend.
        </p>
        <div className="pill" style={{ marginTop: 8 }}>
          Requisitos: endpoint GET /auth/me que devuelva tu identidad, y almacenamiento de videos con campo author/email/userId.
        </div>
      </div>
    );
  }

  return (
    <div className="page-profile" style={{ color: '#e8f6f8' }}>
      {/* Contenedor oscuro de portada / bio */}
      <div
        className="card section"
        style={{
          background: 'linear-gradient(180deg, #121619 0%, #0b1013 100%)',
          borderColor: '#1e2a31',
        }}
      >
        <div className="row" style={{ gap: 16, alignItems: 'center' }}>
          <div
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
          <div style={{ display: 'grid', gap: 6 }}>
            <h2 style={{ margin: 0, color: '#eafcff' }}>{usuario.nombre}</h2>
            <div className="muted" style={{ color: '#9fb4bd' }}>
              {usuario.bio || 'Tu espacio personal para gestionar tus cortos.'}
            </div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <span className="pill" style={pillDark}>
                Seguidores: {usuario.seguidores}
              </span>
              <span className="pill" style={pillDark}>
                Siguiendo: {usuario.siguiendo}
              </span>
              <span className="pill" style={pillDark}>
                🎬 {usuario.videos.length} videos
              </span>
            </div>
          </div>
          <div className="space" />
          <button className="btn" style={{ boxShadow: '0 8px 24px rgba(15,163,177,.35)' }}>
            Edit Profile
          </button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Galería de videos */}
      <div
        className="card section"
        style={{ background: '#0f1417', borderColor: '#1e2a31' }}
        aria-label="Galería de videos del usuario"
      >
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <strong style={{ color: '#d8f2f6' }}>Tus videos</strong>
          <span className="muted" style={{ color: '#94a9b1', fontSize: 13 }}>
            Haz clic en una tarjeta para reproducir en grande
          </span>
        </div>

        <div style={{ height: 12 }} />

        {(!usuario.videos || usuario.videos.length === 0) && (
          <div className="muted" style={{ color: '#94a9b1' }}>
            Aún no has subido videos o no se encontraron resultados para tu cuenta.
          </div>
        )}

        <div className="film-grid">
          {(usuario.videos || []).map((v) => (
            <button
              key={v.id}
              className="card film-card"
              onClick={() => setDestacado(v)}
              style={{
                cursor: 'pointer',
                textAlign: 'left',
                background:
                  'linear-gradient(180deg, #11181c 0%, #0d1316 100%)',
                borderColor: '#22323b',
              }}
              aria-label={`Abrir video ${v.titulo}`}
            >
              <div
                className="film-thumb"
                style={{
                  background:
                    'radial-gradient(40% 50% at 20% 10%, rgba(15,163,177,.16), transparent 70%), #0a0f12',
                  position: 'relative'
                }}
              >
                {/* Mostrar portada si está disponible, con fallback a fondo decorativo */}
                {v.portada || v.cover_image || v.cover || v.thumbnail || v.poster ? (
                  <img
                    src={v.portada || v.cover_image || v.cover || v.thumbnail || v.poster}
                    alt={`Portada de ${v.titulo}`}
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
                  ★ {v.likes} • ⏱ {v.duracion}m
                </div>
              </div>
              <div className="film-meta">
                <div className="film-title" style={{ color: '#eafcff' }}>
                  {v.titulo}
                </div>
                <div className="film-author" style={{ color: '#93a8b0' }}>
                  {v.creado && dayjs(v.creado).isValid()
                    ? dayjs(v.creado).format('YYYY-MM-DD HH:mm')
                    : '—'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal destacado con reproductor grande */}
      {destacado && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Reproductor para ${destacado.titulo}`}
          style={modalBackdrop}
          onClick={() => setDestacado(null)}
        >
          <div
            className="card"
            style={modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="row" style={{ padding: 12, borderBottom: '1px solid #22323b' }}>
              <strong style={{ color: '#eafcff' }}>{destacado.titulo}</strong>
              <div className="space" />
              <button
                className="pill"
                style={pillDark}
                onClick={() => setDestacado(null)}
                aria-label="Cerrar reproductor"
              >
                Cerrar ✕
              </button>
            </div>
            <div style={{ background: '#000', position: 'relative' }}>
              <video
                controls
                style={{ width: '100%', height: 'auto', display: 'block' }}
                src={destacado.url}
                poster=""
              />
            </div>
            <div className="row" style={{ padding: 12, borderTop: '1px solid #22323b' }}>
              <span className="pill" style={pillDark}>★ {destacado.likes}</span>
              <span className="pill" style={pillDark}>⏱ {destacado.duracion} min</span>
              <div className="space" />
              <button className="btn secondary">Compartir</button>
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
