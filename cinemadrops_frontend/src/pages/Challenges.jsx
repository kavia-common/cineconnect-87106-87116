import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Challenges displays weekly creative prompts and submissions.
 */
export default function Challenges() {
  const items = [
    { id: 'w1', theme: 'Unexpected Kindness', deadline: 'Sun', count: 142 },
    { id: 'w0', theme: 'One Room Story', deadline: 'Ended', count: 289 },
  ];
  return (
    <div className="page-challenges">
      <div className="card section">
        <h2 style={{ marginTop: 0 }}>Weekly Challenges</h2>
        <p className="muted">Create, submit, and watch short films inspired by playful prompts.</p>
        <div style={{ height: 8 }} />
        {items.map(i => (
          <div key={i.id} className="row" style={{ justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--cd-border)' }}>
            <div className="row">
              <span className="pill">{i.theme}</span>
            </div>
            <div className="row">
              <span className="badge">Due: {i.deadline}</span>
              <span className="pill">{i.count} submissions</span>
              <button className="btn">Participate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
