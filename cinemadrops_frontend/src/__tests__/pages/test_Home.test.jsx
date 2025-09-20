import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ApiProvider } from '../../services/Api';
import Home from '../../pages/Home';

test('Home renders Discover and film grid with fallback data', () => {
  render(
    <MemoryRouter>
      <ApiProvider>
        <Home />
      </ApiProvider>
    </MemoryRouter>
  );

  expect(screen.getByText(/Discover/i)).toBeInTheDocument();
  // Some film titles from fallback
  expect(screen.getByText(/Paper Boats/i)).toBeInTheDocument();
  expect(screen.getByText(/Under Neon/i)).toBeInTheDocument();
});
