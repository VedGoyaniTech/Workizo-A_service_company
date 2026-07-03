import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Paper, Typography, Box, Button, Grid, Card } from '@mui/material';
import HandymanIcon from '@mui/icons-material/Handyman';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
          border: '1px solid #E5E7EB'
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#0F0F14' }}>
          Hello, {user?.full_name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your Workizo Customer Panel. Search, book, and review local service professionals right here.
        </Typography>
      </Paper>
      
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Quick Actions & Status
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff', borderColor: '#E5E7EB' }}>
            <Box>
              <HandymanIcon color="primary" sx={{ fontSize: 40, mb: 1.5 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Request Service</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Find local electricians, plumbers, carpenters, and technicians near you.
              </Typography>
            </Box>
            <Button variant="contained" color="primary" size="small" fullWidth disabled>
              Book Service (Phase 2)
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff', borderColor: '#E5E7EB' }}>
            <Box>
              <HistoryIcon color="primary" sx={{ fontSize: 40, mb: 1.5 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Booking History</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View your active requests, completed settlements, and receipts.
              </Typography>
            </Box>
            <Button variant="outlined" color="primary" size="small" fullWidth disabled>
              View Bookings (Phase 2)
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff', borderColor: '#E5E7EB' }}>
            <Box>
              <ManageAccountsIcon sx={{ fontSize: 40, color: '#000000', mb: 1.5 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Profile Details</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage your home address, contact details, and password preferences.
              </Typography>
            </Box>
            <Button variant="outlined" color="primary" size="small" fullWidth onClick={() => navigate('/customer/profile')}>
              Update Profile
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerDashboard;
