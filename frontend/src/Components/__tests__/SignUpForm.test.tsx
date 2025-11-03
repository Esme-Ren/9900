import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignUpForm from "../SignUpForm";
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

describe("CreateSignUpForm", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (ApiCalls.apiCallPost as jest.Mock).mockResolvedValue({
      statusCode: 200
    });
  });

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<SignUpForm />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // Test sign up input
  it("should update sign up when input changes", () => {
    renderWithRouter(<SignUpForm />);
    
    // Find the input and change its value
    const usernameInput = screen.getByPlaceholderText("Username");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(emailInput, { target: { value: "testemail@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "TestPassword1234!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "TestPassword1234!" } });
    
    // Check if the input value has been updated
    expect(usernameInput).toHaveValue("testuser");
    expect(emailInput).toHaveValue("testemail@gmail.com");
    expect(passwordInput).toHaveValue("TestPassword1234!");
    expect(confirmPasswordInput).toHaveValue("TestPassword1234!");
  });

  // Test user sign up functionality
  it("should allow the user to sign up", async () => {

    jest.clearAllMocks();
    (ApiCalls.apiCallPost as jest.Mock).mockImplementation((url) => {
      if (url === 'api/auth/pending-register/') {
        return Promise.resolve({
          statusCode: 400,
          username: ["This field may not be blank."],
          email: ["This field may not be blank."],
          password1: ["This field may not be blank."],
          password2: ["This field may not be blank."]
        });
      }
    });

    renderWithRouter(<SignUpForm />);
  
    const signUpButton = screen.getByText("Sign Up");

    userEvent.click(signUpButton);

    // Error should show up (since no inputs are fed in)
    await waitFor(() => {
      expect(screen.getByText("USERNAME: This field may not be blank.")).toBeInTheDocument();
      expect(screen.getByText("EMAIL: This field may not be blank.")).toBeInTheDocument();
      expect(screen.getByText("PASSWORD1: This field may not be blank.")).toBeInTheDocument();
      expect(screen.getByText("PASSWORD2: This field may not be blank.")).toBeInTheDocument();
    });
  
  })  
  
  it("on success, should navigate to confirmation pin page", async () => {
    jest.clearAllMocks();
    (ApiCalls.apiCallPost as jest.Mock).mockImplementation((url) => {
      if (url === 'api/auth/pending-register/') {
        return Promise.resolve({
          statusCode: 200,
          token: "fakeToken",
          message: "Verification code sent. Please check your email."
        });
      }
    });

    renderWithRouter(<SignUpForm />);

    // Check inputs are there
    const usernameInput = screen.getByPlaceholderText("Username");
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
    const signUpButton = screen.getByText("Sign Up");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(emailInput, { target: { value: "testemail@gmail.com" } });
    fireEvent.change(passwordInput, { target: { value: "TestPassword1234!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "TestPassword1234!" } });
  
    // Test form submission success
    userEvent.click(signUpButton);

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith(
        '/confirmation-pin', 
        expect.objectContaining({
          state: expect.objectContaining({
            username: "testuser",
            email: "testemail@gmail.com",
            password1: "TestPassword1234!",
            password2: "TestPassword1234!",
            mobile: "",
            initialToken: "fakeToken"
          })
        })
      )
    });
  })
});