import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import { Box } from "@mui/material";

const CircleImage = () => {
  return (
    <Box
      sx={{
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}
    >
      
      {/* // TO DO: Check if image is already stored, if not, return default profile picture */}
      <AccountCircleRoundedIcon
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </Box>
  );
};

export default CircleImage;