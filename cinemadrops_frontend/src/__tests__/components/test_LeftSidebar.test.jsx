import React from 'react';
import { render, screen } from '@testing-library/react';
import LeftSidebar from '../../components/LeftSidebar';

test('LeftSidebar renders without Browse section', () => {
  render(<LeftSidebar />);
  // "Browse" and its items should not be present anymore
  expect(screen.queryByText(/Browse/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Genres/i)).not.toBeInTheDocument();
  // Minimal placeholder present
  expect(screen.getByText(/Sidebar/i)).toBeInTheDocument();
});
