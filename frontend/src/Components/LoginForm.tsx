import { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputField from './LoginInputField';
import { Alert, Typography } from '@mui/material';
import { apiCallPost } from '../Utilities/ApiCalls';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleLogin } from './GoogleLogin';
import { Checkbox, FormControlLabel } from '@mui/material';
import { getUrl } from '../Utilities/ServerEnv';
import activityTracker from '../Utilities/ActivityTracker';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [revealed, setRevealed] = useState<'password' | 'text'>('password');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const { handleGoogleLoginSuccess, handleGoogleLoginError } = useGoogleLogin();


  const login = async () => {
    try {
      const data = await apiCallPost('api/auth/login/', { username, password }, false);
      
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('url', getUrl());
        localStorage.setItem('token-expiry', data.expiry);
        localStorage.setItem('userDetails', JSON.stringify(data.user));
        
        // Reinitialize activity tracker session for logged in user
        activityTracker.reinitializeSession();
        
        navigate('/');
      } else {
        setErrorMessage(data?.error || data?.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  }

  // Show Password
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRevealed(event.target.checked ? 'text' : 'password');
  };
  
  return (
      <Box sx={{ 
        boxSizing: 'border-box',
        width: { xs: '100%', sm: '50%' },
        maxWidth: '100%',
        padding: { xs: 3, sm: 5 },
        backgroundColor: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: { xs: '0 0 8px 8px', sm: '0 8px 8px 0' }
      }}>
        <Typography style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>SDG Knowledge Login</Typography>

        {/* Shows Error msg if there is one */}
        {errorMessage.length > 0 && 
          (<Alert severity='error' sx={{ marginBottom: '15px' }}>
            <Typography sx={{ fontSize: '0.85rem' }}>
              {errorMessage}
            </Typography>
          </Alert>)
        }

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-around',
          alignItems: 'center', 
          flexDirection: 'column',
          gap: '10px',
          width: '80%'
        }}>
          <InputField 
            type='text'
            name='username' 
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputField 
            type={revealed}
            name='password' 
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
            control={
              <Checkbox
                size='small'
                checked={revealed === 'text'}
                onChange={handleToggle}
              />
            }
            label='Show Password'
          />
          <Button
            variant='contained'
            size='small' 
            sx={{
              backgroundColor: '#000000',
              width: '85%',
              fontSize: '10px',
              textTransform: 'none',
              boxShadow: 'none'
            }}
            onClick={login}
          >
            Log In
          </Button>
          <Box 
            sx={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'flex-end',
              mt: '7px'
            }}
          >
            <Link 
              to='/forgot-password' 
              style={{ 
                fontSize: '10px', 
                color: '#828282'
              }}
            >
              Forgot Password?
            </Link>
          </Box>
          <Divider 
            sx={{ 
              width: '100%', 
              color: '#828282',
              fontSize: '10px', 
              mt: '7px'
            }}
          >
            or continue with
          </Divider>

          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            useOneTap={false}
            theme='outline'
            size='medium'
            text='continue_with'
            width='250'
          />
          
          <div style={{
            color: '#828282',
            fontSize: '10px',
            marginTop: '5px',
            textAlign: 'center'
          }}>
            By clicking continue, you agree to our&nbsp;
            <a href="https://policies.google.com/terms?hl=en" style={{ color: '#000000' }}>Terms of Service</a>
            &nbsp;
            and&nbsp;
            <a href="https://policies.google.com/privacy?hl=en" style={{ color: '#000000' }}>Privacy Policy</a>
          </div>
        </Box>
      </Box>
  );
};

export default LoginForm;
