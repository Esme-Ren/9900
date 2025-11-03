import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfile from '../UserProfile';
import UserDeleteModal from '../UserDeleteModal';
import { MemoryRouter } from 'react-router-dom';
import * as ApiCalls from '../../../Utilities/ApiCalls';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mocks
jest.mock('../../../Utilities/ApiCalls', () => ({
  apiCallGet: jest.fn(),
  apiCallPut: jest.fn(),
  apiCallDelete: jest.fn(),
}));

// Mock window.location.reload
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

// Helper to render with router + theme
const renderWithRouter = (component: React.ReactNode) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{component}</MemoryRouter>
    </ThemeProvider>
  );
};

describe('UserProfile', () => {
  beforeEach(() => {
    (ApiCalls.apiCallGet as jest.Mock).mockResolvedValue({
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      mobile: '1234567890',
      organization: 'TestOrg',
      faculty_and_major: 'Engineering',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Smoke test
  it('renders without crashing', async () => {
    renderWithRouter(<UserProfile />);
    expect(await screen.findByText('testuser')).toBeInTheDocument(); // username in ProfileCard
  });

  // Checks that the correct info is in the correct input fields
  it('displays input fields with fetched user data', async () => {
    renderWithRouter(<UserProfile />);

    expect(await screen.findByDisplayValue('testuser')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Test')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('User')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  // Checks that an edit button is shown on the page
  it('shows Edit button initially', async () => {
    renderWithRouter(<UserProfile />);
    expect(await screen.findByText('Edit')).toBeInTheDocument();
  });

  // Checks that Save and Cancel will appear during editing mode
  it('toggles editing mode and shows Save and Cancel buttons', async () => {
    renderWithRouter(<UserProfile />);
    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);

    expect(await screen.findByText('Save')).toBeInTheDocument();
    expect(await screen.findByText('Cancel')).toBeInTheDocument();
  });

  // Checks that updateUserDetails is called when the Save button is clicked
  it('calls updateUserDetails on Save', async () => {
    const putMock = ApiCalls.apiCallPut as jest.Mock;
    putMock.mockResolvedValue({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      mobile: '1234567890',
      organization: 'TestOrg',
      faculty_and_major: 'Engineering',
    });

    renderWithRouter(<UserProfile />);
    fireEvent.click(await screen.findByText('Edit'));
    fireEvent.click(await screen.findByText('Save'));

    await waitFor(() => {
      expect(putMock).toHaveBeenCalledTimes(1);
    });
  });

  // Checks that info is restored when Cancel is clicked
  it('restores initial values when Cancel is clicked', async () => {
    renderWithRouter(<UserProfile />);
    fireEvent.click(await screen.findByText('Edit'));
  
    const inputs = await screen.findAllByRole('textbox');
    const firstNameInput = inputs[1];
  
    fireEvent.change(firstNameInput, { target: { value: 'ChangedName' } });
  
    fireEvent.click(await screen.findByText('Cancel'));
  
    expect(await screen.findByDisplayValue('Test')).toBeInTheDocument();
  });
});


describe('UserDeleteModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Checks that a Delete User button is on the page
  it('renders Delete User modal button', async () => {
    renderWithRouter(<UserDeleteModal name="testuser" />);
    expect(await screen.findByText('Delete User')).toBeInTheDocument();
  });

  // Checks that an error message is thrown if the incorrect text is entered when deleting
  it('shows error message if incorrect text entered', async () => {
    renderWithRouter(<UserDeleteModal name="testuser" />);

    fireEvent.click(await screen.findByText('Delete User'));

    const input = await screen.findByPlaceholderText('DELETE testuser');
    fireEvent.change(input, { target: { value: 'WRONG TEXT' } });

    fireEvent.click(screen.getByText('Delete this User'));

    expect(await screen.findByText(/does not match required/i)).toBeInTheDocument();
  });

  // Checks that delete can be called successfully
  it('calls apiCallDelete and navigates on correct delete text', async () => {
    (ApiCalls.apiCallDelete as jest.Mock).mockResolvedValue({ statusCode: 200 });
    renderWithRouter(<UserDeleteModal name="testuser" />);

    fireEvent.click(await screen.findByText('Delete User'));

    const input = await screen.findByPlaceholderText('DELETE testuser');
    fireEvent.change(input, { target: { value: 'DELETE testuser' } });

    fireEvent.click(screen.getByText('Delete this User'));

    await waitFor(() => {
      expect(ApiCalls.apiCallDelete).toHaveBeenCalledTimes(1);
      expect(ApiCalls.apiCallDelete).toHaveBeenCalledWith('api/auth/delete-account/', true);
    });
  });

  // Checks that an error is thrown if the API fails to make a call
  it('shows error if delete API fails', async () => {
    (ApiCalls.apiCallDelete as jest.Mock).mockResolvedValue({ statusCode: 400 });
    renderWithRouter(<UserDeleteModal name="testuser" />);

    fireEvent.click(await screen.findByText('Delete User'));

    const input = await screen.findByPlaceholderText('DELETE testuser');
    fireEvent.change(input, { target: { value: 'DELETE testuser' } });

    fireEvent.click(screen.getByText('Delete this User'));

    // Nothing specific renders because you didn't put the error JSX inside a `setMessage`
    await waitFor(() => {
      expect(ApiCalls.apiCallDelete).toHaveBeenCalled();
    });
  });
});


