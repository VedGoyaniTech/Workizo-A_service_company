import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import api, { buildMediaUrl } from '../services/api';
import {
  Container, Paper, Grid, Typography, TextField, Button, Box,
  Divider, MenuItem, CircularProgress, Alert, Chip
} from '@mui/material';
import toast from 'react-hot-toast';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const WorkerProfile = () => {
  const { user, updateProfileState } = useAuth();
  const [categories, setCategories] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // File Upload State
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [aadhaarPhotoFile, setAadhaarPhotoFile] = useState(null);
  const [panPhotoFile, setPanPhotoFile] = useState(null);

  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, watch } = useForm();

  const newPassword = watch('newPassword');

  // Fetch categories & set fields
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
      resetProfile({
        fullName: user.full_name,
        phone: user.phone,
        serviceCategoryId: user.profile?.service_category?.id || '',
        experience: user.profile?.experience || 0,
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        state: user.profile?.state || '',
        pincode: user.profile?.pincode || '',
        aadhaarNumber: user.profile?.aadhaar_number || '',
        panNumber: user.profile?.pan_number || '',
        bankAccount: user.profile?.bank_account || '',
        ifscCode: user.profile?.ifsc_code || '',
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
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
      
      if (data.serviceCategoryId) {
        formData.append('service_category_id', data.serviceCategoryId);
      }

      if (profilePhotoFile) formData.append('profile_photo', profilePhotoFile);
      if (aadhaarPhotoFile) formData.append('aadhaar_photo', aadhaarPhotoFile);
      if (panPhotoFile) formData.append('pan_photo', panPhotoFile);

      const res = await api.post('workers/register-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update user details in context
      const fullDetails = await api.get('accounts/me/');
      updateProfileState(fullDetails.data);
      
      toast.success('Onboarding KYC documents and details submitted.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to submit profile documents.');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    try {
      await api.post('accounts/change-password/', {
        old_password: data.oldPassword,
        new_password: data.newPassword
      });
      toast.success('Password changed successfully.');
      resetPassword();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.old_password?.[0] || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getStatusChip = () => {
    const status = user?.profile?.approval_status || 'pending';
    if (status === 'approved') {
      return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" />;
    } else if (status === 'rejected') {
      return <Chip icon={<CancelIcon />} label="Rejected" color="error" />;
    }
    return <Chip icon={<HourglassEmptyIcon />} label="Pending Verification" color="warning" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      {/* Alert status header */}
      <Box sx={{ mb: 4, p: 3, backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Onboarding & Verification Portal</Typography>
          <Typography variant="body2" color="text.secondary">Provide details to begin receiving customer requests.</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="subtitle2" color="text.secondary">Verification Status:</Typography>
          {getStatusChip()}
        </Box>
      </Box>

      {user?.profile?.approval_status === 'rejected' && (
        <Alert severity="error" sx={{ mb: 4 }}>
          Your KYC documents were rejected by the administrator. Please review your details and re-upload clear photos.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Profile Info Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Onboarding Form & Bank Info
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleSubmitProfile(onProfileSubmit)} noValidate>
              <Grid container spacing={2.5}>
                {/* Section: Personal Info */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    {...registerProfile('fullName', { required: true })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Phone Number"
                    {...registerProfile('phone', { required: true })}
                  />
                </Grid>

                {/* Section: Work Category & Experience */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    select
                    label="Service Category"
                    defaultValue=""
                    {...registerProfile('serviceCategoryId', { required: true })}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Years of Experience"
                    {...registerProfile('experience', { required: true })}
                  />
                </Grid>

                {/* Section: Location Address */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Street Address"
                    {...registerProfile('address')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    {...registerProfile('city')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    {...registerProfile('state')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    {...registerProfile('pincode')}
                  />
                </Grid>

                {/* Section: KYC Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="secondary" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                    Government KYC Details
                  </Typography>
                  <Divider />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Aadhaar Card Number (12 digit)"
                    inputProps={{ maxLength: 12 }}
                    {...registerProfile('aadhaarNumber')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="PAN Card Number (10 digit)"
                    inputProps={{ maxLength: 10 }}
                    {...registerProfile('panNumber')}
                  />
                </Grid>

                {/* Section: Bank Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="secondary" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                    Direct Settlement Bank Account
                  </Typography>
                  <Divider />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Account Number"
                    {...registerProfile('bankAccount')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank IFSC Code"
                    {...registerProfile('ifscCode')}
                  />
                </Grid>

                {/* Section: Document Upload Actions */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="secondary" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                    KYC Upload Documents (Image Files)
                  </Typography>
                  <Divider />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Profile Photo
                  </Typography>
                  <Button variant="outlined" component="label" fullWidth size="medium">
                    Upload Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setProfilePhotoFile(e.target.files[0])}
                    />
                  </Button>
                  {profilePhotoFile ? (
                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                      File: {profilePhotoFile.name}
                    </Typography>
                  ) : user.profile?.profile_photo && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <img src={buildMediaUrl(user.profile.profile_photo)} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5E7EB' }} />
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Aadhaar Card Copy
                  </Typography>
                  <Button variant="outlined" component="label" fullWidth size="medium">
                    Upload Aadhaar
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setAadhaarPhotoFile(e.target.files[0])}
                    />
                  </Button>
                  {aadhaarPhotoFile ? (
                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                      File: {aadhaarPhotoFile.name}
                    </Typography>
                  ) : user.profile?.aadhaar_photo && (
                    <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                      <a href={buildMediaUrl(user.profile.aadhaar_photo)} target="_blank" rel="noreferrer" style={{ fontSize: '11px', textDecoration: 'none', color: '#1A73E8', fontWeight: 'bold' }}>View Aadhaar Image</a>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    PAN Card Copy
                  </Typography>
                  <Button variant="outlined" component="label" fullWidth size="medium">
                    Upload PAN
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setPanPhotoFile(e.target.files[0])}
                    />
                  </Button>
                  {panPhotoFile ? (
                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                      File: {panPhotoFile.name}
                    </Typography>
                  ) : user.profile?.pan_photo && (
                    <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                      <a href={buildMediaUrl(user.profile.pan_photo)} target="_blank" rel="noreferrer" style={{ fontSize: '11px', textDecoration: 'none', color: '#1A73E8', fontWeight: 'bold' }}>View PAN Image</a>
                    </Box>
                  )}
                </Grid>

              </Grid>

              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={profileLoading}
                sx={{ mt: 5, py: 1 }}
              >
                {profileLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Onboarding Profile'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Change Password Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Security Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleSubmitPassword(onPasswordSubmit)} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type="password"
                    label="Current Password"
                    {...registerPassword('oldPassword', { required: true })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type="password"
                    label="New Password"
                    {...registerPassword('newPassword', { required: true, minLength: 6 })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type="password"
                    label="Confirm Password"
                    {...registerPassword('confirmNewPassword', {
                      required: true,
                      validate: (v) => v === newPassword || 'Passwords do not match'
                    })}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="outlined"
                color="secondary"
                disabled={passwordLoading}
                sx={{ mt: 4, py: 1 }}
              >
                {passwordLoading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WorkerProfile;
