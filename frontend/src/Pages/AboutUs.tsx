import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Page from '../Components/Page';

function AboutUs () {

  return (
    <Page center>
      <Box sx={{ p: 4, borderRadius: 2, display: 'flex', flex: 'center', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <Typography variant='h5' fontWeight='bold'>Welcome to</Typography>
        <Typography variant='h3' sx={{
            color: '#4285F4',
            fontWeight: 'bold',
            fontStyle: 'italic'
          }}>SDG Zoo</Typography>
        <Typography variant='subtitle1'>A simple webpage designed to provide comprehensive and relevant information on the United Nations’ 17 Sustainable Development Goals (SDGs).</Typography>
        <Typography variant='subtitle1' fontWeight='bold' sx={{ paddingTop: '50px' }}>More information coming soon...</Typography>
      </Box>
    </Page>
  
  );
}

export default AboutUs;