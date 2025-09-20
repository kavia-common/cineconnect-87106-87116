import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import QuickActionsDrawer from '../../drawers/QuickActionsDrawer';

test('QuickActionsDrawer shows quick links and closes on click', async () => {
  const user = userEvent.setup();
  const onClose = jest.fn();
  render(
    <MemoryRouter>
      <QuickActionsDrawer open={true} onClose={onClose} />
    </MemoryRouter>
  );
  expect(screen.getByLabelText(/Quick actions drawer/i)).toHaveClass('open');
  await user.click(screen.getByRole('button', { name: /Close/i }));
  expect(onClose).toHaveBeenCalled();

  // Links visible
  expect(screen.getByRole('link', { name: /Join Challenge/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Staff Picks/i })).toBeInTheDocument();
});
