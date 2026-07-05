import React, { useState } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Box, Grid,
  Card, CardContent, Divider, Stepper, Step, StepLabel, Alert,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HandymanIcon from '@mui/icons-material/Handyman';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RoomIcon from '@mui/icons-material/Room';
import api from '../services/api';

const steps = [
  { label: 'Booking Placed', desc: 'Finding the nearest Captain' },
  { label: 'Captain Assigned', desc: 'Worker is on the way' },
  { label: 'Repair In Progress', desc: 'Work has started' },
  { label: 'Billing Approval', desc: 'Invoice generated, awaiting approval' },
  { label: 'Job Completed', desc: 'Service successfully settled' }
];

const getActiveStep = (status) => {
  switch (status) {
    case 'searching':
      return 0;
    case 'accepted':
    case 'on_the_way':
    case 'arrived':
      return 1;
    case 'verified':
    case 'inspection':
    case 'repair_started':
      return 2;
    case 'repair_completed':
    case 'waiting_approval':
      return 3;
    case 'completed':
      return 5; // All steps completed
    default:
      return 0;
  }
};

const BookingTracker = () => {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      // Direct call to public tracking endpoint
      const res = await api.get(`bookings/bookings/track/?tracking_id=${trackingId.trim().toUpperCase()}`);
      setBooking(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'No booking found with this Tracking ID.');
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = booking?.status === 'cancelled';
  const activeStep = booking ? getActiveStep(booking.status) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Title */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="caption" sx={{ color: '#000000', fontWeight: 800, letterSpacing: '0.1rem', textTransform: 'uppercase' }}>
          Real-Time Status
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
          Track Your Service
        </Typography>
        <Typography variant="body1" sx={{ color: '#6B7280', maxWidth: '500px', mx: 'auto' }}>
          Enter your unique Tracking ID to track the real-time status of your local repair job.
        </Typography>
      </Box>

      {/* Input Search Panel */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 6,
          borderColor: '#E5E7EB',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
        }}
      >
        <Box component="form" onSubmit={handleTrack} sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            placeholder="Enter Tracking ID (e.g. WRK-10001)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#9CA3AF', mr: 1 }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                bgcolor: '#ffffff'
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#000000',
              color: '#ffffff',
              borderRadius: '8px',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#222222'
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Track Booking'}
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      {/* Booking Status Timeline Panel */}
      {booking && (
        <Grid container spacing={4}>
          {/* Timeline Tracker */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 4, borderRadius: '12px', borderColor: '#E5E7EB', height: '100%' }}>
              <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 4, borderBottom: '1px solid #E5E7EB', pb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">TRACKING ID</Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#000000' }}>{booking.tracking_id}</Typography>
                </Box>
                <Box sx={{ textAlign: { sm: 'right' } }}>
                  <Typography variant="caption" color="text.secondary">SERVICE CATEGORY</Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#000000' }}>
                    {booking.service_category_detail?.name}
                  </Typography>
                </Box>
              </Box>

              {isCancelled ? (
                <Alert severity="error" sx={{ borderRadius: '8px' }}>
                  This booking has been cancelled. If you require assistance, please schedule a new request.
                </Alert>
              ) : (
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((step, idx) => (
                    <Step key={step.label}>
                      <StepLabel
                        optional={
                          <Typography variant="caption" color="text.secondary">
                            {step.desc}
                          </Typography>
                        }
                        StepIconProps={{
                          sx: {
                            '&.Mui-active': { color: '#000000' },
                            '&.Mui-completed': { color: '#000000' }
                          }
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="800">
                          {step.label}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}
            </Card>
          </Grid>

          {/* Booking Summary Details */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 3, borderRadius: '12px', height: '100%', borderColor: '#E5E7EB' }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HandymanIcon fontSize="small" /> Job Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">Problem Type</Typography>
                <Typography variant="body2" fontWeight="700">{booking.problem_type}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">Preferred Slot Schedule</Typography>
                <Typography variant="body2" fontWeight="700">
                  {booking.preferred_date ? `${booking.preferred_date} | ` : ''} {booking.preferred_time || 'Instant'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Assigned Captain</Typography>
                <Typography variant="body2" fontWeight="700">
                  {booking.worker_name ? `Captain ${booking.worker_name}` : 'Searching for nearest Captain...'}
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Workshop / Offsite token Details */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ p: 3, borderRadius: '12px', borderColor: '#E5E7EB', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon fontSize="small" /> Workshop Repair Ledger
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {booking.repair_token ? (
                <Box>
                  <Alert severity="info" sx={{ mb: 2.5, borderRadius: '8px' }}>
                    Your item was taken offsite to the Workizo service workshop.
                  </Alert>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">Token Number</Typography>
                    <Typography variant="body2" fontWeight="700">{booking.repair_token.token_number}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Workshop Status</Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ textTransform: 'capitalize', color: '#1A73E8' }}>
                      {booking.repair_token.status.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                  <AccessTimeIcon sx={{ fontSize: 36, mb: 1, color: '#9CA3AF' }} />
                  <Typography variant="body2">
                    No offsite workshop repair initiated. Work is currently scheduled/occurring on-site at customer premises.
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default BookingTracker;
