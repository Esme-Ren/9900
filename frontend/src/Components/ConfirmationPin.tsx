import { useEffect, useState } from 'react'
import { MuiOtpInput } from 'mui-one-time-password-input'
import Page from './Page'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { apiCallPost } from '../Utilities/ApiCalls';
import { useLocation } from 'react-router-dom';
import { getUrl } from '../Utilities/ServerEnv'

const ConfirmationPin = () => {
  const [pin, setPin] = useState('')
  const [timer, setTimer] = useState(300);
  const minutes = Math.floor(timer / 60);
  const seconds = (timer % 60).toString().padStart(2, '0');
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'error' | 'info'>('error');

  const [pendingUserToken, setPendingUserToken] = useState('');

  const location = useLocation();
  const { username, email, password1, password2, mobile, initialToken } = location.state;

  const handleChange = (newValue: string) => {
    setPin(newValue)
  }

  // Sends an API Call again and makes the last sent code invalid. Triggers when user presses resend code.
  const resendCode = async () => {
    try {
      const data = await apiCallPost('api/auth/pending-register/', { username, email, password1, password2, mobile }, false);
      if (data && data.token) {
        setPendingUserToken(data.token);
        setAlertSeverity('info');
        setErrorMessage('Verification code resent. Please check your email.');
      } else {
        console.log(data?.error || 'Failed to resend code');
        setAlertSeverity('error');
        setErrorMessage('Failed to resend verification code. Please try again.');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setAlertSeverity('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  }

  // API Call - checks if the code is valid and if so, will store the token and userDetails in localStorage. 
  const verifyPin = async () => {
    try {
      const tokenToUse = pendingUserToken || initialToken;
      const data = await apiCallPost('api/auth/register/', { token: tokenToUse, code: pin }, false);
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('url', getUrl());
        localStorage.setItem('token-expiry', data.expiry);
        localStorage.setItem('userDetails', JSON.stringify(data.user));
        navigate('/');
      } else {
        setAlertSeverity('error');
        setErrorMessage('Invalid or expired verification code.');
      }
    } catch (error) {
      console.error('Verify pin error:', error);
      setAlertSeverity('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  }

  // Will go to signup if timer runs out
  useEffect(() => {
    const timer = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000)
  
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  useEffect(() => {
    if (timer === 0) navigate('/signup');
  }, [timer, navigate]);

  return (
    <Page center>
      <Box sx={{ 
        mx: 'auto', 
        width: '40%',
        padding: 5, 
        backgroundColor: '#E1ECFF', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'left',
        borderRadius: '8px',
        gap: '20px'
      }}>
        <Typography style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>Enter Code</Typography>
        <Typography variant='subtitle2'>Enter code that we have sent to {email}</Typography>
        {errorMessage.length > 0 && 
          (<Alert severity={alertSeverity} sx={{ marginBottom: '15px' }}>
            <Typography sx={{ fontSize: '0.85rem' }}>
              {errorMessage}
            </Typography>
          </Alert>)
        }
        <MuiOtpInput 
          value={pin} 
          onChange={handleChange} 
          length={6}
          sx={{
            '& input': {
              backgroundColor: 'white',
              borderRadius: '8px'
            }
          }}
        />
        <Button
          variant='contained'
          sx={{
            backgroundColor: '#000000',
            width: '100%',
            fontSize: '12px',
            textTransform: 'none',
            boxShadow: 'none'
          }}
          onClick={verifyPin}
        >
          Submit Code
        </Button>
        <Box 
          sx={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'space-between',
            mt: '7px',
          }}
        >
          <Link href="/signup" sx={{fontSize: '12px'}} color="#828282">
            {'Go back'}
          </Link>

          <Link component="button" 
            onClick={resendCode} 
            sx={{ fontSize: '12px' }} 
            color="#828282"
          >
            {'Resend Code'}
          </Link>
        </Box>
        <Alert 
          severity="info" 
          sx={{alignSelf: 'center'}}
        >
          {minutes}:{seconds}
        </Alert>

      </Box>

    </Page>

  )
}

export default ConfirmationPin;