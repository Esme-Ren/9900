// VerifyResetCode.tsx
import { useEffect, useState } from 'react'
import { MuiOtpInput } from 'mui-one-time-password-input'
import Page from '../Components/Page'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiCallPost } from '../Utilities/ApiCalls'

type LocationState = {
  token?: string
  email?: string
}

export default function VerifyResetCode() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { email = '', token: initialToken = '' } = (state as LocationState) || {}

  // keep the current token in state so we can update it on "resend"
  const [token, setToken] = useState(initialToken)
  const [code, setCode] = useState('')
  const [timer, setTimer] = useState(15 * 60)       // 15 minutes
  const [errorMessage, setErrorMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'error' | 'info'>('error')

  // redirect back to email‐entry if we don't have an email+token
  useEffect(() => {
    if (!email || !token) {
      navigate('/forgot-password')
    }
  }, [email, token, navigate])

  // countdown timer
  useEffect(() => {
    if (timer <= 0) return
    const iv = setInterval(() => setTimer(t => t - 1), 1000)
    return () => clearInterval(iv)
  }, [timer])

  // once it hits zero, prompt the user to get a new code
  useEffect(() => {
    if (timer === 0) {
      setAlertSeverity('info')
      setErrorMessage('Code expired — please request a new one.')
    }
  }, [timer])

  const minutes = Math.floor(timer / 60)
  const seconds = String(timer % 60).padStart(2, '0')

  const handleResend = async () => {
    setErrorMessage('');
    try {
      const res = await apiCallPost(
        'api/auth/password-reset/request/',
        { email },
        false
      );
      if (res && res.token) {
        setToken(res.token);
        setAlertSeverity('info');
        setErrorMessage('New code sent—check your inbox.');
        setTimer(15 * 60);
      } else {
        setErrorMessage(res?.error || 'Unable to resend code.');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  }

  const handleSubmit = async () => {
    setErrorMessage('');
    try {
      const res = await apiCallPost(
        'api/auth/password-reset/verify/',
        { token, code },
        false
      );
      if (res && res.message === 'Code valid.') {
        navigate('/forgot-password/reset', { state: { email, token, code } });
      } else {
        setAlertSeverity('error');
        setErrorMessage(res?.error || 'Invalid or expired code.');
      }
    } catch (error) {
      console.error('Submit code error:', error);
      setAlertSeverity('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  }

  return (
    <Page center>
      <Box
        sx={{
          mx: 'auto',
          width: '50%',
          p: 5,
          backgroundColor: 'rgba(255,255,255,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderRadius: 2,
          gap: 2
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Enter Reset Code
        </Typography>
        <Typography variant="body2">
          We sent a code to <strong>{email}</strong>
        </Typography>

        {errorMessage && (
          <Alert severity={alertSeverity} sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        )}

        <MuiOtpInput
          length={8}
          value={code}
          onChange={setCode}
          sx={{
            '& input': {
              backgroundColor: 'white',
              borderRadius: 1
            },
            width: '100%',
            justifyContent: 'space-between'
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
          onClick={handleSubmit}
          disabled={code.length < 8}
        >
          Submit Code
        </Button>

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <Link
            component="button"
            onClick={() => navigate('/forgot-password')}
            sx={{fontSize: '12px'}} color="#828282"
          >
            Change Email
          </Link>
          <Link
            component="button"
            onClick={handleResend}
            sx={{fontSize: '12px'}} color="#828282"
          >
            Resend Code
          </Link>
        </Box>

        <Alert severity="info" sx={{ alignSelf: 'center' }}>
          {minutes}:{seconds}
        </Alert>
      </Box>
    </Page>
  )
}
