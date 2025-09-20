import React from 'react';
import { render, screen } from '@testing-library/react';
import Curated from '../../pages/Curated';

test('Curated renders curated lists', () => {
  render(<Curated />);
  expect(screen.getByText(/^Curated$/i)).toBeInTheDocument();
  expect(screen.getByText(/Staff Picks: Joyful Shorts/i)).toBeInTheDocument();
});
