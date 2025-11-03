import SignUpForm from '../Components/SignUpForm';
import { Box } from '@mui/system';
import Page from '../Components/Page';
import { Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {

  const navigate = useNavigate();

  return (
    <Page center>
      <Container
        maxWidth='md'
        disableGutters
        sx={{
          px: { xs: 2, sm: 3 }
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'stretch',
          width: '100%',
          maxWidth: '100%',
        }}>
          {/* Blue Box on left (that lets you navigate to login page) */}
          <Box sx={{
            background: '#4285F4',
            width: { xs: '100%', sm: '35%' },
            maxWidth: 400,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 3,
            gap: 2,
            borderRadius: { xs: '8px 8px 0 0', sm: '8px 0 0 8px' }
          }}>
            <Typography variant='h4' sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Hello Friend!</Typography>
            <Typography variant='h5' sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Already a user?</Typography>
            <Button
              variant='contained'
              size='small' 
              sx={{
                backgroundColor: 'white',
                width: '85%',
                fontSize: '10px',
                textTransform: 'none',
                boxShadow: 'none',
                color: '#4285F4'
              }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Box>
          <SignUpForm />
        </Box>
      </Container>
    </Page>
  );
};

export default SignUp;