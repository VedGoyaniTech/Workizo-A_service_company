import React, { useState } from 'react';
import {
  Typography, TextField, Button, Box, Divider, Stepper, Step, StepLabel, Alert,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import HandymanIcon from '@mui/icons-material/Handyman';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import api from '../services/api';

import { tokens, span } from '../design/tokens';
import { 
  DashboardPage, DashboardGrid, DashboardCard 
} from '../components/dashboard';

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
    <DashboardPage
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Track Booking' }]}
      title="Track Your Service"
      description="Enter your unique Tracking ID to track the real-time status of your local repair job."
    >
      <DashboardGrid>
        {/* Input Search Panel */}
        <Box sx={span.full}>
          <DashboardCard title="Live Service Tracker Lookup" subtitle="Verify updates and assigned captain timelines instantly">
            <Box component="form" onSubmit={handleTrack} sx={{ mt: 1, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                placeholder="Enter Tracking ID (e.g. WRK-10001)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#9CA3AF', mr: 1 }} />
                }}
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: `${tokens.borderRadiusSm}px`,
                    bgcolor: tokens.colors.paper
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: tokens.colors.primary,
                  color: '#ffffff',
                  borderRadius: `${tokens.borderRadiusSm}px`,
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#23232F'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Track Booking'}
              </Button>
            </Box>
          </DashboardCard>
        </Box>

        {/* Error Alert */}
        {error && (
          <Box sx={span.full}>
            <Alert severity="error" sx={{ borderRadius: `${tokens.borderRadiusSm}px` }}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Booking Status Timeline Panel */}
        {booking && (
          <>
            {/* Left Column: Timeline Tracker */}
            <Box sx={span.twoThirds}>
              <DashboardCard 
                title="Service Progress Timeline" 
                subtitle={`Tracking ID: ${booking.tracking_id} | Category: ${booking.service_category_detail?.name}`}
                highlight
              >
                {isCancelled ? (
                  <Alert severity="error" sx={{ borderRadius: `${tokens.borderRadiusSm}px` }}>
                    This booking has been cancelled. If you require assistance, please schedule a new request.
                  </Alert>
                ) : (
                  <Box sx={{ mt: 2 }}>
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
                                '&.Mui-active': { color: tokens.colors.accent },
                                '&.Mui-completed': { color: tokens.colors.success }
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
                  </Box>
                )}
              </DashboardCard>
            </Box>

            {/* Right Column: Summaries & Offsite Workshop Status */}
            <Box sx={span.oneThird}>
              <Box display="flex" flexDirection="column" gap={`${tokens.cardGap}px`}>
                
                {/* Booking Summary Details */}
                <DashboardCard title="Job Summary" subtitle="Details of requested repair">
                  <Box sx={{ mt: 1 }}>
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
                  </Box>
                </DashboardCard>

                {/* Workshop / Offsite token Details */}
                <DashboardCard title="Workshop Repair Ledger" subtitle="Offsite work details">
                  <Box sx={{ mt: 1 }}>
                    {booking.repair_token ? (
                      <Box>
                        <Alert severity="info" sx={{ mb: 2, borderRadius: `${tokens.borderRadiusSm}px` }}>
                          Your item was taken offsite to the Workizo service workshop.
                        </Alert>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block">Token Number</Typography>
                          <Typography variant="body2" fontWeight="700">{booking.repair_token.token_number}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Workshop Status</Typography>
                          <Typography variant="body2" fontWeight="700" sx={{ textTransform: 'capitalize', color: tokens.colors.accent }}>
                            {booking.repair_token.status.replace('_', ' ')}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                        <AccessTimeIcon sx={{ fontSize: 36, mb: 1, color: tokens.colors.textMuted }} />
                        <Typography variant="body2">
                          No offsite workshop repair initiated. Work is currently scheduled/occurring on-site at customer premises.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </DashboardCard>
              </Box>
            </Box>
          </>
        )}
      </DashboardGrid>
    </DashboardPage>
  );
};

export default BookingTracker;
