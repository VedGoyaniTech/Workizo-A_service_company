import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, Typography, Divider, List, ListItem, ListItemText, 
  Avatar, Grid 
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
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

import { tokens, span } from '../design/tokens';
import { 
  DashboardPage, DashboardGrid, DashboardCard, 
  SummaryCard, SummaryGrid 
} from '../components/dashboard';

const CATEGORY_STYLES = {
  'Electrician': {
    icon: <FlashOnIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
    bgColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: '#f59e0b'
  },
  'Plumber': {
    icon: <OpacityIcon sx={{ fontSize: 32, color: '#3b82f6' }} />,
    bgColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: '#3b82f6'
  },
  'Carpenter': {
    icon: <CarpenterIcon sx={{ fontSize: 32, color: '#10b981' }} />,
    bgColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: '#10b981'
  },
  'AC Technician': {
    icon: <AcUnitIcon sx={{ fontSize: 32, color: '#06b6d4' }} />,
    bgColor: 'rgba(6, 182, 212, 0.08)',
    borderColor: '#06b6d4'
  },
  'Mechanic': {
    icon: <ConstructionIcon sx={{ fontSize: 32, color: '#ef4444' }} />,
    bgColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: '#ef4444'
  },
  'Home Cleaning': {
    icon: <CleaningServicesIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />,
    bgColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: '#8b5cf6'
  }
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

  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const pastBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
  const currentLocation = user?.profile?.city ? `${user.profile.city}, Gujarat` : 'Ahmedabad, Gujarat';

  const summary = (
    <SummaryGrid columns={4}>
      <SummaryCard
        label="Total Service Bookings"
        value={bookings.length}
        icon={<AssignmentIcon />}
        accentColor="#1A73E8"
        loading={loading}
      />
      <SummaryCard
        label="Active Bookings"
        value={activeBookings.length}
        icon={<PendingActionsIcon />}
        accentColor="#FBBC05"
        loading={loading}
      />
      <SummaryCard
        label="Completed Services"
        value={pastBookings.filter(b => b.status === 'completed').length}
        icon={<CheckCircleIcon />}
        accentColor="#34A853"
        loading={loading}
      />
      <SummaryCard
        label="Service Location"
        value={currentLocation}
        icon={<RoomIcon />}
        accentColor="#EA4335"
        loading={loading}
      />
    </SummaryGrid>
  );

  return (
    <DashboardPage
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Customer Dashboard' }]}
      title="Customer Dashboard"
      description="Book home repair and maintenance services in Ahmedabad with verified local experts."
      summary={summary}
      loading={loading}
      actions={
        <Button 
          variant="contained" 
          onClick={() => navigate('/customer/book')}
          sx={{ 
            bgcolor: tokens.colors.primary, 
            color: '#ffffff', 
            px: 3, 
            borderRadius: `${tokens.borderRadiusSm}px`,
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: '#23232F' }
          }}
        >
          Book a Partner
        </Button>
      }
    >
      <DashboardGrid>
        {/* Active Trackers */}
        {activeBookings.length > 0 && (
          <Box sx={{ ...span.full, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'Outfit, sans-serif' }}>
              Active Service Trackers
            </Typography>
            <DashboardGrid>
              {activeBookings.map((bk) => (
                <Box key={bk.id} sx={span.half}>
                  <DashboardCard
                    title={bk.service_category_detail?.name}
                    subtitle={`Tracking ID: ${bk.tracking_id || bk.id} | Problem: ${bk.problem_type}`}
                    action={
                      <Box sx={{ 
                        px: 1.5, py: 0.5, borderRadius: '20px', 
                        bgcolor: 'rgba(26, 115, 232, 0.08)',
                        border: '1px solid rgba(26, 115, 232, 0.15)'
                      }}>
                        <Typography variant="caption" sx={{ color: '#1A73E8', fontWeight: 700, textTransform: 'uppercase' }}>
                          {bk.status.replace('_', ' ')}
                        </Typography>
                      </Box>
                    }
                  >
                    <Box sx={{ mt: 'auto', pt: 3 }}>
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/customer/booking/${bk.id}`)}
                        sx={{ 
                          background: tokens.colors.primary, 
                          color: '#ffffff', 
                          borderRadius: `${tokens.borderRadiusSm}px`, 
                          textTransform: 'none',
                          fontWeight: 700,
                          '&:hover': { bgcolor: '#23232F' }
                        }}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Track Live Timeline
                      </Button>
                    </Box>
                  </DashboardCard>
                </Box>
              ))}
            </DashboardGrid>
          </Box>
        )}

        {/* Book A Partner Widget */}
        <Box sx={span.twoThirds}>
          <DashboardCard 
            title="Book A Service Partner" 
            subtitle="Select a category to hire our certified professionals"
          >
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {categories.map((cat) => {
                const styles = CATEGORY_STYLES[cat.name] || {
                  icon: <HandymanIcon sx={{ fontSize: 32, color: '#000000' }} />,
                  bgColor: '#FAFAFB',
                  borderColor: '#E5E7EB'
                };
                return (
                  <Grid item xs={6} sm={4} key={cat.id}>
                    <Box
                      onClick={() => navigate(`/customer/book?category=${cat.id}`)}
                      sx={{ 
                        p: 3, 
                        textAlign: 'center', 
                        cursor: 'pointer', 
                        borderRadius: `${tokens.borderRadius}px`, 
                        border: `1px solid ${tokens.borderColor}`,
                        bgcolor: tokens.colors.paper,
                        height: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        transition: tokens.transition,
                        '&:hover': {
                          borderColor: styles.borderColor,
                          transform: 'translateY(-4px)',
                          boxShadow: tokens.shadowHover,
                        }
                      }}
                    >
                      <Box sx={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        bgcolor: styles.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5,
                      }}>
                        {styles.icon}
                      </Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: tokens.colors.primary }}>
                        {cat.name}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </DashboardCard>
        </Box>

        {/* Sidebar History Ledger */}
        <Box sx={span.oneThird}>
          <DashboardCard title="Booking History Logs" subtitle="Your recent service history">
            <List disablePadding>
              {pastBookings.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No completed service jobs yet.</Typography>
                </Box>
              ) : (
                pastBookings.slice(0, 5).map((bk) => (
                  <ListItem key={bk.id} sx={{ px: 0, py: 1.5 }} divider>
                    <ListItemText
                      primary={bk.service_category_detail?.name}
                      secondary={`${new Date(bk.created_at).toLocaleDateString()} | ID: ${bk.tracking_id || bk.id}`}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Box sx={{ 
                        px: 1, py: 0.25, borderRadius: '4px', 
                        bgcolor: bk.status === 'completed' ? 'rgba(22, 163, 74, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                        border: bk.status === 'completed' ? '1px solid rgba(22, 163, 74, 0.15)' : '1px solid rgba(220, 38, 38, 0.15)'
                      }}>
                        <Typography variant="caption" fontWeight={700} color={bk.status === 'completed' ? 'success.main' : 'error.main'}>
                          {bk.status.toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                ))
              )}
            </List>
          </DashboardCard>
        </Box>

        {/* Secondary Widgets Grid */}
        <Box sx={span.half}>
          <DashboardCard title="Account Management" subtitle="Manage your contact info, location details, and passwords">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                Modify your stored address details, contact credentials, or security keys.
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/customer/profile')}
                  sx={{ borderColor: '#000000', color: '#000000', borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700 }}
                >
                  Edit Profile
                </Button>
              </Box>
            </Box>
          </DashboardCard>
        </Box>

        <Box sx={span.half}>
          <DashboardCard title="Need Assistance?" subtitle="Raise issues, contact settlement, or get general help">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                Raise an issue regarding a completed booking, or contact settlement support.
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Button 
                  variant="outlined" 
                  disabled
                  sx={{ borderColor: tokens.borderColor, color: 'text.secondary', borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700 }}
                >
                  Contact Support
                </Button>
              </Box>
            </Box>
          </DashboardCard>
        </Box>
      </DashboardGrid>
    </DashboardPage>
  );
}

export default CustomerDashboard;
