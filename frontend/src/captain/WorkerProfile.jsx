import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import api, { buildMediaUrl } from '../services/api';
import {
  TextField, Button, Box, CircularProgress, Alert, Chip, MenuItem, Typography, Divider
} from '@mui/material';
import toast from 'react-hot-toast';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { tokens, span } from '../design/tokens';
import { 
  DashboardPage, DashboardGrid, DashboardCard 
} from '../components/dashboard';

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
      return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" sx={{ fontWeight: 'bold' }} />;
    } else if (status === 'rejected') {
      return <Chip icon={<CancelIcon />} label="Rejected" color="error" sx={{ fontWeight: 'bold' }} />;
    }
    return <Chip icon={<HourglassEmptyIcon />} label="Pending Verification" color="warning" sx={{ fontWeight: 'bold' }} />;
  };

  return (
    <DashboardPage
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Dashboard', path: '/captain/dashboard' },
        { label: 'Profile' }
      ]}
      title="Onboarding & Verification Portal"
      description="Provide details to begin receiving customer requests."
      actions={getStatusChip()}
    >
      {user?.profile?.approval_status === 'rejected' && (
        <Alert severity="error" sx={{ mb: 1, borderRadius: `${tokens.borderRadiusSm}px` }}>
          Your KYC documents were rejected by the administrator. Please review your details and re-upload clear photos.
        </Alert>
      )}

      <DashboardGrid>
        {/* Onboarding & Bank Info Form */}
        <Box sx={span.twoThirds}>
          <DashboardCard title="Onboarding Form & Bank Info" subtitle="Provide government KYC and settlement account details">
            <Box component="form" onSubmit={handleSubmitProfile(onProfileSubmit)} noValidate sx={{ mt: 2 }}>
              <DashboardGrid sx={{ gap: 2.5 }}>
                {/* Personal Info */}
                <Box sx={span.half}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    {...registerProfile('fullName', { required: true })}
                  />
                </Box>
                <Box sx={span.half}>
                  <TextField
                    required
                    fullWidth
                    label="Phone Number"
                    {...registerProfile('phone', { required: true })}
                  />
                </Box>

                {/* Work Category & Experience */}
                <Box sx={span.half}>
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
                </Box>
                <Box sx={span.half}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Years of Experience"
                    {...registerProfile('experience', { required: true })}
                  />
                </Box>

                {/* Location Address */}
                <Box sx={span.full}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Street Address"
                    {...registerProfile('address')}
                  />
                </Box>
                <Box sx={span.third}>
                  <TextField
                    fullWidth
                    label="City"
                    {...registerProfile('city')}
                  />
                </Box>
                <Box sx={span.third}>
                  <TextField
                    fullWidth
                    label="State"
                    {...registerProfile('state')}
                  />
                </Box>
                <Box sx={span.third}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    {...registerProfile('pincode')}
                  />
                </Box>

                {/* KYC Details */}
                <Box sx={span.full} style={{ marginTop: '8px' }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: '800' }}>
                    Government KYC Numbers
                  </Typography>
                  <Divider />
                </Box>
                <Box sx={span.half}>
                  <TextField
                    fullWidth
                    label="Aadhaar Card Number (12 digit)"
                    inputProps={{ maxLength: 12 }}
                    {...registerProfile('aadhaarNumber')}
                  />
                </Box>
                <Box sx={span.half}>
                  <TextField
                    fullWidth
                    label="PAN Card Number (10 digit)"
                    inputProps={{ maxLength: 10 }}
                    {...registerProfile('panNumber')}
                  />
                </Box>

                {/* Bank Details */}
                <Box sx={span.full} style={{ marginTop: '8px' }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: '800' }}>
                    Direct Settlement Bank Account
                  </Typography>
                  <Divider />
                </Box>
                <Box sx={span.half}>
                  <TextField
                    fullWidth
                    label="Bank Account Number"
                    {...registerProfile('bankAccount')}
                  />
                </Box>
                <Box sx={span.half}>
                  <TextField
                    fullWidth
                    label="Bank IFSC Code"
                    {...registerProfile('ifscCode')}
                  />
                </Box>

                {/* Document Uploads */}
                <Box sx={span.full} style={{ marginTop: '8px' }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: '800' }}>
                    KYC Upload Documents (Image Files)
                  </Typography>
                  <Divider />
                </Box>
                
                <Box sx={span.third}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 700 }}>
                    Profile Photo
                  </Typography>
                  <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', py: 1 }}>
                    Upload Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setProfilePhotoFile(e.target.files[0])}
                    />
                  </Button>
                  {profilePhotoFile ? (
                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                      File: {profilePhotoFile.name}
                    </Typography>
                  ) : user?.profile?.profile_photo && (
                    <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                      <img src={buildMediaUrl(user.profile.profile_photo)} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: `1px solid ${tokens.borderColor}` }} />
                    </Box>
                  )}
                </Box>

                <Box sx={span.third}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 700 }}>
                    Aadhaar Card Copy
                  </Typography>
                  <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', py: 1 }}>
                    Upload Aadhaar
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setAadhaarPhotoFile(e.target.files[0])}
                    />
                  </Button>
                  {aadhaarPhotoFile ? (
                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                      File: {aadhaarPhotoFile.name}
                    </Typography>
                  ) : user?.profile?.aadhaar_photo && (
                    <Box sx={{ mt: 1.5, textAlign: 'center', pt: 1 }}>
                      <a href={buildMediaUrl(user.profile.aadhaar_photo)} target="_blank" rel="noreferrer" style={{ fontSize: '12px', textDecoration: 'none', color: tokens.colors.accent, fontWeight: '800' }}>View Aadhaar Image</a>
                    </Box>
                  )}
                </Box>

                <Box sx={span.third}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 700 }}>
                    PAN Card Copy
                  </Typography>
                  <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', py: 1 }}>
                    Upload PAN
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setPanPhotoFile(e.target.files[0])}
                    />
                  </Button>
                  {panPhotoFile ? (
                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                      File: {panPhotoFile.name}
                    </Typography>
                  ) : user?.profile?.pan_photo && (
                    <Box sx={{ mt: 1.5, textAlign: 'center', pt: 1 }}>
                      <a href={buildMediaUrl(user.profile.pan_photo)} target="_blank" rel="noreferrer" style={{ fontSize: '12px', textDecoration: 'none', color: tokens.colors.accent, fontWeight: '800' }}>View PAN Image</a>
                    </Box>
                  )}
                </Box>
              </DashboardGrid>

              <Button
                type="submit"
                variant="contained"
                disabled={profileLoading}
                sx={{ 
                  mt: 5, 
                  py: 1.5, 
                  px: 4, 
                  bgcolor: tokens.colors.primary, 
                  color: '#ffffff', 
                  borderRadius: `${tokens.borderRadiusSm}px`,
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#23232F' }
                }}
              >
                {profileLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Onboarding Profile'}
              </Button>
            </Box>
          </DashboardCard>
        </Box>

        {/* Change Password Security Card */}
        <Box sx={span.oneThird}>
          <DashboardCard title="Security Credentials" subtitle="Ensure your account is using a secure password">
            <Box component="form" onSubmit={handleSubmitPassword(onPasswordSubmit)} noValidate sx={{ mt: 2 }}>
              <DashboardGrid sx={{ gap: 2.5 }}>
                <Box sx={span.full}>
                  <TextField
                    required
                    fullWidth
                    type="password"
                    label="Current Password"
                    {...registerPassword('oldPassword', { required: true })}
                  />
                </Box>
                <Box sx={span.full}>
                  <TextField
                    required
                    fullWidth
                    type="password"
                    label="New Password"
                    {...registerPassword('newPassword', { required: true, minLength: 6 })}
                  />
                </Box>
                <Box sx={span.full}>
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
                </Box>
              </DashboardGrid>

              <Button
                type="submit"
                variant="contained"
                disabled={passwordLoading}
                sx={{ 
                  mt: 4, 
                  py: 1.5, 
                  px: 4, 
                  bgcolor: tokens.colors.error, 
                  color: '#ffffff', 
                  borderRadius: `${tokens.borderRadiusSm}px`,
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#B91C1C' }
                }}
              >
                {passwordLoading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
              </Button>
            </Box>
          </DashboardCard>
        </Box>
      </DashboardGrid>
    </DashboardPage>
  );
};

export default WorkerProfile;
