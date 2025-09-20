/**
 * MongoDB connection helper using mongoose.
 * Reads connection string from MONGODB_URI env var.
 */

import mongoose from 'mongoose';

let connected = false;

// PUBLIC_INTERFACE
export async function connectMongo() {
  /**
   * Connect to MongoDB using mongoose.
   * Returns the active mongoose connection.
   */
  if (connected) return mongoose.connection;

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cinemadrops';
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Please configure it in your environment.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    // Options can be set here if needed
  });

  connected = true;
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  mongoose.connection.on('disconnected', () => {
    connected = false;
    console.warn('MongoDB disconnected');
  });

  console.log('MongoDB connected');
  return mongoose.connection;
}
