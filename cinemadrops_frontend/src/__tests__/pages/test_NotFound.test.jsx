import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NotFound from '../../pages/NotFound';

test('NotFound displays message and link home', () => {
  render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>
  );
  expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Back Home/i })).toBeInTheDocument();
});

test('Unknown route renders NotFound via routing', () => {
  render(
    <MemoryRouter initialEntries={['/does-not-exist']}>
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
});
