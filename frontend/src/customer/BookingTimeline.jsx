import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, Typography, Divider, List, ListItem, ListItemText, 
  Dialog, DialogTitle, DialogContent, DialogActions, Rating, TextField, 
  LinearProgress, CircularProgress, Badge, Grid, ListItemIcon,
  IconButton, Avatar
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import api, { buildWsUrl } from '../services/api';
import toast from 'react-hot-toast';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TimelineIcon from '@mui/icons-material/Timeline';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import RoomIcon from '@mui/icons-material/Room';

import { tokens, span } from '../design/tokens';
import { DashboardCard } from '../components/dashboard';

const STATUS_STEPS = [
  { key: 'searching', label: 'Searching' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'on_the_way', label: 'On The Way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'verified', label: 'QR Verified' },
  { key: 'in_progress', label: 'Work Started' },
  { key: 'completed', label: 'Completed' }
];

function BookingTimeline({ bookingId, open, onClose, onRefresh }) {
  const id = bookingId ? String(bookingId) : '';
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
  const searchTimer = useRef(null);

  // Fetch initial details
  const fetchDetails = async () => {
    try {
      const res = await api.get(`/api/bookings/bookings/${id}/`);
      setBooking(res.data);
      
      // Fetch bill if status is completed or bill exists
      if (res.data.status === 'completed' || res.data.status === 'in_progress') {
        try {
          const billRes = await api.get(`/api/billing/${id}/get-bill/`);
          setBill(billRes.data);
        } catch (e) {
          // Bill may not be generated yet
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

  console.log('[BookingTimeline Render] id:', id, 'booking:', booking?.id, 'loading:', loading, 'open:', open);

  useEffect(() => {
    console.log('[BookingTimeline Effect START] id:', id);
    if (!id) return;
    fetchDetails();

    // StrictMode-safe WebSocket with auto-reconnect.
    let isActive = true;
    let socket = null;
    let reconnectTimer = null;

    const connect = () => {
      if (!isActive) return;

      const token = localStorage.getItem('access_token');
      const wsUrl = buildWsUrl(`/ws/bookings/${id}/`, `?token=${token}`);
      console.log('[WS] Connecting to:', wsUrl);
      socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log('[WS] Booking tracker connected, socket readyState:', socket.readyState);
      };

      socket.onmessage = (event) => {
        if (!isActive) return;
        try {
          const payload = JSON.parse(event.data);
          console.log('[WS] Received payload:', payload);
          if (payload.type === 'booking_status') {
            setBooking(payload.booking);
            if (onRefresh) onRefresh();
            if (payload.booking.status === 'completed' || payload.booking.status === 'in_progress') {
              api.get(`/api/billing/${id}/get-bill/`)
                .then(res => setBill(res.data))
                .catch(() => setBill(null));
            }
          }
        } catch (err) {
          console.error('[WS] Message parse error:', err);
        }
      };

      socket.onerror = (err) => {
        console.error('[WS] Error event received:', err);
        socket.close();
      };

      socket.onclose = (event) => {
        console.log('[WS] Close event received. Code:', event.code, 'Reason:', event.reason);
        ws.current = null;
        if (isActive) {
          console.log('[WS] Disconnected. Reconnecting in 3s…');
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      console.log('[BookingTimeline Effect CLEANUP] id:', id);
      isActive = false;
      clearTimeout(reconnectTimer);
      if (socket) {
        console.log('[WS] Closing socket in cleanup…');
        socket.close();
      }
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [id]);

  // Simulate assignment logic
  useEffect(() => {
    if (booking && booking.status === 'searching' && booking.booking_type !== 'instant') {
      if (!searchTimer.current) {
        searchTimer.current = setTimeout(async () => {
          try {
            await api.post(`/api/bookings/bookings/${id}/simulate-assignment/`);
            toast.success('Worker assigned! Simulation update.');
            fetchDetails();
            if (onRefresh) onRefresh();
          } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || 'No available worker registered for this category.');
          }
        }, 8000);
      }
    } else {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
        searchTimer.current = null;
      }
    }
  }, [booking, id]);

  const handleApproveRepair = async (approvalId, statusVal) => {
    try {
      await api.post(`/api/bookings/bookings/${id}/respond-major-repair/`, {
        approval_id: approvalId,
        status: statusVal
      });
      toast.success(`Repair estimate ${statusVal}`);
      fetchDetails();
      if (onRefresh) onRefresh();
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
      if (onRefresh) onRefresh();
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
          if (onRefresh) onRefresh();
        }, 2000);
      } catch (err) {
        toast.error('Payment processing failed');
      } finally {
        setPaying(false);
      }
    }, 1500);
  };

  const handleDownloadInvoice = () => {
    window.open(`http://127.0.0.1:8001/api/billing/${id}/download-invoice/`, '_blank');
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
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (!open) return null;

  const getActiveStepIndex = (status) => {
    switch (status) {
      case 'searching':
        return 0;
      case 'accepted':
        return 1;
      case 'on_the_way':
        return 2;
      case 'arrived':
      case 'verified':
        return 3;
      case 'inspection':
      case 'repair_started':
      case 'in_progress':
      case 'waiting_approval':
      case 'repair_completed':
        return 4;
      case 'completed':
        return 5;
      default:
        return -1;
    }
  };

  const activeStepIndex = booking ? getActiveStepIndex(booking.status) : -1;

  const HORIZONTAL_STEPS = [
    { key: 'searching', label: 'Searching', subtitle: 'Your booking request is currently this step.' },
    { key: 'accepted', label: 'Accepted', subtitle: 'Captain will accept your request.' },
    { key: 'on_the_way', label: 'On The Way', subtitle: 'Captain is on the way to your location.' },
    { key: 'arrived', label: 'Arrived', subtitle: 'Captain has arrived at your location.' },
    { key: 'in_progress', label: 'Work Started', subtitle: 'Work is in progress.' },
    { key: 'completed', label: 'Completed', subtitle: 'Service has been completed.' }
  ];

  const catStyle = booking ? CATEGORY_STYLES[booking.service_category_detail?.name] : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: `${tokens.borderRadius}px`,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: '#FAFAFB',
          boxSizing: 'border-box'
        }
      }}
    >
      {loading ? (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'Outfit, sans-serif' }}>
              Loading Details...
            </Typography>
            <IconButton onClick={onClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 4 }} />
          <Box display="flex" justifyContent="center" alignItems="center" py={8} flex={1}>
            <CircularProgress />
          </Box>
        </>
      ) : !booking ? (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'Outfit, sans-serif' }}>
              Booking Not Found
            </Typography>
            <IconButton onClick={onClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 4 }} />
          <Box py={4}>
            <Typography variant="body1">This service request does not exist or has been removed.</Typography>
          </Box>
        </>
      ) : (
        <>
          {/* Dialog Header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ fontFamily: 'Outfit, sans-serif', color: '#0F0F14' }}>
                Tracking ID: {booking.tracking_id || booking.id}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                Category: {booking.service_category_detail?.name}
              </Typography>
            </Box>
            <IconButton onClick={onClose} edge="end" sx={{ color: '#0F0F14' }}>
              <CloseIcon />
            </IconButton>
          </Box>


      <Divider sx={{ mb: 3 }} />

      {/* Dialog Content Body (Scrollable) */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: { xs: 0, sm: 0.5 }, pb: 2 }}>
        
        {/* Metric summary boxes (Row of 4) */}
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          {/* Card 1: Category */}
          <Grid item xs={6} sm={3}>
            <Box sx={{
              p: 1.5,
              bgcolor: tokens.colors.paper,
              border: `1px solid ${tokens.borderColor}`,
              borderRadius: `${tokens.borderRadiusSm}px`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '6px',
                bgcolor: catStyle?.bgColor || 'rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {catStyle?.icon ? React.cloneElement(catStyle.icon, { sx: { fontSize: 18, color: catStyle.icon.props.sx.color } }) : <HandymanIcon sx={{ fontSize: 18 }} />}
              </Box>
              <Box minWidth={0}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>Category</Typography>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ fontFamily: 'Outfit', color: tokens.colors.primary }}>
                  {booking.service_category_detail?.name}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Card 2: Status */}
          <Grid item xs={6} sm={3}>
            <Box sx={{
              p: 1.5,
              bgcolor: tokens.colors.paper,
              border: `1px solid ${tokens.borderColor}`,
              borderRadius: `${tokens.borderRadiusSm}px`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '6px',
                bgcolor: 'rgba(26,115,232,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1A73E8' }} />
              </Box>
              <Box minWidth={0}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>Status</Typography>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ fontFamily: 'Outfit', color: '#1A73E8' }}>
                  {booking.status.replace(/_/g, ' ').toUpperCase()}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Card 3: Mode */}
          <Grid item xs={6} sm={3}>
            <Box sx={{
              p: 1.5,
              bgcolor: tokens.colors.paper,
              border: `1px solid ${tokens.borderColor}`,
              borderRadius: `${tokens.borderRadiusSm}px`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '6px',
                bgcolor: 'rgba(245,158,11,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <FlashOnIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
              </Box>
              <Box minWidth={0}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>Mode</Typography>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ fontFamily: 'Outfit', color: tokens.colors.primary }}>
                  {booking.booking_type === 'instant' ? 'Instant' : 'Scheduled'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Card 4: Captain */}
          <Grid item xs={6} sm={3}>
            <Box sx={{
              p: 1.5,
              bgcolor: tokens.colors.paper,
              border: `1px solid ${tokens.borderColor}`,
              borderRadius: `${tokens.borderRadiusSm}px`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '6px',
                bgcolor: 'rgba(26,115,232,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <PersonIcon sx={{ color: '#1A73E8', fontSize: 18 }} />
              </Box>
              <Box minWidth={0}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>Captain</Typography>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ fontFamily: 'Outfit', color: tokens.colors.primary }}>
                  {booking.worker?.full_name || 'Searching...'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Left & Right Main Columns */}
        <Grid container spacing={3.5} sx={{ mb: 4 }}>
          
          {/* Left Column: Alerts, Invoices, Approvals, Feedback */}
          <Grid item xs={12} md={7}>
            <Box display="flex" flexDirection="column" gap={3}>
              
              {/* Broadcast / Searching Card */}
              {booking.status === 'searching' ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: `${tokens.cardPadding}px`,
                    border: `1px solid ${tokens.borderColor}`,
                    borderRadius: `${tokens.borderRadius}px`,
                    bgcolor: tokens.colors.paper
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: tokens.colors.primary }}>
                    Assigning service partner...
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontWeight: 500 }}>
                    Broadcasted to nearby available captains
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                      {/* Pulse Circle */}
                      <motion.div
                        animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                          position: 'absolute',
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          background: 'rgba(26, 115, 232, 0.1)',
                          left: 0,
                          top: 0
                        }}
                      />
                      {/* Center Badge */}
                      <Box sx={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, #1A73E8 0%, #1765CC 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(26, 115, 232, 0.3)'
                      }}>
                        <HourglassEmptyIcon sx={{ animation: 'spin 3s linear infinite', fontSize: 28 }} />
                      </Box>
                    </Box>

                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontFamily: 'Outfit', color: tokens.colors.primary }}>
                      Searching for Captains
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '420px', lineHeight: 1.5 }}>
                      Broadcast is live. A nearby worker will pick up your request shortly.
                    </Typography>

                    {booking.booking_type === 'instant' && (
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            await api.post(`/api/bookings/bookings/${booking.id}/simulate-assignment/`);
                            toast.success('Captain assigned via simulation!');
                            fetchDetails();
                            if (onRefresh) onRefresh();
                          } catch (err) {
                            console.error(err);
                            toast.error(err.response?.data?.detail || 'No available workers for simulation.');
                          }
                        }}
                        sx={{
                          bgcolor: tokens.colors.primary,
                          color: '#ffffff',
                          fontWeight: '700',
                          px: 3,
                          py: 1,
                          borderRadius: `${tokens.borderRadiusSm}px`,
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#23232F' }
                        }}
                      >
                        Simulate Captain Acceptance
                      </Button>
                    )}
                  </Box>
                </Paper>
              ) : (
                /* Dynamic tracking summary card for other statuses */
                <Paper
                  elevation={0}
                  sx={{
                    p: `${tokens.cardPadding}px`,
                    border: `1px solid ${tokens.borderColor}`,
                    borderRadius: `${tokens.borderRadius}px`,
                    bgcolor: tokens.colors.paper
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: tokens.colors.primary }}>
                    Service Progress Status
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontWeight: 500 }}>
                    Latest activity and partner comments
                  </Typography>

                  <Box sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
                      {booking.status === 'accepted' && "Your service partner has accepted the request. They will prepare tools and schedule travel shortly."}
                      {booking.status === 'on_the_way' && "The service partner is currently en route to your specified address. Please be ready to receive them."}
                      {booking.status === 'arrived' && "The partner has arrived at your premises. Kindly check their credentials and provide the Check-in Code to begin."}
                      {booking.status === 'verified' && "Check-in completed. The partner has successfully verified credentials and is diagnosing the repair."}
                      {['inspection', 'repair_started', 'in_progress'].includes(booking.status) && "The service partner is actively working on diagnosing and repairing the problem. Progress updates will sync here."}
                      {booking.status === 'waiting_approval' && "Repair estimate submitted. The partner requires your approval for parts replacement costs before completing the task."}
                      {booking.status === 'repair_completed' && "Repairs are finished. The invoice has been prepared. Please review and process the bill payout."}
                      {booking.status === 'completed' && "Service booking successfully completed and closed. Thank you for choosing Workizo!"}
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Major Repair Approvals Card */}
              {booking.major_repairs && booking.major_repairs.length > 0 && (
                <Box>
                  {booking.major_repairs.map((rep) => (
                    <DashboardCard 
                      key={rep.id}
                      title="Major Repair Approval Request"
                      subtitle="Captain requires approval for extra labor/parts estimate"
                      highlight={rep.status === 'pending'}
                    >
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ p: 2, bgcolor: tokens.colors.bg, borderRadius: `${tokens.borderRadiusSm}px` }}>
                          <Typography variant="h6" fontWeight={700}>
                            Estimate: ₹{rep.estimated_cost}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Reason: {rep.reason}
                          </Typography>
                        </Box>

                        {rep.status === 'pending' ? (
                          <Box display="flex" gap={2}>
                            <Button 
                              variant="contained" 
                              color="success"
                              onClick={() => handleApproveRepair(rep.id, 'approved')}
                              sx={{ borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700 }}
                            >
                              Approve Estimate
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error"
                              onClick={() => handleApproveRepair(rep.id, 'rejected')}
                              sx={{ borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700 }}
                            >
                              Reject Estimate
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ 
                            alignSelf: 'flex-start',
                            px: 2, py: 0.5, borderRadius: '20px',
                            bgcolor: rep.status === 'approved' ? 'rgba(22, 163, 74, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                            border: rep.status === 'approved' ? '1px solid rgba(22, 163, 74, 0.15)' : '1px solid rgba(220, 38, 38, 0.15)'
                          }}>
                            <Typography variant="caption" fontWeight={700} color={rep.status === 'approved' ? 'success.main' : 'error.main'}>
                              {rep.status.toUpperCase()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </DashboardCard>
                  ))}
                </Box>
              )}

              {/* Media Upload Verification Section */}
              {(booking.before_photo || booking.after_photo) && (
                <DashboardCard title="Job Inspection Media" subtitle="Verification photo files uploaded by your Captain">
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {booking.before_photo && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Before Repair Photo</Typography>
                        <Box 
                          component="img" 
                          src={`http://127.0.0.1:8001${booking.before_photo}`} 
                          alt="Before repair"
                          sx={{ width: '100%', borderRadius: `${tokens.borderRadiusSm}px`, objectFit: 'cover', border: `1px solid ${tokens.borderColor}` }}
                        />
                      </Grid>
                    )}
                    {booking.after_photo && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>After Repair Photo</Typography>
                        <Box 
                          component="img" 
                          src={`http://127.0.0.1:8001${booking.after_photo}`} 
                          alt="After repair"
                          sx={{ width: '100%', borderRadius: `${tokens.borderRadiusSm}px`, objectFit: 'cover', border: `1px solid ${tokens.borderColor}` }}
                        />
                      </Grid>
                    )}
                  </Grid>
                </DashboardCard>
              )}

              {/* Bill Summary Invoice */}
              {bill && (
                <DashboardCard title="Invoice Detail" subtitle="Summary of work item charges">
                  <List disablePadding>
                    <ListItem sx={{ py: 1.25, px: 0 }}>
                      <ListItemText primary="Service/Labour Charges" />
                      <Typography variant="body2" fontWeight="700">₹{bill.labour_charges}</Typography>
                    </ListItem>
                    <ListItem sx={{ py: 1.25, px: 0 }}>
                      <ListItemText primary="Spare Parts Charges" />
                      <Typography variant="body2" fontWeight="700">₹{bill.parts_charges}</Typography>
                    </ListItem>
                    <ListItem sx={{ py: 1.25, px: 0 }}>
                      <ListItemText primary="GST (18%)" />
                      <Typography variant="body2" fontWeight="700">₹{bill.gst}</Typography>
                    </ListItem>
                    {parseFloat(bill.discount) > 0 && (
                      <ListItem sx={{ py: 1.25, px: 0 }}>
                        <ListItemText primary="Promo Discount" sx={{ color: tokens.colors.success }} />
                        <Typography variant="body2" color="success.main" fontWeight="700">-₹{bill.discount}</Typography>
                      </ListItem>
                    )}
                    <Divider sx={{ my: 1.5 }} />
                    <ListItem sx={{ py: 1.25, px: 0 }}>
                      <ListItemText primary="Total Amount" primaryTypographyProps={{ fontWeight: 700 }} />
                      <Typography variant="h6" fontWeight={700}>
                        ₹{bill.grand_total}
                      </Typography>
                    </ListItem>
                  </List>

                  <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadInvoice}
                      sx={{ borderColor: tokens.colors.primary, color: tokens.colors.primary, borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700 }}
                    >
                      Invoice PDF
                    </Button>
                    
                    {!bill.is_approved ? (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleApproveBill}
                        sx={{ bgcolor: tokens.colors.primary, color: '#ffffff', borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#23232F' } }}
                      >
                        Approve & Pay Invoice
                      </Button>
                    ) : (
                      booking.status !== 'completed' && (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => setPaymentModalOpen(true)}
                          sx={{ bgcolor: tokens.colors.success, color: '#ffffff', borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#15803D' } }}
                        >
                          Proceed to Payment
                        </Button>
                      )
                    )}
                  </Box>
                </DashboardCard>
              )}

              {/* Review rating card */}
              {booking.status === 'completed' && !booking.rating && (
                <DashboardCard title="Feedback Review" subtitle="Share details about the work quality">
                  <Box sx={{ mb: 2 }}>
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
                    label="Share details about the work done..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleSubmitRating}
                    disabled={submittingRating}
                    sx={{ bgcolor: tokens.colors.primary, color: '#ffffff', borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#23232F' } }}
                  >
                    Submit Review
                  </Button>
                </DashboardCard>
              )}

              {/* Display submitted rating card */}
              {booking.status === 'completed' && booking.rating && (
                <DashboardCard title="Your Feedback Review" subtitle="Submitted service quality rating">
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating 
                      value={booking.rating.rating} 
                      readOnly 
                      size="medium" 
                      sx={{ color: tokens.colors.primary }}
                    />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ fontFamily: 'Outfit' }}>
                      ({booking.rating.rating}/5)
                    </Typography>
                  </Box>
                  {booking.rating.review && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      &ldquo;{booking.rating.review}&rdquo;
                    </Typography>
                  )}
                </DashboardCard>
              )}
            </Box>
          </Grid>

          {/* Right Column: Location, Dates, Code, Token, Captain details */}
          <Grid item xs={12} md={5}>
            <Box display="flex" flexDirection="column" gap={3}>
              
              {/* Service Location Card */}
              <Paper
                elevation={0}
                sx={{
                  p: `${tokens.cardPadding}px`,
                  border: `1px solid ${tokens.borderColor}`,
                  borderRadius: `${tokens.borderRadius}px`,
                  bgcolor: tokens.colors.paper
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: tokens.colors.primary }}>
                  Service Location
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontWeight: 500 }}>
                  Address where work is scheduled
                </Typography>

                <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <RoomIcon sx={{ color: '#1A73E8', fontSize: 20, mt: 0.25, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: tokens.colors.primary, lineHeight: 1.4 }}>
                      {booking.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                      {booking.city}, {booking.state} - {booking.pincode}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Booking Details Card */}
              <Paper
                elevation={0}
                sx={{
                  p: `${tokens.cardPadding}px`,
                  border: `1px solid ${tokens.borderColor}`,
                  borderRadius: `${tokens.borderRadius}px`,
                  bgcolor: tokens.colors.paper
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: tokens.colors.primary }}>
                  Booking Details
                </Typography>

                <List disablePadding sx={{ mt: 1.5 }}>
                  <ListItem sx={{ py: 1.25, px: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <CalendarTodayIcon sx={{ color: tokens.colors.textSecondary, fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Booking Date</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: tokens.colors.primary }}>
                      {new Date(booking.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                  </ListItem>

                  <ListItem sx={{ py: 1.25, px: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <AccessTimeIcon sx={{ color: tokens.colors.textSecondary, fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Requested Time</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: tokens.colors.primary }}>
                      {booking.preferred_time || '10:30 AM'}
                    </Typography>
                  </ListItem>

                  <ListItem sx={{ py: 1.25, px: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <FlashOnIcon sx={{ color: tokens.colors.textSecondary, fontSize: 18 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Payment Mode</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: tokens.colors.primary }}>
                      Cash on Delivery
                    </Typography>
                  </ListItem>
                </List>
              </Paper>

              {/* Security Check-in Entry Code */}
              {booking.worker && ['accepted', 'on_the_way', 'arrived'].includes(booking.status) && (
                <DashboardCard title="Security Check-in" subtitle="Provide code on Captain arrival">
                  <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" py={1}>
                    <QrCode2Icon sx={{ fontSize: 56, color: tokens.colors.primary, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Give this unique entry code to your Captain to verify identity and check in.
                    </Typography>
                    <Box sx={{ 
                      p: 2, 
                      border: `2px dashed ${tokens.colors.primary}`, 
                      borderRadius: `${tokens.borderRadiusSm}px`, 
                      bgcolor: tokens.colors.bg,
                      fontFamily: 'monospace',
                      fontSize: '20px',
                      fontWeight: 700,
                      letterSpacing: '1px'
                    }}>
                      {booking.qr_code_value.substring(0, 8).toUpperCase()}
                    </Box>
                  </Box>
                </DashboardCard>
              )}

              {/* Workshop Repair token */}
              {booking.repair_token && (
                <DashboardCard title="Workshop Token" subtitle="Off-site repair status tracker">
                  <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Workshop Token ID</Typography>
                      <Typography variant="h6" fontWeight={700}>{booking.repair_token.token_number}</Typography>
                    </Box>
                    <Box sx={{ 
                      px: 1.5, py: 0.5, borderRadius: '4px',
                      bgcolor: tokens.colors.accentLight,
                      border: '1px solid rgba(26, 115, 232, 0.15)'
                    }}>
                      <Typography variant="caption" fontWeight={700} color="primary">
                        {booking.repair_token.status.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                </DashboardCard>
              )}

              {/* Captain details card */}
              {booking.worker && (
                <DashboardCard title="Assigned Captain" subtitle="Your service partner details">
                  <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" py={1}>
                    <Avatar
                      src={booking.worker.profile_photo ? `http://127.0.0.1:8001${booking.worker.profile_photo}` : ''}
                      sx={{ width: 64, height: 64, mb: 1.5, bgcolor: tokens.colors.accent, fontWeight: 700, fontSize: '24px' }}
                    >
                      {booking.worker.full_name[0]}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ fontFamily: 'Outfit' }}>
                      {booking.worker.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                      ★ 4.8 Rating | {booking.worker.phone}
                    </Typography>

                    <Box display="flex" gap={2} width="100%">
                      <Button 
                        fullWidth
                        variant="outlined" 
                        onClick={() => alert(`Calling Captain at ${booking.worker.phone}...`)}
                        sx={{ borderColor: tokens.colors.primary, color: tokens.colors.primary, borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700 }}
                        startIcon={<PhoneIcon />}
                      >
                        Call
                      </Button>
                      <Button 
                        fullWidth
                        variant="outlined" 
                        onClick={() => alert('Opening live chat simulation...')}
                        sx={{ borderColor: tokens.colors.primary, color: tokens.colors.primary, borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700 }}
                        startIcon={<ChatIcon />}
                      >
                        Chat
                      </Button>
                    </Box>
                  </Box>
                </DashboardCard>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* ── Bottom Section: Track Progress Stepper ──────────────────── */}
        <Paper
          elevation={0}
          sx={{
            p: `${tokens.cardPadding}px`,
            border: `1px solid ${tokens.borderColor}`,
            borderRadius: `${tokens.borderRadius}px`,
            bgcolor: tokens.colors.paper,
            mb: 1
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: tokens.colors.primary }}>
            Track Progress
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontWeight: 500 }}>
            Step timeline updates of your service process
          </Typography>

          {/* Stepper Steps Row */}
          <Box sx={{ position: 'relative', mt: 4, mb: 1, minHeight: 110 }}>
            {/* Background horizontal line */}
            <Box sx={{
              position: 'absolute',
              top: 16,
              left: '8%',
              right: '8%',
              height: '2px',
              bgcolor: '#E5E7EB',
              zIndex: 1
            }} />
            
            {/* Active horizontal progress line overlay */}
            <Box sx={{
              position: 'absolute',
              top: 16,
              left: '8%',
              width: `${activeStepIndex >= 0 ? (activeStepIndex / 5) * 84 : 0}%`,
              height: '2px',
              bgcolor: '#1A73E8',
              zIndex: 1,
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />

            {/* Step circles and text */}
            <Box display="flex" justifyContent="space-between" width="100%">
              {HORIZONTAL_STEPS.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                const isCompleted = activeStepIndex > idx;
                return (
                  <Box
                    key={step.key}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 2,
                      width: '15%',
                      textAlign: 'center'
                    }}
                  >
                    {/* Circle */}
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: isActive ? '#1A73E8' : isCompleted ? '#1A73E8' : '#ffffff',
                      border: `2px solid ${isActive || isCompleted ? '#1A73E8' : '#D1D5DB'}`,
                      color: isActive || isCompleted ? '#ffffff' : tokens.colors.textMuted,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      boxShadow: isActive ? '0 0 0 4px rgba(26, 115, 232, 0.15)' : 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      {idx + 1}
                    </Box>

                    {/* Step label */}
                    <Typography
                      variant="body2"
                      fontWeight={isActive ? 700 : 600}
                      sx={{
                        mt: 1.5,
                        color: isActive || isCompleted ? tokens.colors.primary : tokens.colors.textSecondary,
                        fontSize: '0.85rem'
                      }}
                    >
                      {step.label}
                    </Typography>

                    {/* Step subtitle description (hide on mobile) */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        display: { xs: 'none', md: 'block' },
                        fontSize: '0.7rem',
                        lineHeight: 1.3,
                        maxWidth: 100,
                        mx: 'auto'
                      }}
                    >
                      {step.subtitle}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Dialog Footer Actions */}
      <Divider sx={{ my: 1.5 }} />
      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ pt: 1 }}>
        <Button
          variant="outlined"
          onClick={() => alert('Contacting support line...')}
          sx={{
            borderColor: tokens.borderColor,
            color: tokens.colors.primary,
            borderRadius: `${tokens.borderRadiusSm}px`,
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            py: 1,
            '&:hover': { borderColor: tokens.colors.primary, bgcolor: tokens.colors.bg }
          }}
          startIcon={<HeadsetMicIcon />}
        >
          Contact Support
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: tokens.colors.primary,
            color: '#ffffff',
            borderRadius: `${tokens.borderRadiusSm}px`,
            textTransform: 'none',
            fontWeight: 700,
            px: 3.5,
            py: 1,
            '&:hover': { bgcolor: '#23232F' }
          }}
        >
          Close
        </Button>
      </Box>

    </>
  )}

      {/* Payment Selection Modal */}
      <Dialog 
        open={paymentModalOpen} 
        onClose={() => !paying && setPaymentModalOpen(false)}
        PaperProps={{ style: { borderRadius: `${tokens.borderRadius}px`, padding: '12px' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
          Select Payment Method
        </DialogTitle>
        <DialogContent>
          {paymentSuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" fontWeight="700">Payment Successful!</Typography>
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
                        borderRadius: `${tokens.borderRadiusSm}px`,
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
              sx={{ bgcolor: tokens.colors.primary, color: '#ffffff', borderRadius: `${tokens.borderRadiusSm}px` }}
            >
              {paying ? <CircularProgress size={20} color="inherit" /> : 'Pay Now'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Dialog>
  );
}

export default BookingTimeline;
