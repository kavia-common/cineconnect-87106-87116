import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ApiProvider } from '../../services/Api';
import Home from '../../pages/Home';
import Curated from '../../pages/Curated';
import Challenges from '../../pages/Challenges';
import Forums from '../../pages/Forums';
import FilmDetails from '../../pages/FilmDetails';
import CreatorProfile from '../../pages/CreatorProfile';

test('route: / renders Home', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <ApiProvider>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </ApiProvider>
    </MemoryRouter>
  );
  expect(screen.getByText(/Discover/i)).toBeInTheDocument();
});

test('route: /curated renders Curated', () => {
  render(
    <MemoryRouter initialEntries={['/curated']}>
      <Routes>
        <Route path="/curated" element={<Curated />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/^Curated$/i)).toBeInTheDocument();
});

test('route: /challenges renders Challenges', () => {
  render(
    <MemoryRouter initialEntries={['/challenges']}>
      <Routes>
        <Route path="/challenges" element={<Challenges />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/Weekly Challenges/i)).toBeInTheDocument();
});

test('route: /forums renders Forums', () => {
  render(
    <MemoryRouter initialEntries={['/forums']}>
      <ApiProvider>
        <Routes>
          <Route path="/forums" element={<Forums />} />
        </Routes>
      </ApiProvider>
    </MemoryRouter>
  );
  expect(screen.getByText(/Forums/i)).toBeInTheDocument();
});

test('route: /film/:id renders FilmDetails', () => {
  render(
    <MemoryRouter initialEntries={['/film/1']}>
      <ApiProvider>
        <Routes>
          <Route path="/film/:id" element={<FilmDetails />} />
        </Routes>
      </ApiProvider>
    </MemoryRouter>
  );
  expect(screen.getByText(/Echo Street/i)).toBeInTheDocument();
});

test('route: /creator/:id renders CreatorProfile', () => {
  render(
    <MemoryRouter initialEntries={['/creator/1']}>
      <ApiProvider>
        <Routes>
          <Route path="/creator/:id" element={<CreatorProfile />} />
        </Routes>
      </ApiProvider>
    </MemoryRouter>
  );
  expect(screen.getByText(/Ava Reynolds/i)).toBeInTheDocument();
});
