import React from 'react';
import { render, screen } from '@testing-library/react';

const handlers = {};
jest.mock('../../services/Socket', () => ({
  useSocket: () => ({
    on: (event, handler) => {
      handlers[event] = handlers[event] || [];
      handlers[event].push(handler);
      return () => {
        handlers[event] = (handlers[event] || []).filter(h => h !== handler);
      };
    }
  })
}));

import NotificationsDrawer from '../../drawers/NotificationsDrawer';

test('NotificationsDrawer shows notifications from socket', () => {
  render(<NotificationsDrawer open={true} onClose={() => {}} />);
  expect(screen.getByLabelText(/Notifications drawer/i)).toHaveClass('open');
  // Initially empty state
  expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument();

  // Emit a notify event
  handlers['notify'].forEach(h => h({ text: 'New like', type: 'like' }));

  expect(screen.getByText(/New like/i)).toBeInTheDocument();
  expect(screen.getByText(/like/i)).toBeInTheDocument();
});
