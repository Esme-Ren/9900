import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const InvitationsHeader = () => {

  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center"}}
    >
      <Box>
        <Typography variant={'h4'}>
          Pending Invitations
        </Typography>
        <Typography variant={'body1'}>
          Awaiting your response
        </Typography>
      </Box>
    </Box>
  );
  }
  
export default InvitationsHeader;