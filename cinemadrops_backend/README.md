# Cinemadrops Backend (Express + MongoDB)

Express server providing REST endpoints to create and retrieve video metadata and manage reaction counters.

## Quick Start

1) Copy environment and edit:
```
cp .env.example .env
```
Set at least:
```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/cinemadrops
CORS_ORIGINS=http://localhost:3000
```

2) Install deps
```
npm install
```

3) Run
```
npm run dev
```
Server at http://localhost:4000

## Endpoints

- GET /health
- POST /videos
  - Body: { videoUrl, name, creator, categories?, rated, dislikes?, likes?, loves? }
  - 201 returns created document with fields: { id, videoUrl, name, creator, categories, rated, dislikes, likes, loves, createdAt, updatedAt }

- GET /videos/:id
  - 200 returns a single video by ID

- GET /videos
  - Query: page, pageSize, category, rated, creator
  - 200 returns { items, page, pageSize, total }

- PUT /videos/:id/reaction (optional)
  - Body: { reaction: "dislike" | "like" | "love" | "none", userId }
  - Returns: { videoId, userReaction, counters: { dislikes, likes, loves } }

## Notes

- No file uploads. The frontend uploads to Firebase Storage and sends the `videoUrl` here.
- Uses Mongoose models:
  - Video: aggregate counters + metadata
  - VideoReaction: per-user reaction record to ensure idempotent updates
- CORS origins controlled via `CORS_ORIGINS` env var.
