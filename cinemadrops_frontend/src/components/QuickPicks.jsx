import React from 'react';
import FilmCard from './FilmCard';
import { getCoverByIndex } from '../assets/images';

/**
 * PUBLIC_INTERFACE
 * QuickPicks renders a floating FAB and a bottom drawer with playful quick recommendations.
 * - Button fixed at bottom-right opens/closes the drawer.
 * - Drawer lists a handful of recommended films (randomized from provided list).
 */
export default function QuickPicks({ films = [] }) {
  const [open, setOpen] = React.useState(false);
  const [seed, setSeed] = React.useState(() => Math.floor(Math.random() * 10000));

  // pick 6 random films in a stable way per "seed" to avoid reflow each render
  const picks = React.useMemo(() => {
    const rnd = mulberry32(seed);
    const arr = [...films];
    // simple shuffle using deterministic random
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rnd() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, Math.min(6, arr.length));
  }, [films, seed]);

  const refresh = () => setSeed(Math.floor(Math.random() * 10000));

  return (
    <>
      <button
        className="btn quick-picks-fab"
        aria-label="Open Quick Picks"
        onClick={() => setOpen(true)}
      >
        ✨ Quick Picks
      </button>

      <div className={`quick-picks-drawer ${open ? 'open' : ''}`} role="dialog" aria-label="Quick Picks Drawer">
        <div className="quick-picks-header">
          <span className="brand-badge" aria-hidden="true">QP</span>
          <strong style={{ fontSize: 16 }}>Quick Picks</strong>
          <span className="pill" style={{ marginLeft: 'auto' }}>Playful mix</span>
          <button className="btn secondary" onClick={refresh} aria-label="Refresh picks">Shuffle</button>
          <button className="pill" onClick={() => setOpen(false)} aria-label="Close">Close</button>
        </div>
        <div className="quick-picks-body">
          {picks.map((f, i) => (
            <FilmCard
              key={`qp-${f.id}`}
              film={f}
              index={i}
              image={getCoverByIndex(i)}
            />
          ))}
          {picks.length === 0 && (
            <div className="card" style={{ padding: 16 }}>
              <div className="row">
                <span style={{ fontSize: 18 }}>🤔</span>
                <div>
                  <strong>No picks yet</strong>
                  <div className="muted" style={{ fontSize: 13 }}>Try again in a moment.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/** Deterministic PRNG for stable shuffles between renders */
function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
