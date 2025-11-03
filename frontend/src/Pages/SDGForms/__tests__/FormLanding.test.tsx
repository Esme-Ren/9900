import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DownloadForm from '../../../Components/DownloadForm';


// Mock window.location.reload
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

// Helper function to render with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

// Stub child components for Forms
jest.mock('../CreateFormModal', () => () => <div>CreateFormModal Stub</div>);
jest.mock('../FormsList', () => () => <div>FormsList Stub</div>);

// Stub children for Form component
jest.mock('../FormInfo', () => () => <div>FormInfo Stub</div>);
jest.mock('../../../Components/DownloadForm', () => jest.fn());

import Form from '../Form';

describe('Form component with stubs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Smoke test using stubs
  it('renders header, download button, and FormInfo stub', () => {
    renderWithRouter(<Form />);

    expect(screen.getByText('SDG Knowledge Action Plan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download Plan as PDF/i })).toBeInTheDocument();
    expect(screen.getByText('FormInfo Stub')).toBeInTheDocument();
  });

  // Checks that DownloadForm can only be used when there is a valid id
  it('does not call DownloadForm when id is undefined', () => {
    renderWithRouter(<Form />);
    const btn = screen.getByRole('button', { name: /Download Plan as PDF/i });
    fireEvent.click(btn);
    expect(DownloadForm).not.toHaveBeenCalled();
  });
});
