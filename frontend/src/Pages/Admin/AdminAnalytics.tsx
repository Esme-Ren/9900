import Page from '../../Components/Page';
import { Box, Typography, Button } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UsersTeamsSearch from './UsersTeamsSearch';
import useAdminData from './AdminData';
import AdminListDisplay from './AdminListDisplay';

export type FilterType = 'users' | 'teams';

const AdminAnalytics = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('users');
  const { users, teams } = useAdminData(filter, searchQuery);
  const navigate = useNavigate();

  return (
    <Page>
      <Box width='100%' height='100%' p={4}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
          <Typography variant='h4' gutterBottom>
            List of Users and Teams
          </Typography>
          <Button
            variant='contained'
            size='small'
            sx={{ textTransform: 'none', backgroundColor: '#1976d2' }}
            onClick={() => navigate('/admin/top-searches')}
          >
            View Top Searches
          </Button>
        </Box>
        <UsersTeamsSearch
          value={searchQuery}
          onChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
        />
        <AdminListDisplay users={users} teams={teams} filter={filter} />
      </Box>
    </Page>
  );
};

export default AdminAnalytics;

