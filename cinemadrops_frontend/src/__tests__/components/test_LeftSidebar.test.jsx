import React from 'react';
import { render, screen } from '@testing-library/react';
import LeftSidebar from '../../components/LeftSidebar';

test('LeftSidebar shows Filters and controls (without Discover with hashtags)', () => {
  render(<LeftSidebar />);
  expect(screen.getByText(/Filters/i)).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toBeInTheDocument();
  // Presence of a few filter tags
  expect(screen.getByRole('button', { name: /Drama/i })).toBeInTheDocument();
  // Ensure the removed Discover section is not present
  expect(screen.queryByText(/Discover/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/#behindthescenes/i)).not.toBeInTheDocument();
});
