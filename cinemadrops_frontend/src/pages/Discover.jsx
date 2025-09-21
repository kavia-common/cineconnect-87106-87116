import React, { useMemo } from 'react';
import { useApi } from '../services/Api';
import FilmCard from '../components/FilmCard';
import { getAssetUrl } from '../utils/assets';

/**
 * PUBLIC_INTERFACE
 * Discover fetches the list of videos from the backend (S3 metadata/URLs) and shows them
 * in the film grid. Handles loading and error states gracefully.
 *
 * Expected backend endpoint:
 * - GET /api/videos (or similar) -> returns an array of video items with at least an URL
 *
 * NOTE: If your backend uses a different endpoint or payload shape, update the constant
 * API_VIDEOS_PATH below. Please provide the exact endpoint path and field names if available.
 */
export default function Discover() {
  const { useFetch } = useApi();

  // TODO: Request backend to confirm the correct endpoint path.
  // Placeholder assumed path. Adjust to your backend specification:
  // - If your backend exposes `/videos_shortfilms` or `/videos`, update here.
  const API_VIDEOS_PATH = '/api/videos'; // <-- Please confirm and replace if different.

  // We rely on ApiProvider: it prefixes base URL and includes credentials.
  const { data, error, isLoading } = useFetch(API_VIDEOS_PATH, {
    // In absence of the backend, we can show an empty array as fallback.
    fallbackData: [],
    // Revalidate on focus to keep the feed updated
    revalidateOnFocus: true,
  });

  // Normalize backend items to the film structure used by FilmCard/Home.
  // We accept many possible field names so various backends can work without extra code changes.
  const films = useMemo(() => {
    const arr = Array.isArray(data) ? data : (data?.items || data?.data || []);
    if (!Array.isArray(arr)) return [];

    return arr.map((item, idx) => {
      const id = item.id || item._id || item.key || `s3-${idx}`;
      const title =
        item.title ||
        item.name ||
        item.filename ||
        item.displayName ||
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
        item.playbackUrl ||
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

      // cover/poster/thumbnail fields we might receive
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
        url, // not directly used by FilmCard but useful for details page or future player
        cover,
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
        <span className="pill">For you</span>
        <span className="pill">New</span>
        <span className="pill">Rising</span>
        <span className="pill">Awarded</span>
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
          {/* Developer note: Ensure REACT_APP_API_BASE is set and the endpoint exists.
             Requested endpoint details: please provide the exact GET route returning S3 video metadata. */}
        </div>
      )}

      {/* Results */}
      <div className="film-grid">
        {films.map((f, idx) => (
          <FilmCard
            key={f.id}
            film={f}
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
