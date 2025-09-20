import React from 'react';
import { render, screen } from '@testing-library/react';
import LeftSidebar from '../../components/LeftSidebar';

test('LeftSidebar shows Filters and Discover sections', () => {
  render(<LeftSidebar />);
  expect(screen.getByText(/Filters/i)).toBeInTheDocument();
  expect(screen.getByText(/Discover/i)).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toBeInTheDocument();
  // Presence of a few tags
  expect(screen.getByRole('button', { name: /Drama/i })).toBeInTheDocument();
  expect(screen.getByText(/#behindthescenes/i)).toBeInTheDocument();
});
