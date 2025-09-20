# Video Model (MongoDB) and REST API Contract

This document defines the MongoDB data model/schema for videos and the REST API contracts for creating and retrieving videos. It also outlines the logic for like/dislike/love counters and how to handle user reaction mutations.

## MongoDB Schema (Mongoose-style)

Collection: videos

```javascript
// Example using Mongoose
import mongoose from 'mongoose';

const RatedEnum = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'];

const VideoSchema = new mongoose.Schema(
  {
    // Public streaming URL (e.g., Firebase Storage URL)
    videoUrl: { type: String, required: true, trim: true },

    // Film name/title
    name: { type: String, required: true, trim: true },

    // Creator display name or ID reference string
    creator: { type: String, required: true, trim: true },

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

export default mongoose.model('Video', VideoSchema);
```

Notes:
- Use indexes on fields commonly filtered/searched (e.g., `categories`, `creator`, and possibly `rated`).
- If you need to relate to a separate creators collection, replace `creator: String` with a `creatorId: ObjectId` (ref: 'User') and keep a denormalized `creatorName` as needed.

## REST API Contracts

Base path: /videos

### POST /videos
Create a new video record.

- Summary: Create a video document with metadata and initial reaction counts.
- Request Body (application/json):

```json
{
  "videoUrl": "https://storage.googleapis.com/.../videos/1737428923_myfilm.mp4",
  "name": "Moonlit Alley",
  "creator": "Ava Reynolds",
  "categories": ["Drama", "Festival", "#award"],
  "rated": "PG",
  "dislikes": 0,
  "likes": 0,
  "loves": 0
}
```

Rules:
- Required: videoUrl, name, creator, rated
- categories defaults to empty array if missing
- reaction counters default to 0 if omitted (server-side should enforce defaults)

Responses:
- 201 Created

```json
{
  "id": "67af3c2b7a1c9d38ce6f405c",
  "videoUrl": "https://storage.googleapis.com/.../videos/1737428923_myfilm.mp4",
  "name": "Moonlit Alley",
  "creator": "Ava Reynolds",
  "categories": ["Drama", "Festival", "#award"],
  "rated": "PG",
  "dislikes": 0,
  "likes": 0,
  "loves": 0,
  "createdAt": "2025-01-12T09:21:02.118Z",
  "updatedAt": "2025-01-12T09:21:02.118Z"
}
```

- 400 Bad Request — validation error message
- 409 Conflict — duplicate name or URL (if enforced)
- 500 Internal Server Error — unexpected

### GET /videos/:id
Retrieve a video by its ID.

- Summary: Get a single video.
- Path Params:
  - id: string (Mongo ObjectId)

Responses:
- 200 OK

```json
{
  "id": "67af3c2b7a1c9d38ce6f405c",
  "videoUrl": "https://storage.googleapis.com/.../videos/1737428923_myfilm.mp4",
  "name": "Moonlit Alley",
  "creator": "Ava Reynolds",
  "categories": ["Drama", "Festival", "#award"],
  "rated": "PG",
  "dislikes": 2,
  "likes": 25,
  "loves": 9,
  "createdAt": "2025-01-12T09:21:02.118Z",
  "updatedAt": "2025-01-12T10:02:54.441Z"
}
```

- 404 Not Found — invalid or missing id
- 500 Internal Server Error — unexpected

### GET /videos
List videos (basic pagination and filters)

Query params (optional):
- page: number (default 1)
- pageSize: number (default 20, max 100)
- category: string
- rated: string in [G, PG, PG-13, R, NC-17, NR]
- creator: string

Response 200 OK:

```json
{
  "items": [
    {
      "id": "67af3c2b7a1c9d38ce6f405c",
      "videoUrl": "https://storage.googleapis.com/.../videos/1737428923_myfilm.mp4",
      "name": "Moonlit Alley",
      "creator": "Ava Reynolds",
      "categories": ["Drama", "Festival", "#award"],
      "rated": "PG",
      "dislikes": 2,
      "likes": 25,
      "loves": 9,
      "createdAt": "2025-01-12T09:21:02.118Z",
      "updatedAt": "2025-01-12T10:02:54.441Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

## Reactions: Counters and Mutations

Goal: Each user can have at most one active reaction on a video: one of ["none", "dislike", "like", "love"]. Counters reflect the aggregate across all users.

Recommended data structures:
- videos collection: stores aggregate fields `dislikes`, `likes`, `loves`.
- videoReactions collection: per-user reaction records to maintain idempotency and allow mutation.

Example videoReactions schema (Mongoose-style):

```javascript
const VideoReactionSchema = new mongoose.Schema(
  {
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', index: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    reaction: { type: String, enum: ['none', 'dislike', 'like', 'love'], default: 'none' },
  },
  { timestamps: true }
);
VideoReactionSchema.index({ videoId: 1, userId: 1 }, { unique: true });
```

### Mutation Algorithm

When user sets reaction R for a video V:
1. Load existing reaction record for (userId, videoId). If none, treat as "none".
2. If new reaction equals old reaction, do nothing (idempotent).
3. Else:
   - Decrement the counter corresponding to old reaction (if old != "none").
   - Increment the counter corresponding to new reaction (if new != "none").
   - Persist both:
     - Update video aggregate counters atomically (e.g., using $inc).
     - Upsert user’s reaction record to new value.

Pseudo-code transactional approach:

```javascript
// Inputs: userId, videoId, newReaction ∈ ['none','dislike','like','love']
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  const prev = await VideoReaction.findOne({ userId, videoId }).session(session);

  const oldReaction = prev?.reaction || 'none';
  if (oldReaction === newReaction) return;

  const inc = {};
  if (oldReaction !== 'none') {
    inc[oldReaction + 's'] = -1; // maps 'like' -> 'likes', etc.
  }
  if (newReaction !== 'none') {
    inc[newReaction + 's'] = (inc[newReaction + 's'] || 0) + 1;
  }

  await Video.updateOne({ _id: videoId }, { $inc: inc }).session(session);

  await VideoReaction.updateOne(
    { userId, videoId },
    { $set: { reaction: newReaction } },
    { upsert: true, session }
  );
});
```

Notes:
- If you prefer not using multi-document transactions, you can still approximate atomicity by ordering operations carefully and handling retries on failure. Transactions are recommended on MongoDB clusters that support them.
- To prevent negative counts, ensure you only decrement when the prior reaction exists and equals the decremented type.

### Reaction Endpoints (Optional)

- PUT /videos/:id/reaction
  - Body: { "reaction": "dislike" | "like" | "love" | "none" }
  - Auth required to identify userId
  - Returns: updated aggregate counts and current user reaction

Example request:
```json
{ "reaction": "love" }
```

Example response:
```json
{
  "videoId": "67af3c2b7a1c9d38ce6f405c",
  "userReaction": "love",
  "counters": { "dislikes": 2, "likes": 24, "loves": 10 }
}
```

Error cases:
- 400 if invalid reaction
- 401/403 if unauthenticated
- 404 if video not found

## Validation and Defaults

- videoUrl: must be a valid URL (server-side validation)
- name: 1..200 chars
- creator: 1..120 chars (or schema adaptation if referencing users)
- categories: array of strings, each <= 50 chars
- rated: one of allowed enums
- counters: non-negative integers; server sets defaults to 0

## Example: Frontend Integration (current app)

The VideoUploadPage already builds the payload and POSTs to `/videos`. Ensure the backend implements POST /videos and returns 201 with the saved document as shown.

Environment variables (frontend):
- REACT_APP_API_BASE — used by src/services/Api.js to build requests
- REACT_APP_WS_BASE — used by WebSocket provider
