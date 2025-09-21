import React, { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';

// Tipos y tamaños permitidos
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska'
];
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const API_ENDPOINT = 'https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops/videos_shortfilms';

/**
 * PUBLIC_INTERFACE
 * Componente de sección para subir y listar videos con portada.
 * - Formulario con nombre, género, autor/creador, archivo de video y portada opcional.
 * - Valida tipos/tamaño de archivos.
 * - Barra de progreso de carga.
 * - Consume endpoint AWS para subir (FormData) y listar.
 * - Lista videos con nombre, tamaño, fecha, enlace y la portada si existe.
 */
export default function VideoUploadSection() {
  const [nombre, setNombre] = useState('');
  const [genero, setGenero] = useState('Drama');
  const [autor, setAutor] = useState('');
  const [file, setFile] = useState(null);

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [dragOver, setDragOver] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [mensaje, setMensaje] = useState(null); // { type: 'success'|'error', text: string }

  const [lista, setLista] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);

  const inputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Géneros sugeridos
  const generos = useMemo(
    () => ['Drama', 'Comedia', 'Acción', 'Documental', 'Animación', 'Horror', 'Experimental', 'Sci-Fi'],
    []
  );

  useEffect(() => {
    // Carga inicial de lista de videos
    const fetchList = async () => {
      try {
        setCargandoLista(true);
        const res = await fetch(API_ENDPOINT, { method: 'GET' });
        // Puede ser JSON o texto; intentamos JSON primero.
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
        // Normalizar a un array de objetos
        if (Array.isArray(data)) {
          setLista(data);
        } else if (data && Array.isArray(data.items)) {
          setLista(data.items);
        } else if (data && Array.isArray(data.data)) {
          setLista(data.data);
        } else {
          setLista([]);
        }
      } catch (e) {
        setMensaje({ type: 'error', text: 'Error al cargar la lista de videos.' });
      } finally {
        setCargandoLista(false);
      }
    };
    fetchList();
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) {
      const f = e.dataTransfer.files[0];
      validateAndSetVideo(f);
    }
  };

  const validateAndSetVideo = (f) => {
    if (!f) return;
    if (!ALLOWED_VIDEO_TYPES.includes(f.type)) {
      setMensaje({
        type: 'error',
        text: 'Tipo de archivo no permitido. Sube un video MP4, WebM, OGG, MOV, AVI o MKV.'
      });
      return;
    }
    if (f.size > MAX_VIDEO_SIZE) {
      setMensaje({
        type: 'error',
        text: 'El archivo supera el tamaño máximo permitido (100MB).'
      });
      return;
    }
    setMensaje(null);
    setFile(f);
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    validateAndSetVideo(f);
  };

  const validateAndSetCover = (f) => {
    if (!f) {
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      setMensaje({
        type: 'error',
        text: 'La portada debe ser una imagen JPG, PNG o WEBP.'
      });
      return;
    }
    if (f.size > MAX_IMAGE_SIZE) {
      setMensaje({
        type: 'error',
        text: 'La imagen de portada supera el máximo de 5MB.'
      });
      return;
    }
    setMensaje(null);
    setCoverFile(f);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const onCoverChange = (e) => {
    const f = e.target.files?.[0];
    validateAndSetCover(f);
  };

  const handleUpload = async () => {
    if (!nombre.trim() || !autor.trim() || !file) {
      setMensaje({
        type: 'error',
        text: 'Completa los campos requeridos y selecciona un archivo de video.'
      });
      return;
    }

    setCargando(true);
    setProgreso(0);
    setMensaje(null);

    try {
      // Usamos XMLHttpRequest para poder reportar progreso de subida
      const form = new FormData();
      form.append('name', nombre);
      form.append('author', autor);
      form.append('genre', genero);
      form.append('file', file);
      // Adjuntamos imagen de portada si existe
      if (coverFile) {
        // el backend puede aceptar 'cover_image' como archivo multipart
        form.append('cover_image', coverFile);
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', API_ENDPOINT, true);

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.round((evt.loaded / evt.total) * 100);
          setProgreso(percent);
        }
      };

      const done = new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            // 2xx éxito
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(xhr.responseText || `Error ${xhr.status}`));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Error de red durante la subida.'));
      });

      xhr.send(form);
      await done;

      setMensaje({ type: 'success', text: '¡Video subido exitosamente!' });
      setNombre('');
      setAutor('');
      setGenero('Drama');
      setFile(null);
      setCoverFile(null);
      setCoverPreview(null);
      setProgreso(0);

      // Recargar lista
      try {
        setCargandoLista(true);
        const res = await fetch(API_ENDPOINT, { method: 'GET' });
        const contentType = res.headers.get('content-type') || '';
        let data;
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
        if (Array.isArray(data)) {
          setLista(data);
        } else if (data && Array.isArray(data.items)) {
          setLista(data.items);
        } else if (data && Array.isArray(data.data)) {
          setLista(data.data);
        } else {
          setLista([]);
        }
      } catch {
        // si falla, mantenemos la lista anterior
      } finally {
        setCargandoLista(false);
      }
    } catch (err) {
      setMensaje({ type: 'error', text: `No se pudo subir el video. ${err?.message || ''}` });
    } finally {
      setCargando(false);
    }
  };

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

  const placeholderThumb = (
    <div className="film-thumb" style={{ background: 'var(--cd-bg)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--cd-muted)' }}>
        <div className="pill">Sin portada</div>
      </div>
    </div>
  );

  return (
    <div className="card section" style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>Subir Video</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        Comparte tu corto con la comunidad. Tamaño máximo 100MB. Tipos: MP4, WebM, OGG, MOV, AVI, MKV.
      </p>

      {/* Mensajes de estado */}
      {mensaje && (
        <div
          className="pill"
          role={mensaje.type === 'error' ? 'alert' : 'status'}
          style={{
            borderColor: mensaje.type === 'error' ? 'var(--cd-error)' : 'var(--cd-secondary)',
            background: 'var(--cd-chip-bg)',
            color: 'inherit'
          }}
        >
          {mensaje.text}
        </div>
      )}

      {/* Formulario */}
      <div className="row" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ minWidth: 220, flex: 1 }}>
          <label className="muted" style={{ fontSize: 13 }}>Nombre del video</label>
          <input
            className="input"
            placeholder="Ej. Amanecer en la ciudad"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <label className="muted" style={{ fontSize: 13 }}>Género</label>
          <select className="input" value={genero} onChange={(e) => setGenero(e.target.value)}>
            {generos.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: 220, flex: 1 }}>
          <label className="muted" style={{ fontSize: 13 }}>Autor / Creador</label>
          <input
            className="input"
            placeholder="Tu nombre artístico"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
          />
        </div>
      </div>

      {/* Área de drag-and-drop del video */}
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
          cursor: 'pointer'
        }}
        aria-label="Área para arrastrar y soltar archivo de video"
        role="button"
        tabIndex={0}
      >
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className="badge">Arrastra y suelta tu video aquí</span>
        </div>
        <div style={{ height: 8 }} />
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className="muted">o</span>
          <button
            type="button"
            className="btn secondary"
            style={{ marginLeft: 8 }}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Seleccionar archivo
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
            <strong>Seleccionado:</strong> {file.name} — {humanFileSize(file.size)}
          </div>
        )}
      </div>

      {/* Selector de imagen de portada */}
      <div className="card section" style={{ border: '1px dashed var(--cd-border)' }}>
        <strong>Portada (opcional)</strong>
        <div style={{ height: 8 }} />
        <div className="row" style={{ alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ width: 280, maxWidth: '100%' }}>
            <div className="film-thumb" style={{ position: 'relative', background: 'var(--cd-bg)' }}>
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Vista previa de portada"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <div className="pill">Sin portada seleccionada</div>
                </div>
              )}
            </div>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <input
              type="file"
              ref={coverInputRef}
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              style={{ display: 'none' }}
              onChange={onCoverChange}
            />
            <button
              className="btn secondary"
              onClick={() => coverInputRef.current?.click()}
              type="button"
            >
              Elegir imagen
            </button>
            {coverFile && (
              <button
                className="pill"
                type="button"
                onClick={() => { setCoverFile(null); setCoverPreview(null); }}
              >
                Quitar portada
              </button>
            )}
          </div>
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
          Formatos permitidos: JPG, PNG, WEBP. Máximo 5MB.
        </div>
      </div>

      {/* Progreso y botón de subida */}
      <div className="row" style={{ alignItems: 'center', gap: 12 }}>
        <button className="btn" onClick={handleUpload} disabled={cargando}>
          {cargando ? 'Subiendo...' : 'Subir video'}
        </button>
        {cargando && (
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: '100%',
                height: 10,
                background: 'var(--cd-chip-bg)',
                borderRadius: 999,
                overflow: 'hidden',
                border: '1px solid var(--cd-border)'
              }}
              aria-label="Barra de progreso de carga"
            >
              <div
                style={{
                  height: '100%',
                  width: `${progreso}%`,
                  background: 'var(--cd-primary)',
                  transition: 'width .2s ease'
                }}
              />
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{progreso}%</div>
          </div>
        )}
      </div>

      {/* Lista de videos subidos */}
      <div className="card section" style={{ border: '1px dashed var(--cd-border)' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong>Videos subidos</strong>
          {cargandoLista && <span className="muted">Cargando...</span>}
        </div>
        <div style={{ height: 8 }} />
        {(!lista || lista.length === 0) && !cargandoLista && (
          <div className="muted">Aún no hay videos. ¡Sé el primero en compartir!</div>
        )}
        {(lista || []).map((v, idx) => {
          // Normalización de campos, incluyendo portada
          const name = v.name || v.title || v.filename || `Video ${idx + 1}`;
          const size = v.size || v.filesize || v.contentLength || v.length || null;
          const dateRaw = v.date || v.createdAt || v.LastModified || v.uploadedAt || v.timestamp;
          const dateFmt = dateRaw ? (dayjs(dateRaw).isValid() ? dayjs(dateRaw).format('YYYY-MM-DD HH:mm') : String(dateRaw)) : '—';
          const url = v.url || v.link || v.Location || v.signedUrl || v.videoUrl || '#';
          const cover =
            v.cover_image ||
            v.cover ||
            v.coverUrl ||
            v.thumbnail ||
            v.thumbnailUrl ||
            v.poster ||
            null;

          return (
            <div
              key={v.id || name + idx}
              className="row"
              style={{
                justifyContent: 'space-between',
                padding: '12px 0',
                borderTop: '1px solid var(--cd-border)',
                alignItems: 'center',
                gap: 14
              }}
            >
              <div style={{ width: 200, maxWidth: '30%', flexShrink: 0 }}>
                {cover ? (
                  <img
                    src={cover}
                    alt={`Portada de ${name}`}
                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 10, border: '1px solid var(--cd-border)' }}
                  />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '16/9' }}>{placeholderThumb}</div>
                )}
              </div>
              <div style={{ display: 'grid', minWidth: 0 }}>
                <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                <span className="muted" style={{ fontSize: 12 }}>
                  {size ? humanFileSize(size) : 'Tamaño desconocido'} • {dateFmt}
                </span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                {url && url !== '#' ? (
                  <a className="btn secondary" href={url} target="_blank" rel="noreferrer">
                    Ver / Reproducir
                  </a>
                ) : (
                  <span className="pill">Sin enlace</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
