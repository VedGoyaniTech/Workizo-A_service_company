import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Card, CardContent, Grid, Button, 
  Divider, List, ListItem, ListItemText, Dialog, DialogTitle, 
  DialogContent, DialogActions, Rating, TextField, LinearProgress,
  Stepper, Step, StepLabel, CircularProgress, Badge
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import MapIcon from '@mui/icons-material/Map';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import HandymanIcon from '@mui/icons-material/Handyman';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

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
    if (booking && booking.status === 'searching') {
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
      <Container sx={{ py: 6 }}>
        <Typography variant="h6">Booking details not found.</Typography>
      </Container>
    );
  }

  const activeStepIndex = STATUS_STEPS.findIndex(step => step.key === booking.status);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* 1. Radar Search Animation */}
      <AnimatePresence>
        {booking.status === 'searching' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ marginBottom: '24px' }}
          >
            <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', textAlign: 'center', py: 6 }}>
              <CardContent>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                  <motion.div
                    animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.08)',
                      left: 0,
                      top: 0
                    }}
                  />
                  <Box sx={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <HourglassEmptyIcon sx={{ animation: 'spin 3s linear infinite' }} />
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight="800" gutterBottom sx={{ fontFamily: 'Outfit, sans-serif' }}>
                  Finding Your Local Captain
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please hold on. We are reaching out to nearest service partners...
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Assigned Worker Card */}
      {booking.worker && (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Box sx={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#FAFAFB',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {booking.worker.profile_photo ? (
                    <img 
                      src={`http://127.0.0.1:8001${booking.worker.profile_photo}`} 
                      alt="captain" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Typography variant="h5" fontWeight="700">{booking.worker.full_name[0]}</Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs>
                <Typography variant="subtitle1" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
                  {booking.worker.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ★ 4.8 Rating | {booking.worker.phone}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                  Status: <span style={{ color: '#000000', fontWeight: 'bold' }}>{booking.status.replace('_', ' ').toUpperCase()}</span>
                </Typography>
              </Grid>
              <Grid item>
                <Grid container spacing={1}>
                  <Grid item>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => alert(`Calling Captain at ${booking.worker.phone}...`)}
                      sx={{ borderColor: '#000000', color: '#000000', borderRadius: '6px', textTransform: 'none' }}
                      startIcon={<PhoneIcon />}
                    >
                      Call
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => alert('Opening live chat simulation...')}
                      sx={{ borderColor: '#000000', color: '#000000', borderRadius: '6px', textTransform: 'none' }}
                      startIcon={<ChatIcon />}
                    >
                      Chat
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 3. Stepper Tracker Timeline */}
      <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            SERVICE TIMELINE
          </Typography>
          <Typography variant="h6" fontWeight="800" gutterBottom sx={{ mb: 4, fontFamily: 'Outfit, sans-serif' }}>
            Track Progress
          </Typography>

          <Stepper activeStep={activeStepIndex >= 0 ? activeStepIndex : 0} orientation="vertical">
            {STATUS_STEPS.map((step, idx) => (
              <Step key={step.key}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      color: activeStepIndex >= idx ? '#000000' : '#E5E7EB',
                      '&.Mui-active': { color: '#000000' },
                      '&.Mui-completed': { color: '#000000' }
                    }
                  }}
                >
                  <Typography fontWeight={activeStepIndex === idx ? '800' : '500'}>
                    {step.label}
                  </Typography>
                  {activeStepIndex === idx && (
                    <Typography variant="caption" color="text.secondary">
                      Current status of your booking
                    </Typography>
                  )}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* 4. QR Verification Drawer */}
      {booking.worker && ['accepted', 'on_the_way', 'arrived'].includes(booking.status) && (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4, textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <QrCode2Icon sx={{ fontSize: 60, mb: 1, color: '#000000' }} />
            <Typography variant="h6" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
              Service Entry QR Code
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Show this code to the Captain when they arrive to initiate check-in.
            </Typography>

            <Box sx={{ 
              display: 'inline-block',
              p: 2, 
              border: '2px dashed #000000', 
              borderRadius: '8px', 
              bg: '#FAFAFB',
              fontFamily: 'monospace',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              {booking.qr_code_value.substring(0, 8).toUpperCase()}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 5. Major Repair Approvals Card */}
      {booking.major_repairs && booking.major_repairs.length > 0 && (
        <Box sx={{ mb: 4 }}>
          {booking.major_repairs.map((rep) => (
            <Card 
              key={rep.id} 
              variant="outlined" 
              sx={{ 
                borderColor: rep.status === 'pending' ? '#ff9800' : '#E5E7EB', 
                borderWidth: rep.status === 'pending' ? '2px' : '1px',
                borderRadius: '8px',
                mb: 2
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container justify="space-between" alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <Typography variant="subtitle2" color="warning.main" fontWeight="700">
                      MAJOR REPAIR APPROVAL REQUEST
                    </Typography>
                    <Typography variant="h6" fontWeight="800" sx={{ mt: 1, fontFamily: 'Outfit, sans-serif' }}>
                      Estimate: ₹{rep.estimated_cost}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reason: {rep.reason}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' }, mt: { xs: 2, sm: 0 } }}>
                    {rep.status === 'pending' ? (
                      <Grid container spacing={1} justify="flex-end">
                        <Grid item>
                          <Button 
                            variant="contained" 
                            color="success"
                            size="small"
                            onClick={() => handleApproveRepair(rep.id, 'approved')}
                            sx={{ borderRadius: '6px', textTransform: 'none' }}
                          >
                            Approve
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button 
                            variant="outlined" 
                            color="error"
                            size="small"
                            onClick={() => handleApproveRepair(rep.id, 'rejected')}
                            sx={{ borderRadius: '6px', textTransform: 'none' }}
                          >
                            Reject
                          </Button>
                        </Grid>
                      </Grid>
                    ) : (
                      <Typography variant="subtitle2" fontWeight="700" color={rep.status === 'approved' ? 'success.main' : 'error.main'}>
                        {rep.status.toUpperCase()}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* 6. Workshop Repair Token Details */}
      {booking.repair_token && (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container justify="space-between">
              <Grid item>
                <Typography variant="subtitle2" color="text.secondary">
                  WORKSHOP REPAIR
                </Typography>
                <Typography variant="h6" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
                  Token: {booking.repair_token.token_number}
                </Typography>
              </Grid>
              <Grid item>
                <Badge color="primary" badgeContent={booking.repair_token.status.replace('_', ' ').toUpperCase()} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 7. Bill Card */}
      {bill && (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="subtitle2" color="text.secondary">
              BILL INVOICE DETAIL
            </Typography>
            <Typography variant="h6" fontWeight="800" sx={{ mb: 3, fontFamily: 'Outfit, sans-serif' }}>
              Service Bill Summary
            </Typography>

            <List disablePadding>
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Service/Labour Charges" />
                <Typography variant="body2">₹{bill.labour_charges}</Typography>
              </ListItem>
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Spare Parts Charges" />
                <Typography variant="body2">₹{bill.parts_charges}</Typography>
              </ListItem>
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="GST (18%)" />
                <Typography variant="body2">₹{bill.gst}</Typography>
              </ListItem>
              {parseFloat(bill.discount) > 0 && (
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Promo Discount" sx={{ color: 'success.main' }} />
                  <Typography variant="body2" color="success.main">-₹{bill.discount}</Typography>
                </ListItem>
              )}
              <Divider sx={{ my: 1.5 }} />
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Total Amount" primaryTypographyProps={{ fontWeight: '800' }} />
                <Typography variant="h6" fontWeight="800">
                  ₹{bill.grand_total}
                </Typography>
              </ListItem>
            </List>

            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadInvoice}
                  sx={{ borderColor: '#000000', color: '#000000', borderRadius: '6px', textTransform: 'none' }}
                >
                  Download Invoice PDF
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                {!bill.is_approved ? (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleApproveBill}
                    sx={{ background: '#000000', color: '#ffffff', borderRadius: '6px', textTransform: 'none' }}
                  >
                    Approve Bill & Pay
                  </Button>
                ) : (
                  booking.status !== 'completed' && (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => setPaymentModalOpen(true)}
                      sx={{ background: '#2e7d32', color: '#ffffff', borderRadius: '6px', textTransform: 'none' }}
                    >
                      Make Payment
                    </Button>
                  )
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 8. Rating & Review Form */}
      {booking.status === 'completed' && !booking.rating && (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="800" sx={{ mb: 1, fontFamily: 'Outfit, sans-serif' }}>
              Rate Your Experience
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your feedback helps us maintain professional safety and quality.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Rating 
                value={rating} 
                onChange={(e, val) => setRating(val)} 
                size="large" 
                sx={{ color: '#000000' }}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Share details about the work done..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              slotProps={{ input: { style: { borderRadius: '6px' } } }}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              onClick={handleSubmitRating}
              disabled={submittingRating}
              sx={{ background: '#000000', color: '#ffffff', px: 4, borderRadius: '6px', textTransform: 'none' }}
            >
              Submit Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment Selection Modal */}
      <Dialog 
        open={paymentModalOpen} 
        onClose={() => !paying && setPaymentModalOpen(false)}
        PaperProps={{ style: { borderRadius: '12px', padding: '12px' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800' }}>
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
              <Grid container spacing={2}>
                {['upi', 'card', 'cash'].map((method) => (
                  <Grid item xs={12} key={method}>
                    <Button
                      fullWidth
                      variant={selectedPaymentMethod === method ? 'contained' : 'outlined'}
                      onClick={() => setSelectedPaymentMethod(method)}
                      sx={{
                        py: 1.5,
                        textTransform: 'uppercase',
                        borderRadius: '6px',
                        fontWeight: '700',
                        borderColor: '#000000',
                        color: selectedPaymentMethod === method ? '#ffffff' : '#000000',
                        background: selectedPaymentMethod === method ? '#000000' : 'transparent',
                        '&:hover': {
                          background: selectedPaymentMethod === method ? '#1a1a1a' : 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      {method}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        {!paymentSuccess && (
          <DialogActions>
            <Button onClick={() => setPaymentModalOpen(false)} disabled={paying} sx={{ color: '#000000' }}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessPayment} 
              variant="contained" 
              disabled={paying}
              sx={{ background: '#000000', color: '#ffffff', borderRadius: '6px' }}
            >
              {paying ? <CircularProgress size={20} color="inherit" /> : 'Pay Now'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Container>
  );
}

export default BookingTimeline;
