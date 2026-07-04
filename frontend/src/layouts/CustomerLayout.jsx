import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  Avatar, Menu, MenuItem, IconButton, Tooltip
} from '@mui/material';
import HandymanIcon from '@mui/icons-material/Handyman';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

const CustomerLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'worker') return '/captain/dashboard';
    return '/customer/dashboard';
  };

  const getProfileRoute = () => {
    if (!user) return '/';
    if (user.role === 'worker') return '/captain/profile';
    return '/customer/profile';
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bgcolor="#FAFAFB">
      {/* Glassmorphic Navbar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E5E7EB',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Branding Logo */}
            <Box 
              onClick={() => navigate('/')} 
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1.5 }}
            >
              <Box 
                sx={{ 
                  width: 38, 
                  height: 38, 
                  bgcolor: '#000000', // Workizo black logo color
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
              >
                <HandymanIcon sx={{ color: '#ffffff', fontSize: 22 }} />
              </Box>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontFamily: 'Outfit',
                  fontWeight: 900,
                  letterSpacing: '.03rem',
                  color: '#0F0F14',
                  fontSize: '1.3rem'
                }}
              >
                Workizo
              </Typography>
            </Box>

            {/* Nav Menu Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button 
                variant="text" 
                color="inherit" 
                onClick={() => navigate('/')}
                sx={{ color: location.pathname === '/' ? '#000000' : '#4B5563', fontWeight: 600 }}
              >
                Home
              </Button>
              
              {(!isAuthenticated || user?.role === 'customer') && (
                <>
                  <Button 
                    variant="text" 
                    color="inherit" 
                    onClick={() => navigate(isAuthenticated ? '/customer/book' : '/customer/login')}
                    sx={{ color: location.pathname.includes('/book') ? '#000000' : '#4B5563', fontWeight: 600 }}
                  >
                    Book Service
                  </Button>
                  <Button 
                    variant="text" 
                    color="inherit" 
                    onClick={() => navigate('/track')}
                    sx={{ color: location.pathname.includes('/track') ? '#000000' : '#4B5563', fontWeight: 600 }}
                  >
                    Track Booking
                  </Button>
                </>
              )}

              {(!isAuthenticated || user?.role === 'admin') && (
                <Button 
                  variant="text" 
                  color="inherit" 
                  onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/admin/login')}
                  sx={{ color: location.pathname.includes('/admin') ? '#000000' : '#4B5563', fontWeight: 600 }}
                >
                  Admin
                </Button>
              )}

              {/* Become a Captain button - styled in Workizo black outlined pill button */}
              {(!isAuthenticated || user?.role === 'customer') && (
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/captain/login')}
                  sx={{ 
                    borderColor: '#000000', 
                    color: '#000000', 
                    borderRadius: '24px', 
                    fontWeight: 'bold', 
                    px: 3, 
                    py: 0.8,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#222222',
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  Become a Captain
                </Button>
              )}
              
              {isAuthenticated ? (
                <>
                  {user?.role !== 'customer' && (
                    <Button 
                      variant="text" 
                      color="inherit" 
                      onClick={() => navigate(getDashboardRoute())}
                      sx={{ color: location.pathname.includes('/dashboard') ? '#000000' : '#4B5563', fontWeight: 600 }}
                    >
                      Dashboard
                    </Button>
                  )}
                  
                  <Tooltip title="Account Settings">
                    <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 1 }}>
                      <Avatar 
                        src={user.profile_photo ? `http://127.0.0.1:8001${user.profile_photo}` : ''}
                        sx={{ bgcolor: '#000000', width: 36, height: 36 }}
                      >
                        {user.full_name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        minWidth: 180,
                        backgroundColor: '#ffffff',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                      }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E5E7EB' }}>
                      <Typography variant="subtitle2" noWrap fontWeight="bold">
                        {user.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {user.email}
                      </Typography>
                    </Box>
                    <MenuItem onClick={() => { handleMenuClose(); navigate(getDashboardRoute()); }}>
                      <DashboardIcon fontSize="small" sx={{ mr: 1.5, color: '#6B7280' }} />
                      Dashboard
                    </MenuItem>
                    {user.role !== 'admin' && (
                      <MenuItem onClick={() => { handleMenuClose(); navigate(getProfileRoute()); }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1.5, color: '#6B7280' }} />
                        Profile Settings
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                      <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: '#ef4444' }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/customer/login')}
                  sx={{ borderRadius: '24px', px: 3 }}
                >
                  Login / Sign Up
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Page Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 4, 
          px: 2, 
          mt: 'auto', 
          backgroundColor: '#ffffff', 
          borderTop: '1px solid #E5E7EB' 
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' WORKIZO. Connecting Customers and Local Workers — In Real Time.'}
          </Typography>
          <Typography variant="caption" color="text.disabled" align="center" display="block" sx={{ mt: 1 }}>
            Built with Django & React. Secure JWT Authentication. Role-Based Access Control.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default CustomerLayout;
