import React, { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';

const CHATBOT_URL = 'https://chatgpt.com/g/g-fbPWNIe8s-sdg-expert-chatbot'; 

const ComingSoon: React.FC = () => {
  useEffect(() => {
    // automatic redirection
    window.location.href = CHATBOT_URL;
  }, []);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
      <Typography variant="h4" gutterBottom>
        SDG AI ChatBot
      </Typography>
      <Typography variant="body1" gutterBottom>
      Jumping to the SDG AI ChatBot page...
      </Typography>
      <Button
        variant="contained"
        color="primary"
        href={CHATBOT_URL}
        sx={{ mt: 2 }}
      >
        If there is no automatic redirection, click here to access the ChatBot
      </Button>
    </Box>
  );
};

export default ComingSoon;