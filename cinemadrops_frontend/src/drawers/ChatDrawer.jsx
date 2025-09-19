import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../services/Socket';

/**
 * PUBLIC_INTERFACE
 * ChatDrawer provides real-time chat via WebSockets.
 */
export default function ChatDrawer({ open, onClose }) {
  const { on, emit } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    const off = on('chat:message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return off;
  }, [on]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    if (!text.trim()) return;
    const msg = { id: Date.now(), user: 'You', text };
    setMessages(prev => [...prev, msg]);
    emit('chat:message', msg);
    setText('');
  };

  return (
    <div className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Chat drawer">
      <div className="drawer-header">
        <strong>Live Chat</strong>
        <button className="pill" onClick={onClose}>Close</button>
      </div>
      <div className="drawer-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.map(m => (
            <div key={m.id} className="card section" style={{ padding: 10 }}>
              <strong>{m.user}</strong>
              <div>{m.text}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
      <div style={{ padding: 12, borderTop: '1px solid var(--cd-border)' }}>
        <div className="row">
          <input className="input" placeholder="Say something nice..." value={text} onChange={e => setText(e.target.value)} />
          <button className="btn" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
