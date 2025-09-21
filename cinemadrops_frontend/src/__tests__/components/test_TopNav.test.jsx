import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TopNav from '../../components/TopNav';

describe('TopNav', () => {
  test('renders brand and navigation links including Upload', () => {
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>
    );
    expect(screen.getByText(/Cinemadrops/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Curated/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Challenges/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forums/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Upload short/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Search/i })).toBeInTheDocument();
  });
});
