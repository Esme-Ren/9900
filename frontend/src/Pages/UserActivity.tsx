import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import Page from '../Components/Page';
import { apiCallGet } from '../Utilities/ApiCalls';

interface ActivityData {
  search_analytics: {
    total_searches: number;
    search_types: Array<{ search_type: string; count: number }>;
    recent_searches: Array<{ search_query: string; search_type: string; timestamp: string }>;
  };
  page_analytics: {
    total_pages_visited: number;
    total_time_spent: number;
    most_visited_pages: Array<{ page_title: string; page_url: string; visit_count: number; time_spent: number }>;
  };
  form_analytics: {
    total_form_activities: number;
    activity_types: Array<{ activity_type: string; count: number }>;
    total_content_length: number;
    recent_form_activities: Array<{ activity_type: string; field_name: string; timestamp: string }>;
  };
  browser_analytics: {
    total_activities: number;
    activity_types: Array<{ activity_type: string; count: number }>;
    recent_activities: Array<{ activity_type: string; page_url: string; timestamp: string }>;
  };
  daily_activity: Array<{ date: string; searches: number; pages: number; forms: number }>;
}

const UserActivity: React.FC = () => {
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [timeRange, setTimeRange] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      console.log('UserActivity: Token found:', !!token);
      if (!token) {
        console.error('User not logged in');
        setActivityData({
          search_analytics: { total_searches: 0, search_types: [], recent_searches: [] },
          page_analytics: { total_pages_visited: 0, total_time_spent: 0, most_visited_pages: [] },
          form_analytics: { total_form_activities: 0, activity_types: [], total_content_length: 0, recent_form_activities: [] },
          browser_analytics: { total_activities: 0, activity_types: [], recent_activities: [] },
          daily_activity: []
        });
        return;
      }
      
      console.log('UserActivity: Fetching activity data for time range:', timeRange);
      const response = await apiCallGet(`api/admin/user/activity-analytics/?time_range=${timeRange}`, true);
      console.log('UserActivity: API response:', response);
      if (response) {
        setActivityData(response);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityData();
  }, [timeRange]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Page>
        <Box p={3}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading your activity data...
          </Typography>
        </Box>
      </Page>
    );
  }

  if (!activityData) {
    return (
      <Page>
        <Box p={3}>
          <Typography variant="h6" color="error">
            Failed to load activity data. Please try again.
          </Typography>
        </Box>
      </Page>
    );
  }

  return (
    <Page>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            User Activity Dashboard
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="past day">Past Day</MenuItem>
              <MenuItem value="past week">Past Week</MenuItem>
              <MenuItem value="past month">Past Month</MenuItem>
              <MenuItem value="past 6 months">Past 6 Months</MenuItem>
              <MenuItem value="past year">Past Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {/* Search Analytics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SearchIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Search Activity</Typography>
                </Box>
                <Typography variant="h4" color="primary" gutterBottom>
                  {activityData.search_analytics.total_searches}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total searches performed
                </Typography>
                
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Search Types:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {activityData.search_analytics.search_types.map((type, index) => (
                      <Chip
                        key={index}
                        label={`${type.search_type}: ${type.count}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recent Searches:
                  </Typography>
                  <List dense>
                    {activityData.search_analytics.recent_searches.slice(0, 5).map((search, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={search.search_query}
                          secondary={`${search.search_type} • ${formatDate(search.timestamp)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Page Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ViewIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Page Activity</Typography>
                </Box>
                <Typography variant="h4" color="primary" gutterBottom>
                  {activityData.page_analytics.total_pages_visited}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pages visited • {formatTime(activityData.page_analytics.total_time_spent)} total time
                </Typography>

                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Most Visited Pages:
                  </Typography>
                  <List dense>
                    {activityData.page_analytics.most_visited_pages.slice(0, 5).map((page, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={page.page_title}
                          secondary={`${page.visit_count} visits • ${formatTime(page.time_spent)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Form Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">SDG Form Activity</Typography>
                </Box>
                <Typography variant="h4" color="primary" gutterBottom>
                  {activityData.form_analytics.total_form_activities}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Form activities • {activityData.form_analytics.total_content_length.toLocaleString()} characters written
                </Typography>

                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Activity Types:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {activityData.form_analytics.activity_types.map((type, index) => (
                      <Chip
                        key={index}
                        label={`${type.activity_type}: ${type.count}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recent Activities:
                  </Typography>
                  <List dense>
                    {activityData.form_analytics.recent_form_activities.slice(0, 5).map((activity, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={`${activity.activity_type}${activity.field_name ? ` - ${activity.field_name}` : ''}`}
                          secondary={formatDate(activity.timestamp)}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Browser Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Browser Activity</Typography>
                </Box>
                <Typography variant="h4" color="primary" gutterBottom>
                  {activityData.browser_analytics.total_activities}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Browser interactions tracked
                </Typography>

                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Activity Types:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {activityData.browser_analytics.activity_types.map((type, index) => (
                      <Chip
                        key={index}
                        label={`${type.activity_type}: ${type.count}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recent Activities:
                  </Typography>
                  <List dense>
                    {activityData.browser_analytics.recent_activities.slice(0, 5).map((activity, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={activity.activity_type}
                          secondary={`${activity.page_url} • ${formatDate(activity.timestamp)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Daily Activity Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Daily Activity Summary</Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Searches</TableCell>
                        <TableCell align="right">Page Visits</TableCell>
                        <TableCell align="right">Form Activities</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activityData.daily_activity.slice(0, 10).map((day, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(day.date)}</TableCell>
                          <TableCell align="right">{day.searches}</TableCell>
                          <TableCell align="right">{day.pages}</TableCell>
                          <TableCell align="right">{day.forms}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Page>
  );
};

export default UserActivity; 