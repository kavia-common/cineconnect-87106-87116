import React from 'react';
import { render, screen } from '@testing-library/react';
import LeftSidebar from '../../components/LeftSidebar';

test('LeftSidebar shows Filters section and genre filters', () => {
  render(<LeftSidebar />);
  expect(screen.getByText(/Filters/i)).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toBeInTheDocument();
  // Presence of a few genre tags
  expect(screen.getByRole('button', { name: /Drama/i })).toBeInTheDocument();
  // Discover hashtags removed
  expect(screen.queryByText(/#behindthescenes/i)).not.toBeInTheDocument();
});
