import { Box, Typography } from '@mui/material';
 import PageButton, { PageButtonColour } from '../../Components/PageButton';
 import PageModal from '../../Components/PageModal';
 import TextBox from '../../Components/TextBox';
 import React from 'react';
 import { apiCallDelete } from '../../Utilities/ApiCalls';
 import { useNavigate } from 'react-router-dom';
 
 const UserDeleteModal = ({ name }: { name: string }) => {
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
         <Typography textAlign='center' color='error' sx={{wordBreak: 'break-word'}}>
           Input "{textInput}" does not match required "DELETE {name}".
         </Typography>
       )
     } else {
       let data = await apiCallDelete('api/auth/delete-account/', true);
       if (data.statusCode === 200) {
         localStorage.removeItem('token');
         localStorage.removeItem('userDetails');
         navigate('/');
       } else {
         <Typography textAlign='center' color='error' sx={{wordBreak: 'break-word'}}>
           Error deleting user: {data.statusCode}.
         </Typography>
       }
     }
   }
 
   return (
     <PageModal buttonColour={PageButtonColour.Red} buttonText='Delete User'>
       <Box sx={{
         display: 'flex',
         flexDirection: 'column',
         justifyContent: 'center',
         alignItems: 'center',
         rowGap: '20px'
       }}>
         <Typography textAlign='center' variant={'h6'} sx={{wordBreak: 'break-word'}}>
           Delete User
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
           <PageButton colour={PageButtonColour.Red} onClick={() => submitDeleteRequest()}>Delete this User</PageButton>
         </Box>
       </Box>
     </PageModal>
   );
 }
 
 export default UserDeleteModal;