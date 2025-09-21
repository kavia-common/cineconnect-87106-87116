import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';

test('renders home and brand', () => {
  render(<App />);
  expect(screen.getByText(/Cinemadrops/i)).toBeInTheDocument();
});

test('navigates to known routes via TopNav links', () => {
  render(<App />);

  const linkCurated = screen.getByRole('link', { name: /Curated/i });
  linkCurated.click();
  expect(screen.getByText(/Curated/i)).toBeInTheDocument();

  const linkChallenges = screen.getByRole('link', { name: /Challenges/i });
  linkChallenges.click();
  expect(screen.getByText(/Weekly Challenges/i)).toBeInTheDocument();
});
