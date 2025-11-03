import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import { FilterType } from './AdminAnalytics';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface Props {
  users: User[];
  teams: Team[];
  filter: FilterType;
}

const AdminListDisplay: React.FC<Props> = ({ users, teams, filter }) => {
  const items = filter === 'users' ? users : teams;

  return (
    <Box
      mt={2}
      width='100%'
      display='flex'
      flexWrap='wrap'
      gap={1.5}
      justifyContent='flex-start'
    >
      {items.map((item: User | Team) => (
        <Card
          key={item.id}
          variant='outlined'
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '22%',
            padding: 1,
            transition: 'transform 0.2s, background-color 0.2s',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              transform: 'scale(1.02)',
              cursor: 'pointer'
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
            {filter === 'users' ? <PersonIcon fontSize='large' /> : <GroupsIcon fontSize='large' />}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography variant='h6'>
              {filter === 'users' ? (item as User).username : (item as Team).name}
            </Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default AdminListDisplay;