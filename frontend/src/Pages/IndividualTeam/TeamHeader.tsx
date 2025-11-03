import { Box, Typography } from '@mui/material';

const TeamHeader = ({ groupName }: {groupName: string}) => {
  return (
    <Box sx={{
      display: 'flex',
      flexWrap: 'wrap',
    }}>
      <Typography noWrap variant={'h4'} sx={{
        flexShrink: '1'
      }}>&nbsp;{groupName}</Typography>
      <Typography noWrap variant={'h4'} sx={{
        flexShrink: '0'
      }}>&nbsp;Members&nbsp;</Typography>
    </Box>
    
  );
}

export default TeamHeader;