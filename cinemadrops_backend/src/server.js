/**
 * Express server for Cinemadrops backend.
 * Provides REST API to manage video metadata and reaction counters.
 * 
 * Environment variables:
 * - PORT: Port to run the server (default 4000)
 * - MONGODB_URI: MongoDB connection string
 * - CORS_ORIGINS: Comma separated list of allowed origins for CORS
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectMongo } from './utils/db.js';
import videosRouter from './videos/routes.js';

dotenv.config();

const app = express();

// CORS
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('CORS not allowed'), false);
  },
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Health endpoint
// PUBLIC_INTERFACE
app.get('/health', (req, res) => {
  /** Health check endpoint */
  res.json({ ok: true, service: 'cinemadrops-backend' });
});

// API routes
app.use('/videos', videosRouter);

// Start server only after DB connects
const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`[cinemadrops] API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export default app;
