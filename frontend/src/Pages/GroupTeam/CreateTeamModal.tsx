import { Box, Typography, InputBase, Paper, Chip } from "@mui/material";
import PageButton, { PageButtonColour } from "../../Components/PageButton";
import PageModal from "../../Components/PageModal";
import React, { useState } from "react";
import { apiCallGet, apiCallPost } from "../../Utilities/ApiCalls";

const CreateTeamModal = () => {
  const [teamName, setTeamName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState(<></>);
  const [users, setUsers] = useState<string[]>([]);
  const [showFiltered, setShowFiltered] = useState(false);

  // Retrieve initial users
  React.useEffect(() => {
    const fetchData = async () => {
      const data = await apiCallGet('api/teams/users/', true);
      if (data.statusCode === 200) {
        setUsers(data.usernames);
      }
    }
    fetchData();
  }, []);

  // If the searchTerm has already been populated before the users are set
  // asynchronously, then filter.
  //
  // Otherwise filter whenever searchTerm changes.
  React.useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter((user) =>
        user.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [users, searchTerm]);

  // Search handler for the search by users feature
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setMessage(<></>);
  };

  // Adding/removing user as chips from the list of invited users
  const handleAddUser = (user: string) => {
    if (!selectedUsers.includes(user)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm("");
    setFilteredUsers([]);
  };

  const handleRemoveUser = (user: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u !== user));
  };

  const handleInputBlur = () => {
    // Add a timeout so that the filteredList is actually clickable
    // Otherwise the target will disappear immediately on blur and nothing
    // will happen
    setTimeout(() => {
      setShowFiltered(false);
    }, 100)
  }

  const handleInputFocus = () => {
    setShowFiltered(true);
  }

  // Send team submission data to backend
  const submitTeam = async () => {
    let data = await apiCallPost('api/teams/create/', {
      'name': teamName,
      'invite_usernames': selectedUsers
    }, true);
    if (data.statusCode === 201) {
      setSelectedUsers([]);
      window.location.reload();
    } else {
      setMessage(
        <Typography textAlign='center' color='error' sx={{wordBreak: 'break-word'}}>
          Error creating team.
        </Typography>
      )
    }
  };

  return (
    <PageModal buttonColour={PageButtonColour.Blue} buttonText="Create a Team">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          rowGap: "15px",
        }}
      >
        <Typography variant="h6">Create an SDG Team</Typography>
        <Typography variant="body1" sx={{ paddingTop: 1 }}>
          Team Name
        </Typography>
        <Paper
          component="form"
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            maxWidth: '400px',
            flexGrow: 1,
            position: 'relative',
            '@media (max-width: 805px)': {
              maxWidth: '757px',
              width: 'auto'
            },
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="e.g. Team Green, SDG Project"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </Paper>
        <Typography variant="body1" sx={{ paddingTop: 1 }}>
          Who should be in this team?
        </Typography>
        <Paper
          component="form"
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            maxWidth: '400px',
            flexGrow: 1,
            position: 'relative',
            '@media (max-width: 805px)': {
              maxWidth: '757px',
              width: 'auto'
            },
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Type the username of a friend"
            value={searchTerm}
            onChange={handleSearchChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
          />
          {/* Dropdown menu with suggested users based on search query */}
          {showFiltered && filteredUsers.length > 0 && (
          <Paper
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              backgroundColor: "#fff",
              zIndex: 10,
              mt: "2px",
              boxShadow: 3,
              borderRadius: "4px",
              maxHeight: 150,
              overflowY: "auto",
            }}
          >
            {filteredUsers.map((user) => (
              <Typography
                key={user}
                sx={{
                  padding: 1,
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
                onClick={() => handleAddUser(user)}
              >
                {user}
              </Typography>
            ))}
          </Paper>
        )}
        </Paper>
        {/* Chips that represent selected users */}
        {selectedUsers.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedUsers.map((user) => (
              <Chip
                key={user}
                label={user}
                onDelete={() => handleRemoveUser(user)}
                sx={{ backgroundColor: "#d2e8fc" }}
              />
            ))}
          </Box>
        )}
        {message}
        <Box sx={{ display: "flex", justifyContent: "space-around" }}>
          <PageButton colour={PageButtonColour.Blue} onClick={submitTeam}>
            Create Team
          </PageButton>
        </Box>
      </Box>
    </PageModal>
  );
};

export default CreateTeamModal;
