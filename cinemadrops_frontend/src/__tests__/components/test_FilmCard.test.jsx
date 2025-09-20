import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FilmCard from '../../components/FilmCard';

test('FilmCard renders title and author and links to film details', () => {
  const film = { id: '123', title: 'Paper Boats', author: 'Liu Chen', likes: 10, duration: 7 };
  render(
    <MemoryRouter>
      <FilmCard film={film} />
    </MemoryRouter>
  );
  expect(screen.getByText(/Paper Boats/i)).toBeInTheDocument();
  expect(screen.getByText(/by Liu Chen/i)).toBeInTheDocument();
  const link = screen.getByRole('link', { name: /Paper Boats/i });
  expect(link).toHaveAttribute('href', '/film/123');
});
