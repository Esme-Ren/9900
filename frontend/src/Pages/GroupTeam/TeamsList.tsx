import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import GroupsIcon from '@mui/icons-material/Groups';
import { useNavigate } from "react-router-dom";
import React, { Dispatch, SetStateAction } from 'react';
import { apiCallGet } from '../../Utilities/ApiCalls';
import { TeamData } from './Teams';
import ClampedTypography from '../../Components/ClampedTypography';

const TeamsList = ({teams, setTeams}: {teams: TeamData[], setTeams: Dispatch<SetStateAction<TeamData[]>>}) => {
  const navigate = useNavigate();
  // Initial retreival of teams
  React.useEffect(() => {
    const getTeams = async () => {
      const data = await apiCallGet('api/auth/teams/', true);
      if (data.statusCode === 200) {
        setTeams(data.teams);
      }
    }
    getTeams();
  }, [setTeams]); 

  // Roles retrieved by the API are returned in lower-case form
  // e.g., owner, member
  const capitaliseFirst = (str: string) => {
    let newStr = str.charAt(0).toUpperCase();
    if (str.length > 1) {
      newStr += str.slice(1);
    }
    return newStr;
  }

  return (
    <Box
    sx={{
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 2,
      p: 2,
      maxWidth: "100%",
      minHeight: "100px",
      borderRadius: 2,
      overflow: "hidden",
    }}
    >
    {/* Grid of teams */}
    {teams.map((team) => (
      <Paper
        key={team.id}
        onClick={() => navigate("/teams/" + team.id)}
        sx={{
          width: "100px",
          height: "100px",
          padding: 2,
          wordWrap: "break-word",
          cursor: "pointer",
          "&:hover": { backgroundColor: "#bcd4e8" },
          transition: "0.3s",
          boxShadow: 3,
          backgroundColor: "#8dc6f7"
        }}
      >
        <GroupsIcon />
        <ClampedTypography variant='body1'>
          {team.name}
        </ClampedTypography>
        <Typography variant="body2">{team.role && capitaliseFirst(team.role)}</Typography>
      </Paper>
    ))}
    </Box>
  );
}
  
export default TeamsList;