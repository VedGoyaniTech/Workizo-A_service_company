import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, Button, Typography, Divider, List, ListItem, ListItemText, 
  Dialog, DialogTitle, DialogContent, DialogActions, Rating, TextField, 
  LinearProgress, CircularProgress, Grid, ListItemIcon,
  IconButton, Avatar, Paper, Breadcrumbs
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import api, { buildWsUrl, buildApiUrl } from '../services/api';
import toast from 'react-hot-toast';

// Icons
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TimelineIcon from '@mui/icons-material/Timeline';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import OpacityIcon from '@mui/icons-material/Opacity';
import CarpenterIcon from '@mui/icons-material/Carpenter';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ConstructionIcon from '@mui/icons-material/Construction';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HandymanIcon from '@mui/icons-material/Handyman';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import RoomIcon from '@mui/icons-material/Room';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import StarIcon from '@mui/icons-material/Star';

import { tokens } from '../design/tokens';
import { DashboardPage, DashboardGrid, DashboardCard } from '../components/dashboard';

const STEPPER_STEPS = [
  { key: 'searching', label: 'Searching' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'on_the_way', label: 'On The Way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'repair_started', label: 'Work Started' },
  { key: 'completed', label: 'Completed' }
];

const CATEGORY_STYLES = {
  'Electrician': {
    icon: <FlashOnIcon sx={{ fontSize: 32, color: '#f59e0b' }} />,
    bgColor: 'rgba(245, 158, 11, 0.10)',
    borderColor: '#f59e0b',
  },
  'Plumber': {
    icon: <OpacityIcon sx={{ fontSize: 32, color: '#3b82f6' }} />,
    bgColor: 'rgba(59, 130, 246, 0.10)',
    borderColor: '#3b82f6',
  },
  'Carpenter': {
    icon: <CarpenterIcon sx={{ fontSize: 32, color: '#10b981' }} />,
    bgColor: 'rgba(16, 185, 129, 0.10)',
    borderColor: '#10b981',
  },
  'AC Technician': {
    icon: <AcUnitIcon sx={{ fontSize: 32, color: '#06b6d4' }} />,
    bgColor: 'rgba(6, 182, 212, 0.10)',
    borderColor: '#06b6d4',
  },
  'Mechanic': {
    icon: <ConstructionIcon sx={{ fontSize: 32, color: '#ef4444' }} />,
    bgColor: 'rgba(239, 68, 68, 0.10)',
    borderColor: '#ef4444',
  },
  'Home Cleaning': {
    icon: <CleaningServicesIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />,
    bgColor: 'rgba(139, 92, 246, 0.10)',
    borderColor: '#8b5cf6',
  }
};

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'searching':
      return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' };
    case 'accepted':
      return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' };
    case 'on_the_way':
      return { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)' };
    case 'arrived':
    case 'verified':
      return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' };
    case 'inspection':
    case 'repair_started':
      return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' };
    case 'repair_completed':
    case 'waiting_approval':
      return { color: '#e11d48', bg: 'rgba(225, 29, 72, 0.08)' };
    case 'completed':
      return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' };
    default:
      return { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.08)' };
  }
};

const getStatusIndex = (status) => {
  switch (status) {
    case 'searching': return 0;
    case 'accepted': return 1;
    case 'on_the_way': return 2;
    case 'arrived':
    case 'verified': return 3;
    case 'inspection':
    case 'repair_started':
    case 'repair_completed':
    case 'waiting_approval': return 4;
    case 'completed': return 5;
    default: return -1;
  }
};

