import * as React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';

import PersonIcon from '@mui/icons-material/Person';
import { apiCallPost, apiCallGet } from '../Utilities/ApiCalls';
import { getUrl } from '../Utilities/ServerEnv';

function ResponsiveAppBar() {
  
  const navigate = useNavigate();
  
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [anchorElFeatures, setAnchorElFeatures] = React.useState<null | HTMLElement>(null);
  const [adminStatus, setAdminStatus] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);
  
  const handleRemoveLocalData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token-expiry')
    localStorage.removeItem('url');
    localStorage.removeItem('userDetails');
  }

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const url = localStorage.getItem('url');
    const tokenExpiry = localStorage.getItem('token-expiry');

    // Specifically check if token is expired
    if (tokenExpiry && Date.now() > (new Date(tokenExpiry)).getTime()) {
      handleRemoveLocalData();
      setLoggedIn(false)
    } else if (token && url === getUrl() && tokenExpiry) {
      // If there is a token and it is for the correct url (i.e., logged in
      // on local compared to cloud website)
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);

  React.useEffect(() => {
    const fetchAdmin = async () => {
      const data = await apiCallGet('api/auth/admin-check/', true);
      if (data.is_admin === true) {
        setAdminStatus(true);
      }
    };
    if (localStorage.getItem('token')) {
      fetchAdmin();
    }
  }, []);

  const pages = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about-us' }
  ];

  const featurePages = [
    { name: 'SDG EDUCATIONS', path: '/sdg-education' },
    { name: 'SDG ACTIONS', path: '/sdg-action' },
    { name: 'SDG KEYWORDS', path: '/sdg-keywords' },
    { name: 'SDG AI CHATBOT', path: '/sdg-ai-chatbot' },
    ...(loggedIn ? [{ name: 'SDG FORM', path: '/sdg-form' },
                    { name: 'USER ACTIVITY', path: '/user-activity' }
    ] : []),
    ...(adminStatus ? [{ name: 'ADMIN PORTAL', path: '/admin-portal' }] : [])
  ];

  const settings = [
    ...(loggedIn ? [
      { name: 'PROFILE', path: '/userprofile' },
      { name: 'TEAMS', path: '/teams' },
      { name: 'BOOKMARKS', path: '/bookmarks' }
    ] : [
      { name: 'LOG IN', path: '/login' },
      { name: 'SIGN UP', path: '/signup' }
    ])
  ];

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      const data = await apiCallPost('api/auth/logout/', {}, true);
      console.log('Logout response:', data);
      if (data.statusCode === 200) {
        handleRemoveLocalData();
        setLoggedIn(false);
        navigate('/');
        console.log('Logout successful');
      } else {
        console.error('Logout failed:', data);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenFeaturesMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElFeatures(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseFeaturesMenu = () => {
    setAnchorElFeatures(null);
  };

  return (
    <AppBar position='static' elevation={0} sx={{ backgroundColor: 'white' }} >
      <Container maxWidth={false}>
        <Toolbar disableGutters sx={{ px: 0 }}>
          {/* LOGO */}
          <Typography
            variant='subtitle1'
            component={Link}
            to='/'
            sx={{
              paddingLeft: '10px',
              display: { xs: 'flex', md: 'flex' },
              fontFamily: 'Roboto, monospace',
              fontWeight: 900,
              letterSpacing: '.2rem',
              color: 'black',
              textDecoration: 'none',
              lineHeight: 1
            }}
          >
            SDG<br />
            ZOO
          </Typography>

          {/* MOBILE DESIGN */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
            <IconButton
              size='large'
              onClick={(e) => setAnchorElNav(e.currentTarget)}
              color='inherit'
            >
            <MenuIcon sx={{ color: '#000' }} />
              </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiPaper-root': {
                  width: '100vw',
                  maxWidth: '100vw',
                  left: '0 !important',
                  right: '0 !important',
                  borderRadius: 0,
                },
              }}
            >
              {pages.map((page) => (
                <MenuItem 
                key={page.name} 
                onClick={handleCloseNavMenu} 
                component={Link} 
                to={page.path}
                >
                  <Typography textAlign='center'>
                    {page.name}
                  </Typography>
                </MenuItem>
              ))}
              {featurePages.map((page) => (
                <MenuItem 
                  key={page.name} 
                  onClick={handleCloseNavMenu} 
                  component={Link} 
                  to={page.path
                }>
                  <Typography textAlign='center'>
                    {page.name}
                  </Typography>
                </MenuItem>
              ))}
              {settings.map((setting) => (
                <MenuItem
                  key={setting.name}
                  component={Link}
                  to={setting.path}
                  onClick={handleCloseUserMenu}
                >
                  <Typography textAlign='center'>
                    {setting.name}
                  </Typography>
                </MenuItem>
              ))}
              {loggedIn && (
                <MenuItem onClick={() => {
                  handleLogout();
                  handleCloseNavMenu();
                }}>
                  <Typography textAlign='center'>LOG OUT</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* DESKTOP DESIGN  */}
          <Box sx={{ flexGrow: 1,  display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center', gap: '0px 20px' }}>
            {pages.map((page) => (
              <React.Fragment key={page.name}>
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: '#666666', display: 'block' }}
                  component={Link}
                  to={page.path}
                >
                  {page.name}
                </Button>
              </React.Fragment>
            ))}
            <Button
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleOpenFeaturesMenu}
              sx={{ my: 2, color: '#666666' }}
            >
              FEATURES
            </Button>

            <Menu
              anchorEl={anchorElFeatures}
              open={Boolean(anchorElFeatures)}
              onClose={handleCloseFeaturesMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              {featurePages.map((page) => (
                <MenuItem
                  key={page.name}
                  component={Link}
                  to={page.path}
                  onClick={handleCloseFeaturesMenu}
                  sx={{ color: '#2B2B2B' }}
                >
                  {page.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* USER PROFILE + SETTINGS */}
          <Box sx={{ flexGrow: 0,  display: { xs: 'none', md: 'flex' }}}>
            <Tooltip title='Profile settings'>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt='User Icon' sx={{ bgcolor: '#E1ECFF', color: '#4285F4' }}>
                  <PersonIcon /> 
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id='menu-appbar'
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.name}
                  component={Link}
                  to={setting.path}
                  onClick={handleCloseUserMenu}
                >
                  <Typography textAlign='center'>
                    {setting.name}
                  </Typography>
                </MenuItem>
              ))}
              {loggedIn && (
                <MenuItem onClick={() => {
                  handleLogout();
                  handleCloseUserMenu();
                }}>
                  <Typography textAlign='center'>LOG OUT</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
