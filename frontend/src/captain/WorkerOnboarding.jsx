import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api, { buildMediaUrl } from '../services/api';
import {
  TextField, Button, Box, CircularProgress, Alert, MenuItem, Typography, Divider, Paper, AppBar, Toolbar, IconButton
} from '@mui/material';
import toast from 'react-hot-toast';
import LogoutIcon from '@mui/icons-material/Logout';

import { tokens, span } from '../design/tokens';
import { 
  DashboardGrid, DashboardCard 
} from '../components/dashboard';

const WorkerOnboarding = () => {
  const { user, updateProfileState, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // File Upload State
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [aadhaarPhotoFile, setAadhaarPhotoFile] = useState(null);
  const [panPhotoFile, setPanPhotoFile] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('services/categories/');
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.full_name,
        phone: user.phone,
        serviceCategoryId: user.profile?.service_category?.id || '',
        experience: user.profile?.experience || 0,
        address: user.profile?.address || '',
        city: user.profile?.city || 'Ahmedabad',
        state: user.profile?.state || 'Gujarat',
        pincode: user.profile?.pincode || '',
        aadhaarNumber: user.profile?.aadhaar_number || '',
        panNumber: user.profile?.pan_number || '',
        bankAccount: user.profile?.bank_account || '',
        ifscCode: user.profile?.ifsc_code || '',
        accountHolderName: user.full_name || '',
      });
    }
  }, [user, reset]);

  const handleLogout = async () => {
    await logout();
    navigate('/captain/login');
  };

  const onSubmit = async (data) => {
    // Validate that required files are selected
    if (!profilePhotoFile && !user?.profile?.profile_photo) {
      toast.error('Please upload your profile photo.');
      return;
    }
    if (!aadhaarPhotoFile && !user?.profile?.aadhaar_photo) {
      toast.error('Please upload your Aadhaar card copy.');
      return;
    }
    if (!panPhotoFile && !user?.profile?.pan_photo) {
      toast.error('Please upload your PAN card copy.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', data.fullName);
      formData.append('phone', data.phone);
      formData.append('experience', data.experience);
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('state', data.state);
      formData.append('pincode', data.pincode);
      formData.append('aadhaar_number', data.aadhaarNumber);
      formData.append('pan_number', data.panNumber);
      formData.append('bank_account', data.bankAccount);
      formData.append('ifsc_code', data.ifscCode);
      formData.append('account_holder_name', data.accountHolderName);
      
      if (data.serviceCategoryId) {
        formData.append('service_category_id', data.serviceCategoryId);
      }

      if (profilePhotoFile) formData.append('profile_photo', profilePhotoFile);
      if (aadhaarPhotoFile) formData.append('aadhaar_photo', aadhaarPhotoFile);
      if (panPhotoFile) formData.append('pan_photo', panPhotoFile);

      // Save verification request
      await api.post('workers/register-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Fetch fresh profile state to sync context
      const fullDetails = await api.get('accounts/me/');
      updateProfileState(fullDetails.data);
      
      toast.success('KYC documents submitted. Status: Pending Verification.');
      navigate('/captain/waiting');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to submit profile documents.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: tokens.colors.bg, pb: 6 }}>
      {/* Mini Topbar */}
      <AppBar position="static" elevation={0} sx={{ background: '#0F0F14', borderBottom: '1px solid #1E1E24', height: '64px' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box component="img" src="/logo.png" sx={{ width: 32, height: 32, objectFit: 'contain' }} />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', lineHeight: 1.2 }}>
                WORKIZO
              </Typography>
              <Typography variant="caption" sx={{ color: '#888888', fontWeight: 600 }}>
                CAPTAIN PORTAL
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ color: '#ef4444', textTransform: 'none', fontWeight: 700 }}
          >
            Log Out
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Container */}
      <Box sx={{ maxWidth: '900px', mx: 'auto', mt: 4, px: 2 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: `${tokens.borderRadius}px`, border: `1px solid ${tokens.borderColor}` }}>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} sx={{ fontFamily: 'Outfit, sans-serif' }} gutterBottom>
              Captain Onboarding & KYC
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Provide government KYC details and settlement bank info once to start receiving bookings.
            </Typography>
          </Box>

          {user?.profile?.approval_status === 'rejected' && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: `${tokens.borderRadiusSm}px` }}>
              Your KYC documents were rejected by the administrator. Please review your details and re-upload clear photos.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <DashboardGrid sx={{ gap: 2.5 }}>
              {/* Personal Details */}
              <Box sx={span.full}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 700 }}>
                  Personal Information
                </Typography>
                <Divider />
              </Box>

              <Box sx={span.half}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  {...register('fullName', { required: true })}
                />
              </Box>
              <Box sx={span.half}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  {...register('phone', { required: true })}
                />
              </Box>

              {/* Service Category & Experience */}
              <Box sx={span.half}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Service Category"
                  defaultValue=""
                  {...register('serviceCategoryId', { required: true })}
                >
                  <MenuItem value="">Select Category</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={span.half}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Years of Experience"
                  {...register('experience', { required: true })}
                />
              </Box>

              {/* Address Details */}
              <Box sx={span.full}>
                <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                  Address Details
                </Typography>
                <Divider />
              </Box>

              <Box sx={span.full}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={2}
                  label="Street Address"
                  {...register('address', { required: true })}
                />
              </Box>
              <Box sx={span.third}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  {...register('city', { required: true })}
                />
              </Box>
              <Box sx={span.third}>
                <TextField
                  required
                  fullWidth
                  label="State"
                  {...register('state', { required: true })}
                />
              </Box>
              <Box sx={span.third}>
                <TextField
                  required
                  fullWidth
                  label="Pincode"
                  {...register('pincode', { required: true })}
                />
              </Box>

              {/* Government KYC */}
              <Box sx={span.full}>
                <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                  Government Identity KYC
                </Typography>
                <Divider />
              </Box>

              <Box sx={span.half}>
                <TextField
                  required
                  fullWidth
                  label="Aadhaar Card Number (12 digit)"
                  inputProps={{ maxLength: 12 }}
                  {...register('aadhaarNumber', { required: true })}
                />
              </Box>
              <Box sx={span.half}>
                <TextField
                  required
                  fullWidth
                  label="PAN Card Number (10 digit)"
                  inputProps={{ maxLength: 10 }}
                  {...register('panNumber', { required: true })}
                />
              </Box>

              {/* Bank Details */}
              <Box sx={span.full}>
                <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                  Direct Payout Bank Settlement
                </Typography>
                <Divider />
              </Box>

              <Box sx={span.third}>
                <TextField
                  required
                  fullWidth
                  label="Bank Account Number"
                  {...register('bankAccount', { required: true })}
                />
              </Box>
              <Box sx={span.third}>
                <TextField
                  required
                  fullWidth
                  label="Bank IFSC Code"
                  {...register('ifscCode', { required: true })}
                />
              </Box>
              <Box sx={span.third}>
                <TextField
                  required
                  fullWidth
                  label="Account Holder Name"
                  {...register('accountHolderName', { required: true })}
                />
              </Box>

              {/* Upload Documents */}
              <Box sx={span.full}>
                <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                  Upload Document Photos (Images)
                </Typography>
                <Divider />
              </Box>

              <Box sx={span.third}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 600 }}>
                  Profile Photo *
                </Typography>
                <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', py: 1.25 }}>
                  Upload Photo
                  <input type="file" hidden accept="image/*" onChange={(e) => setProfilePhotoFile(e.target.files[0])} />
                </Button>
                {profilePhotoFile ? (
                  <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                    Selected: {profilePhotoFile.name}
                  </Typography>
                ) : user?.profile?.profile_photo && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Already uploaded.
                  </Typography>
                )}
              </Box>

              <Box sx={span.third}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 600 }}>
                  Aadhaar Card Copy *
                </Typography>
                <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', py: 1.25 }}>
                  Upload Aadhaar
                  <input type="file" hidden accept="image/*" onChange={(e) => setAadhaarPhotoFile(e.target.files[0])} />
                </Button>
                {aadhaarPhotoFile ? (
                  <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                    Selected: {aadhaarPhotoFile.name}
                  </Typography>
                ) : user?.profile?.aadhaar_photo && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Already uploaded.
                  </Typography>
                )}
              </Box>

              <Box sx={span.third}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 600 }}>
                  PAN Card Copy *
                </Typography>
                <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', py: 1.25 }}>
                  Upload PAN
                  <input type="file" hidden accept="image/*" onChange={(e) => setPanPhotoFile(e.target.files[0])} />
                </Button>
                {panPhotoFile ? (
                  <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                    Selected: {panPhotoFile.name}
                  </Typography>
                ) : user?.profile?.pan_photo && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Already uploaded.
                  </Typography>
                )}
              </Box>
            </DashboardGrid>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 5, 
                py: 1.5, 
                px: 5, 
                bgcolor: tokens.colors.primary, 
                color: '#ffffff', 
                borderRadius: `${tokens.borderRadiusSm}px`,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': { bgcolor: '#23232F' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Verification Request'}
            </Button>
          </Box>

        </Paper>
      </Box>
    </Box>
  );
};

export default WorkerOnboarding;
