import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Tooltip,
  Menu, MenuItem, useTheme, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import HandymanIcon from '@mui/icons-material/Handyman';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const drawerWidth = 260;

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Parse active tab from URL to highlight menu items
  const queryParams = new URLSearchParams(location.search);
  const tabQuery = queryParams.get('tab');
  
  // Default tab highlight based on URL
  const isCaptainsActive = location.pathname === '/admin/dashboard' && (tabQuery === '0' || tabQuery === null);
  const isCustomersActive = location.pathname === '/admin/dashboard' && tabQuery === '1';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/admin/login');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#110c0c', color: '#ffffff' }}>
      {/* Branding Logo */}
      <Box 
        onClick={() => navigate('/admin/dashboard')} 
        sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer', 
          gap: 1.5,
          borderBottom: '1px solid #221515'
        }}
      >
        <HandymanIcon sx={{ color: '#ef4444', fontSize: 28 }} />
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Outfit',
              fontWeight: 900,
              letterSpacing: '.05rem',
              color: '#ffffff',
              lineHeight: 1.2
            }}
          >
            WORKIZO
          </Typography>
          <Typography variant="caption" sx={{ color: '#ef4444', letterSpacing: '.1rem', fontWeight: 600 }}>
            ADMIN PORTAL
          </Typography>
        </Box>
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => {
              navigate('/admin/dashboard?tab=0');
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              borderRadius: '8px',
              py: 1.2,
              px: 2,
              backgroundColor: isCaptainsActive ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              color: isCaptainsActive ? '#ef4444' : '#9CA3AF',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff'
              },
              transition: 'all 0.2s'
            }}
          >
            <ListItemIcon sx={{ color: isCaptainsActive ? '#ef4444' : '#9CA3AF', minWidth: 40 }}>
              <SupervisorAccountIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Verify Captains" 
              primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: isCaptainsActive ? 700 : 500 }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => {
              navigate('/admin/dashboard?tab=1');
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              borderRadius: '8px',
              py: 1.2,
              px: 2,
              backgroundColor: isCustomersActive ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              color: isCustomersActive ? '#ef4444' : '#9CA3AF',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff'
              },
              transition: 'all 0.2s'
            }}
          >
            <ListItemIcon sx={{ color: isCustomersActive ? '#ef4444' : '#9CA3AF', minWidth: 40 }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Customer Directory" 
              primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: isCustomersActive ? 700 : 500 }} 
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ borderColor: '#221515' }} />

      {/* Footer / Account Profile */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderTop: '1px solid #221515' }}>
        <Avatar
          sx={{ bgcolor: '#ef4444', width: 40, height: 40, fontWeight: 700 }}
        >
          {user?.full_name?.charAt(0).toUpperCase() || 'A'}
        </Avatar>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
            {user?.full_name || 'Admin User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ color: '#888888' }}>
            System Administrator
          </Typography>
        </Box>
        <Tooltip title="Log Out">
          <IconButton onClick={handleLogout} sx={{ color: '#ef4444' }}>
            <LogoutIcon size="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box display="flex" minHeight="100vh" bgcolor="#FAFAFB">
      {/* AppBar Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E5E7EB',
          color: '#0F0F14'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <AdminPanelSettingsIcon sx={{ color: '#ef4444', mr: 1, display: { xs: 'none', sm: 'block' } }} />
            <Typography variant="subtitle1" fontWeight="800" sx={{ letterSpacing: '0.02em', display: { xs: 'none', sm: 'block' } }}>
              Workizo Administrative Panel
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {/* Avatar Dropdown */}
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar
                sx={{ bgcolor: '#ef4444', width: 36, height: 36, fontWeight: 700 }}
              >
                {user?.full_name?.charAt(0).toUpperCase() || 'A'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 160,
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: '#ef4444' }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Left Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #221515' },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #E5E7EB' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Page Layout Container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
