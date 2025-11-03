import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as ApiCalls from "../../../Utilities/ApiCalls";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import Teams, { TeamData } from "../Teams";
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

// Mock useNavigate
const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

// Helper function to render the component with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe("TeamsList", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (ApiCalls.apiCallGet as jest.Mock).mockImplementation((url) => {
      if (url === 'api/auth/teams/') {
        return Promise.resolve({
          statusCode: 200,
          teams: [
            {
              id: 1,
              name: 'Team Green',
              description: '',
              role: 'owner',
            },
            {
              id: 2,
              name: 'Team Red',
              description: '',
              role: 'member',
            }
          ]
        })
      } else if (url === 'api/auth/teams/invitations/') {
        return Promise.resolve({
          statusCode: 200,
          pending_invitations: [
              {
                id: 3,
                name: 'Team Blue',
                description: '',
                role: 'member',
                invited_by: 'user1'
              },
              {
                id: 4,
                name: 'Team Yellow',
                description: '',
                role: 'member',
                invited_by: 'user1'
              }
          ]
        })
      } else if (url === 'api/teams/users/') {
        return Promise.resolve({
          statusCode: 200,
          usernames: ['user1', 'user2', 'user3'],
        })
      }
    });
    jest.clearAllMocks();
    (ApiCalls.apiCallPost as jest.Mock).mockImplementation((url) => {
      if (url === 'api/auth/teams/invitations/respond/') {
        return Promise.resolve({
          statusCode: 200,
        })
      }
    });
  });

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<Teams />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // Test TeamsList has headings
  it("should have teams headings", async () => {
    renderWithRouter(<Teams />);
    
    await waitFor(() => {
      expect(screen.getByText("Your Teams")).toBeInTheDocument();
      expect(screen.getByText("All your Teams!")).toBeInTheDocument();
    })
  });

  // Test TeamsList has team tiles
  it("should have team tiles", async () => {
    renderWithRouter(<Teams />);

    await waitFor(() => {
      expect(screen.getByText("Team Green")).toBeInTheDocument();
      expect(screen.getByText("Owner")).toBeInTheDocument();
      expect(screen.getByText("Team Red")).toBeInTheDocument();
      expect(screen.getByText("Member")).toBeInTheDocument();
    });
  });

  // Test TeamsList tiles navigate on click
  it("should navigate when team tile is clicked on", async () => {
    renderWithRouter(<Teams />);
    await waitFor(() => {
      const teamsTile = screen.getByText("Team Green");
      userEvent.click(teamsTile);
    })

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/teams/1')
    });
  });

  // Test InvitationsList has headings
  it("should have invitations headings", async () => {
    renderWithRouter(<Teams />);

    await waitFor(() => {
      expect(screen.getByText("Pending Invitations")).toBeInTheDocument();
      expect(screen.getByText("Awaiting your response")).toBeInTheDocument();
    });
  });

  // Test InvitationsList has team tiles
  it("should have invitations tiles", async () => {
    renderWithRouter(<Teams />);

    await waitFor(() => {
      expect(screen.getByText("Team Blue")).toBeInTheDocument();
      expect(screen.getByText("Team Yellow")).toBeInTheDocument();
      const subheadings = screen.getAllByText("New Invitation");
      expect(subheadings.length).toBe(2);
    });
  });

  // Test InvitationsList tiles open accept invite modal
  it("should have invite acceptance modal", async () => {
    renderWithRouter(<Teams />);

    await waitFor(() => {
      const invitationTile = screen.getByText("Team Blue");
      userEvent.click(invitationTile);
    })

    await waitFor(() => {
      // From mock data above: user 1 was the inviter
      expect(screen.getByText("user1")).toBeInTheDocument();
      expect(screen.getByText("has invited you to join their Team")).toBeInTheDocument();

      // From mock data above/team clicked on: team name is Team Blue
      // Team Blue should appear in the DOM twice: once in the list, and now a
      // second time in the modal.
      const teamNames = screen.getAllByText("Team Blue");
      expect(teamNames.length).toBe(2);

      // Interaction buttons
      expect(screen.getByText("Decline")).toBeInTheDocument();
      expect(screen.getByText("Accept Invitation")).toBeInTheDocument();
    });
  });

  // Test InvitationsList tiles decline button
  it("should delete invite if declined", async () => {
    renderWithRouter(<Teams />);

    await waitFor(() => {
      const invitationTile = screen.getByText("Team Blue");
      userEvent.click(invitationTile);
    })

    act(() => {
      const declineButton = screen.getByText("Decline");
      userEvent.click(declineButton);
    });

    await waitFor(() => {
      const invitationTile = screen.queryByText("Team Blue");
      expect(invitationTile).not.toBeInTheDocument();
    });
  });

  // Test InvitationsList tiles accept button
  it("should add team if accepted", async () => {
    renderWithRouter(<Teams />);
    await waitFor(() => {
      const invitationTile = screen.getByText("Team Blue");
      userEvent.click(invitationTile);
    })

    act(() => {
      const acceptButton = screen.getByText("Accept Invitation");
      userEvent.click(acceptButton);
    });

    await waitFor(() => {
      // Originally there were two invites
      // After accepting, there should only be one invite left
      const invitationTile = screen.getAllByText("New Invitation");
      expect(invitationTile.length).toBe(1);

      const acceptedTile = screen.getByText("Team Blue");
      expect(acceptedTile).toBeInTheDocument();

      // Originally there was only one team with Member role
      // Now there should be two
      const teamsSubheadings = screen.getAllByText("Member");
      expect(teamsSubheadings.length).toBe(2);
    });
  });
});