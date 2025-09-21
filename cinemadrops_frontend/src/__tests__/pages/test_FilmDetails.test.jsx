import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiProvider } from '../../services/Api';
import FilmDetails from '../../pages/FilmDetails';

test('FilmDetails shows film metadata and sections', () => {
  render(
    <MemoryRouter initialEntries={['/film/7']}>
      <ApiProvider>
        <Routes>
          <Route path="/film/:id" element={<FilmDetails />} />
        </Routes>
      </ApiProvider>
    </MemoryRouter>
  );

  expect(screen.getByText(/Echo Street/i)).toBeInTheDocument();
  expect(screen.getByText(/Behind the Scenes/i)).toBeInTheDocument();
  expect(screen.getByText(/Script & Notes/i)).toBeInTheDocument();
  expect(screen.getByText(/Comments/i)).toBeInTheDocument();
});
