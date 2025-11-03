import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Page from '../Components/Page';
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import InputField from '../Components/LoginInputField'
import Alert from '@mui/material/Alert'
import { apiCallPost } from '../Utilities/ApiCalls'

export default function ForgotPasswordEmail() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const navigate = useNavigate()

  const sendCode = async () => {
    setError('')
    setInfo('')
    try {
      const res = await apiCallPost(
        'api/auth/password-reset/request/',
        { email },
        false
      )
      if (res && res.token) {
        navigate('/forgot-password/verify', {
          state: { email, token: res.token }
        })
      } else {
        setError(res?.error || 'Please check if you have entered a valid email.')
      }
    } catch (error) {
      console.error('Send code error:', error)
      setError('An unexpected error occurred. Please try again.')
    }
  }

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
        <Typography variant="h5" fontWeight="bold">
          Reset Your Password
        </Typography>
        {error && (
          <Alert
            severity="error"
            sx={{ width: '100%', textAlign: 'center' }}
          >
            {error}
          </Alert>
        )}
        {info && (
          <Alert
            severity="info"
            sx={{ width: '100%', textAlign: 'center' }}
          >
            {info}
          </Alert>
        )}
        <InputField
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
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
          onClick={sendCode}        
        > Send me a code
        </Button>
      </Box>
    </Page>
  )
}
