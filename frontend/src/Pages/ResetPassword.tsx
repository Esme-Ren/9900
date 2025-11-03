// src/pages/ResetPassword.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Page from '../Components/Page';
import InputField from '../Components/LoginInputField'
import { Box, Typography, Button, Alert, Link } from '@mui/material';
import { apiCallPost } from '../Utilities/ApiCalls';

type LocationState = {
  email: string;
  token: string;
  code:  string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { email = '', token = '', code = '' } = (state as LocationState) || {};

  // form fields & errors
  const [newPw, setNewPw]       = useState('');
  const [confirm, setConfirm]   = useState('');
  const [err, setErr]           = useState('');

  // success flag
  const [success, setSuccess]   = useState(false);

  // 15‑minute timer
  const [timer, setTimer]       = useState(15 * 60);

  // redirect if we don't have the needed state
  useEffect(() => {
    if (!email || !token || !code) {
      navigate('/forgot-password');
    }
  }, [email, token, code, navigate]);

  // countdown interval
  useEffect(() => {
    if (timer <= 0) return;
    const iv = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(iv);
  }, [timer]);

  // when timer hits 0, disable form & show expired message
  useEffect(() => {
    if (timer === 0) {
      setErr('Reset session expired. Please request a new code.');
    }
  }, [timer]);

  const minutes = Math.floor(timer / 60);
  const seconds = String(timer % 60).padStart(2, '0');

  const handleReset = async () => {
    setErr('');
    if (newPw !== confirm) {
      return setErr("Passwords don't match.");
    }
    // if time's up, block submission
    if (timer === 0) {
      return;
    }

    const res = await apiCallPost(
      'api/auth/password-reset/confirm/',
      { token, code, new_password: newPw },
      false
    );

    if (res.message === 'Password has been reset.') {
      setSuccess(true);
    } else {
      setErr(res.error || 'Unable to reset password.');
    }
  };

  return (
    <Page center>
      <Box
        sx={{
          mx: 'auto',
          width: '30%',
          p: 4,
          bgcolor: 'rgba(255,255,255,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          gap: 2
        }}
      >
        {!success ? (
          <>
            <Typography variant="h5" mb={1}>
              Choose New Password
            </Typography>
            <InputField
              type="password"
              name="password1"
              placeholder="New Password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
            />
            <InputField
              type="password"
              name="password2"
              placeholder="Confirm Password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
            <Button
              size='small' 
              sx={{
                backgroundColor: '#000000',
                width: '85%',
                fontSize: '10px',
                textTransform: 'none',
                boxShadow: 'none'
              }}
              variant="contained"
              onClick={handleReset}
              disabled={timer === 0}
            >
              Reset Password
            </Button>

            <Alert severity="info" sx={{ width: '100%' }}>
              {minutes}:{seconds} remaining
            </Alert>

            {err && <Alert severity="error" sx={{ width: '100%' }}>{err}</Alert>}

            {timer === 0 && (
              <Link
                component="button"
                onClick={() => navigate('/forgot-password')}
                sx={{ mt: 1 }}
              >
                Request a new code
              </Link>
            )}
          </>
        ) : (
          <>
            <Alert severity="success" sx={{ width: '100%' }}>
              Your password has been reset!
            </Alert>
            <Button 
              sx={{
                backgroundColor: '#000000',
                width: '85%',
                fontSize: '10px',
                textTransform: 'none',
                boxShadow: 'none'
              }}
              variant="contained" onClick={() => navigate('/login')}>
              Go back to login
            </Button>
          </>
        )}
      </Box>
    </Page>
  );
}
