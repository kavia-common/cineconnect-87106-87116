import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ApiProvider } from '../../services/Api';
import Upload from '../../pages/Upload';

test('Upload page renders inputs and button', () => {
  render(
    <MemoryRouter initialEntries={['/upload']}>
      <ApiProvider>
        <Routes>
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </ApiProvider>
    </MemoryRouter>
  );
  expect(screen.getByText(/Upload your short/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Select video file/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Upload/i })).toBeInTheDocument();
});
