import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  Avatar, Menu, MenuItem, IconButton, Tooltip
} from '@mui/material';
import HandymanIcon from '@mui/icons-material/Handyman';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

const Layout = ({ children }) => {
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
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1 }}
            >
              <HandymanIcon sx={{ color: '#000000', fontSize: 28 }} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  letterSpacing: '.05rem',
                  color: '#0F0F14',
                }}
              >
                WORKIZO
              </Typography>
            </Box>

            {/* Nav Menu Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button 
                variant="text" 
                color="inherit" 
                onClick={() => navigate('/')}
                sx={{ color: location.pathname === '/' ? '#000000' : '#4B5563' }}
              >
                Home
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="text" 
                    color="inherit" 
                    onClick={() => navigate(getDashboardRoute())}
                    sx={{ color: location.pathname.includes('/dashboard') ? '#000000' : '#4B5563' }}
                  >
                    Dashboard
                  </Button>
                  
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
                    {user.role === 'worker' && (
                      <>
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/captain/wallet'); }}>
                          <AccountBalanceWalletIcon fontSize="small" sx={{ mr: 1.5, color: '#6B7280' }} />
                          Wallet Ledger
                        </MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/captain/history'); }}>
                          <HistoryIcon fontSize="small" sx={{ mr: 1.5, color: '#6B7280' }} />
                          Job History
                        </MenuItem>
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/captain/settings'); }}>
                          <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: '#6B7280' }} />
                          System Settings
                        </MenuItem>
                      </>
                    )}
                    <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                      <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: '#ef4444' }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button 
                    variant="text" 
                    color="inherit" 
                    onClick={() => navigate('/captain/login')}
                    sx={{ color: '#4B5563' }}
                  >
                    Join as Captain
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/customer/login')}
                  >
                    Login / Sign Up
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Page Content */}
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
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

export default Layout;
