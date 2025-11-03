import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminOverviewSDGPlans from '../AdminOverviewSDGPlans';
import { MemoryRouter } from 'react-router-dom';
import * as ApiCalls from "../../../Utilities/ApiCalls";

// Mock the API calls
jest.mock("../../../Utilities/ApiCalls", () => ({
  apiCallGet: jest.fn(),
  apiCallPatch: jest.fn(),
}));

// Mock window.location.reload
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
  },
  writable: true
});

// Mock useNavigate
const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

// Helper function to render the component with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('AdminOverviewSDGPlans', () => {
  beforeEach(() => {
    (ApiCalls.apiCallGet as jest.Mock).mockImplementation((url: string) => {
      if (url === 'api/admin/sdg-plans/') {
        return Promise.resolve({
          statusCode: 200,
          1: {
            id: 1,
            user_id: 101,
            name_of_designers: 'Alice',
            impact_project_name: 'Save the Whales',
            description: 'Protect marine life',
            status: 'In Progress',
          },
          2: {
            id: 2,
            user_id: 102,
            name_of_designers: 'Bob',
            impact_project_name: 'Plant More Trees',
            description: 'Reforesting efforts',
            status: 'Completed',
          },
        });
      }
    });
  });

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<AdminOverviewSDGPlans />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('fetches action plans', async () => {
    (ApiCalls.apiCallGet as jest.Mock).mockResolvedValue({
      statusCode: 200,
      1: {
        id: 1,
        user_id: 4,
        name_of_designers: 'Alice',
        impact_project_name: 'Save the Whales',
        description: 'Protect marine life',
        status: 'Draft',
      },
      2: {
        id: 2,
        user_id: 6,
        name_of_designers: 'Bob',
        impact_project_name: 'Plant More Trees',
        description: 'Reforesting efforts',
        status: 'Completed',
      },
    });

    renderWithRouter(<AdminOverviewSDGPlans/>)

    await waitFor(() => {
      expect(screen.getByText('Save the Whales')).toBeInTheDocument();
      expect(screen.getByText('Plant More Trees')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search the forms');
    fireEvent.change(searchInput, { target: { value: 'Whales' } });

    await waitFor(() => {
      expect(screen.getByText('Save the Whales')).toBeInTheDocument();
      expect(screen.queryByText('Plant More Trees')).not.toBeInTheDocument();
    });
  });

});
