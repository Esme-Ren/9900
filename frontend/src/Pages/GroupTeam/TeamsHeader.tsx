import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CreateTeamModal from './CreateTeamModal';

const TeamsHeader = () => {
  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center"}}
    >
      <Box>
        <Typography variant={'h4'}>
          Your Teams
        </Typography>
        <Typography variant={'body1'}>
          All your Teams!
        </Typography>
      </Box>
      <CreateTeamModal />
    </Box>
  );
  }
  
export default TeamsHeader;