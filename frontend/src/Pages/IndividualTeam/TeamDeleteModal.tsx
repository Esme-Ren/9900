import { Box, Typography } from '@mui/material';
import PageButton, { PageButtonColour } from '../../Components/PageButton';
import PageModal from '../../Components/PageModal';
import TextBox from '../../Components/TextBox';
import React from 'react';
import { apiCallDelete } from '../../Utilities/ApiCalls';
import { useNavigate } from 'react-router-dom';

const TeamDeleteModal = ({ name, teamId }: { name: string, teamId: string }) => {
  const [textInput, setTextInput] = React.useState('');
  const [message, setMessage] = React.useState(<></>);
  const navigate = useNavigate();

  // When the user starts typing again, remove error message
  const textInputOnChange = (value: string) => {
    setTextInput(value);
    setMessage(<></>);
  }

  const submitDeleteRequest = async () => {
    // User must type in the correct confirmation message
    if (textInput !== 'DELETE ' + name) {
      setMessage(
        <Typography textAlign='center' color='error' sx={{wordBreak: 'break-word'}}>
          Input "{textInput}" does not match required "DELETE {name}".
        </Typography>
      )
    } else {
      // Delete if input is correct
      let data = await apiCallDelete('api/teams/' + teamId + '/delete/', true);
      if (data.statusCode === 200) {
        navigate('/teams/')
      } else {
        // Error message if deletion is unsuccessful
        <Typography textAlign='center' color='error' sx={{wordBreak: 'break-word'}}>
          Error deleting team: {data.statusCode}.
        </Typography>
      }
      
    }
  }

  return (
    <PageModal buttonColour={PageButtonColour.Red} buttonText='Delete Team'>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        rowGap: '20px'
      }}>
        <Typography textAlign='center' variant={'h6'} sx={{wordBreak: 'break-word'}}>
          Delete Team "{name}"
        </Typography>
        <Typography textAlign='center' sx={{wordBreak: 'break-word'}}>
          To confirm, type "DELETE {name}" in the box below.
        </Typography>
        { message }
        <TextBox onChange={(e) => textInputOnChange(e.target.value)} placeholder={"DELETE " + name} disableIcon/>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          <PageButton colour={PageButtonColour.Red} onClick={() => submitDeleteRequest()}>Delete this Team</PageButton>
        </Box>
      </Box>
    </PageModal>
  );
}

export default TeamDeleteModal;