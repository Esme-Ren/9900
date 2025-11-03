import { Box, Typography, CircularProgress } from '@mui/material';
import PageModal from '../../Components/PageModal';
import FormsCard from '../SDGForms/FormsCard';
import { PageButtonColour } from '../../Components/PageButton';
import { useNavigate } from 'react-router-dom';
import TeamFormsHelper from './TeamFormsHelper';

const TeamFormsModal = ({ teamId }: { teamId: string }) => {
  const navigate = useNavigate();
  const { groupedForms, loading } = TeamFormsHelper();

  const formsForTeam = groupedForms[Number(teamId)] || [];

  return (
    // Modal needs to be opened to display a grid of forms associated with a team
    <PageModal buttonText="Team Forms" buttonColour={PageButtonColour.Blue}>
      <Box
        sx={{
          padding: 2,
          maxWidth: 700,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h5">Forms Shared with This Team</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
            <CircularProgress />
          </Box>
        ) : formsForTeam.length === 0 ? (
          <Typography variant="body1" sx={{ padding: 2, textAlign: 'center' }}>
            No forms found for this team.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
            }}
          >
            {/* Grid of forms */}
            {formsForTeam.map((form) => (
              <FormsCard
                key={form.id}
                title={form.impact_project_name}
                onClick={() => navigate(`/sdg-form/${form.id}`)}
              />
            ))}
          </Box>
        )}
      </Box>
    </PageModal>
  );
};

export default TeamFormsModal;


