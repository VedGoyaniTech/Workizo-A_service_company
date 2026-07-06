import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Button, Typography, Divider, List, ListItem, ListItemText, 
  Dialog, DialogTitle, DialogContent, DialogActions, Rating, TextField, 
  LinearProgress, CircularProgress, Badge, Grid, ListItemIcon
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TimelineIcon from '@mui/icons-material/Timeline';
import InfoIcon from '@mui/icons-material/Info';

import { tokens, span } from '../design/tokens';
import { 
  DashboardPage, DashboardGrid, DashboardCard, 
  SummaryCard, SummaryGrid 
} from '../components/dashboard';

const STATUS_STEPS = [
  { key: 'searching', label: 'Searching' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'on_the_way', label: 'On The Way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'verified', label: 'QR Verified' },
  { key: 'in_progress', label: 'Work Started' },
  { key: 'completed', label: 'Completed' }
];

function BookingTimeline() {
  const { id } = useParams();
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

  useEffect(() => {
    fetchDetails();

    // Establish WebSocket Connection
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const token = localStorage.getItem('access_token');
    ws.current = new WebSocket(`${wsScheme}://127.0.0.1:8001/ws/bookings/${id}/?token=${token}`);

    ws.current.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'booking_status') {
        setBooking(payload.booking);
        // Refresh invoice/bill if updated
        if (payload.booking.status === 'completed' || payload.booking.status === 'in_progress') {
          api.get(`/api/billing/${id}/get-bill/`)
            .then(res => setBill(res.data))
            .catch(() => setBill(null));
        }
      }
    };

    ws.current.onclose = () => {
      console.log('WS Connection closed');
    };

    return () => {
      if (ws.current) ws.current.close();
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
    } catch (err) {
      toast.error('Failed to submit estimate response');
    }
  };

  const handleApproveBill = async () => {
    try {
      const res = await api.post(`/api/billing/${id}/approve-bill/`);
      setBill(res.data);
      toast.success('Bill invoice approved successfully.');
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
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!booking) {
    return (
      <DashboardPage title="Booking Timeline" description="Booking details not found.">
        <Typography variant="body1">This service request does not exist or has been removed.</Typography>
      </DashboardPage>
    );
  }

  const activeStepIndex = STATUS_STEPS.findIndex(step => step.key === booking.status);

  const summary = (
    <SummaryGrid columns={4}>
      <SummaryCard
        label="Service Category"
        value={booking.service_category_detail?.name || 'Loading...'}
        icon={<TimelineIcon />}
        accentColor="#1A73E8"
        loading={loading}
      />
      <SummaryCard
        label="Service Status"
        value={booking.status.replace('_', ' ').toUpperCase()}
        icon={<InfoIcon />}
        accentColor={booking.status === 'completed' ? '#34A853' : '#FBBC05'}
        loading={loading}
      />
      <SummaryCard
        label="Booking Mode"
        value={booking.booking_type === 'instant' ? 'Instant Service' : 'Slot Scheduled'}
        icon={<AccessTimeIcon />}
        accentColor="#EA4335"
        loading={loading}
      />
      <SummaryCard
        label="Assigned Captain"
        value={booking.worker ? booking.worker.full_name : 'Searching...'}
        icon={<HourglassEmptyIcon />}
        accentColor="#8F00FF"
        loading={loading}
      />
    </SummaryGrid>
  );

  return (
    <DashboardPage
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Dashboard', path: '/customer/dashboard' },
        { label: 'Service Timeline' }
      ]}
      title={`Tracking ID: ${booking.tracking_id || booking.id}`}
      description="Monitor progress, verify security codes, and check repair bills in real-time."
      summary={summary}
      actions={
        <Button
          variant="outlined"
          onClick={() => navigate('/customer/dashboard')}
          sx={{ borderColor: tokens.colors.primary, color: tokens.colors.primary, borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700 }}
        >
          Back to Dashboard
        </Button>
      }
    >
      <DashboardGrid>
        {/* Left Column: Timeline and Progress Details */}
        <Box sx={span.twoThirds}>
          <Box display="flex" flexDirection="column" gap={3}>
            
            {/* Searching Radar Alert */}
            <AnimatePresence>
              {booking.status === 'searching' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <DashboardCard title="Assigning service partner..." subtitle="Broadcasted to nearby available captains">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                        <motion.div
                          animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                          style={{
                            position: 'absolute',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(26, 115, 232, 0.08)',
                            left: 0,
                            top: 0
                          }}
                        />
                        <Box sx={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: tokens.colors.accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff'
                        }}>
                          <HourglassEmptyIcon sx={{ animation: 'spin 3s linear infinite' }} />
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                        Searching for Captains
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '400px' }}>
                        {booking.booking_type === 'instant' 
                          ? 'Broadcast is live. A nearby worker will pick up your request shortly.' 
                          : 'Please hold. Reaching out to local service specialists.'}
                      </Typography>
                      
                      {booking.booking_type === 'instant' && (
                        <Button
                          variant="contained"
                          onClick={async () => {
                            try {
                              await api.post(`/api/bookings/bookings/${id}/simulate-assignment/`);
                              toast.success('Captain assigned via simulation!');
                              fetchDetails();
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
                            borderRadius: `${tokens.borderRadiusSm}px`,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#23232F' }
                          }}
                        >
                          Simulate Captain Acceptance
                        </Button>
                      )}
                    </Box>
                  </DashboardCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Timeline Card */}
            <DashboardCard title="Track Progress" subtitle="Step timeline updates of your service process">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2 }}>
                {STATUS_STEPS.map((step, idx) => {
                  const isActive = activeStepIndex === idx;
                  const isCompleted = activeStepIndex > idx;
                  return (
                    <Box 
                      key={step.key} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        position: 'relative',
                        gap: 3
                      }}
                    >
                      {/* Vertical line connecting markers */}
                      {idx < STATUS_STEPS.length - 1 && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 28,
                            bottom: -32,
                            left: 14,
                            width: '2px', 
                            bgcolor: isCompleted ? tokens.colors.primary : tokens.colors.borderColor,
                            zIndex: 1
                          }}
                        />
                      )}

                      {/* Step Circle */}
                      <Box sx={{ 
                          width: 30, 
                          height: 30, 
                          borderRadius: '50%', 
                          bgcolor: isActive ? tokens.colors.primary : isCompleted ? tokens.colors.primary : '#ffffff', 
                          border: `2px solid ${isActive || isCompleted ? tokens.colors.primary : tokens.colors.borderColor}`,
                          color: isActive || isCompleted ? '#ffffff' : tokens.colors.textMuted,
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          zIndex: 2,
                          boxShadow: isActive ? `0 0 0 4px ${tokens.colors.accentLight}` : 'none',
                          transition: tokens.transition,
                        }}
                      >
                        {idx + 1}
                      </Box>
 
                      {/* Step Info */}
                      <Box sx={{ flex: 1, pt: 0.25 }}>
                        <Typography 
                          sx={{ 
                            fontSize: '1rem', 
                            fontWeight: isActive ? 700 : isCompleted ? 600 : 500, 
                            color: isActive || isCompleted ? tokens.colors.primary : tokens.colors.textSecondary,
                            fontFamily: 'Outfit, sans-serif'
                          }}
                        >
                          {step.label}
                        </Typography>
                        {isActive && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Your booking request is currently at this step.
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </DashboardCard>

            {/* Media Upload Verification Section */}
            {(booking.before_photo || booking.after_photo) && (
              <DashboardCard title="Job Inspection Media" subtitle="Verification photo files uploaded by your Captain">
                <DashboardGrid sx={{ mt: 1 }}>
                  {booking.before_photo && (
                    <Box sx={span.half}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Before Repair Photo</Typography>
                      <Box 
                        component="img" 
                        src={`http://127.0.0.1:8001${booking.before_photo}`} 
                        alt="Before repair"
                        sx={{ width: '100%', borderRadius: `${tokens.borderRadiusSm}px`, objectFit: 'cover', border: `1px solid ${tokens.borderColor}` }}
                      />
                    </Box>
                  )}
                  {booking.after_photo && (
                    <Box sx={span.half}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>After Repair Photo</Typography>
                      <Box 
                        component="img" 
                        src={`http://127.0.0.1:8001${booking.after_photo}`} 
                        alt="After repair"
                        sx={{ width: '100%', borderRadius: `${tokens.borderRadiusSm}px`, objectFit: 'cover', border: `1px solid ${tokens.borderColor}` }}
                      />
                    </Box>
                  )}
                </DashboardGrid>
              </DashboardCard>
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
          </Box>
        </Box>

        {/* Right Column: Captain details, QR Verification, Billing & reviews */}
        <Box sx={span.oneThird}>
          <Box display="flex" flexDirection="column" gap={3}>
            
            {/* Captain details card */}
            {booking.worker && (
              <DashboardCard title="Assigned Captain" subtitle="Your service partner details">
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" py={2}>
                  <Avatar
                    src={booking.worker.profile_photo ? `http://127.0.0.1:8001${booking.worker.profile_photo}` : ''}
                    sx={{ width: 72, height: 72, mb: 2, bgcolor: tokens.colors.accent, fontWeight: 700, fontSize: '28px' }}
                  >
                    {booking.worker.full_name[0]}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {booking.worker.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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

            {/* Service Entry QR Code */}
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
                <Box display="flex" justify="space-between" align="center" py={1}>
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
          </Box>
        </Box>
      </DashboardGrid>

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
    </DashboardPage>
  );
}

export default BookingTimeline;
