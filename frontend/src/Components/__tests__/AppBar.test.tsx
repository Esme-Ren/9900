import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppBar from '../AppBar';
import * as ApiCalls from '../../Utilities/ApiCalls';

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
  
describe('AppBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<AppBar />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('shows login/signup when not logged in', async () => {
    renderWithRouter(<AppBar />);

    const profileButton = screen.getByRole('button', { name: 'Profile settings' });
    fireEvent.click(profileButton);

    expect(await screen.findByText('LOG IN')).toBeInTheDocument();
    expect(screen.getByText('SIGN UP')).toBeInTheDocument();
  });

  it('shows profile/teams/bookmarks and logout when logged in', async () => {
    // Set the localStorage values that check if someone is logged in to this website
    // and the token hasnt expired (normally 10 hours, but 20 seconds here)
    localStorage.setItem('token', 'mockToken');
    localStorage.setItem('url', 'http://127.0.0.1:8000/');
    localStorage.setItem('token-expiry', String(Date.now() + 20000));

    // not an admin
    (ApiCalls.apiCallGet as jest.Mock).mockImplementation((url) => {
      if (url === 'api/auth/admin-check/') {
        return Promise.resolve({ is_admin: false });
      }
    });

    renderWithRouter(<AppBar />);

    const profileButton = await screen.findByRole('button', { name: 'Profile settings' });
    fireEvent.click(profileButton);

    expect(await screen.findByText('PROFILE')).toBeInTheDocument();
    expect(screen.getByText('TEAMS')).toBeInTheDocument();
    expect(screen.getByText('BOOKMARKS')).toBeInTheDocument();
    expect(screen.getByText('LOG OUT')).toBeInTheDocument();
  });

  it('shows admin portal when user is admin', async () => {
    localStorage.setItem('token', 'mock-token');
    (ApiCalls.apiCallGet as jest.Mock).mockImplementation((url) => {
      if (url === 'api/auth/admin-check/') {
        return Promise.resolve({ is_admin: true });
      }
    });

    renderWithRouter(<AppBar />);

    const featuresButton = await screen.findByText('FEATURES');
    fireEvent.click(featuresButton);

    expect(await screen.findByText('ADMIN PORTAL')).toBeInTheDocument();
  });

  it('logout functionality', async () => {
    // Set the localStorage values that check if someone is logged in to this website
    // and the token hasnt expired (normally 10 hours, but 20 seconds here)
    localStorage.setItem('token', 'mockToken');
    localStorage.setItem('url', 'http://127.0.0.1:8000/');
    localStorage.setItem('token-expiry', String(Date.now() + 20000));
  
    (ApiCalls.apiCallGet as jest.Mock).mockImplementation((url: string) => {
      if (url === 'api/auth/admin-check/') {
        return Promise.resolve({ is_admin: false });
      }
      return Promise.resolve({});
    });
  
    (ApiCalls.apiCallPost as jest.Mock).mockImplementation((url: string) => {
      if (url === 'api/auth/logout/') {
        return Promise.resolve({ statusCode: 200 });
      }
      return Promise.resolve({});
    });
  
    renderWithRouter(<AppBar />);
  
    const profileButton = await screen.findByRole('button', { name: 'Profile settings' });
    fireEvent.click(profileButton);
  
    const logoutButton = await screen.findByText('LOG OUT');
    fireEvent.click(logoutButton);
  
    await waitFor(() => {
      expect(ApiCalls.apiCallPost).toHaveBeenCalledWith('api/auth/logout/', {}, true);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });  
  
});
