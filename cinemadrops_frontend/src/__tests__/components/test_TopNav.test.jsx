import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import TopNav from '../../components/TopNav';

describe('TopNav', () => {
  test('renders brand and navigation links', () => {
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>
    );
    expect(screen.getByText(/Cinemadrops/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Curated/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Challenges/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forums/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Search/i })).toBeInTheDocument();
  });

  test('fires drawer open callbacks', async () => {
    const user = userEvent.setup();
    const onOpenChat = jest.fn();
    const onOpenNotifications = jest.fn();
    const onOpenQuick = jest.fn();
    render(
      <MemoryRouter>
        <TopNav onOpenChat={onOpenChat} onOpenNotifications={onOpenNotifications} onOpenQuick={onOpenQuick} />
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: /Quick actions/i }));
    expect(onOpenQuick).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Open chat/i }));
    expect(onOpenChat).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Open notifications/i }));
    expect(onOpenNotifications).toHaveBeenCalled();
  });
});
