// Stub child components before importing Forms
jest.mock('../CreateFormModal', () => () => <div>CreateFormModal Stub</div>);
jest.mock('../FormsList', () => () => <div>FormsList Stub</div>);

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Forms from '../Forms';

// Smoke test using stubs
describe('Forms component with stubs', () => {
  it('renders heading and stubbed children', () => {
    render(
      <MemoryRouter>
        <Forms />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Recent Forms/i })).toBeInTheDocument();
    expect(screen.getByText('CreateFormModal Stub')).toBeInTheDocument();
    expect(screen.getByText('FormsList Stub')).toBeInTheDocument();
  });
});
