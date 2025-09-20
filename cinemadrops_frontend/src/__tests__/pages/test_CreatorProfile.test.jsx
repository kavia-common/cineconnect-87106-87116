import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ApiProvider } from '../../services/Api';
import CreatorProfile from '../../pages/CreatorProfile';

test('CreatorProfile renders creator info and films', () => {
  render(
    <MemoryRouter initialEntries={['/creator/ava']}>
      <ApiProvider>
        <Routes>
          <Route path="/creator/:id" element={<CreatorProfile />} />
        </Routes>
      </ApiProvider>
    </MemoryRouter>
  );
  expect(screen.getByText(/Ava Reynolds/i)).toBeInTheDocument();
  expect(screen.getByText(/Followers:/i)).toBeInTheDocument();
  expect(screen.getByText(/Films/i)).toBeInTheDocument();
  // from fallback films
  expect(screen.getByText(/Moonlit Alley/i)).toBeInTheDocument();
});
