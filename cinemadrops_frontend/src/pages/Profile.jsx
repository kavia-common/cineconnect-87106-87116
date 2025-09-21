import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';

/**
 * PUBLIC_INTERFACE
 * Profile muestra los videos subidos por el usuario actual (simulado) en modo oscuro,
 * con galería de tarjetas grandes y un reproductor destacado en modal al hacer clic.
 * Textos en español y estética "playful".
 */
export default function Profile() {
  // Simulación de usuario actual si no hay autenticación
  const usuario = useMemo(
    () => ({
      id: 'me',
      nombre: 'Tú',
      bio: 'Creador/a apasionado/a por los cortos emotivos con toques experimentales.',
      seguidores: 1240,
      siguiendo: 312,
      // Lista de videos (mock). Si tienes API real, reemplaza con fetch/swr.
      videos: [
        {
          id: 'v1',
          titulo: 'Luz de Invierno',
          url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          likes: 210,
          duracion: 4,
          creado: '2024-09-01T12:31:00Z',
        },
        {
          id: 'v2',
          titulo: 'Café a Medianoche',
          url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          likes: 152,
          duracion: 6,
          creado: '2024-08-11T08:22:00Z',
        },
        {
          id: 'v3',
          titulo: 'Sombras en el Parque',
          url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          likes: 397,
          duracion: 9,
          creado: '2024-07-20T17:45:00Z',
        },
        {
          id: 'v4',
          titulo: 'Tránsito',
          url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          likes: 89,
          duracion: 3,
          creado: '2024-07-10T10:10:00Z',
        },
      ],
    }),
    []
  );

  const [destacado, setDestacado] = useState(null); // { id, titulo, url, ... } | null

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
              {usuario.bio}
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
            Editar perfil
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
                }}
              >
                <div
                  className="badge"
                  style={{
                    background: 'rgba(9,13,15,.8)',
                    borderColor: '#20313a',
                    color: '#d6eef2',
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
                  {dayjs(v.creado).isValid()
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