function BookingTracker() {
  const { bookingId } = useParams();
  const id = String(bookingId);
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

  const ws = useRef(null);

  // Fetch initial details
  const fetchDetails = async () => {
    try {
      const res = await api.get(`/api/bookings/bookings/${id}/`);
      setBooking(res.data);
      
      // Fetch bill if status matches
      if (['repair_completed', 'waiting_approval', 'completed'].includes(res.data.status)) {
        try {
          const billRes = await api.get(`/api/billing/${id}/get-bill/`);
          setBill(billRes.data);
        } catch (e) {
          setBill(null);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchDetails();

    // Setup WebSocket connection
    let isActive = true;
    let socket = null;
    let reconnectTimer = null;

    const connect = () => {
      if (!isActive) return;

      const token = localStorage.getItem('access_token');
      const wsUrl = buildWsUrl(`/ws/bookings/${id}/`, `?token=${token}`);
      socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onmessage = (event) => {
        if (!isActive) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'booking_status') {
            setBooking(payload.booking);
            if (['repair_completed', 'waiting_approval', 'completed'].includes(payload.booking.status)) {
              api.get(`/api/billing/${id}/get-bill/`)
                .then(res => setBill(res.data))
                .catch(() => setBill(null));
            }
          }
        } catch (err) {
          console.error('[WS] Message parse error:', err);
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onclose = () => {
        ws.current = null;
        if (isActive) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      isActive = false;
      clearTimeout(reconnectTimer);
      if (socket) socket.close();
    };
  }, [id]);

  const handleApproveRepair = async (approvalId, statusVal) => {
    try {
      await api.post(`/api/bookings/bookings/${id}/respond-major-repair/`, {
        approval_id: approvalId,
        status: statusVal
      });
      toast.success(`Repair estimate ${statusVal}`);
      fetchDetails();
    } catch (err) {
      toast.error('Failed to submit estimate response');
    }
  };

  const handleApproveBill = async () => {
    try {
      const res = await api.post(`/api/billing/${id}/approve-bill/`);
      setBill(res.data);
      toast.success('Bill invoice approved successfully.');
      fetchDetails();
    } catch (err) {
      toast.error('Failed to approve bill invoice');
    }
  };

  const handleProcessPayment = async () => {
    setPaying(true);
    setTimeout(async () => {
      try {
        await api.post(`/api/billing/${id}/process-payment/`, {
          method: selectedPaymentMethod
        });
        setPaymentSuccess(true);
        setTimeout(() => {
          setPaymentModalOpen(false);
          setPaymentSuccess(false);
          fetchDetails();
        }, 2000);
      } catch (err) {
        toast.error('Payment processing failed');
      } finally {
        setPaying(false);
      }
    }, 1500);
  };

  const handleDownloadInvoice = () => {
    window.open(buildApiUrl(`/api/billing/${id}/download-invoice/`), '_blank');
  };

  const handleSubmitRating = async () => {
    setSubmittingRating(true);
    try {
      await api.post('/api/services/rate-booking/', {
        booking_id: id,
        rating,
        review
      });
      toast.success('Thank you for rating your experience!');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingRating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Check-in OTP code copied!');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={48} sx={{ color: tokens.colors.primary }} />
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Booking Details Not Found</Typography>
        <Button variant="contained" onClick={() => navigate('/customer/dashboard')} sx={{ mt: 3, bgcolor: tokens.colors.primary }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const categoryName = booking.service_category_detail?.name || 'Service Request';
  const catStyle = CATEGORY_STYLES[categoryName] || {
    icon: <HandymanIcon sx={{ fontSize: 32, color: tokens.colors.primary }} />,
    bgColor: 'rgba(0,0,0,0.05)',
    borderColor: tokens.borderColor,
  };

  const currentStepIdx = getStatusIndex(booking.status);
  const statusBadge = getStatusBadgeStyle(booking.status);

  // Generate dynamic event logs based on state
  const getEventLogs = () => {
    const events = [];
    const formattedDate = new Date(booking.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    events.push({
      time: formattedDate,
      title: "Booking Created",
      desc: `Service request placed successfully for ${categoryName}.`,
      active: true
    });

    if (booking.worker) {
      events.push({
        time: "Just now",
        title: "Captain Assigned",
        desc: `Captain ${booking.worker.full_name} is assigned to resolve your request.`,
        active: ['accepted', 'on_the_way', 'arrived', 'verified', 'inspection', 'repair_started', 'repair_completed', 'waiting_approval', 'completed'].includes(booking.status)
      });
    }

    if (['on_the_way', 'arrived', 'verified', 'inspection', 'repair_started', 'repair_completed', 'waiting_approval', 'completed'].includes(booking.status)) {
      events.push({
        time: "Updated",
        title: "Captain Traveling",
        desc: "Captain has initiated the journey to your service address.",
        active: ['on_the_way', 'arrived', 'verified', 'inspection', 'repair_started', 'repair_completed', 'waiting_approval', 'completed'].includes(booking.status)
      });
    }

    if (['arrived', 'verified', 'inspection', 'repair_started', 'repair_completed', 'waiting_approval', 'completed'].includes(booking.status)) {
      events.push({
        time: "Arrived",
        title: "Captain Arrived",
        desc: "Captain reached your destination. Pending secure check-in verification code.",
        active: ['arrived', 'verified', 'inspection', 'repair_started', 'repair_completed', 'waiting_approval', 'completed'].includes(booking.status)
      });
    }

    if (['verified', 'inspection', 'repair_started', 'repair_completed', 'waiting_approval', 'completed'].includes(booking.status)) {
      events.push({
        time: "Started",
        title: "Work Started",
        desc: "Secure check-in code verified. Diagnosis and repair works are underway.",
        active: ['verified', 'inspection', 'repair_started', 'repair_completed', 'waiting_approval', 'completed'].includes(booking.status)
      });
    }

    if (booking.status === 'completed') {
      events.push({
        time: "Completed",
        title: "Service Completed",
        desc: "Repair finished. Bill paid and booking closed successfully.",
        active: true
      });
    }

    return events.reverse();
  };

  return (
    <Box sx={{ maxWidth: '1300px', margin: '0 auto', px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Top Header with Breadcrumbs & Action Buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ fontSize: '0.875rem' }}>
          <Link to="/customer/dashboard" style={{ textDecoration: 'none', color: tokens.colors.textSecondary, fontWeight: 500 }}>
            Home
          </Link>
          <Link to="/customer/dashboard" style={{ textDecoration: 'none', color: tokens.colors.textSecondary, fontWeight: 500 }}>
            My Bookings
          </Link>
          <Typography color="text.primary" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
            Booking Details
          </Typography>
        </Breadcrumbs>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/customer/dashboard')}
            sx={{ bgcolor: tokens.colors.primary, color: '#ffffff', px: 3, py: 1.25, borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.875rem', '&:hover': { bgcolor: '#23232F' } }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            startIcon={<HeadsetMicIcon />}
            onClick={() => toast.success('Connecting with Workizo Support...')}
            sx={{ borderColor: tokens.colors.primary, color: tokens.colors.primary, px: 3, py: 1.25, borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.875rem' }}
          >
            Contact Support
          </Button>
        </Box>
      </Box>

      {/* SECTION 2: Large Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={7}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tracking ID
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ fontFamily: 'Outfit, sans-serif', color: tokens.colors.primary, mb: 1 }}>
              {booking.tracking_id || `WRK-${booking.id + 10000}`}
            </Typography>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="h6" fontWeight={700} sx={{ color: tokens.colors.textSecondary }}>
                {categoryName}
              </Typography>
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: '20px', bgcolor: statusBadge.bg }}>
                <Typography variant="caption" fontWeight={800} sx={{ color: statusBadge.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {booking.status.replace('_', ' ')}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Booking Date: <b>{new Date(booking.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Booking ID: <b>#{booking.id}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payment Status: <b style={{ color: booking.status === 'completed' ? '#10b981' : '#e11d48' }}>
                {booking.status === 'completed' ? 'Paid' : 'Pending'}
              </b>
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* SECTION 3: Top Info Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Category', value: categoryName, icon: catStyle.icon, color: '#8F00FF' },
          { label: 'Service Status', value: booking.status.replace('_', ' ').toUpperCase(), icon: <TimelineIcon sx={{ fontSize: 32, color: statusBadge.color }} />, color: statusBadge.color },
          { label: 'Mode', value: 'Instant', icon: <FlashOnIcon sx={{ fontSize: 32, color: '#f59e0b' }} />, color: '#f59e0b' },
          { label: 'Captain Assigned', value: booking.worker?.full_name || 'Searching...', icon: <PersonIcon sx={{ fontSize: 32, color: '#1A73E8' }} />, color: '#1A73E8' }
        ].map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2, height: '100%', bgcolor: tokens.colors.paper }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {card.label}
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: tokens.colors.primary, fontFamily: 'Outfit' }}>
                  {card.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* SECTION 5: FULL WIDTH TIMELINE STEPPER */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3, color: tokens.colors.primary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Service Tracking
        </Typography>
        <Box sx={{ width: '100%', position: 'relative', px: 2 }}>
          {/* Progress Connector Line */}
          <Box sx={{ 
            position: 'absolute', top: '18px', left: '4%', right: '4%', height: '4px', 
            bgcolor: '#E5E7EB', zIndex: 1 
          }}>
            <Box sx={{ 
              width: `${currentStepIdx >= 0 ? (currentStepIdx / 5) * 100 : 0}%`, 
              height: '100%', bgcolor: '#1A73E8', transition: 'width 0.4s ease' 
            }} />
          </Box>

          <Grid container justifyContent="space-between">
            {STEPPER_STEPS.map((step, idx) => {
              const isActive = currentStepIdx === idx;
              const isCompleted = currentStepIdx > idx;

              return (
                <Grid item key={idx} sx={{ zIndex: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <motion.div
                    animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Box sx={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      bgcolor: isActive ? '#1A73E8' : isCompleted ? '#1A73E8' : '#ffffff',
                      border: `2px solid ${isActive || isCompleted ? '#1A73E8' : '#D1D5DB'}`,
                      color: isActive || isCompleted ? '#ffffff' : tokens.colors.textMuted,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.9rem', mb: 1,
                      boxShadow: isActive ? '0 0 12px rgba(26, 115, 232, 0.4)' : 'none'
                    }}>
                      {isCompleted ? '✓' : idx + 1}
                    </Box>
                  </motion.div>
                  <Typography 
                    variant="caption" 
                    fontWeight={isActive || isCompleted ? 700 : 500} 
                    sx={{ color: isActive || isCompleted ? tokens.colors.primary : tokens.colors.textSecondary, display: 'block', maxWidth: '100px', lineHeight: 1.2 }}
                  >
                    {step.label}
                  </Typography>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Paper>

      {/* SECTION 4: Two Column Layout */}
      <Grid container spacing={3}>
        {/* LEFT COLUMN 65% */}
        <Grid item xs={12} lg={8}>
          <Box display="flex" flexDirection="column" gap={3}>
            
            {/* Service Progress Card */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
              <Box display="flex" gap={2.5} alignItems="flex-start">
                <Box sx={{ p: 2, borderRadius: '16px', bgcolor: catStyle.bgColor, border: `1px solid ${catStyle.borderColor}` }}>
                  {catStyle.icon}
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'Outfit' }}>
                    {booking.status === 'searching' && "Broadcasting request to nearby Captains..."}
                    {booking.status === 'accepted' && "Captain accepted your service booking!"}
                    {booking.status === 'on_the_way' && "Captain is en route to your place"}
                    {booking.status === 'arrived' && "Captain reached your location"}
                    {booking.status === 'verified' && "Check-in successful, diagnosing repair..."}
                    {['inspection', 'repair_started'].includes(booking.status) && "Service repairs are actively in progress..."}
                    {booking.status === 'repair_completed' && "Repairs done! Invoice pending checkout"}
                    {booking.status === 'waiting_approval' && "Invoice awaiting your checkout approval"}
                    {booking.status === 'completed' && "Booking finished and closed!"}
                    {booking.status === 'cancelled' && "Booking request was cancelled."}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                    {booking.status === 'searching' && "Our system is connecting with approved service partners in your vicinity. Standard pickup window is 2-5 minutes."}
                    {booking.status === 'accepted' && "Your assigned Captain has confirmed receipt. They are preparing specialized tools for the booking."}
                    {booking.status === 'on_the_way' && `Captain ${booking.worker?.full_name} is on the way. Estimated time of arrival is 15 minutes.`}
                    {booking.status === 'arrived' && "The partner has arrived at your address. Please provide the 8-digit check-in verification OTP code to unlock service."}
                    {booking.status === 'verified' && "Check-in complete. The partner has gained authorization and is running initial hardware inspection."}
                    {['inspection', 'repair_started'].includes(booking.status) && "The captain is actively implementing the repair tasks. Progress updates will sync here automatically."}
                    {booking.status === 'repair_completed' && "Service job finished successfully. The invoice statement has been built by the partner."}
                    {booking.status === 'waiting_approval' && "Captain is seeking estimate approval for spare parts. Please check details below to proceed."}
                    {booking.status === 'completed' && "Thank you for using WORKIZO! The billing invoice has been cleared and payment was successful."}
                    {booking.status === 'cancelled' && "This booking request was cancelled and terminated."}
                  </Typography>

                  {booking.status === 'searching' && (
                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            await api.post(`/api/bookings/bookings/${booking.id}/simulate-assignment/`);
                            toast.success('Captain assigned via simulation!');
                            fetchDetails();
                          } catch (err) {
                            toast.error(err.response?.data?.detail || 'No available workers for simulation.');
                          }
                        }}
                        sx={{ bgcolor: tokens.colors.primary, color: '#ffffff', fontWeight: '700', borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', '&:hover': { bgcolor: '#23232F' } }}
                      >
                        Simulate Captain Acceptance
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>

            {/* SECTION 6: OTP VERIFICATION CARD */}
            {booking.status === 'arrived' && (
              <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper, textAlign: 'center' }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <QrCode2Icon sx={{ fontSize: 56, color: tokens.colors.primary, mb: 1.5 }} />
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    Service Check-In Code
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1.5} sx={{ bgcolor: 'rgba(0,0,0,0.02)', px: 3, py: 1.5, borderRadius: '12px', border: `1px solid ${tokens.borderColor}`, mb: 1.5 }}>
                    <Typography variant="h5" fontWeight={800} color="primary" sx={{ letterSpacing: 3, fontFamily: 'Outfit' }}>
                      {booking.qr_code_value ? String(booking.qr_code_value).substring(0, 8).toUpperCase() : 'N/A'}
                    </Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(String(booking.qr_code_value).substring(0, 8).toUpperCase())}>
                      <FileCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ maxWidth: '400px', lineHeight: 1.5 }}>
                    Provide this check-in OTP code to the Captain ONLY after they reach your location to securely start work.
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Major Repair Estimates Approval */}
            {booking.major_repairs && booking.major_repairs.length > 0 && (
              <Box>
                {booking.major_repairs.map((rep) => (
                  <Paper key={rep.id} elevation={0} sx={{ p: 3, mb: 2, border: `1px solid ${rep.status === 'pending' ? tokens.colors.primary : tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Major Repair Approval Estimate
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Captain requires authorization to install spare parts
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '12px', mb: 2 }}>
                      <Typography variant="h6" fontWeight={700} color="primary">
                        Cost Estimate: ₹{rep.estimated_cost}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Reason: {rep.reason}
                      </Typography>
                    </Box>
                    {rep.status === 'pending' ? (
                      <Box display="flex" gap={2}>
                        <Button variant="contained" color="success" onClick={() => handleApproveRepair(rep.id, 'approved')} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                          Approve
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => handleApproveRepair(rep.id, 'rejected')} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                          Reject
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ px: 2, py: 0.5, borderRadius: '20px', display: 'inline-block', bgcolor: rep.status === 'approved' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)' }}>
                        <Typography variant="caption" fontWeight={700} color={rep.status === 'approved' ? 'success.main' : 'error.main'}>
                          ESTIMATE {rep.status.toUpperCase()}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            )}

            {/* SECTION 8: PAYMENT CARD */}
            {bill && (
              <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Bill Invoice Summary
                </Typography>
                <List disablePadding>
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Service/Labour base charge" />
                    <Typography variant="body2" fontWeight={700}>₹{bill.labour_charges}</Typography>
                  </ListItem>
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Spare parts & materials charges" />
                    <Typography variant="body2" fontWeight={700}>₹{bill.parts_charges}</Typography>
                  </ListItem>
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="GST (18% inclusive)" />
                    <Typography variant="body2" fontWeight={700}>₹{bill.gst}</Typography>
                  </ListItem>
                  {parseFloat(bill.discount) > 0 && (
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <ListItemText primary="Promo Discount" sx={{ color: tokens.colors.success }} />
                      <Typography variant="body2" color="success.main" fontWeight={700}>-₹{bill.discount}</Typography>
                    </ListItem>
                  )}
                  <Divider sx={{ my: 1.5 }} />
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Grand Total Payable" primaryTypographyProps={{ fontWeight: 800 }} />
                    <Typography variant="h6" fontWeight={800} color="primary" sx={{ fontFamily: 'Outfit' }}>
                      ₹{bill.grand_total}
                    </Typography>
                  </ListItem>
                </List>

                <Box display="flex" gap={2} sx={{ mt: 3, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadInvoice}
                    sx={{ borderColor: tokens.colors.primary, color: tokens.colors.primary, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                  >
                    Download Invoice
                  </Button>
                  
                  {!bill.is_approved ? (
                    <Button
                      variant="contained"
                      onClick={handleApproveBill}
                      sx={{ bgcolor: tokens.colors.primary, color: '#ffffff', borderRadius: '8px', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#23232F' } }}
                    >
                      Approve Invoice
                    </Button>
                  ) : (
                    booking.status !== 'completed' && (
                      <Button
                        variant="contained"
                        onClick={() => setPaymentModalOpen(true)}
                        sx={{ bgcolor: tokens.colors.success, color: '#ffffff', borderRadius: '8px', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#16a34a' } }}
                      >
                        Process Payout (Pay ₹{bill.grand_total})
                      </Button>
                    )
                  )}
                </Box>
              </Paper>
            )}

            {/* SECTION 7: LIVE STATUS EVENTS FEED */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Live Service Status Feed
              </Typography>
              <Box display="flex" alignItems="center" gap={1.5} sx={{ p: 1.5, bgcolor: 'rgba(26,115,232,0.05)', borderRadius: '12px', borderLeft: '4px solid #1A73E8' }}>
                <CircularProgress size={16} sx={{ color: '#1A73E8' }} />
                <Typography variant="body2" fontWeight={600} color="primary">
                  {booking.status === 'searching' && "Listening for service captain coordinates..."}
                  {booking.status === 'accepted' && "Captain assigned. Preparing toolbox."}
                  {booking.status === 'on_the_way' && "Captain en route to destination address."}
                  {booking.status === 'arrived' && "Captain at client site. Awaiting QR code authentication."}
                  {booking.status === 'verified' && "Diagnosis and repair operations initiated."}
                  {booking.status === 'repair_completed' && "Repair work successfully complete. Invoice compiled."}
                  {booking.status === 'completed' && "Service transaction completed and closed."}
                  {booking.status === 'cancelled' && "Request cancelled."}
                </Typography>
              </Box>
            </Paper>

            {/* SECTION 9: SERVICE HISTORY EVENT TRACKER */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
                Activity Time Log
              </Typography>
              <Box sx={{ position: 'relative', pl: 3, borderLeft: `2px solid ${tokens.borderColor}` }}>
                {getEventLogs().map((log, idx) => (
                  <Box key={idx} sx={{ position: 'relative', mb: 3 }}>
                    {/* Event Dot */}
                    <Box sx={{ 
                      position: 'absolute', left: '-33px', top: '2px', width: '12px', height: '12px', 
                      borderRadius: '50%', bgcolor: log.active ? '#1A73E8' : '#D1D5DB',
                      border: '2px solid #ffffff'
                    }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                      {log.time}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: log.active ? tokens.colors.primary : 'text.secondary' }}>
                      {log.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {log.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Rating/Feedback card */}
            {booking.status === 'completed' && !booking.rating && (
              <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Submit Service Feedback
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2.5 }}>
                  Let us know about your repair experience
                </Typography>
                <Box sx={{ mb: 2.5 }}>
                  <Rating 
                    value={rating} 
                    onChange={(e, val) => setRating(val)} 
                    size="large" 
                    sx={{ color: tokens.colors.primary }}
                  />
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Review Details"
                  placeholder="Share details about the work done..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  sx={{ mb: 3 }}
                />

                <Button
                  variant="contained"
                  onClick={handleSubmitRating}
                  disabled={submittingRating}
                  sx={{ bgcolor: tokens.colors.primary, color: '#ffffff', borderRadius: '8px', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#23232F' } }}
                >
                  Submit Feedback
                </Button>
              </Paper>
            )}

            {/* Display submitted rating card */}
            {booking.status === 'completed' && booking.rating && (
              <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                  Your Submitted Review
                </Typography>
                <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating 
                    value={booking.rating.rating} 
                    readOnly 
                    size="medium" 
                    sx={{ color: tokens.colors.primary }}
                  />
                  <Typography variant="subtitle2" fontWeight={700}>
                    ({booking.rating.rating}/5)
                  </Typography>
                </Box>
                {booking.rating.review && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', bgcolor: 'rgba(0,0,0,0.01)', p: 2, borderRadius: '8px', borderLeft: '3px solid #ccc' }}>
                    &ldquo;{booking.rating.review}&rdquo;
                  </Typography>
                )}
              </Paper>
            )}

          </Box>
        </Grid>

        {/* RIGHT COLUMN 35% */}
        <Grid item xs={12} lg={4}>
          <Box display="flex" flexDirection="column" gap={3}>
            
            {/* Captain Information */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Service Partner
              </Typography>
              {booking.worker ? (
                <Box>
                  <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2.5 }}>
                    <Avatar 
                      src={booking.worker.profile?.profile_photo} 
                      sx={{ 
                        width: 56, height: 56, 
                        bgcolor: tokens.colors.accentLight, 
                        color: tokens.colors.primary,
                        fontWeight: 700,
                        fontSize: '1.25rem'
                      }}
                    >
                      {booking.worker.full_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {booking.worker.full_name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <StarIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                        <Typography variant="body2" fontWeight={700}>
                          {booking.worker.profile?.rating || '4.8'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • {booking.worker.profile?.experience || '3'} yrs experience
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Phone Contact: <b>{booking.worker.phone}</b>
                  </Typography>

                  <Box display="flex" gap={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PhoneIcon />}
                      href={`tel:${booking.worker.phone}`}
                      sx={{ borderColor: tokens.colors.primary, color: tokens.colors.primary, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                    >
                      Call
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ChatIcon />}
                      onClick={() => toast.success('Chat messaging feature loaded.')}
                      sx={{ bgcolor: tokens.colors.primary, color: '#ffffff', borderRadius: '8px', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#23232F' } }}
                    >
                      Chat
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No Captain assigned yet. Broadcast search is underway...
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Service Location */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Service Location
              </Typography>
              <Box display="flex" gap={1.5} alignItems="flex-start">
                <RoomIcon sx={{ color: tokens.colors.primary, mt: 0.25 }} />
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {booking.address}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    {booking.city}, {booking.state} - {booking.pincode}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Booking Information */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${tokens.borderColor}`, borderRadius: '16px', bgcolor: tokens.colors.paper }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Booking Details
              </Typography>
              <List disablePadding>
                <ListItem sx={{ py: 1, px: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                    Created Timestamp
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {new Date(booking.created_at).toLocaleString('en-IN')}
                  </Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                    Problem Description
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.5, mt: 0.5 }}>
                    {booking.problem_description}
                  </Typography>
                </ListItem>
              </List>
            </Paper>

          </Box>
        </Grid>
      </Grid>


      {/* Payment Selection Modal */}
      <Dialog 
        open={paymentModalOpen} 
        onClose={() => !paying && setPaymentModalOpen(false)}
        PaperProps={{ style: { borderRadius: '16px', padding: '12px' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
          Select Payment Method
        </DialogTitle>
        <DialogContent>
          {paymentSuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" fontWeight="800">Payment Successful!</Typography>
              <Typography variant="body2" color="text.secondary">Earnings deposited to worker's wallet.</Typography>
            </Box>
          ) : (
            <Box sx={{ py: 2 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                {['upi', 'card', 'cash'].map((method) => (
                  <Box key={method}>
                    <Button
                      fullWidth
                      variant={selectedPaymentMethod === method ? 'contained' : 'outlined'}
                      onClick={() => setSelectedPaymentMethod(method)}
                      sx={{
                        py: 1.5,
                        textTransform: 'uppercase',
                        borderRadius: '8px',
                        fontWeight: '700',
                        borderColor: tokens.colors.primary,
                        color: selectedPaymentMethod === method ? '#ffffff' : tokens.colors.primary,
                        background: selectedPaymentMethod === method ? tokens.colors.primary : 'transparent',
                        '&:hover': {
                          background: selectedPaymentMethod === method ? '#23232F' : 'rgba(0,0,0,0.04)',
                          borderColor: tokens.colors.primary,
                        }
                      }}
                    >
                      {method}
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        {!paymentSuccess && (
          <DialogActions>
            <Button onClick={() => setPaymentModalOpen(false)} disabled={paying} sx={{ color: tokens.colors.primary }}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessPayment} 
              variant="contained" 
              disabled={paying}
              sx={{ bgcolor: tokens.colors.primary, color: '#ffffff', borderRadius: '8px' }}
            >
              {paying ? <CircularProgress size={20} color="inherit" /> : 'Pay Now'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

    </Box>
  );
}

export default BookingTracker;
