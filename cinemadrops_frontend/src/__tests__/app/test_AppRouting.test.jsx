import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';

test('renders home with brand', () => {
  render(<App />);
  expect(screen.getByText(/Cinemadrops/i)).toBeInTheDocument();
});

test('navigates to known routes via links', () => {
  render(<App />);

  const linkChallenges = screen.getByRole('link', { name: /Challenges/i });
  linkChallenges.click();
  expect(screen.getByText(/Weekly Challenges/i)).toBeInTheDocument();
});
