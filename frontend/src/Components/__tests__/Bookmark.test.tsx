import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Bookmark from "../Bookmark"; // Adjust the import based on your file structure
import { MemoryRouter } from "react-router-dom";
  
// Mock window.location.reload
const mockReload = jest.fn();
Object.defineProperty(window, "location", {
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

describe("Bookmark Component", () => {
  test("calls onDelete when the delete button is clicked", () => {
    const mockOnDelete = jest.fn();
    const mockOnClick = jest.fn();

    renderWithRouter(
      <Bookmark 
        bookmarkTitle="Test Bookmark"
        bookmarkType="Test Type"
        sdgGoalNumbers={["1", "2"]}
        onClick={mockOnClick}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Test Bookmark")).toBeInTheDocument();
    const deleteButton = screen.getByRole("button", { name: "Remove Bookmark" });

    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);

  });
});