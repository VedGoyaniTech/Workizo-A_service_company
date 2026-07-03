import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Button, Grid, Card,
  Switch, FormControlLabel, Alert, Divider
} from '@mui/material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import api from '../services/api';
import toast from 'react-hot-toast';

const WorkerDashboard = () => {
  const { user, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const [online, setOnline] = useState(user?.profile?.online_status || false);
  const [loading, setLoading] = useState(false);

  const handleOnlineToggle = async (event) => {
    setLoading(true);
    const newStatus = event.target.checked;
    try {
      const res = await api.put('accounts/profile/', {
        online_status: newStatus
      });
      setOnline(newStatus);
      updateProfileState(res.data);
      toast.success(newStatus ? 'You are now Online! Waiting for requests.' : 'You are now Offline.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update online status.');
    } finally {
      setLoading(false);
    }
  };

  const getAlertBanner = () => {
    const status = user?.profile?.approval_status || 'pending';
    if (status === 'approved') {
      return (
        <Alert severity="success" sx={{ mb: 4 }}>
          Congratulations! Your profile has been approved. You are ready to accept customer service requests.
        </Alert>
      );
    } else if (status === 'rejected') {
      return (
        <Alert severity="error" sx={{ mb: 4 }}>
          Your KYC documentation was rejected by the administrator. Please update your details.
        </Alert>
      );
    }
    return (
      <Alert severity="warning" sx={{ mb: 4 }}>
        Your registration is currently under review by our administration team. You will be able to receive bookings once approved.
      </Alert>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      {getAlertBanner()}

      <Grid container spacing={4}>
        {/* Welcome Section */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 4, 
              mb: 4, 
              background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
              border: '1px solid #E5E7EB'
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#0F0F14' }}>
              Welcome, Captain {user?.full_name}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Category: {user?.profile?.service_category?.name || 'Not Selected (Please update profile)'}
            </Typography>
            
            <Divider sx={{ mb: 3, borderColor: 'rgba(0,0,0,0.08)' }} />

            <FormControlLabel
              control={
                <Switch
                  checked={online}
                  onChange={handleOnlineToggle}
                  disabled={loading || user?.profile?.approval_status !== 'approved'}
                  color="primary"
                />
              }
              label={
                <Typography variant="subtitle1" fontWeight="bold">
                  {online ? 'Status: ONLINE (Visible to customers)' : 'Status: OFFLINE (Unavailable)'}
                </Typography>
              }
            />
          </Paper>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Job Management
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#E5E7EB', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <SignalCellularAltIcon color="primary" sx={{ fontSize: 40, mb: 1.5 }} />
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Job Requests</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Real-time local bookings matching your service category will appear here.
                  </Typography>
                </Box>
                <Button variant="contained" color="primary" size="small" fullWidth disabled>
                  View Job Board (Phase 2)
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#E5E7EB', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <ContactPageIcon sx={{ fontSize: 40, color: '#000000', mb: 1.5 }} />
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>KYC Documents</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Review or update your uploaded Aadhaar, PAN, and settlement bank details.
                  </Typography>
                </Box>
                <Button variant="outlined" color="primary" size="small" fullWidth onClick={() => navigate('/captain/profile')}>
                  Edit Onboarding Profile
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Quick Stats sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Captain Performance
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Approval Status</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                {user?.profile?.approval_status || 'pending'}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Experience</Typography>
              <Typography variant="body2" fontWeight="bold">
                {user?.profile?.experience || 0} Years
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Total Earnings</Typography>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                ₹0.00 (Phase 2)
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Jobs Completed</Typography>
              <Typography variant="body2" fontWeight="bold">
                0
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WorkerDashboard;
