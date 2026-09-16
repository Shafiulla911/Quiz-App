import { render, screen } from '@testing-library/react';
import App from './App';

test('renders QuizSpark app header branding', () => {
  render(<App />);
  const logoElement = screen.getByText(/Quiz/i);
  expect(logoElement).toBeInTheDocument();
});

