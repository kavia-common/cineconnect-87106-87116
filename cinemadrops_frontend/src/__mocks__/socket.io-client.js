export const io = () => {
  const handlers = {};
  const socket = {
    on: (event, cb) => {
      handlers[event] = handlers[event] || [];
      handlers[event].push(cb);
    },
    off: (event, cb) => {
      if (!handlers[event]) return;
      handlers[event] = handlers[event].filter(h => h !== cb);
    },
    emit: (event, payload) => {
      (handlers[event] || []).forEach(cb => cb(payload));
    },
    disconnect: () => { /* noop */ },
  };
  return socket;
};
export default { io };
