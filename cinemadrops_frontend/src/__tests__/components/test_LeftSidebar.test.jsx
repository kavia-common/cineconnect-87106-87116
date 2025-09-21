import React from 'react';
import { render, screen } from '@testing-library/react';
import LeftSidebar from '../../components/LeftSidebar';

test('LeftSidebar no longer shows Filters; focuses on browse shortcuts', () => {
  render(<LeftSidebar />);
  expect(screen.getByText(/Browse/i)).toBeInTheDocument();
  expect(screen.getByText(/Genres/i)).toBeInTheDocument();
  // Filters should not be here anymore
  expect(screen.queryByText(/Filters/i)).not.toBeInTheDocument();
});
