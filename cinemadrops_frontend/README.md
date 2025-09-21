# Cinemadrops Frontend (React)

Cinemadrops is a playful, community-driven platform for short films. This frontend implements:
- Discovery feed and curated lists
- Detailed film pages with behind-the-scenes and scripts
- Creator profiles
- Comments and forums
- Weekly challenges
- Video upload page for creators (supports mp4, avi, mov, webm, mkv) with progress and success/error feedback
- Responsive multi-column layout with top navigation, sidebars

## Tech
- React 18 + React Router v6
- SWR for data fetching
- socket.io-client for real-time features
- No heavy UI framework; handcrafted playful CSS

## Static cover images

- Cover images used by the film cards and creator profiles are served from the CRA `public/assets` directory.
- Make sure any images you want to use are placed at: `cinemadrops_frontend/public/assets/`
- In code, always reference them with absolute paths like:
  - `<img src="/assets/pexels-alvarobalderas-20747775.jpg" alt="..." />`
- See `src/assets/images.js` which exports absolute URLs for existing demo images.

## Run locally
1) Copy environment config
```
cp .env.example .env
```
2) Edit `.env` and set:
```
REACT_APP_API_BASE=http://localhost:4000
REACT_APP_WS_BASE=ws://localhost:4000
```
3) Install and start
```
npm install
npm start
```

Open http://localhost:3000

Note: This UI expects a REST API and WebSocket server. If none is available, demo fallback data is shown and sockets will simply connect without guaranteed events.

## Project Structure
- src/services/Api.js — API helpers and SWR
- src/services/Socket.js — WebSocket provider
- src/components/* — Reusable UI components (TopNav, Sidebars, FilmCard, Comments)
- src/pages/* — Route pages (Home, FilmDetails, CreatorProfile, Forums, Challenges, Curated)
- src/drawers/* — Chat, Notifications, Quick Actions
- src/index.css — Playful theme styles per style guide

## Style Guide
Colors (from styleThemeData):
- Primary: #0FA3B1
- Secondary/Success: #FFB627
- Error: #ED6A5A
- Background: #F7F9F9
- Surface: #FFFFFF
- Text: #2F4858

Layout:
- Top navigation bar
- Left filters and right trending sidebars
- Main content area
- Modal drawers for chat, notifications, and quick actions

## Environment Variables
- REACT_APP_API_BASE — Base URL for REST (required)
- REACT_APP_WS_BASE — Base URL for WebSockets (required)

Do not commit real secrets; use `.env` locally and deployment env vars in production.
