import express from 'express';
import mongoose from 'mongoose';
import Video, { RatedEnum } from '../models/Video.js';
import VideoReaction from '../models/VideoReaction.js';
import { serializeVideo } from '../utils/serializers.js';

const router = express.Router();

/**
 * Validate a URL shape simply.
 */
function isValidUrl(url) {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Build query filters based on allowed params.
 */
function buildFilters(q) {
  const filter = {};
  if (q.category) {
    filter.categories = q.category;
  }
  if (q.rated && RatedEnum.includes(q.rated)) {
    filter.rated = q.rated;
  }
  if (q.creator) {
    filter.creator = q.creator;
  }
  return filter;
}

/**
 * POST /videos
 * Create a new video record.
 * Body: { videoUrl, name, creator, categories?, rated, dislikes?, likes?, loves? }
 */
// PUBLIC_INTERFACE
router.post('/', async (req, res) => {
  /**
   * Create a video document with metadata and initial reaction counts.
   * Returns 201 with created document or 400 on validation error.
   */
  try {
    const {
      videoUrl,
      name,
      creator,
      categories = [],
      rated,
      dislikes = 0,
      likes = 0,
      loves = 0,
    } = req.body || {};

    // Basic validation
    if (!videoUrl || !isValidUrl(videoUrl)) {
      return res.status(400).json({ error: 'Invalid or missing videoUrl' });
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 200) {
      return res.status(400).json({ error: 'Invalid or missing name' });
    }
    if (!creator || typeof creator !== 'string' || creator.trim().length === 0 || creator.length > 120) {
      return res.status(400).json({ error: 'Invalid or missing creator' });
    }
    if (!rated || !RatedEnum.includes(rated)) {
      return res.status(400).json({ error: 'Invalid or missing rated' });
    }
    const cleanCategories = Array.isArray(categories) ? categories.filter(c => typeof c === 'string' && c.length <= 50) : [];

    const video = await Video.create({
      videoUrl: videoUrl.trim(),
      name: name.trim(),
      creator: creator.trim(),
      categories: cleanCategories,
      rated,
      dislikes: Math.max(0, parseInt(dislikes, 10) || 0),
      likes: Math.max(0, parseInt(likes, 10) || 0),
      loves: Math.max(0, parseInt(loves, 10) || 0),
    });

    return res.status(201).json(serializeVideo(video));
  } catch (err) {
    // Handle duplicate key or other errors
    console.error('POST /videos error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /videos/:id
 * Retrieve a video by its ID.
 */
// PUBLIC_INTERFACE
router.get('/:id', async (req, res) => {
  /**
   * Get a single video by Mongo ObjectId.
   */
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Not Found' });
    }
    return res.json(serializeVideo(video));
  } catch (err) {
    console.error('GET /videos/:id error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /videos
 * List videos with pagination and filters.
 * Query: page=1, pageSize=20, category, rated, creator
 */
// PUBLIC_INTERFACE
router.get('/', async (req, res) => {
  /**
   * List videos with pagination and optional filters.
   */
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSizeRaw = parseInt(req.query.pageSize, 10) || 20;
    const pageSize = Math.min(Math.max(1, pageSizeRaw), 100);

    const filter = buildFilters(req.query);

    const [items, total] = await Promise.all([
      Video.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      Video.countDocuments(filter),
    ]);

    return res.json({
      items: items.map(serializeVideo),
      page,
      pageSize,
      total,
    });
  } catch (err) {
    console.error('GET /videos error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * PUT /videos/:id/reaction
 * Optional: update reaction counters based on user reaction mutation.
 * Body: { reaction: 'dislike' | 'like' | 'love' | 'none', userId?: string }
 * Note: In a real app, userId comes from auth; here we accept it in body for demo.
 */
// PUBLIC_INTERFACE
router.put('/:id/reaction', async (req, res) => {
  /**
   * Update a video's aggregate reaction counters and the user's individual reaction record.
   * Returns updated counters and the user's current reaction.
   */
  const { id } = req.params;
  const { reaction, userId } = req.body || {};
  const allowed = ['none', 'dislike', 'like', 'love'];

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ error: 'Video not found' });
    }
    if (!allowed.includes(reaction)) {
      return res.status(400).json({ error: 'Invalid reaction' });
    }
    if (!userId || !mongoose.isValidObjectId(userId)) {
      // In production, replace with actual auth, but keep simple for now
      return res.status(400).json({ error: 'Invalid or missing userId' });
    }

    const session = await mongoose.startSession();
    let updatedVideo;
    await session.withTransaction(async () => {
      const prev = await VideoReaction.findOne({ userId, videoId: id }).session(session);
      const oldReaction = prev?.reaction || 'none';
      if (oldReaction === reaction) {
        updatedVideo = await Video.findById(id).session(session);
        return;
      }
      const inc = {};
      if (oldReaction !== 'none') {
        inc[oldReaction + 's'] = -1;
      }
      if (reaction !== 'none') {
        inc[reaction + 's'] = (inc[reaction + 's'] || 0) + 1;
      }

      const resUpd = await Video.updateOne({ _id: id }, { $inc: inc }).session(session);
      if (resUpd.matchedCount === 0) {
        throw new Error('Video not found');
      }

      await VideoReaction.updateOne(
        { userId, videoId: id },
        { $set: { reaction } },
        { upsert: true, session }
      );

      updatedVideo = await Video.findById(id).session(session);
    });
    session.endSession();

    if (!updatedVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }

    return res.json({
      videoId: String(updatedVideo._id),
      userReaction: reaction,
      counters: {
        dislikes: updatedVideo.dislikes,
        likes: updatedVideo.likes,
        loves: updatedVideo.loves,
      },
    });
  } catch (err) {
    console.error('PUT /videos/:id/reaction error:', err);
    if (String(err.message).includes('Video not found')) {
      return res.status(404).json({ error: 'Video not found' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
