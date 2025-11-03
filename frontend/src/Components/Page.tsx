import { Box, Container } from '@mui/material';
import React from 'react';
import ResponsiveAppBar from './AppBar';

const Page = ({ center, children }: { center?: boolean, children?: React.ReactNode }) => {
  return (
    <Box display={'flex'} sx={{
      background: '#F5F6F7',
      minWidth: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <ResponsiveAppBar/>
      <Container sx={{
        maxWidth: '1500px',
        margin: '50px',
        display: 'flex',
        flexGrow: '1',
        flexDirection: 'column',
        rowGap: '22px',
        alignSelf: 'center',
        justifyContent: center ? 'center' : 'flex-start'
      }}>
          {children}
      </Container>
    </Box>
  );
}

export default Page;
