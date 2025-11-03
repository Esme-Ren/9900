import { Box, Chip, Paper, Typography } from '@mui/material';
import PageButton, { PageButtonColour } from '../../Components/PageButton';
import PageModal from '../../Components/PageModal';
import React from 'react';
import TextBox from '../../Components/TextBox';
import { apiCallGet, apiCallPost } from '../../Utilities/ApiCalls';

const TeamInviteModal = ({ name, teamId, addInvitee }:
  { name: string, teamId: string, addInvitee: (usernames: string[]) => void }) => {
  const [users, setUsers] = React.useState<string[]>([]);
  const [submissionMsg, setSubmissionMsg] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredUsers, setFilteredUsers] = React.useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [showFiltered, setShowFiltered] = React.useState(false);

  // Retrieves all users
  React.useEffect(() => {
    const fetchData = async () => {
      const data = await apiCallGet('api/teams/users/', true, {"Team-Id": teamId});
      setUsers(data.usernames);
    }
    fetchData();
  }, [teamId]);   

  // Filteres list of users based on query
  const handleSearchChange = (query: string) => {
    setSearchTerm(query);
    setSubmissionMsg("");

    if (query) {
      const filtered = users.filter((user) =>
        user.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  };
  
  // Handler for adding and removing selected users as displayed chips
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

  // Invites user
  // Gives confirmation message on screen on whether or not the invite succeeded
  const submitInviteRequest = async () => {
    let data = await apiCallPost('api/teams/' + teamId + '/invite/', {'usernames': selectedUsers}, true);
    if (data.statusCode === 200) {
      setSelectedUsers([]);
      setSubmissionMsg("Invite sent");
      addInvitee(selectedUsers)
    } else {
      setSubmissionMsg("Error sending invite");
    }
  }

  return (
    <PageModal buttonColour={PageButtonColour.Green} buttonText='Invite'>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        rowGap: '20px'
      }}>
        <Typography textAlign='center' variant={'h6'} sx={{wordBreak: 'break-word'}}>
          Invite Users to "{name}"
        </Typography>
        <TextBox
          onChange={(e) => handleSearchChange(e.target.value)}
          value={searchTerm}
          placeholder='Type the username of a friend'
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
        >
          {showFiltered && filteredUsers.length > 0 &&
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
              {/* Dropdown menu of suggested users based on search query */}
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
          }
        </TextBox>
        {/* List of chips representing selected users */}
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
        {/* Message to show whether or not the invitation succeeded */}
        {
          submissionMsg.length > 0 && 
          <Typography textAlign='center' color='success' sx={{wordBreak: 'break-word'}}>
            {submissionMsg}
          </Typography>
        }
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          <PageButton colour={PageButtonColour.Green} onClick={() => submitInviteRequest()}>Invite Users</PageButton>
        </Box>
      </Box>
    </PageModal>
  );
}

export default TeamInviteModal;