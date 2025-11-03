import React, { useState } from 'react';
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

const SignUpForm = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [revealed, setRevealed] = useState<'password' | 'text'>('password');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string[]>([]);

  const navigate = useNavigate();

  const { handleGoogleLoginSuccess, handleGoogleLoginError } = useGoogleLogin();
  
  // API Call Here
  const signup = async () => {
    if (!agreedTerms) {
      setErrorMessage(['You must agree to the Terms and Conditions to sign up.']);
      return;
    }
    try {
      const data = await apiCallPost('api/auth/pending-register/', {
        username,
        email,
        password1: password,
        password2: confirmPassword,
        mobile: phoneNumber,
        agreed_terms: agreedTerms
      }, false);
      if (data && data.token) {
        navigate('/confirmation-pin', {
          state: {
            username,
            email,
            password1: password,
            password2: confirmPassword,
            mobile: phoneNumber,
            initialToken: data.token
          }
        });
      } else {
        const errors: string[] = [];
        if (data) {
          for (let field in data) {
            if (field !== 'statusCode') {
              if (field === 'non_field_errors') {
                errors.push(data[field][0]);
              } else {
                errors.push(field.toUpperCase() + ': ' + data[field][0]);
              }
            }
          }
        }
        if (errors.length === 0) {
          errors.push('Sign up failed. Please try again.');
        }
        setErrorMessage(errors);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrorMessage(['An unexpected error occurred. Please try again.']);
    }
  };

  // Show Password
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRevealed(event.target.checked ? 'text' : 'password');
  };

  return (
    <Box sx={{
      boxSizing: 'border-box',
      width: { xs: '100%', sm: '50%' },
      maxWidth: '100%',
      padding: 3, 
      backgroundColor: 'white', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: { xs: '0 0 8px 8px', sm: '0 8px 8px 0' }
    }}>
      <Typography style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>SDG Knowledge Sign Up</Typography>

      {errorMessage.length > 0 && 
        (<Alert severity='error' sx={{ marginBottom: '15px' }}>
          {errorMessage.map((error, index) => (
            <Typography key={index} sx={{ fontSize: '0.85rem' }}>
              {error}
            </Typography>
          ))}
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
          type='text'
          name='contact' 
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField 
          type='text'
          name='phonenumber' 
          placeholder='Phone Number (optional)'
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <InputField 
          type={revealed}
          name='password' 
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputField 
          type={revealed}
          name='confirmpassword' 
          placeholder='Confirm Password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
            />
          }
          label={
            <span style={{ fontSize: '0.75rem' }}>
              I have read and agree to the&nbsp;
              <span
                style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => setShowTerms(true)}
              >
                Terms and Conditions
              </span>
            </span>
          }
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
          onClick={signup}
          disabled={!agreedTerms}
        >
          Sign Up
        </Button>
        
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
          width='100%'
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

      {showTerms && (
        <Box
          sx={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}
          onClick={() => setShowTerms(false)}
        >
          <Box
            sx={{
              backgroundColor: 'white', padding: 3, borderRadius: 2, maxWidth: 500, maxHeight: '80vh', overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <Typography variant="h6" gutterBottom>Terms and Conditions</Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: '0.85rem', whiteSpace: 'pre-line' }}
            >
            {`
Terms and Conditions

Welcome to the SDG Knowledge System. These Terms and Conditions govern your access to and use of our website and related services. 
By registering for an account, browsing, or otherwise using the Service, you agree to be bound by these Terms. 
If you do not agree, please do not access or use the Service.

1. Eligibility & Account Registration
You must be at least 16 years of age (or the minimum legal age in your jurisdiction) to register for and use the Service.
When creating an account, you agree to provide accurate, current, and complete information and to update it promptly if anything changes.
You are responsible for safeguarding your login credentials and any activity that occurs under your account. Notify us immediately if you suspect any unauthorized use.

2. Data Collection & Privacy
We collect data on your interactions with the Service—such as page views, search terms, form inputs, and session durations—to improve performance, personalize content, and support research initiatives.
All data practices are described in our Privacy Policy, which is incorporated by reference and is a binding part of these Terms.
Refusal to consent to mandatory data collection will prevent access to certain account-only features.

3. Acceptable Use
You agree to use the Service solely for lawful, non-commercial purposes and in compliance with all applicable laws and regulations.
Prohibited activities include, but are not limited to:
- Reverse engineering or decompiling any part of the Service.
- Introducing viruses, worms, or other malicious code.
- Harassing or abusing other users.
- Impersonating any person or entity.
We reserve the right to suspend or terminate any account that violates these Terms or engages in harmful conduct.

4. Intellectual Property
All content, features, and functionality of the Service—including text, graphics, logos, and software—are owned or licensed by us and are protected by copyright, trademark, and other intellectual property laws.
You may download, print, or view content for personal, non-commercial use only. Any other use requires our prior written permission.

5. Disclaimers & Limitation of Liability
The Service is provided "as is" and "as available." We expressly disclaim all warranties, whether express or implied, including guarantees of performance, accuracy, or fitness for a particular purpose.
We do not guarantee uninterrupted or error-free operation; nor do we warrant that the Service will be free from harmful components.
To the fullest extent permitted by law, we shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of—or inability to use—the Service.

6. Changes to Terms & Service
We may update these Terms or modify the Service at any time. Revised Terms will be posted on our website with an updated "Last Updated" date.
Continued use after changes implies your acceptance of the new Terms. We encourage you to review this page regularly.

7. Governing Law & Dispute Resolution
These Terms are governed by the laws of New South Wales, Australia, without regard to conflict-of-law principles.
Any dispute arising from or related to these Terms shall be resolved first through good-faith negotiation. If unresolved, disputes may be brought before the courts of New South Wales.

8. Contact Us
For postal correspondence or general inquiries (excluding email), you may write to:
SDG Knowledge System
Business School, UNSW
Sydney, NSW 2052
Australia
`}
            </Typography>
            <Button onClick={() => setShowTerms(false)} sx={{ mt: 2 }} variant="contained" size="small">Close</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SignUpForm;
