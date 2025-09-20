/// Firebase initialization for Cinemadrops Frontend
/// This file initializes Firebase App and exposes Firebase Storage (and optionally Analytics)
/// so uploads/downloads can be performed from anywhere in the app.

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration for Cinemadrops loaded from environment variables.
 * For React apps, env vars must be prefixed with REACT_APP_ to be exposed at build time.
 *
 * Required .env variables:
 * - REACT_APP_FIREBASE_API_KEY
 * - REACT_APP_FIREBASE_AUTH_DOMAIN
 * - REACT_APP_FIREBASE_PROJECT_ID
 * - REACT_APP_FIREBASE_STORAGE_BUCKET
 * - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
 * - REACT_APP_FIREBASE_APP_ID
 * - REACT_APP_FIREBASE_MEASUREMENT_ID (optional for Analytics)
 *
 * Do not commit real secrets. Provide them via environment or a local .env file.
 */
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  // measurementId is optional; Analytics will only initialize if both supported and provided
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App (singleton)
const app = initializeApp(firebaseConfig);

/** Storage instance for uploads */
export const storage = getStorage(app);
/** Firestore instance for metadata */
export const db = getFirestore(app);
/** This is a public export for consumers to optionally use the Firebase app instance. */
export { app };

/**
 * Optionally export Analytics if supported (in browser contexts) and a measurementId is provided.
 * Some test and SSR environments may not support Analytics; we guard accordingly.
 */
export let analytics = null;
(async () => {
  try {
    // Only try analytics in real browser environment
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    const hasMeasurementId = !!process.env.REACT_APP_FIREBASE_MEASUREMENT_ID;
    if (isBrowser && hasMeasurementId && (await isAnalyticsSupported())) {
      analytics = getAnalytics(app);
    }
  } catch {
    // Silently ignore analytics init errors (e.g., non-browser environment)
  }
})();
