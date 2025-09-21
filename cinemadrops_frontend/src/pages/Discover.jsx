import React, { useState, useEffect, useMemo } from 'react';
import FilmCard from '../components/FilmCard';
import { getAssetUrl } from '../utils/assets';
import { Link } from 'react-router-dom';

/**
 * Image import pattern note:
 * PUBLIC_INTERFACE
 * For assets placed under src/assets/, always import them explicitly so the bundler
 * includes them in the build and resolves the correct URLs. Avoid using string paths
 * like '/assets/...' for files under src, as that targets the public/ folder instead.
 *
 * Example:
 *   import Img1 from '../../assets/file.jpg';
 *   const assetImages = [Img1, ...];
 *
 * If you place files under public/assets, prefer absolute paths at runtime:
 *   <img src="/assets/file.jpg" />
 *
 * Here we import from src/assets/ to use them as thumbnails in Discover.
 */
import Img1 from '../assets/pexels-alvarobalderas-20747775.jpg';
import Img2 from '../assets/pexels-amar-29656074.jpg';
import Img3 from '../assets/pexels-andreas-schnabl-1775843-19321355.jpg';
import Img4 from '../assets/pexels-chriszwettler-9407824.jpg';
import Img5 from '../assets/pexels-delot-29721171.jpg';
import Img6 from '../assets/pexels-guillermo-berlin-1524368912-30068229.jpg';
import Img7 from '../assets/pexels-jillyjillystudio-33962662.jpg';
import Img8 from '../assets/pexels-kalistro666-29263909.jpg';

export default function Discover() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops';
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
      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const films = useMemo(() => {
    const unwrap = (() => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.videos && Array.isArray(data.videos)) return data.videos;
      if (data.body) {
        const body = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        if (body && Array.isArray(body.videos)) return body.videos;
      }
      return [];
    })();

    return unwrap.map((item, idx) => {
      const id = item.id || item._id || item.key || `video-${idx}`;
      const title = item.title || 
                   item.name || 
                   item.nombre ||
                   item.filename?.replace(/\.[^/.]+$/, '') || 
                   `Video ${idx + 1}`;
      const author = item.author || 
                    item.creator ||
                    item.autor ||
                    item.uploader ||
                    item.owner ||
                    'Unknown';
      const url = item.url || 
                 item.link || 
                 item.Location || 
                 item.signedUrl || 
                 item.videoUrl || 
                 '';
      const duration = item.duration ?? item.length ?? item.seconds ?? 0;
      const likes = item.likes ?? item.stars ?? item.hearts ?? item.views ?? 0;
      const genre = item.genre || item.category || item.type || 'Uncategorized';
      const uploadDate = item.upload_date ||
                        item.uploadDate ||
                        item.fecha_subida ||
                        item.date ||
                        item.createdAt ||
                        item.LastModified ||
                        null;

      return {
        id,
        // if API provides a filename or key use it for deep-linking to details page
        filename: item.filename || item.key || item.name || null,
        title,
        author,
        likes,
        duration,
        url,
        genre,
        uploadDate,
        // keep original item as well in case details page wants full shape
        _raw: item,
      };
    });
  }, [data]);

  // Explicit imports ensure correct bundling; rotate over them for previews.
  const assetImages = [Img1, Img2, Img3, Img4, Img5, Img6, Img7, Img8];

  const pickPreviewImage = (_film, index) => {
    const imageIndex = index % assetImages.length;
    return assetImages[imageIndex];
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
          Loading videos...
        </div>
      )}

      {error && (
        <div className="card section" role="alert">
          Could not load videos. 
          <button
            onClick={fetchVideos}
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && films.length > 0 && (
        <div className="film-grid">
          {films.map((film, idx) => {
            const toHref = `/film/${encodeURIComponent(film.filename || film.id)}`;
            // We pass complete film data via state so FilmDetails can render instantly without extra fetch
            const state = { film, from: 'discover' };
            return (
              <Link
                key={film.id}
                to={toHref}
                state={state}
                className="card film-card"
                style={{ textDecoration: 'none' }}
                aria-label={`Abrir corto ${film.title}`}
              >
                <div
                  className="film-thumb"
                  style={{ position: 'relative', background: 'var(--cd-bg)' }}
                >
                  <img
                    src={pickPreviewImage(film, idx)}
                    alt={`Preview de ${film.title}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = getAssetUrl('/assets/pexels-amar-29656074.jpg');
                    }}
                  />
                  <div className="badge">★ {film.likes} • ⏱ {film.duration}m</div>
                </div>
                <div className="film-meta">
                  <div className="film-title">{film.title}</div>
                  <div className="film-author">by {film.author}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!isLoading && !error && films.length === 0 && (
        <div className="card section">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
            <div style={{ fontSize: '18px', marginBottom: '8px', color: '#666' }}>
              No videos available yet
            </div>
            <div style={{ fontSize: '14px', color: '#999' }}>
              Upload your first video to get started
            </div>
          </div>
        </div>
      )}
    </div>
  );
}