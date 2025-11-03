import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignUp from "../SignUp";
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

describe("SignUp", () => {

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<SignUp />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // Check if SignUp text is on screen
  it("signup text should be on screen", () => {
      renderWithRouter(<SignUp />);
      
      expect(screen.getByText("Hello Friend!")).toBeInTheDocument();
      expect(screen.getByText("Already a user?")).toBeInTheDocument();
      expect(screen.getByText("Login")).toBeInTheDocument();
  
  });

  it("should navigate to login page when login up button is clicked", () => {
    renderWithRouter(<SignUp />);
    
    const signUpButton = screen.getByText("Login");
    fireEvent.click(signUpButton);
    
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/login");

  });
});