import React, { useEffect, useState } from 'react';
import { useSocket } from '../services/Socket';

/**
 * PUBLIC_INTERFACE
 * NotificationsDrawer lists real-time notifications from WebSockets.
 */
export default function NotificationsDrawer({ open, onClose }) {
  const { on } = useSocket();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const off = on('notify', (n) => {
      setItems(prev => [{ id: Date.now(), ...n }, ...prev]);
    });
    return off;
  }, [on]);

  return (
    <div className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Notifications drawer">
      <div className="drawer-header">
        <strong>Notifications</strong>
        <button className="pill" onClick={onClose}>Close</button>
      </div>
      <div className="drawer-body" style={{ background: 'var(--cd-surface)' }}>
        {items.length === 0 && <div className="muted">No notifications yet. You’re all caught up!</div>}
        {items.map(n => (
          <div key={n.id} className="row" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--cd-border)' }}>
            <span>{n.text || 'New activity'}</span>
            <span className="badge">{n.type || 'update'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
