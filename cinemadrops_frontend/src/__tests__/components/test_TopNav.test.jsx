import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TopNav from '../../components/TopNav';

describe('TopNav', () => {
  test('renders brand, navigation links and search', () => {
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>
    );
    expect(screen.getByText(/Cinemadrops/i)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Challenges/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forums/i })).toBeInTheDocument();
    // Input de búsqueda
    expect(screen.getByRole('textbox', { name: /Buscar/i })).toBeInTheDocument();
  });
});
