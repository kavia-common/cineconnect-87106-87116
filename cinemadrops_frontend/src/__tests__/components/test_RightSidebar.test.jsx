import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RightSidebar from '../../components/RightSidebar';

test('RightSidebar shows trending, weekly challenge, and creators', () => {
  render(
    <MemoryRouter>
      <RightSidebar />
    </MemoryRouter>
  );
  expect(screen.getByText(/Trending/i)).toBeInTheDocument();
  expect(screen.getByText(/Weekly Challenge/i)).toBeInTheDocument();
  expect(screen.getByText(/Top Creators/i)).toBeInTheDocument();
  // sample items
  expect(screen.getByRole('link', { name: /Moonlit Alley/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Join Challenge/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Ava Reynolds/i })).toBeInTheDocument();
});
