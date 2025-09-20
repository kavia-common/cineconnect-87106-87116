const AWS_API_BASE = process.env.REACT_APP_AWS_API_BASE || ''; // PUBLIC: must be set by user in .env

/**
 * INTERNAL: Derives REST URL from provided ARN or returns as-is if it's already an https URL.
 * Accepts either:
 * - ARN form: arn:aws:execute-api:region:account:apiId/stage/VERB/path...
 * - Full https form: https://{apiId}.execute-api.{region}.amazonaws.com/{stage}/path...
 * For this project we expect REACT_APP_AWS_API_BASE to be a base URL like:
 *   https://7r49ns3v2i.execute-api.us-east-2.amazonaws.com/prod
 */
function normalizeBase(input) {
  if (!input) return '';
  if (input.startsWith('http')) return input.replace(/\/+$/, '');
  if (input.startsWith('arn:aws:execute-api:')) {
    // Parse ARN to construct a usable HTTPS URL
    // arn:aws:execute-api:{region}:{account}:{apiId}/{stage}/{method}/{resourcePath...}
    const parts = input.split(':');
    const region = parts[3];
    const rest = parts.slice(5).join(':'); // {apiId}/{stage}/{method}/{resource...}
    const [apiStageAndBeyond] = rest.split(' '); // safety
    const segs = apiStageAndBeyond.split('/');
    const apiId = segs[0];
    const stage = segs[1] || 'prod';
    return `https://${apiId}.execute-api.${region}.amazonaws.com/${stage}`.replace(/\/+$/, '');
  }
  return input.replace(/\/+$/, '');
}

const BASE = normalizeBase(AWS_API_BASE);

// PUBLIC_INTERFACE
export async function listVideos() {
  /** Fetch list of all videos from AWS API Gateway. Returns array of videos. */
  const url = `${BASE}/resources/VIDEOS`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`listVideos failed: ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// PUBLIC_INTERFACE
export async function getVideoByKey(videoKey) {
  /** Fetch a single video by key (path-encoded) from AWS API Gateway. */
  if (!videoKey) throw new Error('videoKey is required');
  const encoded = encodeURIComponent(videoKey).replace(/\*/g, '%2A');
  const url = `${BASE}/resources/VIDEOS/${encoded}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`getVideoByKey failed: ${res.status}`);
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// PUBLIC_INTERFACE
export async function uploadVideo({ file, title, description }) {
  /**
   * Upload a video using POST endpoint.
   * If backend expects multipart/form-data, we send FormData with file and metadata.
   * Falls back to JSON if file is not provided.
   */
  const url = `${BASE}/resources/UPLOAD`;

  if (file) {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    if (description) form.append('description', description);

    const res = await fetch(url, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) throw new Error(`uploadVideo failed: ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
  } else {
    const payload = { title, description };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`uploadVideo failed: ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
  }
}
