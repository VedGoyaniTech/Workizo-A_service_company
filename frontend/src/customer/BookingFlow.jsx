import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Box, Container, Typography, TextField, Button, MenuItem, 
  Card, CardContent, Grid, InputAdornment, LinearProgress 
} from '@mui/material';
import api from '../services/api';
import toast from 'react-hot-toast';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HomeIcon from '@mui/icons-material/Home';

function BookingFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const preselectedCategoryId = searchParams.get('category');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    formData.append('preferred_date', data.preferred_date);
    formData.append('preferred_time', data.preferred_time);

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
      // Navigate to tracking timeline
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
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/customer/dashboard')}
        sx={{ mb: 3, color: '#000000', textTransform: 'none' }}
      >
        Back to Dashboard
      </Button>

      <Typography variant="h4" fontWeight="800" gutterBottom sx={{ mb: 4, fontFamily: 'Outfit, sans-serif' }}>
        Book a Service
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: '8px', borderWidth: '1px', borderColor: '#E5E7EB' }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Category */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Select Service Category"
                  defaultValue=""
                  {...register('service_category', { required: 'Please select a category' })}
                  error={!!errors.service_category}
                  helperText={errors.service_category?.message}
                  slotProps={{
                    input: {
                      style: { borderRadius: '6px' }
                    }
                  }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Problem Type */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="What is the problem? (e.g. AC Filter Clogged, Socket Sparking)"
                  placeholder="e.g. Leaking kitchen tap"
                  {...register('problem_type', { required: 'Problem type is required' })}
                  error={!!errors.problem_type}
                  helperText={errors.problem_type?.message}
                  slotProps={{
                    input: {
                      style: { borderRadius: '6px' }
                    }
                  }}
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
                  slotProps={{
                    input: {
                      style: { borderRadius: '6px' }
                    }
                  }}
                />
              </Grid>

              {/* Date & Time slots */}
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
                      style: { borderRadius: '6px' }
                    }
                  }}
                  {...register('preferred_date', { required: 'Date is required' })}
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
                      style: { borderRadius: '6px' }
                    }
                  }}
                  {...register('preferred_time', { required: 'Time slot is required' })}
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
                      style: { borderRadius: '6px' }
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
                  slotProps={{ input: { style: { borderRadius: '6px' } } }}
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
                  slotProps={{ input: { style: { borderRadius: '6px' } } }}
                />
              </Grid>

              {/* Optional photo upload */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: '600' }}>
                  Upload Reference Images (Optional)
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  {...register('before_photo')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
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
                    background: '#000000',
                    color: '#ffffff',
                    fontWeight: '700',
                    py: 1.5,
                    borderRadius: '6px',
                    '&:hover': {
                      background: '#1a1a1a'
                    }
                  }}
                >
                  {submitting ? 'Placing Booking...' : 'Request Service'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

export default BookingFlow;
