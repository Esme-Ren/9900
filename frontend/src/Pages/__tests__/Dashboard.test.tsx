import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchKeyword from "../SearchKeyword";
import * as ApiCalls from "../../Utilities/ApiCalls"
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Mock the API calls
jest.mock("../../Utilities/ApiCalls", () => ({
  apiCallGet: jest.fn(),
  apiCallPost: jest.fn()
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

describe("CreateDashboard/Search", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (ApiCalls.apiCallPost as jest.Mock).mockImplementation((url) => {
      if (url === 'api/admin/log/education/' || url === 'api/admin/log/action/') {
        return Promise.resolve({ statusCode: 200 });
      } else if (url === 'api/admin/analytics/educations/top/') {
        return Promise.resolve({
          0: {
            educationName: 'Introducing the Sustainability Bootcamp and the SDGs',
          }
        });
      } else if (url === 'api/admin/analytics/actions/top/') {
        return Promise.resolve({
          0: {
            actionName: "Get rid of paper bank statements",
          }
        });
      }
    });

    (ApiCalls.apiCallGet as jest.Mock).mockImplementation((url) => {
      if (url.includes('userInteractions')) {
        return Promise.resolve({
          action_plans_viewed: [],
          education_plans_viewed: [],
        });
      } else if (url.startsWith('api/sdg-education/search?q=Introducing')) {
        return Promise.resolve([
          {
            title: "Introducing the Sustainability Bootcamp and the SDGs",
            aims: "Understand transboundary freshwater governance.",
            descriptions: "Course on governance for transboundary freshwater security...",
            organization: "SDG Academy X"
          }
        ]);
      } else if (url.startsWith('api/sdg-actions/search?q=Get')) {
        return Promise.resolve([
          {
            actions: "Get rid of paper bank statements",
            action_detail: "Cut down on waste and maybe save money at the coffee shop.",
          }
        ]);
      }
      return Promise.resolve([]);
    });

    // user isn't logged in
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'userDetails') {
        return JSON.stringify({ id: '1', name: 'Test User' });
      }
      if (key === 'token') {
        return 'fake_token';
      }
      return null;
    });
  });

  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<SearchKeyword />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it("should render the title", async () => {
    renderWithRouter(<SearchKeyword />);
    expect(await screen.findByText("SDG Knowledge System")).toBeInTheDocument();
  });

  it("should display recent searches when the input is focused", async () => {
    renderWithRouter(<SearchKeyword />);
    const input = screen.getByPlaceholderText("Search for an SDG Action/Education Plan");
    fireEvent.focus(input);

    expect(await screen.findByText("Get rid of paper bank statements")).toBeInTheDocument();
    expect(await screen.findByText("Introducing the Sustainability Bootcamp and the SDGs")).toBeInTheDocument();
  });

  it("should fetch suggestions when typing", async () => {
    renderWithRouter(<SearchKeyword />);
    const input = screen.getByPlaceholderText("Search for an SDG Action/Education Plan");
    
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Introducing" } });

    await waitFor(() => {
      expect(ApiCalls.apiCallGet).toHaveBeenCalledWith(
        expect.stringContaining("api/sdg-education/search?q=Introducing"),
        false
      );
      expect(ApiCalls.apiCallGet).toHaveBeenCalledWith(
        expect.stringContaining("api/sdg-actions/search?q=Introducing"),
        false
      );
    });

  });

  it("should update search input value", async () => {
    renderWithRouter(<SearchKeyword />);
    const input = screen.getByPlaceholderText("Search for an SDG Action/Education Plan");

    userEvent.type(input, "Sustainability");

    await waitFor(() => {
      expect(input).toHaveValue("Sustainability");
    });
  });

  it("should open modal when suggested plan is selected", async () => {
    renderWithRouter(<SearchKeyword />);
    const input = screen.getByPlaceholderText("Search for an SDG Action/Education Plan");
    
    fireEvent.focus(input);
    await userEvent.type(input, "Introducing");
  
    const suggestion = await screen.findByText("Introducing the Sustainability Bootcamp and the SDGs");
    expect(suggestion).toBeInTheDocument();
  
    userEvent.click(suggestion);
  });

});
