import { Box, Modal, Typography } from '@mui/material';
    
const SearchSDGPlanModal = ({ title, aims, descriptions, organisation, sources, links, onClose, open }:
  { title: string, aims: string, descriptions: string, organisation: string, sources: string, links: string, onClose: () => void, open: boolean }) => {  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: 400,
          bgcolor: 'background.paper',
          borderRadius: '20px',
          boxShadow: 5,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {title && (
          <Typography id="modal-modal-title" variant="h6" fontWeight="bold">
            {title}
          </Typography>
        )}

        {aims && (
          <Typography variant="body1">
            <Typography component="span" fontWeight="bold">
              Aims:
            </Typography>{' '}
            {aims}
          </Typography>
        )}

        {descriptions && (
          <Typography variant="body1">
            <Typography component="span" fontWeight="bold">
              Description:
            </Typography>{' '}
            {descriptions}
          </Typography>
        )}

        {organisation && (
          <Typography variant="body1">
            <Typography component="span" fontWeight="bold">
              Organisation:
            </Typography>{' '}
            {organisation}
          </Typography>
        )}

        {sources && (
          <Typography variant="body1">
            <Typography component="span" fontWeight="bold">
              Sources:
            </Typography>{' '}
            {sources}
          </Typography>
        )}

        {links && (
          <Typography variant="body1">
            <Typography component="span" fontWeight="bold">
              Links:
            </Typography>{' '}
            {links}
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default SearchSDGPlanModal;
