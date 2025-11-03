import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

const AdminSDGActionPlan = ({ actionPlanTitle, actionPlanOwner, actionPlanStatus, onClick }: { actionPlanTitle: string, actionPlanOwner: string, actionPlanStatus: string, onClick: () => void }) => {

  return (
    <Box 
      sx={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '5px',
        cursor: 'pointer',
        width: '100%',
      }}
      onClick={onClick}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '15px'
      }}>
        <DescriptionOutlinedIcon sx={{ color: '#454545', fontSize: '30px' }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography variant='h6'>{actionPlanTitle}</Typography>
          <Typography variant='subtitle2' color='#828282'>{actionPlanOwner}</Typography>
        </Box>
      </Box>
      <Typography variant='subtitle2' color='#828282' marginRight='10px'>{actionPlanStatus}</Typography>

    </Box> 
  )
}

export default AdminSDGActionPlan;