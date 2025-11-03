import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateTeamModal from "../CreateTeamModal";
import * as ApiCalls from "../../../Utilities/ApiCalls";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

// Mock the API calls
jest.mock("../../../Utilities/ApiCalls", () => ({
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

// Helper function to render the component with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe("CreateTeamModal", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (ApiCalls.apiCallGet as jest.Mock).mockResolvedValue({
      statusCode: 200,
      usernames: ['user1', 'user2', 'user3'],
    });
  });

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<CreateTeamModal />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // Test modal opens when button is clicked
  it("should open modal when button is clicked", async () => {
    renderWithRouter(<CreateTeamModal />);
    
    // Find and click the "Create a Team" button
    const createButton = screen.getByText("Create a Team");
    fireEvent.click(createButton);
  
    // Check if modal content is visible
    await waitFor(() => {
      expect(screen.getByText("Create an SDG Team")).toBeInTheDocument();
    })
  });

  // Test team name input
  it("should update team name when input changes", async () => {
    renderWithRouter(<CreateTeamModal />);
    
    // Open the modal
    const createButton = screen.getByText("Create a Team");
    fireEvent.click(createButton);
    
    // Find the team name input and change its value
    const teamNameInput = screen.getByPlaceholderText("e.g. Team Green, SDG Project");
    fireEvent.change(teamNameInput, { target: { value: "Test Team" } });
    
    // Check if the input value has been updated
    await waitFor(() => {
      expect(teamNameInput).toHaveValue("Test Team");
    })
  });

  // Test user search functionality
  it("should filter users when searching", async () => {
    renderWithRouter(<CreateTeamModal />);
    
    // Open the modal
    const createButton = screen.getByText("Create a Team");
    fireEvent.click(createButton);
    
    // Find the user search input and type in it
    const searchInput = screen.getByPlaceholderText("Type the username of a friend");
    userEvent.type(searchInput, "user");

    // Check if input value has been updated
    expect(searchInput).toHaveValue("user");
    
    // Wait for the filtered users to appear
    await waitFor(() => {
      expect(screen.getByText("user1")).toBeInTheDocument();
      expect(screen.getByText("user2")).toBeInTheDocument();
      expect(screen.getByText("user3")).toBeInTheDocument();
    });
  });

  // Test user search on blur
  it("should remove user suggestions on blur", async () => {
    renderWithRouter(<CreateTeamModal />);
    
    // Open the modal
    const createButton = screen.getByText("Create a Team");
    fireEvent.click(createButton);
    
    // Find the user search input and type in it
    const searchInput = screen.getByPlaceholderText("Type the username of a friend");
    userEvent.type(searchInput, "user");
    
    // Wait for the filtered users to appear
    await waitFor(() => {
      expect(screen.getByText("user1")).toBeInTheDocument();
    });

    fireEvent.blur(searchInput);
    // Wait for the filtered users to appear
    await waitFor(() => {
      expect(screen.queryByText("user1")).not.toBeInTheDocument();
    });
  });

  // Test adding a user
  it("should add a user when clicked from search results", async () => {
    renderWithRouter(<CreateTeamModal />);
    
    // Open the modal
    const createButton = screen.getByText("Create a Team");
    fireEvent.click(createButton);
    
    // Search for users
    const searchInput = screen.getByPlaceholderText("Type the username of a friend");
    userEvent.type(searchInput, "user");
    
    // Wait for search results and click on a user
    await waitFor(() => {
      const user1 = screen.getByText("user1");
      fireEvent.click(user1);
    });

    await waitFor(() => {
      // Check if the user has been added (as a chip)
      expect(screen.getByText("user1")).toBeInTheDocument();
      
      // Check if the search input has been cleared
      expect(searchInput).toHaveValue("");
    })
  });

  // Test removing a user
  it("should remove a user when delete button on chip is clicked", async () => {
    renderWithRouter(<CreateTeamModal />);
    
    // Open the modal
    const createButton = screen.getByText("Create a Team");
    fireEvent.click(createButton);
    
    // Search for users and add one
    const searchInput = screen.getByPlaceholderText("Type the username of a friend");
    userEvent.type(searchInput, "user");
    
    await waitFor(() => {
      const user1 = screen.getByText("user1");
      fireEvent.click(user1);
    });
    
    // Find the chip with the user and click its delete button
    const chip = screen.getByText("user1").closest(".MuiChip-root");
    const deleteButton = chip?.querySelector(".MuiChip-deleteIcon");
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }
    
    // Check if the user has been removed
    await waitFor(() => {
      expect(screen.queryByText("user1")).not.toBeInTheDocument();
    });
  });
});