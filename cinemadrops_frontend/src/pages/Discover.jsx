import React, { useMemo } from 'react';
import { useApi } from '../services/Api';
import FilmCard from '../components/FilmCard';
import { getAssetUrl } from '../utils/assets';

/**
 * PUBLIC_INTERFACE
 * Discover fetches the list of videos from the Lambda-backed API Gateway and renders them.
 *
 * Backend: AWS Lambda via HTTP API (GET /videos_shortfilms)
 * - This component uses the real Lambda-backed endpoint returning S3-listed videos.
 * - Set REACT_APP_API_BASE (or REACT_APP_API_BASE_URL) in your environment to the API Gateway base URL.
 *   Example:
 *     REACT_APP_API_BASE_URL=https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops
 *
 * Response shape (from provided Lambda code):
 *   {
 *     statusCode: 200,
 *     body: {
 *       videos: [
 *         {
 *           title, genre, author, uploadDate, url, ... // fields may vary or include additional S3 metadata
 *         },
 *         ...
 *       ]
 *     }
 *   }
 *
 * This component parses response.body.videos if present, or falls back to response.videos or array root.
 */
export default function Discover() {
  const { useFetch } = useApi();

  // Actual path per Lambda-backed API
  const API_VIDEOS_PATH = '/videos_shortfilms';

  // We rely on ApiProvider: it prefixes base URL and includes credentials.
  const { data, error, isLoading } = useFetch(API_VIDEOS_PATH, {
    fallbackData: [],
    revalidateOnFocus: true,
  });

  // Normalize backend items to the film structure used by FilmCard/Home.
  // Supports Lambda body.videos and graceful fallbacks.
  const films = useMemo(() => {
    // Try to unwrap Lambda envelope: { statusCode, body: { videos: [...] } }
    const unwrap = (() => {
      if (!data) return [];
      // If data is an array already
      if (Array.isArray(data)) return data;
      // If the lambda body has been stringified JSON, try to parse
      const body = typeof data.body === 'string'
        ? safeJsonParse(data.body)
        : (data.body || {});
      // Prefer body.videos
      if (body && Array.isArray(body.videos)) return body.videos;
      // Also handle top-level data.videos
      if (Array.isArray(data.videos)) return data.videos;
      // Some backends might return { items: [...] } or { data: [...] }
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.data)) return data.data;
      return [];
    })();

    return unwrap.map((item, idx) => {
      const id = item.id || item._id || item.key || `video-${idx}`;
      const title =
        item.title ||
        item.name ||
        item.filename ||
        `Video ${idx + 1}`;
      const author =
        item.author ||
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
      const duration =
        item.duration ??
        item.length ??
        item.seconds ??
        0;
      const likes =
        item.likes ??
        item.stars ??
        item.hearts ??
        0;
      const genre = item.genre || item.category || item.type || null;
      const uploadDate = item.uploadDate || item.date || item.createdAt || item.LastModified || null;

      // cover/poster/thumbnail when available
      const cover =
        item.cover_image ||
        item.cover ||
        item.coverUrl ||
        item.thumbnail ||
        item.thumbnailUrl ||
        item.poster ||
        null;

      return {
        id,
        title,
        author,
        likes,
        duration,
        url,
        cover,
        genre,
        uploadDate,
      };
    });
  }, [data]);

  // Small selection of asset images to serve as placeholders when no cover is provided.
  const assetGallery = [
    getAssetUrl('/assets/pexels-amar-29656074.jpg'),
    getAssetUrl('/assets/pexels-jillyjillystudio-33962662.jpg'),
    getAssetUrl('/assets/pexels-delot-29721171.jpg'),
    getAssetUrl('/assets/pexels-andreas-schnabl-1775843-19321355.jpg'),
    getAssetUrl('/assets/pexels-chriszwettler-9407824.jpg'),
  ];
  const defaultPlaceholder = assetGallery[0];

  const pickPreviewImage = (film, index) => {
    const img =
      film.cover ||
      film.cover_image ||
      film.coverUrl ||
      film.thumbnail ||
      film.thumbnailUrl ||
      film.poster ||
      null;
    if (img) return getAssetUrl(img);
    if (assetGallery.length === 0) return defaultPlaceholder;
    return assetGallery[index % assetGallery.length];
  };

  return (
    <div className="page-discover">
      <div className="row" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Discover</h2>
        <div className="space" />
        {/* Future filtering controls (read-only for now) */}
        <span className="pill" aria-pressed="true">For you</span>
        <span className="pill" aria-pressed="false">New</span>
        <span className="pill" aria-pressed="false">Rising</span>
        <span className="pill" aria-pressed="false">Awarded</span>
      </div>

      {/* Loading and error states */}
      {isLoading && (
        <div className="card section" role="status">
          Loading S3 videos...
        </div>
      )}
      {error && (
        <div className="card section" role="alert">
          Could not load videos from API.
          {/* Developer note:
             Ensure REACT_APP_API_BASE or REACT_APP_API_BASE_URL is set and accessible.
             This page integrates with the real Lambda-backed API at GET /videos_shortfilms.
          */}
        </div>
      )}

      {/* Results */}
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
              // Extra fields retained for future detail/player usage:
              genre: f.genre,
              uploadDate: f.uploadDate,
              url: f.url,
            }}
            placeholderImage={defaultPlaceholder}
            previewImage={pickPreviewImage(f, idx)}
          />
        ))}
      </div>

      {/* Empty state */}
      {!isLoading && !error && films.length === 0 && (
        <div className="card section">
          <div className="muted">No videos available yet.</div>
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
