import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginForm from "../LoginForm";
import * as ApiCalls from "../../Utilities/ApiCalls"
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Mock the API calls
jest.mock("../../Utilities/ApiCalls", () => ({
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
    <GoogleOAuthProvider clientId="google-client-id">
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </GoogleOAuthProvider>
  );
};

describe("CreateLoginForm", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (ApiCalls.apiCallPost as jest.Mock).mockResolvedValue({
      statusCode: 200
    });
  });

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<LoginForm />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // Test login input
  it("should update login when input changes", () => {
    renderWithRouter(<LoginForm />);
    
    // Find the input and change its value
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "TestPassword1234!" } });
    
    // Check if the input value has been updated
    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("TestPassword1234!");
  });

  // Test user login functionality
  it("should allow the user to login", async () => {

    jest.clearAllMocks();
    (ApiCalls.apiCallPost as jest.Mock).mockImplementation((url) => {
      if (url === 'api/auth/login/') {
        return Promise.resolve({
          statusCode: 400,
          error: "Both username and password are required."
        });
      }
    });

    renderWithRouter(<LoginForm />);
  
    const loginButton = screen.getByText("Log In");

    userEvent.click(loginButton);

    // Error should show up (since no inputs are fed in)
    await waitFor(() => {
      expect(screen.getByText("Both username and password are required.")).toBeInTheDocument();
    });
  
  })  
  
  it("on success, should navigate to dashboard", async () => {
    jest.clearAllMocks();
		Storage.prototype.setItem = jest.fn();
    (ApiCalls.apiCallPost as jest.Mock).mockImplementation((url) => {
      if (url === 'api/auth/login/') {
        return Promise.resolve({
          statusCode: 200,
          token: "fakeToken"
        });
      }
    });

    renderWithRouter(<LoginForm />);

    // Check inputs are there
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByText("Log In");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "TestPassword1234!" } });
  
    // Test form submission success
    userEvent.click(loginButton);

    await waitFor(() => {
    	expect(mockedUsedNavigate).toHaveBeenCalledWith('/')
			expect(localStorage.setItem).toHaveBeenCalledWith("token", "fakeToken");
    });
  })
});