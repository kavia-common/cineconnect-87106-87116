 // PUBLIC_INTERFACE
 /**
  * getAssetUrl returns a URL that correctly points to a static asset bundled under the app's public folder.
  * It safely prefixes the provided path with PUBLIC_URL when necessary so that deployments under subpaths work.
  *
  * Usage:
  *   <img src={getAssetUrl('/assets/my-image.jpg')} alt="" />
  *
  * Notes:
  * - Place your static files inside the app's public/assets directory at build time.
  * - For external URLs (http/https/data), the function returns the input unchanged.
  */
 export function getAssetUrl(path) {
   if (!path) return path;
   // If it's already an absolute URL or data URI, return as-is
   if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;

   // Normalize leading slash for public assets
   const normalized = path.startsWith('/') ? path : `/${path}`;

   // PUBLIC_URL is set by CRA at build time and at runtime
   const base = process.env.PUBLIC_URL || '';
   return `${base}${normalized}`;
 }
