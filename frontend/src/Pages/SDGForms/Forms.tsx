import Page from "../../Components/Page";
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import CreateFormModal from "./CreateFormModal";
import FormsList from "./FormsList";

const Forms = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Page>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? 2 : 3,
          padding: isMobile ? 2 : 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: isMobile ? 'flex-start' : 'space-between',
            gap: isMobile ? 2 : 0,
          }}
        >
          <Typography variant={isMobile ? 'h5' : 'h4'}>
            Recent Forms
          </Typography>
          <CreateFormModal />
        </Box>
        <FormsList />
      </Box>
    </Page>
  );
};

export default Forms;