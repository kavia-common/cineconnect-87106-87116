import mongoose from 'mongoose';

const { Schema } = mongoose;

export const RatedEnum = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'];

const VideoSchema = new Schema(
  {
    // Public streaming URL (e.g., Firebase Storage URL)
    videoUrl: { type: String, required: true, trim: true },

    // Film name/title
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },

    // Creator display name or ID reference string
    creator: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },

    // Tags/genres/hashtags
    categories: { type: [String], default: [], index: true },

    // Content rating (enum)
    rated: { type: String, enum: RatedEnum, required: true },

    // Reaction counters (aggregates)
    dislikes: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    loves: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Useful query indexes
VideoSchema.index({ creator: 1 });
VideoSchema.index({ rated: 1 });

// PUBLIC_INTERFACE
export default mongoose.model('Video', VideoSchema);
