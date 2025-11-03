import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import AboutUs from "../AboutUs";
  
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

describe("AboutUs", () => {

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<AboutUs />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it("check if correct text is on screen", () => {
      renderWithRouter(<AboutUs />);
      expect(screen.getByText("Welcome to")).toBeInTheDocument();
      expect(screen.getByText("SDG Zoo")).toBeInTheDocument();
      expect(screen.getByText(/A simple webpage designed to provide comprehensive and relevant information on the United Nations/i)).toBeInTheDocument();
      expect(screen.getByText("More information coming soon...")).toBeInTheDocument();

  });
});