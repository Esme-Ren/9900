import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Bookmarks from '../Bookmarks';
import * as ApiCalls from "../../Utilities/ApiCalls"
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

// Mock the API calls
jest.mock("../../Utilities/ApiCalls", () => ({
  apiCallGet: jest.fn(),
  apiCallPost: jest.fn(),
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
  
describe('Bookmarks Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ApiCalls.apiCallPost as jest.Mock).mockImplementation((url) => {
      if (url === 'api/auth/bookmark/set/') {
        return Promise.resolve({ statusCode: 200 });
      }
      if (url === 'api/auth/bookmark/unset/') {
        return Promise.resolve({ statusCode: 200 });
      }
    });

    (ApiCalls.apiCallGet as jest.Mock).mockImplementation((url) => {
      if (url === 'api/auth/bookmark/get/') {
        return Promise.resolve({
          bookmarks: ['action-1', 'education-2']
        });
      }
      if (url.startsWith('api/sdg-actions/retrieve')) {
        return Promise.resolve({
          id: '1',
          actions: 'Plant a tree',
          aims: 'Environmental improvement',
          action_detail: 'Planting trees to absorb carbon dioxide',
          organization: 'Green Earth Org',
          sdgs: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
          type: 'action'
        });
      }
      if (url.startsWith('api/sdg-education/retrieve')) {
        return Promise.resolve({
          id: '2',
          title: 'Climate Change Education',
          aims: 'Awareness',
          descriptions: 'Learn about climate change.',
          organization: 'UNESCO',
          sdgs_related: ['10', '11', '12', '13', '14', '15', '16', '17', '18'],
          type: 'education'
        });
      }
    });
  });

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<Bookmarks />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('shows bookmarks', async () => {
    renderWithRouter(<Bookmarks />);

    expect(await screen.findByText('Plant a tree')).toBeInTheDocument();
    expect(await screen.findByText('Climate Change Education')).toBeInTheDocument();
  });

  it('can search bookmarks', async () => {
    renderWithRouter(<Bookmarks />);
    
    fireEvent.change(screen.getByPlaceholderText('Search your bookmarks'), {
      target: { value: 'Climate' }
    });

    expect(await screen.findByText('Climate Change Education')).toBeInTheDocument();
    expect(await screen.queryByText('Plant a tree')).not.toBeInTheDocument();
  });

  it('opens and closes modal', async () => {
    renderWithRouter(<Bookmarks />);
    
    const bookmark = await screen.findByText('Plant a tree');
    fireEvent.click(bookmark);
    
    expect(screen.findByText('Planting trees to absorb carbon dioxide'))
    expect(screen.findByText('Organization: Green Earth Org'))

  });

  it('filters out action bookmarks when "Actions" is unchecked', async () => {
    renderWithRouter(<Bookmarks />);

    const filterButton = await screen.getByRole('button', { name: 'filter' });
    fireEvent.click(filterButton);

    const actionsCheckbox = screen.getByLabelText('Actions');
    fireEvent.click(actionsCheckbox);

    // Only education bookmark should be visible now
    expect(await screen.queryByText('Plant a tree')).not.toBeInTheDocument();
    expect(await screen.findByText('Climate Change Education')).toBeInTheDocument();
  });

  it('filters out education bookmarks when "Education" is unchecked', async () => {
    renderWithRouter(<Bookmarks />);

    const filterButton = await screen.getByRole('button', { name: 'filter' });
    fireEvent.click(filterButton);

    expect(await screen.findByText('Plant a tree')).toBeInTheDocument();
    expect(await screen.findByText('Climate Change Education')).toBeInTheDocument();

    const educationCheckbox = screen.getByLabelText('Education');
    fireEvent.click(educationCheckbox);

    // Only action bookmark should be visible now
    expect(await screen.findByText('Plant a tree')).toBeInTheDocument();
    expect(await screen.queryByText('Climate Change Education')).not.toBeInTheDocument();

  });

});
