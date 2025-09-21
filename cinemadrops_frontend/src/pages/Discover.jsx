import React, { useState, useEffect, useMemo } from 'react';
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
 * Response shape (from English Lambda code):
 *   {
 *     status: "success",
 *     message: "X videos found",
 *     total_videos: X,
 *     videos: [
 *       {
 *         id, title, genre, author, upload_date, url, size_mb, filename, s3_key
 *       },
 *       ...
 *     ]
 *   }
 */
export default function Discover() {
  // Direct state management instead of useApi hook
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded API configuration
  const API_BASE_URL = 'https://s4myuxoa90.execute-api.us-east-2.amazonaws.com/devops';
  const API_VIDEOS_PATH = '/videos_shortfilms';
  const FULL_API_URL = API_BASE_URL + API_VIDEOS_PATH;

  // Direct fetch function
  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching from:', FULL_API_URL);
      
      const response = await fetch(FULL_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      setData(responseData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  // Normalize backend items to the film structure used by FilmCard/Home.
  // Updated for English Lambda response format
  const films = useMemo(() => {
    // Try to unwrap Lambda response: { status, videos: [...] }
    const unwrap = (() => {
      if (!data) return [];
      
      // If data is an array already (unlikely but possible)
      if (Array.isArray(data)) return data;
      
      // Standard Lambda response format: { status: "success", videos: [...] }
      if (data.videos && Array.isArray(data.videos)) return data.videos;
      
      // If the lambda body has been stringified JSON, try to parse
      if (data.body) {
        const body = typeof data.body === 'string'
          ? safeJsonParse(data.body)
          : data.body;
        if (body && Array.isArray(body.videos)) return body.videos;
      }
      
      // Fallback patterns for other possible response formats
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.data)) return data.data;
      
      return [];
    })();

    return unwrap.map((item, idx) => {
      // Primary field mapping for English Lambda
      const id = item.id || item._id || item.key || `video-${idx}`;
      
      // Title mapping - prioritize English fields, fallback to Spanish
      const title = item.title || 
                   item.name || 
                   item.nombre ||  // Spanish fallback
                   item.filename?.replace(/\.[^/.]+$/, '') || // Remove file extension
                   `Video ${idx + 1}`;
      
      // Author mapping - prioritize English fields, fallback to Spanish
      const author = item.author || 
                    item.creator ||
                    item.autor ||  // Spanish fallback
                    item.uploader || 
                    item.owner || 
                    'Unknown';
      
      // URL mapping
      const url = item.url || 
                 item.link || 
                 item.Location || 
                 item.signedUrl || 
                 item.videoUrl || 
                 '';
      
      // Duration and likes (optional fields)
      const duration = item.duration ?? 
                      item.length ?? 
                      item.seconds ?? 
                      0;
      
      const likes = item.likes ?? 
                   item.stars ?? 
                   item.hearts ?? 
                   item.views ?? 
                   0;
      
      // Genre mapping
      const genre = item.genre || 
                   item.category || 
                   item.type || 
                   'Uncategorized';
      
      // Upload date mapping - prioritize English fields, fallback to Spanish
      const uploadDate = item.upload_date || 
                        item.uploadDate || 
                        item.fecha_subida ||  // Spanish fallback
                        item.date || 
                        item.createdAt || 
                        item.LastModified || 
                        null;

      // Cover/poster/thumbnail when available
      const cover = item.cover_image ||
                   item.cover ||
                   item.coverUrl ||
                   item.thumbnail ||
                   item.thumbnailUrl ||
                   item.poster ||
                   null;

      // Additional metadata from S3
      const size_mb = item.size_mb || 0;
      const filename = item.filename || null;

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
        // Additional fields for potential future use
        size_mb,
        filename,
      };
    });
  }, [data]);

  // Asset gallery for placeholder images when no cover is provided
  const assetGallery = [
    getAssetUrl('/assets/pexels-amar-29656074.jpg'),
    getAssetUrl('/assets/pexels-jillyjillystudio-33962662.jpg'),
    getAssetUrl('/assets/pexels-delot-29721171.jpg'),
    getAssetUrl('/assets/pexels-andreas-schnabl-1775843-19321355.jpg'),
    getAssetUrl('/assets/pexels-chriszwettler-9407824.jpg'),
  ];
  const defaultPlaceholder = assetGallery[0];

  const pickPreviewImage = (film, index) => {
    const img = film.cover ||
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

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '10px', 
          margin: '10px 0', 
          borderRadius: '4px', 
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#666'
        }}>
          Debug: {films.length} films loaded from {data?.total_videos || 'unknown'} total videos
          {data?.status && ` (API Status: ${data.status})`}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="card section" role="status">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading videos from S3...
          </div>
        </div>
      )}

      {/* Error state - Enhanced debugging */}
      {error && (
        <div className="card section" role="alert">
          <div style={{ color: '#dc3545' }}>
            <strong>Could not load videos from API</strong>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              <strong>Error:</strong> {error.toString()}
            </div>
            <div style={{ fontSize: '12px', marginTop: '12px', fontFamily: 'monospace', background: '#f8f9fa', padding: '8px', borderRadius: '4px' }}>
              <div><strong>Debug Information:</strong></div>
              <div>API Path: {API_VIDEOS_PATH}</div>
              <div>Base URL: {API_BASE_URL}</div>
              <div>Full URL: {FULL_API_URL}</div>
              <div>Error Type: {error?.name || 'Unknown'}</div>
              <div>Network Error: {error?.message?.includes('fetch') ? 'Yes (CORS/Network issue)' : 'No'}</div>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              <strong>Common solutions:</strong>
              <br />
              1. Check if API Gateway URL is correct and accessible
              <br />
              2. Ensure CORS is enabled in API Gateway
              <br />
              3. Check browser console for network errors
              <br />
              4. Verify Lambda function is deployed and working
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
            >
              Retry Loading
            </button>
          </div>
        </div>
      )}

      {/* Results grid */}
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
                // Additional metadata
                size_mb: f.size_mb,
                filename: f.filename,
              }}
              placeholderImage={defaultPlaceholder}
              previewImage={pickPreviewImage(f, idx)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
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
            {data && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '16px' }}>
                API Response: {data.status || 'unknown'} 
                {data.message && ` - ${data.message}`}
              </div>
            )}
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