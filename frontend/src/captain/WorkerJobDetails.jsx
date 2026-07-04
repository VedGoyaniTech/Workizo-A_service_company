import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Card, CardContent, Grid, Button, 
  Divider, TextField, List, ListItem, ListItemText, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress,
  Badge, Stepper, Step, StepLabel, DialogContentText
} from '@mui/material';
import api from '../services/api';
import toast from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import HandymanIcon from '@mui/icons-material/Handyman';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const JOB_TIMELINE = [
  { key: 'accepted', label: 'Accepted' },
  { key: 'on_the_way', label: 'Travelling' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'verified', label: 'Verified' },
  { key: 'inspection', label: 'Inspection' },
  { key: 'repair_started', label: 'Repair Started' },
  { key: 'repair_completed', label: 'Repair Completed' },
  { key: 'waiting_approval', label: 'Waiting for Customer Approval' },
  { key: 'completed', label: 'Completed' }
];

function WorkerJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // QR Code Verification
  const [qrCodeInput, setQrCodeInput] = useState('');

  // Cancel Warning Modal
  const [cancelWarningOpen, setCancelWarningOpen] = useState(false);

  // Major Repair Estimator
  const [repairReason, setRepairReason] = useState('');
  const [repairCost, setRepairCost] = useState('');
  const [requestingRepair, setRequestingRepair] = useState(false);

  // Workshop Token
  const [workshopStatus, setWorkshopStatus] = useState('item_received');
  const [updatingToken, setUpdatingToken] = useState(false);

  // Media upload files
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [sparePartPhoto, setSparePartPhoto] = useState(null);
  const [invoicePhoto, setInvoicePhoto] = useState(null);
  const [optionalVideo, setOptionalVideo] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Billing states
  const [labourCharges, setLabourCharges] = useState('');
  const [discount, setDiscount] = useState('');
  const [spareParts, setSpareParts] = useState([{ part_name: '', quantity: 1, price: '' }]);
  const [supplierInvoice, setSupplierInvoice] = useState(null);
  const [generatingBill, setGeneratingBill] = useState(false);
  const [existingBill, setExistingBill] = useState(null);

  const ws = useRef(null);

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/api/bookings/bookings/${id}/`);
      setBooking(res.data);

      if (['completed', 'waiting_approval', 'repair_completed'].includes(res.data.status)) {
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

    // Establish WebSocket Connection for real-time customer updates
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const token = localStorage.getItem('access_token');
    ws.current = new WebSocket(`${wsScheme}://127.0.0.1:8001/ws/bookings/${id}/?token=${token}`);

    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'booking_status') {
          setBooking(payload.booking);
          // Refresh bill if status completed
          if (['completed', 'waiting_approval', 'repair_completed'].includes(payload.booking.status)) {
            api.get(`/api/billing/${id}/get-bill/`)
              .then(res => setExistingBill(res.data))
              .catch(() => setExistingBill(null));
          }
        }
      } catch (err) {
        console.error(err);
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

  const handleCancelBooking = async () => {
    setSubmitting(true);
    setCancelWarningOpen(false);
    try {
      await api.post(`/api/bookings/bookings/${id}/update-status/`, {
        status: 'cancelled'
      });
      toast.success('Job booking cancelled successfully.');
      navigate('/captain/dashboard');
    } catch (err) {
      toast.error('Failed to cancel booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyQR = async () => {
    if (!qrCodeInput) return toast.error('Please enter the customer QR code value');
    setSubmitting(true);
    try {
      const res = await api.post(`/api/bookings/bookings/${id}/verify-qr/`, {
        qr_code_value: qrCodeInput.trim().toLowerCase()
      });
      if (res.data.verified) {
        toast.success('QR verified! Check-in successful.');
        setBooking(res.data.booking);
      } else {
        toast.error('Invalid QR code. Please check with customer.');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadMedia = async () => {
    setUploadingMedia(true);
    const formData = new FormData();
    formData.appends = (key, file) => { if (file) formData.append(key, file); };
    formData.appends('status', booking.status); // keeps current status
    
    if (beforePhoto) formData.append('before_photo', beforePhoto);
    if (afterPhoto) formData.append('after_photo', afterPhoto);
    if (sparePartPhoto) formData.append('spare_part_photo', sparePartPhoto);
    if (invoicePhoto) formData.append('invoice_photo', invoicePhoto);
    if (optionalVideo) formData.append('optional_video', optionalVideo);

    try {
      const res = await api.post(`/api/bookings/bookings/${id}/update-status/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBooking(res.data);
      toast.success('Service media files uploaded successfully.');
      
      // Reset selected states
      setBeforePhoto(null);
      setAfterPhoto(null);
      setSparePartPhoto(null);
      setInvoicePhoto(null);
      setOptionalVideo(null);
    } catch (e) {
      toast.error('Failed to upload media files');
    } finally {
      setUploadingMedia(false);
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
    const formData = new FormData();
    formData.append('labour_charges', labourCharges);
    formData.append('discount', discount || 0);
    formData.append('items', JSON.stringify(formattedParts));
    if (supplierInvoice) {
      formData.append('supplier_invoice', supplierInvoice);
    }

    try {
      const res = await api.post(`/api/billing/${id}/generate-bill/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setExistingBill(res.data);
      toast.success('Invoice generated. Waiting for customer payment.');
      
      // Advance to waiting for customer approval status
      await updateJobStatus('waiting_approval');
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

  const activeStepIdx = JOB_TIMELINE.findIndex(step => step.key === booking.status);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/captain/dashboard')}
          sx={{ color: '#000000', textTransform: 'none' }}
        >
          Back to Jobs Board
        </Button>

        {['accepted', 'on_the_way', 'arrived'].includes(booking.status) && (
          <Button 
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />} 
            onClick={() => setCancelWarningOpen(true)}
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            Cancel Job
          </Button>
        )}
      </Box>

      {/* Main title */}
      <Grid container justify="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Grid item xs>
          <Typography variant="h4" fontWeight="900" sx={{ fontFamily: 'Outfit, sans-serif' }}>
            Job Booking #{booking.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Service: <b>{booking.service_category_detail?.name} ({booking.problem_type})</b>
          </Typography>
        </Grid>
        <Grid item>
          <Badge 
            color="primary" 
            badgeContent={booking.status.replace('_', ' ').toUpperCase()} 
            sx={{ 
              '& .MuiBadge-badge': { 
                height: 24, fontSize: 11, fontWeight: '800', px: 1.5, py: 0.5 
              } 
            }}
          />
        </Grid>
      </Grid>

      {/* Service Progress Tracker Timeline */}
      <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: '850' }}>
            SERVICE TIMELINE CHECKPOINTS
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Stepper activeStep={activeStepIdx >= 0 ? activeStepIdx : 0} alternativeLabel>
              {JOB_TIMELINE.map((step) => (
                <Step key={step.key}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        color: activeStepIdx >= JOB_TIMELINE.findIndex(s => s.key === step.key) ? '#1A73E8' : '#E5E7EB',
                        '&.Mui-active': { color: '#1A73E8' },
                        '&.Mui-completed': { color: '#1A73E8' }
                      }
                    }}
                  >
                    <Typography variant="caption" fontWeight="800">
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </CardContent>
      </Card>

      {/* Customer Info Card */}
      <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: '850' }}>
            CUSTOMER CONTACT & DIRECTIONS
          </Typography>
          <Typography variant="subtitle1" fontWeight="800" sx={{ mt: 1.5 }}>
            {booking.customer?.full_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phone Contact: <b>{booking.customer?.phone}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Location: <b>{booking.address}, {booking.city}, {booking.state} - {booking.pincode}</b>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Schedule Slot: <b>{booking.preferred_date} | {booking.preferred_time}</b>
          </Typography>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: '#FAFAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <Typography variant="caption" color="text.secondary" display="block">Problem Description Details:</Typography>
            <Typography variant="body2">{booking.problem_description || 'No detailed explanation provided.'}</Typography>
          </Box>

          <Box display="flex" gap={1.5} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.open(`tel:${booking.customer?.phone}`)}
              sx={{ borderColor: '#000000', color: '#000000', textTransform: 'none', borderRadius: '8px' }}
            >
              Call Customer
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(booking.address)}`)}
              sx={{ borderColor: '#000000', color: '#000000', textTransform: 'none', borderRadius: '8px' }}
            >
              Navigate to Address
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Checkpoints Actions Card */}
      <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="900" sx={{ mb: 2, fontFamily: 'Outfit, sans-serif' }}>
            Execute Service Milestones
          </Typography>

          {booking.status === 'accepted' && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => updateJobStatus('on_the_way')}
              disabled={submitting}
              sx={{ bgcolor: '#1A73E8', color: '#ffffff', py: 1.5, borderRadius: '8px', fontWeight: '800' }}
            >
              Start Journey (Travelling)
            </Button>
          )}

          {booking.status === 'on_the_way' && (
            <Button
              fullWidth
              variant="contained"
              onClick={() => updateJobStatus('arrived')}
              disabled={submitting}
              sx={{ bgcolor: '#1A73E8', color: '#ffffff', py: 1.5, borderRadius: '8px', fontWeight: '800' }}
            >
              Arrived at Customer Location
            </Button>
          )}

          {booking.status === 'arrived' && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Scan or enter the verification check-in QR token generated on the Customer's app to unlock the service:
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <TextField
                    fullWidth
                    label="Enter Customer QR Value"
                    placeholder="e.g. 8-digit uuid start"
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    slotProps={{ input: { style: { borderRadius: '8px' } } }}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={handleVerifyQR}
                    disabled={submitting}
                    startIcon={<QrCodeScannerIcon />}
                    sx={{ bgcolor: '#000000', color: '#ffffff', py: 2, px: 3, borderRadius: '8px', textTransform: 'none' }}
                  >
                    Check-in (Verify QR)
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {booking.status === 'verified' && (
            <Button
              fullWidth
              variant="contained"
              onClick={() => updateJobStatus('inspection')}
              disabled={submitting}
              sx={{ bgcolor: '#1A73E8', color: '#ffffff', py: 1.5, borderRadius: '8px', fontWeight: '800' }}
            >
              Initiate Inspection
            </Button>
          )}

          {booking.status === 'inspection' && (
            <Button
              fullWidth
              variant="contained"
              onClick={() => updateJobStatus('repair_started')}
              disabled={submitting}
              sx={{ bgcolor: '#1A73E8', color: '#ffffff', py: 1.5, borderRadius: '8px', fontWeight: '800' }}
            >
              Start Repair Work
            </Button>
          )}

          {booking.status === 'repair_started' && (
            <Button
              fullWidth
              variant="contained"
              onClick={() => updateJobStatus('repair_completed')}
              disabled={submitting}
              sx={{ bgcolor: '#1A73E8', color: '#ffffff', py: 1.5, borderRadius: '8px', fontWeight: '800' }}
            >
              Mark Repair Completed
            </Button>
          )}

          {booking.status === 'repair_completed' && !existingBill && (
            <Typography variant="body2" color="warning.main" fontWeight="700">
              Work complete. Please fill out parts & labour fee below to compile the invoice and seek payment.
            </Typography>
          )}

          {booking.status === 'waiting_approval' && (
            <Typography variant="body2" color="info.main" fontWeight="700" sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 1 }} /> Invoice generated. Awaiting customer confirmation/payout.
            </Typography>
          )}

          {booking.status === 'completed' && (
            <Typography variant="body1" fontWeight="800" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 1 }} /> Job runs verified & completed successfully. Payout confirmed.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Service Media Upload Panel */}
      {['inspection', 'repair_started', 'repair_completed'].includes(booking.status) && (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="900" sx={{ mb: 1, fontFamily: 'Outfit, sans-serif' }}>
              Service Media Documentation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload photographic evidence of the work stages to ensure transparency and safety checks.
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight="800" color="text.secondary" display="block" sx={{ mb: 1 }}>Before Repair Photo</Typography>
                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                  Upload Before Photo
                  <input type="file" hidden accept="image/*" onChange={(e) => setBeforePhoto(e.target.files[0])} />
                </Button>
                {beforePhoto && <Typography variant="caption" color="success.main">{beforePhoto.name}</Typography>}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight="800" color="text.secondary" display="block" sx={{ mb: 1 }}>After Repair Photo</Typography>
                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                  Upload After Photo
                  <input type="file" hidden accept="image/*" onChange={(e) => setAfterPhoto(e.target.files[0])} />
                </Button>
                {afterPhoto && <Typography variant="caption" color="success.main">{afterPhoto.name}</Typography>}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight="800" color="text.secondary" display="block" sx={{ mb: 1 }}>Spare Part Photo</Typography>
                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                  Upload Parts Photo
                  <input type="file" hidden accept="image/*" onChange={(e) => setSparePartPhoto(e.target.files[0])} />
                </Button>
                {sparePartPhoto && <Typography variant="caption" color="success.main">{sparePartPhoto.name}</Typography>}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" fontWeight="800" color="text.secondary" display="block" sx={{ mb: 1 }}>Supplier Invoice Copy</Typography>
                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                  Upload Invoice Image
                  <input type="file" hidden accept="image/*" onChange={(e) => setInvoicePhoto(e.target.files[0])} />
                </Button>
                {invoicePhoto && <Typography variant="caption" color="success.main">{invoicePhoto.name}</Typography>}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" fontWeight="800" color="text.secondary" display="block" sx={{ mb: 1 }}>Optional Video (MP4/MOV)</Typography>
                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                  Upload Diagnostic Video
                  <input type="file" hidden accept="video/*" onChange={(e) => setOptionalVideo(e.target.files[0])} />
                </Button>
                {optionalVideo && <Typography variant="caption" color="success.main">{optionalVideo.name}</Typography>}
              </Grid>
            </Grid>

            <Button
              variant="contained"
              onClick={handleUploadMedia}
              disabled={uploadingMedia || (!beforePhoto && !afterPhoto && !sparePartPhoto && !invoicePhoto && !optionalVideo)}
              sx={{ bgcolor: '#000000', color: '#ffffff', px: 4, borderRadius: '8px', textTransform: 'none' }}
            >
              {uploadingMedia ? 'Uploading Files...' : 'Submit Media Documentation'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workshop Repairs Token Drawer */}
      {['inspection', 'repair_started', 'repair_completed'].includes(booking.status) && (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="900" sx={{ mb: 1, fontFamily: 'Outfit, sans-serif' }}>
              Workshop Repair Tokens
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              If the appliance/item requires repair at the main workshop, allocate a tracking token for customer updates.
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  select
                  fullWidth
                  label="Workshop Progress Milestone"
                  value={workshopStatus}
                  onChange={(e) => setWorkshopStatus(e.target.value)}
                  slotProps={{ input: { style: { borderRadius: '8px' } } }}
                >
                  <MenuItem value="item_received">Item Received</MenuItem>
                  <MenuItem value="reached_workshop">Reached Workshop</MenuItem>
                  <MenuItem value="inspection">Inspection Milestone</MenuItem>
                  <MenuItem value="waiting_parts">Waiting For Spare Parts</MenuItem>
                  <MenuItem value="repair_started">Repair Process Initiated</MenuItem>
                  <MenuItem value="repair_completed">Workshop Repair Completed</MenuItem>
                  <MenuItem value="returning">Item Returning</MenuItem>
                  <MenuItem value="delivered">Item Delivered</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleUpdateWorkshopToken}
                  disabled={updatingToken}
                  sx={{ bgcolor: '#000000', color: '#ffffff', py: 1.8, borderRadius: '8px', textTransform: 'none' }}
                >
                  {updatingToken ? 'Updating...' : 'Update Workshop Token'}
                </Button>
              </Grid>
            </Grid>

            {booking.repair_token && (
              <Box sx={{ mt: 3, p: 2, bgcolor: '#F0F7FF', borderRadius: '8px', border: '1px solid #C2E0FF' }}>
                <Typography variant="body2">
                  Active Tracking Token ID: <b>{booking.repair_token.token_number}</b> <br />
                  Milestone Status: <b style={{ textTransform: 'uppercase', color: '#1A73E8' }}>{booking.repair_token.status.replace('_', ' ')}</b>
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Major Repair Cost Approval Request Form */}
      {['inspection', 'repair_started'].includes(booking.status) && (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="900" sx={{ mb: 1, fontFamily: 'Outfit, sans-serif' }}>
              Major Additional Repair Approval
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Require additional spare parts or extra labor fee for severe damage? Request digital estimate verification from customer.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Description / Reason of extra parts"
                  placeholder="e.g. Outer compressor coil replaced"
                  value={repairReason}
                  onChange={(e) => setRepairReason(e.target.value)}
                  slotProps={{ input: { style: { borderRadius: '8px' } } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Estimated Cost (₹)"
                  type="number"
                  value={repairCost}
                  onChange={(e) => setRepairCost(e.target.value)}
                  slotProps={{ input: { style: { borderRadius: '8px' } } }}
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              onClick={handleRequestMajorRepair}
              disabled={requestingRepair || !repairReason || !repairCost}
              sx={{ mt: 3, bgcolor: '#000000', color: '#ffffff', px: 4, borderRadius: '8px', textTransform: 'none' }}
            >
              Send Cost Request to Client
            </Button>

            {booking.major_repairs && booking.major_repairs.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" fontWeight="700">Submitted Estimates Log:</Typography>
                <List>
                  {booking.major_repairs.map((rep) => (
                    <ListItem key={rep.id} sx={{ px: 0, py: 1 }}>
                      <ListItemText primary={rep.reason} secondary={`Estimate: ₹${rep.estimated_cost}`} />
                      <Badge 
                        color={rep.status === 'approved' ? 'success' : rep.status === 'rejected' ? 'error' : 'warning'}
                        badgeContent={rep.status.toUpperCase()} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Spare Parts Entry & Service Invoicing Form */}
      {booking.status === 'repair_completed' && !existingBill && (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="900" sx={{ mb: 1, fontFamily: 'Outfit, sans-serif' }}>
              Compile Service Invoice Bill
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter labor charges, promo discount, and log any spare parts used to compute total GST.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Labour / Service Charges (₹)"
                  type="number"
                  value={labourCharges}
                  onChange={(e) => setLabourCharges(e.target.value)}
                  slotProps={{ input: { style: { borderRadius: '8px' } } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Discount amount if any (₹)"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  slotProps={{ input: { style: { borderRadius: '8px' } } }}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: '800' }}>
              Spare Parts Used Details
            </Typography>

            {spareParts.map((part, index) => (
              <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={6} sm={7}>
                  <TextField
                    fullWidth
                    label="Part Description Name"
                    value={part.part_name}
                    onChange={(e) => handlePartChange(index, 'part_name', e.target.value)}
                    slotProps={{ input: { style: { borderRadius: '8px' } } }}
                  />
                </Grid>
                <Grid item xs={3} sm={2}>
                  <TextField
                    fullWidth
                    label="Qty"
                    type="number"
                    value={part.quantity}
                    onChange={(e) => handlePartChange(index, 'quantity', e.target.value)}
                    slotProps={{ input: { style: { borderRadius: '8px' } } }}
                  />
                </Grid>
                <Grid item xs={3} sm={2}>
                  <TextField
                    fullWidth
                    label="Price (₹)"
                    type="number"
                    value={part.price}
                    onChange={(e) => handlePartChange(index, 'price', e.target.value)}
                    slotProps={{ input: { style: { borderRadius: '8px' } } }}
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
              sx={{ color: '#1A73E8', mb: 3, textTransform: 'none', fontWeight: '700' }}
            >
              Add Another Spare Part
            </Button>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: '800' }}>
              OR Upload Supplier Invoice Copy (Image/PDF)
            </Typography>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', borderRadius: '8px', mb: 4 }}>
              Select Supplier Invoice File
              <input type="file" hidden accept="image/*,application/pdf" onChange={(e) => setSupplierInvoice(e.target.files[0])} />
            </Button>
            {supplierInvoice && <Typography variant="caption" color="success.main" display="block">{supplierInvoice.name}</Typography>}

            <Button
              fullWidth
              variant="contained"
              onClick={handleGenerateBill}
              disabled={generatingBill}
              sx={{ bgcolor: '#000000', color: '#ffffff', py: 1.5, borderRadius: '8px', fontWeight: '850' }}
            >
              {generatingBill ? 'Compiling Invoices...' : 'Generate & Submit Invoice'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bill summary preview */}
      {existingBill && (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: '850' }}>
              COMPILED SERVICE BILL SUMMARY
            </Typography>
            <Typography variant="h5" fontWeight="900" sx={{ mt: 1, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
              Grand Total Invoice: ₹{existingBill.grand_total}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Invoice PDF Summary compiled. Customer verification status: <b>{existingBill.is_approved ? 'APPROVED & PAID' : 'AWAITING CUSTOMER CONFIRMATION'}</b>
            </Typography>
            
            <Button
              variant="contained"
              onClick={handleDownloadInvoice}
              sx={{ bgcolor: '#000000', color: '#ffffff', borderRadius: '8px', textTransform: 'none' }}
            >
              Download Official Invoice PDF
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cancel Warning Modal Dialog */}
      <Dialog 
        open={cancelWarningOpen} 
        onClose={() => setCancelWarningOpen(false)}
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800' }}>
          ⚠️ Cancel Job Warning
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking? Cancelling after accepting may affect your performance and reduce your overall completion rates.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelWarningOpen(false)} sx={{ color: '#000000' }}>
            Keep Booking
          </Button>
          <Button onClick={handleCancelBooking} color="error" variant="contained" sx={{ borderRadius: '8px' }}>
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default WorkerJobDetails;
