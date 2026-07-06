import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Box, Typography, TextField, Button, MenuItem, 
  Grid, InputAdornment, LinearProgress, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import api from '../services/api';
import toast from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HomeIcon from '@mui/icons-material/Home';
import ShieldIcon from '@mui/icons-material/Shield';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { tokens, span } from '../design/tokens';
import { 
  DashboardPage, DashboardGrid, DashboardCard 
} from '../components/dashboard';

function BookingFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const preselectedCategoryId = searchParams.get('category');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      booking_type: 'instant'
    }
  });
  const bookingType = watch('booking_type');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedCategory = categories.find(cat => String(cat.id) === String(preselectedCategoryId));

  useEffect(() => {
    // Fetch categories
    setLoading(true);
    api.get('/api/services/categories/')
      .then(res => {
        setCategories(res.data);
        if (preselectedCategoryId) {
          setValue('service_category', preselectedCategoryId);
        }
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load categories');
      })
      .finally(() => setLoading(false));
  }, [preselectedCategoryId, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append('service_category', data.service_category);
    formData.append('problem_type', data.problem_type);
    formData.append('problem_description', data.problem_description);
    formData.append('address', data.address);
    formData.append('city', data.city || 'Ahmedabad');
    formData.append('state', data.state || 'Gujarat');
    formData.append('pincode', data.pincode);
    formData.append('booking_type', data.booking_type);
    if (data.booking_type === 'slot') {
      formData.append('preferred_date', data.preferred_date);
      formData.append('preferred_time', data.preferred_time);
    }

    if (data.before_photo && data.before_photo[0]) {
      formData.append('before_photo', data.before_photo[0]);
    }

    try {
      const res = await api.post('/api/bookings/bookings/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Booking request placed successfully!');
      navigate(`/customer/booking/${res.data.id}`);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to place booking';
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <DashboardPage
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Dashboard', path: '/customer/dashboard' },
        { label: 'Book Partner' }
      ]}
      title="Request a Service Partner"
      description="Provide booking details and location. A certified Captain will accept your request."
      actions={
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/customer/dashboard')}
          sx={{ color: tokens.colors.primary, textTransform: 'none', fontWeight: 700 }}
        >
          Back to Dashboard
        </Button>
      }
    >
      <DashboardGrid>
        {/* Booking Form Card */}
        <Box sx={span.twoThirds}>
          <DashboardCard title="Booking Details" subtitle="Provide the problem description and service location details">
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Category */}
                {!preselectedCategoryId ? (
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Select Service Category"
                      defaultValue=""
                      {...register('service_category', { required: 'Please select a category' })}
                      error={!!errors.service_category}
                      helperText={errors.service_category?.message}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 2.5, 
                      background: tokens.colors.accentLight, 
                      borderRadius: `${tokens.borderRadiusSm}px`, 
                      border: '1px solid rgba(26, 115, 232, 0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5
                    }}>
                      <Typography variant="caption" color="primary" fontWeight="800" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Selected Service Category
                      </Typography>
                      <Typography variant="h6" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
                        {selectedCategory ? selectedCategory.name : 'Loading service details...'}
                      </Typography>
                      <input type="hidden" {...register('service_category')} value={preselectedCategoryId} />
                    </Box>
                  </Grid>
                )}

                {/* Problem Type */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="What is the problem? (e.g. AC Filter Clogged, Socket Sparking)"
                    placeholder="e.g. Leaking kitchen tap"
                    {...register('problem_type', { required: 'Problem type is required' })}
                    error={!!errors.problem_type}
                    helperText={errors.problem_type?.message}
                  />
                </Grid>

                {/* Problem Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Describe the issue in detail"
                    placeholder="Please describe what needs repair..."
                    {...register('problem_description', { required: 'Description is required' })}
                    error={!!errors.problem_description}
                    helperText={errors.problem_description?.message}
                  />
                </Grid>

                {/* Booking Type Select */}
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Select Service Mode"
                    defaultValue="instant"
                    {...register('booking_type', { required: 'Please select a booking mode' })}
                    error={!!errors.booking_type}
                    helperText={errors.booking_type?.message}
                  >
                    <MenuItem value="instant">Instant Service (Get Captain in 10-40 mins)</MenuItem>
                    <MenuItem value="slot">Slot-Based Booking (Schedule for later)</MenuItem>
                  </TextField>
                </Grid>

                {bookingType === 'slot' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Preferred Date"
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <EventIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }
                        }}
                        {...register('preferred_date', { required: bookingType === 'slot' ? 'Date is required' : false })}
                        error={!!errors.preferred_date}
                        helperText={errors.preferred_date?.message}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Preferred Time Slot"
                        defaultValue=""
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTimeIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }
                        }}
                        {...register('preferred_time', { required: bookingType === 'slot' ? 'Time slot is required' : false })}
                        error={!!errors.preferred_time}
                        helperText={errors.preferred_time?.message}
                      >
                        <MenuItem value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</MenuItem>
                        <MenuItem value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</MenuItem>
                        <MenuItem value="01:00 PM - 03:00 PM">01:00 PM - 03:00 PM</MenuItem>
                        <MenuItem value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</MenuItem>
                        <MenuItem value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM</MenuItem>
                      </TextField>
                    </Grid>
                  </>
                )}

                {/* Address details */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Full Service Address"
                    placeholder="Flat No, Building, Street Name..."
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon fontSize="small" sx={{ alignSelf: 'flex-start', mt: 0.5 }} />
                          </InputAdornment>
                        ),
                      }
                    }}
                    {...register('address', { required: 'Address is required' })}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    defaultValue="Ahmedabad"
                    {...register('city')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    {...register('pincode', { 
                      required: 'Pincode is required',
                      pattern: { value: /^[0-9]{6}$/, message: 'Must be a 6 digit code' }
                    })}
                    error={!!errors.pincode}
                    helperText={errors.pincode?.message}
                  />
                </Grid>

                {/* Optional photo upload */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: '700' }}>
                    Upload Reference Images (Optional)
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    {...register('before_photo')}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${tokens.borderColor}`,
                      borderRadius: `${tokens.borderRadiusSm}px`,
                      fontSize: '14px'
                    }}
                  />
                </Grid>

                {/* Submit */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={submitting}
                    sx={{
                      background: tokens.colors.primary,
                      color: '#ffffff',
                      fontWeight: '700',
                      py: 1.5,
                      borderRadius: `${tokens.borderRadiusSm}px`,
                      textTransform: 'none',
                      '&:hover': {
                        background: '#23232F'
                      }
                    }}
                  >
                    {submitting ? 'Placing Booking...' : 'Request Service'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </DashboardCard>
        </Box>

        {/* Sidebar Guide */}
        <Box sx={span.oneThird}>
          <Box display="flex" flexDirection="column" gap={3}>
            <DashboardCard title="WORKIZO Guarantee" subtitle="Why book service partners with us?">
              <List disablePadding>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}><ShieldIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Verified Captains Only" 
                    secondary="All workers pass a background check and verify identification proofs."
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}><CheckCircleIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Zero Booking Fee" 
                    secondary="Booking requests are processed for free. Pay only for labor and parts."
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}><HelpIcon color="warning" /></ListItemIcon>
                  <ListItemText 
                    primary="Cancellation Policy" 
                    secondary="Cancel bookings free of charge before a Captain reaches your site."
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                </ListItem>
              </List>
            </DashboardCard>

            <DashboardCard title="Estimates & Billing" subtitle="How are service charges calculated?">
              <Typography variant="body2" color="text.secondary" paragraph>
                Service rates consist of:
              </Typography>
              <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2, mb: 2 }}>
                <li><b>Flat Labour Base Rate:</b> As defined by the service category.</li>
                <li><b>Parts Charges:</b> If any spare parts are required during repair.</li>
                <li><b>18% GST:</b> Standard tax rate applicable on the final service sum.</li>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You will review the compiled invoice and pay securely through the application once the service is complete.
              </Typography>
            </DashboardCard>
          </Box>
        </Box>
      </DashboardGrid>
    </DashboardPage>
  );
}

export default BookingFlow;
