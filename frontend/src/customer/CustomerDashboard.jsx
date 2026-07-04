import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Paper, Typography, Box, Button, Grid, Card, CardContent, 
  Divider, List, ListItem, ListItemText, LinearProgress, Avatar 
} from '@mui/material';
import api from '../services/api';
import toast from 'react-hot-toast';
import HandymanIcon from '@mui/icons-material/Handyman';
import HistoryIcon from '@mui/icons-material/History';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import RoomIcon from '@mui/icons-material/Room';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import OpacityIcon from '@mui/icons-material/Opacity';
import CarpenterIcon from '@mui/icons-material/Carpenter';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ConstructionIcon from '@mui/icons-material/Construction';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

const CATEGORY_ICONS = {
  'Electrician': <FlashOnIcon sx={{ fontSize: 32, color: '#000000' }} />,
  'Plumber': <OpacityIcon sx={{ fontSize: 32, color: '#000000' }} />,
  'Carpenter': <CarpenterIcon sx={{ fontSize: 32, color: '#000000' }} />,
  'AC Technician': <AcUnitIcon sx={{ fontSize: 32, color: '#000000' }} />,
  'Mechanic': <ConstructionIcon sx={{ fontSize: 32, color: '#000000' }} />,
  'Home Cleaning': <CleaningServicesIcon sx={{ fontSize: 32, color: '#000000' }} />
};

function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const catsRes = await api.get('/api/services/categories/');
      setCategories(catsRes.data);

      const bookingsRes = await api.get('/api/bookings/my-bookings/');
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const pastBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  // Determine current location display based on address profile
  const currentLocation = user?.profile?.city ? `${user.profile.city}, Gujarat` : 'Ahmedabad, Gujarat';

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Welcome Banner */}
      <Paper 
        variant="outlined"
        sx={{ 
          p: 4, 
          mb: 4, 
          borderColor: '#E5E7EB',
          borderRadius: '8px',
          background: '#ffffff'
        }}
      >
        <Grid container justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#000000', fontFamily: 'Outfit, sans-serif' }}>
              Hello, {user?.full_name}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <RoomIcon sx={{ mr: 0.5, color: '#000000' }} /> {currentLocation}
            </Typography>
          </Grid>
          <Grid item sx={{ mt: { xs: 2, sm: 0 } }}>
            <Button
              variant="contained"
              onClick={() => navigate('/customer/book')}
              sx={{ background: '#000000', color: '#ffffff', fontWeight: '700', borderRadius: '6px', textTransform: 'none' }}
            >
              Quick Book Service
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Active Service Requests Trackers */}
      {activeBookings.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" fontWeight="800" sx={{ mb: 3, fontFamily: 'Outfit, sans-serif' }}>
            Active Service Trackers
          </Typography>
          <Grid container spacing={3}>
            {activeBookings.map((bk) => (
              <Grid item xs={12} sm={6} key={bk.id}>
                <Card variant="outlined" sx={{ p: 2, borderColor: '#000000', borderWidth: '1.5px', borderRadius: '8px' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="primary" fontWeight="700">
                      STATUS: {bk.status.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="h6" fontWeight="800" sx={{ mt: 1, fontFamily: 'Outfit, sans-serif' }}>
                      {bk.service_category_detail?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ref: #{bk.id} | Problem: {bk.problem_type}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/customer/booking/${bk.id}`)}
                      sx={{ background: '#000000', color: '#ffffff', mt: 3, borderRadius: '6px', textTransform: 'none' }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Track Live Timeline
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Service Categories Selection */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" fontWeight="800" sx={{ mb: 3, fontFamily: 'Outfit, sans-serif' }}>
            Book A Service Partner
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {categories.map((cat) => (
              <Grid item xs={6} sm={4} key={cat.id}>
                <Card 
                  variant="outlined" 
                  onClick={() => navigate(`/customer/book?category=${cat.id}`)}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    cursor: 'pointer', 
                    borderRadius: '8px', 
                    borderColor: '#E5E7EB',
                    '&:hover': {
                      borderColor: '#000000',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <Box sx={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    bgcolor: '#FAFAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}>
                    {CATEGORY_ICONS[cat.name] || <HandymanIcon sx={{ color: '#000000' }} />}
                  </Box>
                  <Typography variant="subtitle2" fontWeight="700">
                    {cat.name}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Quick Info & Profile Card */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: 3, borderColor: '#E5E7EB', borderRadius: '8px' }}>
                <ManageAccountsIcon sx={{ fontSize: 36, mb: 1.5, color: '#000000' }} />
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 1 }}>Account Management</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Modify your stored address details, contact credentials, or security keys.
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/customer/profile')}
                  sx={{ borderColor: '#000000', color: '#000000', borderRadius: '6px', textTransform: 'none' }}
                >
                  Edit Profile
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: 3, borderColor: '#E5E7EB', borderRadius: '8px' }}>
                <HistoryIcon sx={{ fontSize: 36, mb: 1.5, color: '#000000' }} />
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 1 }}>Need Assistance?</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Raise an issue regarding a completed booking, or contact settlement support.
                </Typography>
                <Button 
                  variant="outlined" 
                  disabled
                  sx={{ borderColor: '#E5E7EB', color: 'text.secondary', borderRadius: '6px', textTransform: 'none' }}
                >
                  Contact Support
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar History Ledger */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: '#E5E7EB', borderRadius: '8px' }}>
            <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2, fontFamily: 'Outfit, sans-serif' }}>
              Booking History Logs
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List disablePadding>
              {pastBookings.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No completed service jobs yet.</Typography>
              ) : (
                pastBookings.slice(0, 8).map((bk) => (
                  <ListItem key={bk.id} sx={{ px: 0, py: 1.5 }} divider>
                    <ListItemText
                      primary={bk.service_category_detail?.name}
                      secondary={`${new Date(bk.created_at).toLocaleDateString()} | Ref: #${bk.id}`}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="700">
                        {bk.status.toUpperCase()}
                      </Typography>
                      {bk.status === 'completed' && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Settled
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CustomerDashboard;
