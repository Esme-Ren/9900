import Page from '../../Components/Page';
import {
  Box,
  CircularProgress,
  Fade,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import FormInfo from './FormInfo';
import DownloadForm from '../../Components/DownloadForm';
import { useEffect, useState } from 'react';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import { useParams } from 'react-router-dom';
import FormPermissionsModal from './FormPermissionsModal';
import { apiCallGet, apiCallPost } from '../../Utilities/ApiCalls';
import GoogleIcon from '@mui/icons-material/Google';
import activityTracker from '../../Utilities/ActivityTracker';


// 定义表单数据类型
interface FormData {
  id: number;
  impact_project_name: string;
  name_of_designers: string;
  description: string;
  plan_content: any;
  google_doc_created?: boolean;
  google_doc_url?: string;
  [key: string]: any;
}

// 定义 Snackbar 状态类型
interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
}

const Form = () => {
  const { id } = useParams();
  const [downloading, setDownloading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState({
    allow_team_edit: true,
    allow_team_view: true,
    require_explicit_permissions: false,
  });
  const [formData, setFormData] = useState<FormData | null>(null);
  const [googleDocsLoading, setGoogleDocsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (id) {
      const fetchFormData = async () => {
        const response = await apiCallGet(`api/sdg-action-plan/${id}/`, true);
        if (response?.statusCode === 200) {
          setFormData(response);
          setIsOwner(response.is_owner || false);
          if (response.permissions) {
            setPermissions(response.permissions);
          }
          // Track form view activity
          activityTracker.trackFormActivity(parseInt(id), 'view');
        } else {
          console.error(response);
        }
      };
      fetchFormData();
    }
  }, [id]);

  const handleFormDownload = async () => {
    setDownloading(true);
    if (id) {
      try {
        await DownloadForm(formData);
        console.log('download worked');
        // Track form export activity
        activityTracker.trackFormActivity(parseInt(id), 'export');
      } catch (error) {
        console.log(error);
      }
    }
    setDownloading(false);
  };

  const handleGoogleDocsSync = async () => {
    setGoogleDocsLoading(true);
    try {
      const response = await apiCallPost(`api/sdg-action-plan/${id}/google-docs/`, {}, true);
      
      if (response?.success) {
        setSnackbar({
          open: true,
          message: response.message,
          severity: 'success',
        });
        
        // Update form data with new Google Docs info
        if (response.google_doc_url) {
          setFormData((prev: FormData | null) => prev ? ({
            ...prev,
            google_doc_url: response.google_doc_url,
            google_doc_created: true,
          }) : null);
        }
        
        // Open Google Docs in new tab
        if (response.google_doc_url) {
          window.open(response.google_doc_url, '_blank');
        }
      } else if (response?.auth_required) {
        // Handle OAuth authorization required
        setSnackbar({
          open: true,
          message: 'Google Docs authorization required. Please authorize the application.',
          severity: 'info',
        });
        
        // Open authorization URL in new window
        if (response.auth_url) {
          const authWindow = window.open(response.auth_url, '_blank', 'width=600,height=600');
          
          // Check if authorization was successful
          const checkAuth = setInterval(async () => {
            try {
              const authResponse = await apiCallPost(`api/sdg-action-plan/${id}/google-docs/`, {}, true);
              if (authResponse?.success) {
                clearInterval(checkAuth);
                authWindow?.close();
                
                setSnackbar({
                  open: true,
                  message: 'Google Docs authorization successful! Document created.',
                  severity: 'success',
                });
                
                if (authResponse.google_doc_url) {
                  setFormData((prev: FormData | null) => prev ? ({
                    ...prev,
                    google_doc_url: authResponse.google_doc_url,
                    google_doc_created: true,
                  }) : null);
                  
                  window.open(authResponse.google_doc_url, '_blank');
                }
              }
            } catch (error) {
              // Continue checking
            }
          }, 2000);
          
          // Stop checking after 5 minutes
          setTimeout(() => {
            clearInterval(checkAuth);
            authWindow?.close();
          }, 300000);
        }
      } else {
        setSnackbar({
          open: true,
          message: response?.message || 'Failed to sync with Google Docs',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error connecting to Google Docs',
        severity: 'error',
      });
    } finally {
      setGoogleDocsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev: SnackbarState) => ({ ...prev, open: false }));
  };

  return (
    <Page>
      <Box
        sx={{
          alignSelf: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: isMobile ? '95%' : '80%',
          background: 'white',
          padding: isMobile ? '20px' : '30px',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 2 : 0,
          }}
        >
          <Typography variant={isMobile ? 'h5' : 'h4'} paddingLeft={isMobile ? 0 : '30px'}>
            SDG Knowledge Action Plan
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {isOwner && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SettingsIcon />}
                onClick={() => setShowPermissions(true)}
                sx={{ textTransform: 'none' }}
              >
                MANAGE FORM PERMISSIONS
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Sync with Google Docs" arrow slots={{ transition: Fade }}>
              <IconButton 
                onClick={handleGoogleDocsSync}
                disabled={googleDocsLoading}
                sx={{ 
                  backgroundColor: '#4285f4',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#3367d6',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                  }
                }}
              >
                {googleDocsLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <GoogleIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Plan as PDF" arrow slots={{ transition: Fade }}>
              <IconButton onClick={handleFormDownload}>
                {downloading ? (
                  <CircularProgress size={20} />
                ) : (
                  <FileDownloadIcon sx={{ fontSize: 30 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Google Docs Status */}
        {formData?.google_doc_created && formData?.google_doc_url && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              padding: 2,
              backgroundColor: '#f0f8ff',
              borderRadius: 1,
              border: '1px solid #4285f4',
            }}
          >
            <GoogleIcon sx={{ color: '#4285f4' }} />
            <Typography variant="body2" color="primary">
              Google Docs document is available. 
              <Button
                size="small"
                onClick={() => window.open(formData.google_doc_url, '_blank')}
                sx={{ ml: 1, textTransform: 'none' }}
              >
                Open Document
              </Button>
            </Typography>
          </Box>
        )}
        <FormInfo />
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
      {id && (
        <FormPermissionsModal
          open={showPermissions}
          onClose={() => setShowPermissions(false)}
          formId={id}
          initialPermissions={permissions}
        />
      )}
    </Page>
  );
};

export default Form;