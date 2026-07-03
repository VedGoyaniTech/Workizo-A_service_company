import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import {
  Container, Paper, Grid, Typography, TextField, Button, Box,
  Divider, CircularProgress
} from '@mui/material';
import toast from 'react-hot-toast';

const CustomerProfile = () => {
  const { user, updateProfileState } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, watch } = useForm();

  const newPassword = watch('newPassword');

  // Pre-fill profile form fields
  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.full_name,
        phone: user.phone,
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        state: user.profile?.state || '',
        pincode: user.profile?.pincode || '',
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
    try {
      const res = await api.put('accounts/profile/', {
        full_name: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode
      });
      updateProfileState(res.data);
      toast.success('Profile details updated successfully.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to update profile details.');
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
      toast.error(err.response?.data?.old_password?.[0] || 'Failed to change password. Double check current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <Grid container spacing={4}>
        {/* Profile Info Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
              Profile Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Update your account details and contact address
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleSubmitProfile(onProfileSubmit)} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
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
                    label="Email Address"
                    disabled
                    value={user?.email || ''}
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
              </Grid>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={profileLoading}
                sx={{ mt: 4, py: 1 }}
              >
                {profileLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Change Password Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Ensure your account is using a secure password
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
                    label="Confirm New Password"
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
                color="primary"
                disabled={passwordLoading}
                sx={{ mt: 4, py: 1 }}
              >
                {passwordLoading ? <CircularProgress size={24} color="inherit" /> : 'Change Password'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerProfile;
