import { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import Page from '../../Components/Page';
import ArticleIcon from '@mui/icons-material/Article';

const mockActions = [
  { id: 4, name: 'Install Solar Panels', views: 50, date: '2025-04-19T20:54:20' },
  { id: 1, name: 'Recycle Plastic Bottles', views: 42, date: '2025-04-22T20:54:20' },
  { id: 7, name: 'Support Local Farmers', views: 38, date: '2025-03-30T20:54:20' },
  { id: 2, name: 'Plant a Tree', views: 35, date: '2025-04-20T20:54:20' },
  { id: 5, name: 'Use Public Transport', views: 31, date: '2025-04-21T20:54:20' },
  { id: 3, name: 'Reduce Water Usage', views: 28, date: '2025-04-17T20:54:20' },
  { id: 8, name: 'Compost Organic Waste', views: 27, date: '2025-04-16T20:54:20' },
  { id: 6, name: 'Avoid Fast Fashion', views: 22, date: '2025-04-09T20:54:20' }
];

const mockEducations = [
  { id: 1, name: 'Climate Change Basics', views: 30, date: '2025-04-22T10:45:00' },
  { id: 2, name: 'Sustainable Cities', views: 25, date: '2025-04-20T14:10:30' },
  { id: 3, name: 'Clean Energy Solutions', views: 22, date: '2025-04-18T12:00:00' },
  { id: 4, name: 'Ocean Conservation', views: 20, date: '2025-03-15T12:00:00' },
  { id: 5, name: 'Zero Waste Living', views: 18, date: '2025-02-15T12:00:00' }
];

const filterByTimeRange = (data: any[], range: string) => {
  const now = new Date();
  let threshold = new Date();

  switch (range) {
    case 'day':
      threshold.setDate(now.getDate() - 1);
      break;
    case 'week':
      threshold.setDate(now.getDate() - 7);
      break;
    case 'month':
      threshold.setMonth(now.getMonth() - 1);
      break;
    case '6months':
      threshold.setMonth(now.getMonth() - 6);
      break;
    case '1year':
      threshold.setFullYear(now.getFullYear() - 1);
      break;
    case '5years':
      threshold.setFullYear(now.getFullYear() - 5);
      break;
    default:
      return data;
  }

  return data.filter((item) => new Date(item.date) >= threshold);
};

const TopSearchesPage = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [searchType, setSearchType] = useState<'actions' | 'educations'>('actions');

  const handleSearchTypeChange = (_: any, newType: 'actions' | 'educations') => {
    if (newType !== null) setSearchType(newType);
  };

  const rawData = searchType === 'actions' ? mockActions : mockEducations;
  const filteredData = filterByTimeRange(rawData, timeRange).sort((a, b) => b.views - a.views);

  return (
    <Page>
      <Box width='100%' p={2}>
        <Box
          display='flex'
          flexDirection='row'
          alignItems='flex-start'
          justifyContent='space-between'
          width='100%'
          maxWidth='800px'
          mx='auto'
          mb={2}
        >
          <Typography variant='h5'>
            Top {searchType === 'actions' ? 'Action' : 'Education'} Searches
          </Typography>
          <Box display='flex' flexDirection='column' alignItems='flex-end' gap={1}>
            <ToggleButtonGroup
              value={searchType}
              exclusive
              onChange={handleSearchTypeChange}
              size='small'
            >
              <ToggleButton value='actions'>Actions</ToggleButton>
              <ToggleButton value='educations'>Educations</ToggleButton>
            </ToggleButtonGroup>
            <FormControl size='small' sx={{ backgroundColor: '#f0f0f0', borderRadius: 1, minWidth: 100 }}>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                displayEmpty
                sx={{ fontSize: '0.8rem', height: 30 }}
              >
                <MenuItem value='day'>Past Day</MenuItem>
                <MenuItem value='week'>Past Week</MenuItem>
                <MenuItem value='month'>Past Month</MenuItem>
                <MenuItem value='6months'>Past 6 Months</MenuItem>
                <MenuItem value='1year'>Past Year</MenuItem>
                <MenuItem value='5years'>Past 5 Years</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box display='flex' flexDirection='column' gap={2} maxWidth='800px' mx='auto'>
          {filteredData.length > 0 ? (
            filteredData.map((item: any) => (
              <Card key={item.id} sx={{ width: '100%', display: 'flex', alignItems: 'center', p: 1 }}>
                <Avatar sx={{ bgcolor: '#e0e0e0', m: 2 }}>
                  <ArticleIcon />
                </Avatar>
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant='h6'>{item.name}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Views: {item.views} | Last accessed: {new Date(item.date).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant='body1' textAlign='center' mt={4}>
              No data available for the selected time range.
            </Typography>
          )}
        </Box>
      </Box>
    </Page>
  );
};

export default TopSearchesPage;