import { Box, IconButton } from '@mui/material';
import Modal from '@mui/material/Modal';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const ModalBase = ({ children, open, handleClose }:
  { children?: React.ReactNode, open: boolean, handleClose: () => void }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
    <Box sx={{position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: 400,
        minWidth: 296,
        bgcolor: 'background.paper',
        borderRadius: '20px',
        boxShadow: 5,
        maxHeight: '80vh',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
          marginTop: '20px',
          marginBottom: '20px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: '3px',
        },
        p: 4,
    }}> 
        <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end'
        }}>
        <IconButton onClick={handleClose}>
            <CloseIcon/>
        </IconButton>
        </Box>
        {children}
    </Box>
    </Modal>
  );
}

export default ModalBase;
