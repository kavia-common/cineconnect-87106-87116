/**
 * PUBLIC_INTERFACE
 * assetsImages exports the list of available cover images served from the public /assets folder.
 * Use these absolute URLs directly as <img src="/assets/filename.jpg" />.
 */
export const assetsImages = [
  '/assets/pexels-alvarobalderas-20747775.jpg',
  '/assets/pexels-amar-29656074.jpg',
  '/assets/pexels-andreas-schnabl-1775843-19321355.jpg',
  '/assets/pexels-chriszwettler-9407824.jpg',
  '/assets/pexels-delot-29721171.jpg',
  '/assets/pexels-guillermo-berlin-1524368912-30068229.jpg',
  '/assets/pexels-jillyjillystudio-33962662.jpg',
  '/assets/pexels-kalistro666-29263909.jpg',
];

/**
 * PUBLIC_INTERFACE
 * Returns a cover URL cycling over the assetsImages by index, or null if none available.
 */
export function getCoverByIndex(index) {
  if (!assetsImages || assetsImages.length === 0) return null;
  const idx = Math.abs(Number.isFinite(index) ? index : 0) % assetsImages.length;
  return assetsImages[idx];
}
