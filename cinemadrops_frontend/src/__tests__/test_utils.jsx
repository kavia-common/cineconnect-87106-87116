import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ApiProvider } from '../services/Api';

// PUBLIC_INTERFACE
export function renderWithProviders(ui, { route = '/', historyEntries = [route] } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={historyEntries}>
      <ApiProvider>
        {children}
      </ApiProvider>
    </MemoryRouter>
  );
  return { Wrapper };
}
