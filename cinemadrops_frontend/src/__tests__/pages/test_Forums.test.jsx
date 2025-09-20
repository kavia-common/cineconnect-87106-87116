import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

jest.mock('../../services/Api', () => {
  const actual = jest.requireActual('../../services/Api');
  const data = [
    { id: 'f1', title: 'Best mics for windy exteriors?', replies: 23 },
  ];
  const mutate = jest.fn();
  const fakeUseFetch = jest.fn(() => ({ data, mutate }));
  const post = jest.fn(async () => ({}));
  return {
    ...actual,
    useApi: () => ({
      base: 'http://test',
      get: jest.fn(),
      post,
      put: jest.fn(),
      del: jest.fn(),
      useFetch: fakeUseFetch,
    })
  };
});

import Forums from '../../pages/Forums';

test('Forums list threads and create new thread with optimistic update', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Forums />
    </MemoryRouter>
  );
  expect(screen.getByText(/Forums/i)).toBeInTheDocument();
  // Existing thread
  expect(screen.getByText(/Best mics for windy exteriors/i)).toBeInTheDocument();

  // Create
  const input = screen.getByPlaceholderText(/Start a new thread/i);
  await user.type(input, 'New Storyboarding tips');
  await user.click(screen.getByRole('button', { name: /Create/i }));

  // Optimistic - the new title should appear
  expect(screen.getByText(/New Storyboarding tips/i)).toBeInTheDocument();
});
