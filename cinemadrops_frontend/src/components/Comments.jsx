import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useApi } from '../services/Api';

/**
 * PUBLIC_INTERFACE
 * Comments thread component with optimistic posting.
 */
export default function Comments({ filmId }) {
  const { useFetch, post } = useApi();
  const { data, mutate } = useFetch(`/films/${filmId}/comments`, { fallbackData: [] });
  const [text, setText] = useState('');

  const addComment = async () => {
    if (!text.trim()) return;
    const optimistic = [
      ...(data || []),
      { id: `tmp-${Date.now()}`, user: 'You', text, createdAt: new Date().toISOString(), _optimistic: true }
    ];
    mutate(optimistic, false);
    setText('');
    try {
      await post(`/films/${filmId}/comments`, { text });
      mutate();
    } catch (e) {
      mutate();
    }
  };

  return (
    <div className="card section">
      <strong>Comments</strong>
      <div style={{ height: 10 }} />
      <div className="row">
        <input className="input" placeholder="Share your thoughts..." value={text} onChange={e => setText(e.target.value)} />
        <button className="btn" onClick={addComment}>Post</button>
      </div>
      <div style={{ height: 12 }} />
      {(data || []).map(c => (
        <div key={c.id} style={{ padding: '10px 0', borderTop: '1px solid var(--cd-border)' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>{c.user}</strong>
            <span className="muted">{dayjs(c.createdAt).fromNow?.() || dayjs(c.createdAt).format('MMM D, HH:mm')}</span>
          </div>
          <div>{c.text}</div>
          {c._optimistic && <div className="muted" style={{ fontSize: 12 }}>(sending...)</div>}
        </div>
      ))}
    </div>
  );
}
