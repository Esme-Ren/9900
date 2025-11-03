import React, { useState } from "react";
import { Box, Paper, Typography, Modal } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PageButton, { PageButtonColour } from '../../Components/PageButton';
import CircleImage from "../../Components/CircleImage";
import { apiCallGet, apiCallPost } from "../../Utilities/ApiCalls";
import InvitationsHeader from "./InvitationsHeader";
import { TeamData } from "./Teams";
import ClampedTypography from "../../Components/ClampedTypography";

const InvitationsList = ({addTeam}: {addTeam: (team: TeamData) => void}) => {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamData>();
  const [message, setMessage] = useState('');

  // Initial list of invitations retrieved
  React.useEffect(() => {
    const getTeams = async () => {
      const data = await apiCallGet('api/auth/teams/invitations/', true);
      if (data.statusCode === 200) {
        setTeams(data.pending_invitations);
      }
    }
    getTeams();
  }, []); 

  // Handlers for opening and closing modal
  // Modal handles whether or not you accept the invite
  const handleOpen = (team: TeamData) => {
    setSelectedTeam(team);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTeam(undefined);
    setMessage('');
  };

  // Helper function for removing invite locally
  const removeInvite = (id: number) => {
    setTeams(teams.filter((team: TeamData) => team.id !== id));
  }

  // Overall handler for accepting/declining invite
  // Called by modal
  const inviteResponse = async (acceptedStatus: boolean, id: number) => {
    const data = await apiCallPost('api/auth/teams/invitations/respond/', {
        "team_id": id,
        "action": acceptedStatus ? "accept" : "decline"
      }, true);
    if (data.statusCode === 200) {
      if (acceptedStatus) {
        const team = teams.find((team: TeamData) => team.id === id);
        if (team) {
          addTeam(team);
        }
      }
      removeInvite(id);
      handleClose();
    } else {
      setMessage('Error responding to invite');
    }
  }

  return (
    <React.Fragment>
      { teams.length > 0 &&
        <InvitationsHeader />
      }
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          p: 2,
          maxWidth: "100%",
          minHeight: "100px",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Grid of invites */}
        {teams.length > 0 && teams.map((team) => (
          <Paper
            key={team.name}
            onClick={() => handleOpen(team)}
            sx={{
              width: "100px",
              height: "100px",
              padding: 2,
              wordWrap: "break-word",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#f0f0f0" },
              transition: "0.3s",
              boxShadow: 3,
            }}
          >
            <GroupsIcon />
            <ClampedTypography variant='body1'>
              {team.name}
            </ClampedTypography>
            <Typography variant="body2">New Invitation</Typography>
          </Paper>
        ))}
        {/* When an invite is clicked on, it opens a modal to respond */}
        { selectedTeam &&
          <Modal open={open} onClose={handleClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: "white",
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                rowGap: '20px'
              }}
            >
              <Box
                sx = {{
                  maxWidth: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  rowGap: '10px',
                  wordWrap: 'break-word'
                }}
              >
                <CircleImage />
                <Typography variant="h6">{selectedTeam.invited_by}</Typography>
                <Typography variant="body2">has invited you to join their Team</Typography>
                <ClampedTypography variant="h6">
                  {selectedTeam.name}
                </ClampedTypography>
              </Box>
              {message.length > 0 &&
                <Typography textAlign='center' color='error' sx={{wordBreak: 'break-word'}}>
                  {message}
                </Typography>}
              <Box sx = {{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                columnGap: '10px'
                }}>
                <PageButton colour={PageButtonColour.White} textColour="black" onClick={() => inviteResponse(false, selectedTeam.id)}>Decline</PageButton>
                <PageButton colour={PageButtonColour.Blue} onClick={() => inviteResponse(true, selectedTeam.id)}>Accept Invitation</PageButton>
              </Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
              </Box>
            </Box>
          </Modal>
        }
      </Box>
    </React.Fragment>
  );
};

export default InvitationsList;
