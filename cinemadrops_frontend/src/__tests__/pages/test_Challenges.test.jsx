import React from 'react';
import { render, screen } from '@testing-library/react';
import Challenges from '../../pages/Challenges';

test('Challenges renders weekly challenges', () => {
  render(<Challenges />);
  expect(screen.getByText(/Weekly Challenges/i)).toBeInTheDocument();
  expect(screen.getByText(/Unexpected Kindness/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Participate/i })).toBeInTheDocument();
});
