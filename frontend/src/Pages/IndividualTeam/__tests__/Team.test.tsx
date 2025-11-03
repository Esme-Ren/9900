import { render, screen, fireEvent, waitFor, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as ApiCalls from "../../../Utilities/ApiCalls";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import Team from "../Team";
import userEvent from "@testing-library/user-event";

// Mock the API calls
jest.mock("../../../Utilities/ApiCalls", () => ({
  apiCallGet: jest.fn(),
  apiCallPost: jest.fn(),
  apiCallDelete: jest.fn(),
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

const mockForm = {
  'id': 1,
  'name_of_designers': '',
  'impact_project_name': 'Test',
  'description': '',
  'plan_content': {
    'SDGs': [],
    'risk': '',
    'role': '',
    'steps': {
      'input1': '',
      'input2': '',
      'input3': '',
      'input4': '',
      'input5': '',
      'input6': ''
    },
    'impact': '',
    'example': '',
    'challenge': '',
    'resources': '',
    'importance': '',
    'mitigation': '',
    'impact_types': {
      'rank1': '',
      'rank2': '',
      'rank3': ''
    }
  },
  'status': 'draft',
  'created_at': '2025-04-25T05:22:06.240530Z',
  'updated_at': '2025-04-25T05:22:08.958497Z',
  'pdf_file_path': null,
  'user': 1,
  'team': 1
}

describe("Team", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (ApiCalls.apiCallGet as jest.Mock).mockImplementation((url) => {
      if (url === 'api/teams/1/members/') {
        return Promise.resolve({
          statusCode: 200,
          members: [
            {
              user: {
                id: 1,
                username: 'Test',
                email: 'TestEmail@gmail.com'
              },
              role: 'owner',
              is_pending: false,
              joined_on: '25 Apr 2025, 04:06 AM',
              can_invite: true
            },
            {
              user: {
                  id: 2,
                  username: 'Test2',
                  email: 'TestEmail2@gmail.com'
              },
              role: 'admin',
              is_pending: false,
              joined_on: '25 Apr 2025, 04:06 AM',
              can_invite: false
            },
            {
              user: {
                  id: 3,
                  username: 'Test3',
                  email: 'TestEmail2@gmail.com'
              },
              role: 'member',
              is_pending: false,
              joined_on: '25 Apr 2025, 04:06 AM',
              can_invite: false
            },
            {
              user: {
                  id: 4,
                  username: 'Test4',
                  email: 'TestEmail3@gmail.com'
              },
              role: 'member',
              is_pending: true,
              joined_on: '25 Apr 2025, 04:59 AM',
              can_invite: false
            },
            {
              user: {
                  id: 5,
                  username: 'Test5',
                  email: 'TestEmail3@gmail.com'
              },
              role: 'member',
              is_pending: true,
              joined_on: '25 Apr 2025, 04:59 AM',
              can_invite: false
            }
          ]
        })
      } else if (url === 'api/teams/1') {
        return Promise.resolve({
          statusCode: 200,
          id: 1,
          name: 'Team Green',
          description: '',
        })
      } else if (url === 'api/teams/users/') {
        return Promise.resolve({
          statusCode: 200,
          usernames: ['Test6', 'Test7'],
        })
      } else if (url === 'api/sdg-action-plan/1/') {
        return Promise.resolve(mockForm)
      } else if (url === 'api/sdg-action-plan/') {
        return Promise.resolve([
          mockForm
        ])
      }
    });
    (ApiCalls.apiCallPost as jest.Mock).mockImplementation((url) => {
      if (url === 'api/teams/1/role/') {
        return Promise.resolve({
          statusCode: 200,
          role: 'owner',
          can_invite: true
        })
      } else {
        return Promise.resolve({
          statusCode: 200,
        })
      }
    });
    (ApiCalls.apiCallDelete as jest.Mock).mockImplementation(() => {
      return Promise.resolve({statusCode: 200});
    });
  });

  // Snapshot test
  it("should match snapshot", async () => {
    const { asFragment } = renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // Test Team page has heading
  it("should have heading", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const heading = screen.getByText("Team Green");
      expect(heading).toBeInTheDocument();
    })
  });

  // Test Team page has users
  it("should have users", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    
    await waitFor(() => {
      const users = ['Test', 'Test2', 'Test3', 'Test4'];
      for (const user of users) {
        expect(screen.getByText(user)).toBeInTheDocument();
      }
    })
  });

  // Test Team page has user roles
  it("should have user roles", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    
    await waitFor(() => {
      const roles = ['Team Owner', 'Team Admin', 'Member'];
      for (const role of roles) {
        expect(screen.getByText(role)).toBeInTheDocument();
      }
      // Two people with invited status
      expect(screen.getAllByText('Invited').length).toBe(2);
    })
  });

  // Test Team page has search bar
  it("should have search bar", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const searchBar = screen.getByPlaceholderText("Search for people");
      expect(searchBar).toBeInTheDocument();
    });
  });

  // Test filter users by name
  it("should filter users by name", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const searchBar = screen.getByPlaceholderText("Search for people");
      userEvent.type(searchBar, 'Test2');
    })
    await waitFor(() => {
      const otherUsers = ['Test', 'Test3', 'Test4', 'Test5']
      for (const otherUser of otherUsers) {
        expect(screen.queryByText(otherUser)).not.toBeInTheDocument();
      }
      expect(screen.getByText('Test2')).toBeInTheDocument();
    })
  });

  // Test filter users by role
  it("should filter users by role", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const searchBar = screen.getByPlaceholderText("Search for people");
      userEvent.type(searchBar, 'Team Admin');
    })
    await waitFor(() => {
      const otherUsers = ['Team Owner', 'Member', 'Invited']
      for (const otherUser of otherUsers) {
        expect(screen.queryByText(otherUser)).not.toBeInTheDocument();
      }
      expect(screen.getByText('Team Admin')).toBeInTheDocument();
    })
  });

  // Test invite modal
  it("should have invite modal", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const inviteButton = screen.getByText("Invite");
      userEvent.click(inviteButton);
    })
    await waitFor(() => {
      expect(screen.getByText('Invite Users to "Team Green"')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type the username of a friend')).toBeInTheDocument();
      expect(screen.getByText('Invite Users')).toBeInTheDocument();
    })
  });

  // Test able to invite using invite modal
  it("should be able to invite", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const inviteButton = screen.getByText("Invite");
      userEvent.click(inviteButton);
    })
    await waitFor(() => {
      const field = screen.getByPlaceholderText('Type the username of a friend');
      userEvent.type(field, 'Test6')
    })
    await waitFor(() => {
      const filteredUserTile = screen.getByText('Test6');
      expect(filteredUserTile).toBeInTheDocument();
      userEvent.click(filteredUserTile);
    })
    await waitFor(() => {
      userEvent.click(screen.getByText('Invite Users'));
    })
    await waitFor(() => {
      expect(screen.getByText('Invite sent')).toBeInTheDocument();
    })
  });

  // Test owner cannot leave
  it("should not be able to leave as owner", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const leaveButton = screen.getByText("Leave");
      expect(leaveButton).toBeInTheDocument();
    })
    act(() => {
      userEvent.click(screen.getByText("Leave"));
    })
    await waitFor(() => {
      const leaveError = screen.getByText("Team owners must transfer ownership before leaving.");
      expect(leaveError).toBeInTheDocument();
    })
  });

  // Test owner can transfer ownership
  it("should be able to transfer ownership", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const row = screen.getByText('Test2').parentElement;
      expect(row).toBeInTheDocument();
      const moreActionsMenu = within(row!).getByRole('button');
      expect(moreActionsMenu).toBeInTheDocument();
      userEvent.click(moreActionsMenu);
    })
    await waitFor(() => {
      const promote = screen.getByText('Elevate to Team Owner');
      expect(promote).toBeInTheDocument();
      userEvent.click(promote);
    })
    await waitFor(() => {
      const confirm = screen.getByText('Confirm');
      expect(confirm).toBeInTheDocument();
      userEvent.click(confirm);
    })
  });

  // Test owner can leave after transferring ownership
  it("should be able to leave as non-owner", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const row = screen.getByText('Test2').parentElement;
      const moreActionsMenu = within(row!).getByRole('button');
      userEvent.click(moreActionsMenu);
    })
    await waitFor(() => {
      const promote = screen.getByText('Elevate to Team Owner');
      userEvent.click(promote);
    })
    await waitFor(() => {
      const confirm = screen.getByText('Confirm');
      userEvent.click(confirm);
    })
    await waitFor(() => {
      const leaveButton = screen.getByText("Leave");
      userEvent.click(leaveButton);
    })
    await waitFor(() => {
      const leaveButton = screen.getByText("Confirm leave");
      expect(leaveButton).toBeInTheDocument();
      userEvent.click(leaveButton);
    })
  });

  // Test owner can promote and demote members and admins
  it("should be able to grant and revoke admin", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const row = screen.getByText('Test3').parentElement;
      const moreActionsMenu = within(row!).getByRole('button');
      userEvent.click(moreActionsMenu);
    })
    await waitFor(() => {
      const promote = screen.getByText('Elevate to Team Admin');
      expect(promote).toBeInTheDocument();
      userEvent.click(promote);
    })
    await waitFor(() => {
      const demote = screen.getByText('Revoke Team Admin');
      expect(demote).toBeInTheDocument();
      userEvent.click(demote);
    })
  });

  // Test owner can kick users
  it("should be able to kick users", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const row = screen.getByText('Test3').parentElement;
      const moreActionsMenu = within(row!).getByRole('button');
      userEvent.click(moreActionsMenu);
    })
    await waitFor(() => {
      const kick = screen.getByText('Kick');
      expect(kick).toBeInTheDocument();
      userEvent.click(kick);
    })
    await waitFor(() => {
      const confirm = screen.getByText('Confirm kick');
      expect(confirm).toBeInTheDocument();
      userEvent.click(confirm);
    })
  });

  // Test owner can view profile
  it("should be able to view profile", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const row = screen.getByText('Test3').parentElement;
      const moreActionsMenu = within(row!).getByRole('button');
      userEvent.click(moreActionsMenu);
    })
    await waitFor(() => {
      const profile = screen.getByText('Profile');
      expect(profile).toBeInTheDocument();
      userEvent.click(profile);
    })
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/userprofile/Test3');
    })
  });

  // Test owner can view profile
  it("should be able to view profile", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const row = screen.getByText('Test3').parentElement;
      const moreActionsMenu = within(row!).getByRole('button');
      userEvent.click(moreActionsMenu);
    })
    await waitFor(() => {
      const profile = screen.getByText('Profile');
      expect(profile).toBeInTheDocument();
      userEvent.click(profile);
    })
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/userprofile/Test3');
    })
  });

  // Test delete modal contents exist
  it("should be able to open delete modal", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Team');
      expect(deleteButton).toBeInTheDocument();
      userEvent.click(deleteButton);
    })
    await waitFor(() => {
      const modalTitle = screen.getByText('Delete Team "Team Green"');
      const modalText = screen.getByText('To confirm, type "DELETE Team Green" in the box below.');
      const modalField = screen.getByPlaceholderText('DELETE Team Green');
      const modalButton = screen.getByText('Delete this Team');
      expect(modalTitle).toBeInTheDocument();
      expect(modalText).toBeInTheDocument();
      expect(modalField).toBeInTheDocument();
      expect(modalButton).toBeInTheDocument();
    })
  });

  // Test modal gives error message on incorrect input
  it("should not delete team on incorrect input", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Team');
      expect(deleteButton).toBeInTheDocument();
      userEvent.click(deleteButton);
    })
    await waitFor(() => {
      const modalField = screen.getByPlaceholderText('DELETE Team Green');
      userEvent.type(modalField, 'Incorrect Text');
    })
    await waitFor(() => {
      const modalButton = screen.getByText('Delete this Team');
      userEvent.click(modalButton);
    })
    await waitFor(() => {
      const modalError = screen.getByText('Input "Incorrect Text" does not match required "DELETE Team Green".');
      expect(modalError).toBeInTheDocument();
    })
  });

  // Test owner should be able to delete the team
  it("should be able to delete team", async () => {
    renderWithRouter(<Team teamId={"1"} />);
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Team');
      expect(deleteButton).toBeInTheDocument();
      userEvent.click(deleteButton);
    })
    await waitFor(() => {
      const modalField = screen.getByPlaceholderText('DELETE Team Green');
      userEvent.type(modalField, 'DELETE Team Green');
    })
    await waitFor(() => {
      const modalButton = screen.getByText('Delete this Team');
      userEvent.click(modalButton);
    })
    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/teams/');
    })
  });
});