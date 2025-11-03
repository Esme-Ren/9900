import React from 'react';
import { apiCallPost } from '../../Utilities/ApiCalls';
import PageButton, { PageButtonColour } from '../../Components/PageButton';
import { useNavigate } from 'react-router-dom';
import ModalBase from '../../Components/ModalBase';
import { ITeamRole, TeamRoles } from './TeamRole';
import { Box, Typography } from '@mui/material';

const TeamTableMoreActions = ({ teamId, selfRole }:
  { teamId: string, selfRole: ITeamRole }) => {
  const [text, setText] = React.useState('Leave')
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const postLeave = async () => {
    // Opens error modal if user is owner
    // Requires transferring of ownership
    if (selfRole.title === TeamRoles.TeamOwner.title) {
      setOpen(true);
      return;
    }
    // Requires confirmation to leave
    if (text === 'Leave') {
      setText('Confirm leave');
    } else {
      setText('Leave');
      let res = await apiCallPost('api/teams/' + teamId + '/leave/', {}, true);
      if (res.statusCode !== 200) {
        return;
      }
      navigate('/teams/');
    }
  }

  const handleClose = () => setOpen(false);

  return (
    <div>
      <PageButton onClick={postLeave} colour={PageButtonColour.Red}>
        {text}
      </PageButton>
      <ModalBase open={open} handleClose={handleClose}>
        <Typography textAlign='center' variant={'h6'} sx={{
          wordBreak: 'break-word',
          mb: '20px',
        }}>
          Team owners must transfer ownership before leaving.
        </Typography>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          <PageButton colour={PageButtonColour.Blue} onClick={handleClose}>Okay</PageButton>
        </Box>
      </ModalBase>
    </div>
  );
}

export default TeamTableMoreActions;