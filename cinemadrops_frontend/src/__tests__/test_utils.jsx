import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ApiProvider } from '../services/Api';
import { SocketProvider } from '../services/Socket';

// PUBLIC_INTERFACE
export function renderWithProviders(ui, { route = '/', historyEntries = [route] } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={historyEntries}>
      <ApiProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </ApiProvider>
    </MemoryRouter>
  );
  return { Wrapper };
}
