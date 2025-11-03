import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';

const FormsCard = ({ title = 'Untitled Form', onClick }: { title: string, onClick: () => void }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      onClick={onClick}
      sx={{
        width: isMobile ? '100%' : 175,
        height: 175,
        borderRadius: 1,
        boxShadow: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'scale(1.03)',
          transition: '0.2s',
          cursor: 'pointer',
        },
      }}
    >
      <Box
        sx={{
          flex: 3,
          backgroundColor: '#4285F4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AssignmentIcon sx={{ fontSize: 60, color: 'white' }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          paddingX: 2,
          paddingY: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default FormsCard;
