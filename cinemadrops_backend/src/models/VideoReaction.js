import mongoose from 'mongoose';

const { Schema } = mongoose;

const VideoReactionSchema = new Schema(
  {
    videoId: { type: Schema.Types.ObjectId, ref: 'Video', index: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    reaction: { type: String, enum: ['none', 'dislike', 'like', 'love'], default: 'none' },
  },
  { timestamps: true }
);

// Ensure unique reaction per (video, user)
VideoReactionSchema.index({ videoId: 1, userId: 1 }, { unique: true });

// PUBLIC_INTERFACE
export default mongoose.model('VideoReaction', VideoReactionSchema);
