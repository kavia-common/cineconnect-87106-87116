import React, { useState } from 'react';
import { useApi } from '../services/Api';

/**
 * PUBLIC_INTERFACE
 * Forums provides community discussions with threads and posts.
 */
export default function Forums() {
  const { useFetch, post } = useApi();
  const { data: threads, mutate } = useFetch('/forums/threads', { fallbackData: demoThreads });
  const [title, setTitle] = useState('');

  const createThread = async () => {
    if (!title.trim()) return;
    const optimistic = [{ id: `tmp-${Date.now()}`, title, replies: 0 }, ...threads];
    mutate(optimistic, false);
    setTitle('');
    try {
      await post('/forums/threads', { title });
      mutate();
    } catch {
      mutate();
    }
  };

  return (
    <div className="page-forums">
      <div className="card section">
        <div className="row" style={{ alignItems: 'center' }}>
          <strong>Forums</strong>
          <div className="space" />
          <span className="pill">#filmmaking</span>
          <span className="pill">#sound</span>
          <span className="pill">#post</span>
        </div>
        <div style={{ height: 10 }} />
        <div className="row">
          <input className="input" placeholder="Start a new thread..." value={title} onChange={e => setTitle(e.target.value)} />
          <button className="btn" onClick={createThread}>Create</button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="card section">
        {(threads || []).map(t => (
          <div key={t.id} className="row" style={{ justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--cd-border)' }}>
            <span>{t.title}</span>
            <span className="muted">{t.replies} replies</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const demoThreads = [
  { id: 'f1', title: 'Best mics for windy exteriors?', replies: 23 },
  { id: 'f2', title: 'Color grading tips for night scenes', replies: 14 },
  { id: 'f3', title: 'How to shoot on a bus without permits?', replies: 31 },
];
