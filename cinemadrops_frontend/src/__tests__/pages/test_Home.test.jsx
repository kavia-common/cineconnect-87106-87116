import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ApiProvider } from '../../services/Api';
import Home from '../../pages/Home';

test('Home renders film grid with fallback data', () => {
  render(
    <MemoryRouter>
      <ApiProvider>
        <Home />
      </ApiProvider>
    </MemoryRouter>
  );

  // Verify film titles from fallback appear (header removed)
  expect(screen.getByText(/Paper Boats/i)).toBeInTheDocument();
  expect(screen.getByText(/Under Neon/i)).toBeInTheDocument();
});
