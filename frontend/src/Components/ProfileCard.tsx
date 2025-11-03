import CircleImage from "../Components/CircleImage";
import Card from '@mui/material/Card';
import Panda from '../Assets/Panda.png';
import { Box } from "@mui/material";

const ProfileCard = ({ username }: { username: string }) => {
  return (
    <Card sx={{ 
      width: '250px',
      height: '400px',
      padding: '10px',
      marginRight: '40px',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      background: 'linear-gradient(to bottom, rgba(145, 174, 255, 0.3), #3369ff)',
      boxShadow: 'none',
      alignSelf: 'center',
      flexShrink: 0
    }}
    >
      {CircleImage()}
      <Box
        sx={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          position: 'absolute',
          background: 'linear-gradient(to bottom, rgba(145, 174, 255, 0.3), #3369ff)',
          marginTop: '14px',
          marginLeft: '5px',
          zIndex: 0
        }}
      />
      
      <h2>{username}</h2>
      <img 
        src={Panda} 
        alt="Panda"
        style={{
          width: '80px',
          objectFit: 'contain'
        }}
      />
      
    </Card>
  )
};
  
export default ProfileCard;