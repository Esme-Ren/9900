import { Box, Typography } from '@mui/material';
import PageButton, { PageButtonColour } from '../../Components/PageButton';
import PageModal from '../../Components/PageModal';
import FormSearch from './FormSearch';
import React from 'react';
import { apiCallDelete } from '../../Utilities/ApiCalls';
import { useNavigate } from 'react-router-dom';

const DeleteFormModal = ({ name, formId }: { name: string, formId: string }) => {
  const [textInput, setTextInput] = React.useState('');
  const [message, setMessage] = React.useState(<></>);
  const navigate = useNavigate();

  const textInputOnChange = (value: string) => {
    setTextInput(value);
    setMessage(<></>);
  }

  const submitDeleteRequest = async () => {
    if (textInput !== 'DELETE ' + name) {
      setMessage(
        <Typography textAlign='center' color='error' sx={{ wordBreak: 'break-word' }}>
          Input "{textInput}" does not match required "DELETE {name}".
        </Typography>
      );
    } else {
      try {
        const data = await apiCallDelete(`api/sdg-action-plan/${formId}/delete/`, true);
        if (!data || data.statusCode === 204) {
          navigate('/sdg-form');
          return;
        }
        setMessage(
          <Typography textAlign='center' color='error' sx={{ wordBreak: 'break-word' }}>
            Error deleting form: {data.statusCode}.
          </Typography>
        );
      } catch (error) {
        setMessage(
          <Typography textAlign='center' color='error' sx={{ wordBreak: 'break-word' }}>
            An unexpected error occurred while deleting the form.
          </Typography>
        );
      }
    }
  };

  return (
    <PageModal buttonColour={PageButtonColour.Red} buttonText='Delete Form'>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: '20px'
      }}>
        <Typography textAlign='center' variant={'h6'} sx={{ wordBreak: 'break-word' }}>
          Delete Form "{name}"
        </Typography>
        <Typography textAlign='center' sx={{ wordBreak: 'break-word' }}>
          To confirm, type "DELETE {name}" in the box below.
        </Typography>
        {message}
        <FormSearch onChange={(e) => textInputOnChange(e.target.value)} placeholder={"DELETE " + name} disableIcon />
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          <PageButton colour={PageButtonColour.Red} onClick={() => submitDeleteRequest()}>Delete this Form</PageButton>
        </Box>
      </Box>
    </PageModal>
  );
};

export default DeleteFormModal;
