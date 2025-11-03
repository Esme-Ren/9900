import Page from '../Components/Page';
import Typography from '@mui/material/Typography';
import PageButton, { PageButtonColour } from '../Components/PageButton';
import { useNavigate } from "react-router-dom";
import { Box } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';

const AdminPortal = () => {
  const navigate = useNavigate();

    return (
      <Page>
        <Typography variant='h3'>
          Admin Portal
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px',
        }}>
          <PageButton colour={PageButtonColour.White} textColour='black' onClick={() => navigate('/admin/analytics')}>
            <LinkIcon />
            Admin Analytics
          </PageButton>
          <PageButton colour={PageButtonColour.White} textColour='black' onClick={() => navigate('/admin/overview-of-sdg-plans')}>
            <LinkIcon />
            Admin Overview of SDG Action Plans
          </PageButton>
        </Box>
      </Page>
    );
  }
  
export default AdminPortal;