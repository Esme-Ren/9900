import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../Login";
import { MemoryRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
  
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

describe("Login", () => {

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<Login />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // Check if login text is on screen
  it("should update login when input changes", () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
      expect(screen.getByText("Not a user yet?")).toBeInTheDocument();
      expect(screen.getByText("Sign Up")).toBeInTheDocument();
  
  });

  it("should navigate to signup page when sign up button is clicked", () => {
    renderWithRouter(<Login />);
    
    const signUpButton = screen.getByText("Sign Up");
    fireEvent.click(signUpButton);
    
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/signup");

  });
});