import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const onHandlers = {};
jest.mock('../../services/Socket', () => ({
  useSocket: () => ({
    on: (event, handler) => {
      onHandlers[event] = onHandlers[event] || [];
      onHandlers[event].push(handler);
      return () => {
        onHandlers[event] = (onHandlers[event] || []).filter(h => h !== handler);
      };
    },
    emit: (event, payload) => {
      (onHandlers[event] || []).forEach(h => h(payload));
    }
  })
}));

import ChatDrawer from '../../drawers/ChatDrawer';

test('ChatDrawer shows and sends messages via socket', async () => {
  const user = userEvent.setup();
  const onClose = jest.fn();
  render(<ChatDrawer open={true} onClose={onClose} />);

  // Drawer visible
  expect(screen.getByLabelText(/Chat drawer/i)).toHaveClass('open');

  // Send message
  await user.type(screen.getByPlaceholderText(/Say something nice/i), 'Hello!');
  await user.click(screen.getByRole('button', { name: /Send/i }));

  // Message appears (your own message)
  expect(screen.getByText(/Hello!/i)).toBeInTheDocument();

  // Simulate receiving a message
  onHandlers['chat:message'].forEach(h => h({ id: 99, user: 'System', text: 'Welcome!' }));
  expect(screen.getByText(/Welcome!/i)).toBeInTheDocument();

  // Close
  await user.click(screen.getByRole('button', { name: /Close/i }));
  expect(onClose).toHaveBeenCalled();
});
