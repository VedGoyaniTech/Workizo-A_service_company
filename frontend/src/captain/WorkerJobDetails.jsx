import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Card, CardContent, Grid, Button, 
  Divider, TextField, List, ListItem, ListItemText, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  Badge
} from '@mui/material';
import api from '../services/api';
import toast from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import SendIcon from '@mui/icons-material/Send';
import HandymanIcon from '@mui/icons-material/Handyman';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

function WorkerJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // QR Code Verification
  const [qrCodeInput, setQrCodeInput] = useState('');

  // Major Repair Estimator
  const [repairReason, setRepairReason] = useState('');
  const [repairCost, setRepairCost] = useState('');
  const [requestingRepair, setRequestingRepair] = useState(false);

  // Workshop Token
  const [workshopStatus, setWorkshopStatus] = useState('reached_workshop');
  const [updatingToken, setUpdatingToken] = useState(false);

  // Billing states
  const [labourCharges, setLabourCharges] = useState('');
  const [discount, setDiscount] = useState('');
  const [spareParts, setSpareParts] = useState([{ part_name: '', quantity: 1, price: '' }]);
  const [generatingBill, setGeneratingBill] = useState(false);
  const [existingBill, setExistingBill] = useState(null);

  const ws = useRef(null);

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/api/bookings/bookings/${id}/`);
      setBooking(res.data);

      if (res.data.status === 'completed' || res.data.status === 'in_progress') {
        try {
          const billRes = await api.get(`/api/billing/${id}/get-bill/`);
          setExistingBill(billRes.data);
        } catch (e) {
          setExistingBill(null);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();

    // Establish WebSocket Connection
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const token = localStorage.getItem('access_token');
    ws.current = new WebSocket(`${wsScheme}://127.0.0.1:8001/ws/bookings/${id}/?token=${token}`);

    ws.current.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'booking_status') {
        setBooking(payload.booking);
        // Refresh bill if status completed
        if (payload.booking.status === 'completed' || payload.booking.status === 'in_progress') {
          api.get(`/api/billing/${id}/get-bill/`)
            .then(res => setExistingBill(res.data))
            .catch(() => setExistingBill(null));
        }
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [id]);

  const updateJobStatus = async (newStatus) => {
    setSubmitting(true);
    try {
      const res = await api.post(`/api/bookings/bookings/${id}/update-status/`, {
        status: newStatus
      });
      setBooking(res.data);
      toast.success(`Job status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyQR = async () => {
    if (!qrCodeInput) return toast.error('Please enter the customer QR code value');
    setSubmitting(true);
    try {
      const res = await api.post(`/api/bookings/bookings/${id}/verify-qr/`, {
        qr_code_value: qrCodeInput.toLowerCase()
      });
      if (res.data.verified) {
        toast.success('QR verified! Check-in successful.');
        setBooking(res.data.booking);
      } else {
        toast.error('Invalid QR code. Please double check.');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestMajorRepair = async () => {
    if (!repairReason || !repairCost) return toast.error('Enter estimate and reason');
    setRequestingRepair(true);
    try {
      await api.post(`/api/bookings/bookings/${id}/request-major-repair/`, {
        reason: repairReason,
        estimated_cost: repairCost
      });
      toast.success('Repair request submitted. Waiting for customer response.');
      setRepairReason('');
      setRepairCost('');
      fetchJobDetails();
    } catch (err) {
      toast.error('Failed to send request');
    } finally {
      setRequestingRepair(false);
    }
  };

  const handleUpdateWorkshopToken = async () => {
    setUpdatingToken(true);
    try {
      await api.post(`/api/bookings/bookings/${id}/update-repair-token/`, {
        status: workshopStatus
      });
      toast.success('Workshop repair token updated.');
      fetchJobDetails();
    } catch (err) {
      toast.error('Failed to update workshop status');
    } finally {
      setUpdatingToken(false);
    }
  };

  // Billing spare parts handlers
  const handleAddPart = () => {
    setSpareParts([...spareParts, { part_name: '', quantity: 1, price: '' }]);
  };

  const handleRemovePart = (index) => {
    const list = [...spareParts];
    list.splice(index, 1);
    setSpareParts(list);
  };

  const handlePartChange = (index, field, value) => {
    const list = [...spareParts];
    list[index][field] = value;
    setSpareParts(list);
  };

  const handleGenerateBill = async () => {
    if (!labourCharges) return toast.error('Labour charges are required');
    setGeneratingBill(true);

    const formattedParts = spareParts.filter(p => p.part_name && p.price);

    try {
      const res = await api.post(`/api/billing/${id}/generate-bill/`, {
        labour_charges: labourCharges,
        discount: discount || 0,
        items: formattedParts
      });
      setExistingBill(res.data);
      toast.success('Invoice generated. Customer notified.');
      fetchJobDetails();
    } catch (err) {
      toast.error('Invoice compilation failed');
    } finally {
      setGeneratingBill(false);
    }
  };

  const handleDownloadInvoice = () => {
    window.open(`http://127.0.0.1:8001/api/billing/${id}/download-invoice/`, '_blank');
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!booking) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h6">Job detail not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/captain/dashboard')}
        sx={{ mb: 3, color: '#000000', textTransform: 'none' }}
      >
        Back to Jobs
      </Button>

      <Grid container justify="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Grid item>
          <Typography variant="h4" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
            Job #{booking.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Service: {booking.service_category_detail?.name} | {booking.problem_type}
          </Typography>
        </Grid>
        <Grid item>
          <Badge color="primary" badgeContent={booking.status.replace('_', ' ').toUpperCase()} />
        </Grid>
      </Grid>

      {/* Customer Info Card */}
      <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            CUSTOMER DETAILS
          </Typography>
          <Typography variant="subtitle1" fontWeight="700">
            {booking.customer.full_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phone: {booking.customer.phone}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Address: {booking.address}, {booking.city}, {booking.state} - {booking.pincode}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Scheduled Date/Time: <b>{booking.preferred_date} ({booking.preferred_time})</b>
          </Typography>
          {booking.problem_description && (
            <Box sx={{ mt: 2, p: 2, bg: '#FAFAFB', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
              <Typography variant="caption" color="text.secondary" display="block">Description:</Typography>
              <Typography variant="body2">{booking.problem_description}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Journey Buttons Actions */}
      <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="800" sx={{ mb: 3, fontFamily: 'Outfit, sans-serif' }}>
            Journey & Work Checkpoints
          </Typography>

          {booking.status === 'accepted' && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => updateJobStatus('on_the_way')}
              disabled={submitting}
              sx={{ background: '#000000', color: '#ffffff', py: 1.5, borderRadius: '6px' }}
            >
              Start Journey (On the Way)
            </Button>
          )}

          {booking.status === 'on_the_way' && (
            <Button
              fullWidth
              variant="contained"
              onClick={() => updateJobStatus('arrived')}
              disabled={submitting}
              sx={{ background: '#000000', color: '#ffffff', py: 1.5, borderRadius: '6px' }}
            >
              Arrived at Location
            </Button>
          )}

          {booking.status === 'arrived' && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the check-in verification code provided by the customer to start working:
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <TextField
                    fullWidth
                    label="Enter QR Verification Token"
                    placeholder="e.g. A1B2C3D4"
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    slotProps={{ input: { style: { borderRadius: '6px' } } }}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={handleVerifyQR}
                    disabled={submitting}
                    startIcon={<QrCodeScannerIcon />}
                    sx={{ background: '#000000', color: '#ffffff', py: 2, px: 3, borderRadius: '6px', textTransform: 'none' }}
                  >
                    Verify QR
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {booking.status === 'verified' && (
            <Button
              fullWidth
              variant="contained"
              onClick={() => updateJobStatus('in_progress')}
              disabled={submitting}
              sx={{ background: '#000000', color: '#ffffff', py: 1.5, borderRadius: '6px' }}
            >
              Start Work
            </Button>
          )}

          {['in_progress', 'completed'].includes(booking.status) && (
            <Typography variant="body1" fontWeight="700" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 1 }} /> Verification Complete & Work Initiated.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Work Execution Actions (In Progress) */}
      {booking.status === 'in_progress' && (
        <>
          {/* A. Request Major Repair Approval */}
          <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1, fontFamily: 'Outfit, sans-serif' }}>
                Major Repair Payout Estimate
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                If you find a major issue that costs extra, request cost approval from customer.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Reason / Part Description"
                    placeholder="e.g. Copper Pipe Replacement"
                    value={repairReason}
                    onChange={(e) => setRepairReason(e.target.value)}
                    slotProps={{ input: { style: { borderRadius: '6px' } } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Estimated Cost (₹)"
                    type="number"
                    value={repairCost}
                    onChange={(e) => setRepairCost(e.target.value)}
                    slotProps={{ input: { style: { borderRadius: '6px' } } }}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                onClick={handleRequestMajorRepair}
                disabled={requestingRepair}
                sx={{ mt: 3, background: '#000000', color: '#ffffff', borderRadius: '6px', textTransform: 'none' }}
              >
                Send Request
              </Button>

              {/* Approval status check */}
              {booking.major_repairs && booking.major_repairs.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">Submitted Estimates:</Typography>
                  {booking.major_repairs.map((rep) => (
                    <ListItem key={rep.id} sx={{ px: 0 }}>
                      <ListItemText primary={rep.reason} secondary={`Estimate: ₹${rep.estimated_cost}`} />
                      <Typography variant="subtitle2" fontWeight="800" color={rep.status === 'approved' ? 'success.main' : rep.status === 'rejected' ? 'error.main' : 'warning.main'}>
                        {rep.status.toUpperCase()}
                      </Typography>
                    </ListItem>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* B. Workshop Repairs (Token updates) */}
          <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1, fontFamily: 'Outfit, sans-serif' }}>
                Workshop Repair Status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                For repairs that cannot be done on-site, assign a workshop tracking token.
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    select
                    fullWidth
                    label="Select Workshop Milestone"
                    value={workshopStatus}
                    onChange={(e) => setWorkshopStatus(e.target.value)}
                    slotProps={{ input: { style: { borderRadius: '6px' } } }}
                  >
                    <option value="reached_workshop">Reached Workshop</option>
                    <option value="inspection">Inspection</option>
                    <option value="repair_started">Repair Started</option>
                    <option value="waiting_parts">Waiting For Parts</option>
                    <option value="repair_completed">Repair Completed</option>
                    <option value="returning">Returning</option>
                    <option value="delivered">Delivered</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleUpdateWorkshopToken}
                    disabled={updatingToken}
                    sx={{ background: '#000000', color: '#ffffff', py: 1.8, borderRadius: '6px', textTransform: 'none' }}
                  >
                    Update Token Status
                  </Button>
                </Grid>
              </Grid>

              {booking.repair_token && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    Current Active Token: <b>{booking.repair_token.token_number}</b> | Milestone: <b>{booking.repair_token.status.replace('_', ' ').toUpperCase()}</b>
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* C. Spare Parts & Billing Form */}
          {!existingBill ? (
            <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 1, fontFamily: 'Outfit, sans-serif' }}>
                  Generate Billing Summary
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Fill out service fee details and any spare parts used to compile the final invoice.
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Service / Labour Fee (₹)"
                      type="number"
                      value={labourCharges}
                      onChange={(e) => setLabourCharges(e.target.value)}
                      slotProps={{ input: { style: { borderRadius: '6px' } } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Promo Discount (₹)"
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      slotProps={{ input: { style: { borderRadius: '6px' } } }}
                    />
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: '700' }}>
                  Spare Parts Used:
                </Typography>

                {spareParts.map((part, index) => (
                  <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={7}>
                      <TextField
                        fullWidth
                        label="Spare Part Name"
                        value={part.part_name}
                        onChange={(e) => handlePartChange(index, 'part_name', e.target.value)}
                        slotProps={{ input: { style: { borderRadius: '6px' } } }}
                      />
                    </Grid>
                    <Grid item xs={3} sm={2}>
                      <TextField
                        fullWidth
                        label="Qty"
                        type="number"
                        value={part.quantity}
                        onChange={(e) => handlePartChange(index, 'quantity', e.target.value)}
                        slotProps={{ input: { style: { borderRadius: '6px' } } }}
                      />
                    </Grid>
                    <Grid item xs={3} sm={2}>
                      <TextField
                        fullWidth
                        label="Price (₹)"
                        type="number"
                        value={part.price}
                        onChange={(e) => handlePartChange(index, 'price', e.target.value)}
                        slotProps={{ input: { style: { borderRadius: '6px' } } }}
                      />
                    </Grid>
                    {spareParts.length > 1 && (
                      <Grid item xs={12} sm={1}>
                        <IconButton color="error" onClick={() => handleRemovePart(index)}>
                          <RemoveCircleOutlinedIcon />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                ))}

                <Button
                  startIcon={<AddCircleOutlinedIcon />}
                  onClick={handleAddPart}
                  sx={{ color: '#000000', mb: 3, textTransform: 'none' }}
                >
                  Add Another Spare Part
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGenerateBill}
                  disabled={generatingBill}
                  sx={{ background: '#000000', color: '#ffffff', py: 1.5, borderRadius: '6px' }}
                >
                  Generate & Submit Bill
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">INVOICE SUBMITTED</Typography>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 2, fontFamily: 'Outfit, sans-serif' }}>
                  Grand Total: ₹{existingBill.grand_total}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Status: <b>{existingBill.is_approved ? 'Approved by customer (Awaiting Payment)' : 'Pending Customer Approval'}</b>
                </Typography>

                <Button
                  variant="outlined"
                  onClick={handleDownloadInvoice}
                  sx={{ borderColor: '#000000', color: '#000000', borderRadius: '6px', textTransform: 'none' }}
                >
                  Download Invoice PDF
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Completed Job Status Info */}
      {booking.status === 'completed' && (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '8px', mb: 4, bgcolor: '#FAFAFB' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
            <Typography variant="h6" fontWeight="800">Job Complete</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Payment has been cleared and funds credited to your wallet balance.
            </Typography>
            
            {existingBill && (
              <Button
                variant="outlined"
                onClick={handleDownloadInvoice}
                sx={{ borderColor: '#000000', color: '#000000', borderRadius: '6px', textTransform: 'none' }}
              >
                View PDF Summary
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default WorkerJobDetails;
