import React, { useState, useEffect, useMemo } from 'react';
import FilmCard from '../components/FilmCard';
import { getAssetUrl } from '../utils/assets';

/**
 * PUBLIC_INTERFACE
 * Discover fetches the list of videos from the Lambda-backed API Gateway and renders them.
 *
 * Backend: AWS Lambda via HTTP API (GET /videos_shortfilms)
 * - Set REACT_APP_API_BASE (or REACT_APP_API_BASE_URL) to the API Gateway base URL.
 *
 * Response shape:
 *   {
 *     status: "success",
 *     message: "X videos found",
 *     total_videos: X,
 *     videos: [{ id, title, genre, author, upload_date, url, size_mb, filename, s3_key }, ...]
 *   }
 */
export default function Discover() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_BASE ||
    'https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops';
  const API_VIDEOS_PATH = '/videos_shortfilms';
  const FULL_API_URL = `${API_BASE_URL}${API_VIDEOS_PATH}`;

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(FULL_API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      // Attempt to parse JSON; if not JSON, read text and try to JSON.parse it
      const contentType = response.headers.get('content-type') || '';
      let responseData;
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        try { responseData = JSON.parse(text); } catch { responseData = text; }
      }
      setData(responseData);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalize backend items to the film structure used by FilmCard/Home.
  const films = useMemo(() => {
    const unwrap = (() => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.videos && Array.isArray(data.videos)) return data.videos;
      if (data.body) {
        const body = typeof data.body === 'string' ? safeJsonParse(data.body) : data.body;
        if (body && Array.isArray(body.videos)) return body.videos;
      }
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.data)) return data.data;
      return [];
    })();

    return unwrap.map((item, idx) => {
      const id = item.id || item._id || item.key || `video-${idx}`;
      const title =
        item.title ||
        item.name ||
        item.nombre ||
        item.filename?.replace(/\.[^/.]+$/, '') ||
        `Video ${idx + 1}`;
      const author =
        item.author ||
        item.creator ||
        item.autor ||
        item.uploader ||
        item.owner ||
        'Unknown';
      const url =
        item.url ||
        item.link ||
        item.Location ||
        item.signedUrl ||
        item.videoUrl ||
        '';
      const duration = item.duration ?? item.length ?? item.seconds ?? 0;
      const likes = item.likes ?? item.stars ?? item.hearts ?? item.views ?? 0;
      const genre = item.genre || item.category || item.type || 'Uncategorized';
      const uploadDate =
        item.upload_date ||
        item.uploadDate ||
        item.fecha_subida ||
        item.date ||
        item.createdAt ||
        item.LastModified ||
        null;
      const size_mb = item.size_mb || 0;
      const filename = item.filename || null;

      return {
        id,
        title,
        author,
        likes,
        duration,
        url,
        genre,
        uploadDate,
        size_mb,
        filename,
      };
    });
  }, [data]);

  // Import-resolved local images (ensures bundler resolves files and prevents 404s)
  const galleryImports = [
    getAssetUrl('/assets/pexels-amar-29656074.jpg'),
    getAssetUrl('/assets/pexels-jillyjillystudio-33962662.jpg'),
    getAssetUrl('/assets/pexels-delot-29721171.jpg'),
    getAssetUrl('/assets/pexels-andreas-schnabl-1775843-19321355.jpg'),
    getAssetUrl('/assets/pexels-chriszwettler-9407824.jpg'),
  ];

  // Ensure we have at least one valid placeholder (if none, fallback to a neutral 1x1 PNG)
  const defaultPlaceholder =
    galleryImports[0] ||
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP4BwQACfsD/u8C0S8AAAAASUVORK5CYII=';

  // Always use local images for previews, cycling through; adds extra safety for index bounds.
  const pickPreviewImage = (_film, index) => {
    if (!galleryImports || galleryImports.length === 0) return defaultPlaceholder;
    const safeIndex = Math.abs(index) % galleryImports.length;
    return galleryImports[safeIndex] || defaultPlaceholder;
  };

  return (
    <div className="page-discover">
      <div className="row" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Discover</h2>
        <div className="space" />
        <span className="pill" aria-pressed="true">For you</span>
        <span className="pill" aria-pressed="false">New</span>
        <span className="pill" aria-pressed="false">Rising</span>
        <span className="pill" aria-pressed="false">Awarded</span>
      </div>

      {isLoading && (
        <div className="card section" role="status">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading videos...
          </div>
        </div>
      )}

      {error && (
        <div className="card section" role="alert">
          <div style={{ color: '#dc3545' }}>
            <strong>Could not load videos from API</strong>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              <strong>Error:</strong> {error.toString()}
            </div>
            <button
              onClick={fetchVideos}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              type="button"
            >
              Retry Loading
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && films.length > 0 && (
        <div className="film-grid">
          {films.map((f, idx) => (
            <FilmCard
              key={f.id}
              film={{
                id: f.id,
                title: f.title,
                author: f.author,
                likes: f.likes,
                duration: f.duration,
                genre: f.genre,
                uploadDate: f.uploadDate,
                url: f.url,
                size_mb: f.size_mb,
                filename: f.filename,
              }}
              placeholderImage={defaultPlaceholder}
              previewImage={pickPreviewImage(f, idx)}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && films.length === 0 && (
        <div className="card section">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
            <div className="muted" style={{ fontSize: '18px', marginBottom: '8px' }}>
              No videos available yet
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Upload your first video to get started
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}