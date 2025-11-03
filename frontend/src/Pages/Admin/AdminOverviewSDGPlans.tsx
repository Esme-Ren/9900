import Page from '../../Components/Page';
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { TextField, Typography, IconButton } from '@mui/material';
import SDGPlansGraph from '../../Components/AdminSDGPlansGraph';
import AdminSDGActionPlan from '../../Components/AdminSDGActionPlan';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { apiCallGet } from '../../Utilities/ApiCalls';
import { useNavigate } from 'react-router-dom'; 

interface ActionPlan {
  id: number;
  user_id: number;
  name_of_designers: string;
  impact_project_name: string;
  description: string;
  plan_content?: object;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

const AdminOverviewSDGPlans = () => {
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentSearch, setCurrentSearch] = useState('');
  const open = Boolean(anchorEl);

  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchActionPlans = async () => {
      const response = await apiCallGet('api/admin/sdg-plans/', true);
      if (response?.statusCode === 200) {
        const plansArray = Object.values(response).filter(
          (item): item is ActionPlan =>
            typeof item === 'object' && item !== null && 'impact_project_name' in item
        );
        setActionPlans(plansArray);
      } else {
        console.error('Failed to fetch SDG action plans', response);
      }
    };
    fetchActionPlans();
  }, []);

  const filteredPlans = actionPlans.filter((plan) =>
    plan.impact_project_name.toLowerCase().includes(currentSearch.toLowerCase())
  );

  return (
    <Page>
      <Typography alignSelf='center' fontSize='2rem' fontWeight='500'>
        Admin Overview of SDG Action Plans
      </Typography>

      <SDGPlansGraph />

      <Typography variant='h5'>List of SDG Action Plans</Typography>

      <TextField
        placeholder='Search the forms'
        fullWidth
        onChange={(e) => setCurrentSearch(e.target.value)}
        sx={{
          backgroundColor: '#FFFFFF',
          padding: '5px',
          fontSize: '18px',
          borderRadius: '5px',
          boxSizing: 'border-box',
          '& fieldset': { border: 'none' },
          marginBottom: '20px',
          width: '50%'
        }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ marginRight: '10px' }} />,
          endAdornment: (
            <IconButton onClick={handleClick}>
              <FilterAltIcon />
            </IconButton>
          )
        }}
      />

      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      >
        <Typography pl={2}>Filter</Typography>
        <MenuItem>
          <FormControlLabel control={<Checkbox defaultChecked />} label='Teams' />
        </MenuItem>
        <MenuItem>
          <FormControlLabel control={<Checkbox defaultChecked />} label='Individual' />
        </MenuItem>
      </Menu>

      <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {filteredPlans.map((plan, index) => (
          <AdminSDGActionPlan
            key={plan.id || index}
            actionPlanTitle={plan.impact_project_name}
            actionPlanOwner={plan.name_of_designers || 'Unknown'}
            actionPlanStatus={plan.status || 'Unknown'}
            onClick={() => navigate(`/sdg-form/${plan.id}`)} 
          />
        ))}
      </Box>
    </Page>
  );
};

export default AdminOverviewSDGPlans;