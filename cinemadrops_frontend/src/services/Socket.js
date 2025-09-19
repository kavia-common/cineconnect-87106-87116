import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { WS_BASE } from './Api';

const SocketCtx = createContext(null);

/**
 * PUBLIC_INTERFACE
 * SocketProvider manages a singleton socket connection and exposes subscribe/emit helpers.
 */
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(WS_BASE, { transports: ['websocket'] });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  const api = useMemo(() => ({
    socket,
    // PUBLIC_INTERFACE
    on: (event, handler) => {
      if (!socket) return () => {};
      socket.on(event, handler);
      return () => socket.off(event, handler);
    },
    // PUBLIC_INTERFACE
    emit: (event, payload) => socket?.emit(event, payload),
  }), [socket]);

  return <SocketCtx.Provider value={api}>{children}</SocketCtx.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useSocket to access socket helpers.
 */
export function useSocket() {
  const ctx = useContext(SocketCtx);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
