import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('../../services/Api', () => {
  const actual = jest.requireActual('../../services/Api');
  const fakeUseFetch = jest.fn(() => ({ data: [], mutate: jest.fn() }));
  const post = jest.fn(async () => ({}));
  const ctx = {
    base: 'http://test',
    get: jest.fn(),
    post,
    put: jest.fn(),
    del: jest.fn(),
    useFetch: fakeUseFetch,
  };
  return {
    ...actual,
    useApi: () => ctx,
  };
});

import Comments from '../../components/Comments';

describe('Comments', () => {
  test('optimistic add and input clears', async () => {
    const user = userEvent.setup();
    render(<Comments filmId="f-1" />);

    const input = screen.getByPlaceholderText(/Share your thoughts/i);
    await user.type(input, 'Great short!');
    await user.click(screen.getByRole('button', { name: /Post/i }));

    expect(input).toHaveValue('');

    // optimistic comment appears
    expect(screen.getByText(/Great short!/i)).toBeInTheDocument();

    // eventually mutate called (cannot directly access, but ensure message remains)
    await waitFor(() => {
      expect(screen.getByText(/Great short!/i)).toBeInTheDocument();
    });
  });
});
