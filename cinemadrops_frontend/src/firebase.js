/// Firebase initialization for Cinemadrops Frontend
/// This file initializes Firebase App and exposes Firebase Storage (and optionally Analytics)
/// so uploads/downloads can be performed from anywhere in the app.

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration for Cinemadrops.
 * Note: storageBucket corrected to include the proper domain.
 * If you prefer using environment variables, you can swap these with REACT_APP_*
 * values from your .env file.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyAVi65m_QztkCkWZjNsV86GZ_PANfeFtyQ',
  authDomain: 'cinemadrops-e1127.firebaseapp.com',
  projectId: 'cinemadrops-e1127',
  storageBucket: 'cinemadrops-e1127.appspot.com',
  messagingSenderId: '506755432338',
  appId: '1:506755432338:web:2244572cdea6dfd9784b4b',
  measurementId: 'G-6MSWY7EVM7',
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
 * Optionally export Analytics if supported (in browser contexts).
 * Some test and SSR environments may not support Analytics; we guard accordingly.
 */
export let analytics = null;
(async () => {
  try {
    // Only try analytics in real browser environment
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    if (isBrowser && (await isAnalyticsSupported())) {
      analytics = getAnalytics(app);
    }
  } catch {
    // Silently ignore analytics init errors (e.g., non-browser environment)
  }
})();
