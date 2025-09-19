import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Cinemadrops brand', () => {
  render(<App />);
  const brand = screen.getByText(/Cinemadrops/i);
  expect(brand).toBeInTheDocument();
});
