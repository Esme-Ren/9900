import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ComingSoon from "../ComingSoon";
import "@testing-library/jest-dom";
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

describe("ComingSoon", () => {

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<ComingSoon />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it("renders the comingsoon message", () => {
    renderWithRouter(<ComingSoon />);
    const comingSoon = screen.getByText("Coming Soon...");
    expect(comingSoon).toBeInTheDocument();
  });

});
