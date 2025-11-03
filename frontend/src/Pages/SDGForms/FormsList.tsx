import { Box, Typography, Card, CardContent, Chip, IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { apiCallGet } from '../../Utilities/ApiCalls';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import { format } from 'date-fns';



interface FormData {
  id: number;
  impact_project_name: string;
  name_of_designers: string;
  created_at: string;
  updated_at: string;
  google_doc_created: boolean;
  google_doc_url?: string;
  team: {
    name: string;
  };
}

const FormsList = () => {
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {

    const fetchForms = async () => {
      try {
        const response = await apiCallGet('api/sdg-action-plan/', true);
        console.log('API Response:', response); // 调试用
        if (response?.statusCode === 200) {
          // 确保 forms 是一个数组
          let formsData = [];
          if (Array.isArray(response)) {
            formsData = response;
          } else if (Array.isArray(response.results)) {
            formsData = response.results;
          } else if (response.results && typeof response.results === 'object') {
            // 如果 results 是对象，转换为数组
            formsData = Object.values(response.results).filter((item: any) => 
              item && typeof item === 'object' && 'id' in item
            );
          } else {
            formsData = [];
          }
          
          setForms(formsData);
        } else {
          setForms([]);
        }
      } catch (error) {
        console.error('Error fetching forms:', error);
        setForms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();

  }, []);

  const handleFormClick = (formId: number) => {
    navigate(`/sdg-form/${formId}`);
  };

  const handleGoogleDocsClick = (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <Typography>Loading forms...</Typography>
      </Box>
    );
  }

  if (forms.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', padding: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No forms found. Create your first SDG action plan!
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {forms.map((form) => (
        <Card
          key={form.id}
          sx={{
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            },
          }}
          onClick={() => handleFormClick(form.id)}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {form.impact_project_name || 'Untitled Project'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Designed by: {form.name_of_designers || 'Not specified'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Team: {form.team?.name || 'No team'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {format(new Date(form.created_at), 'MMM dd, yyyy')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated: {format(new Date(form.updated_at), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {form.google_doc_created && form.google_doc_url && (
                  <Tooltip title="Open in Google Docs">
                    <IconButton
                      size="small"
                      onClick={(e) => handleGoogleDocsClick(e, form.google_doc_url!)}
                      sx={{
                        color: '#4285f4',
                        '&:hover': {
                          backgroundColor: '#f0f8ff',
                        },
                      }}
                    >
                      <GoogleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Chip
                  label={form.google_doc_created ? 'Google Docs' : 'Local Only'}
                  size="small"
                  color={form.google_doc_created ? 'primary' : 'default'}
                  variant={form.google_doc_created ? 'filled' : 'outlined'}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default FormsList;

