import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import {
  TextField, Button, Box, Link, CircularProgress, Typography
} from '@mui/material';
import toast from 'react-hot-toast';
import { tokens } from '../design/tokens';
import { AuthPageShell } from '../components/dashboard';

const WorkerRegister = () => {
  const { register: registerAuth, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'worker') {
        navigate('/captain/dashboard');
      } else if (user.role === 'customer') {
        navigate('/customer/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerAuth(data.fullName, data.email, data.phone, data.password, 'worker');
      toast.success('Registration successful! Please complete your profile and KYC details.');
      navigate('/captain/profile');
    } catch (err) {
      console.error(err);
      if (err.email) {
        toast.error(`Email: ${err.email[0]}`);
      } else if (err.phone) {
        toast.error(`Phone: ${err.phone[0]}`);
      } else {
        toast.error(err.detail || 'Registration failed. Please check inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Register as Captain"
      subtitle="Earn money by offering services near you"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="fullName"
          label="Full Name"
          autoFocus
          {...register('fullName', { required: 'Full name is required' })}
          error={!!errors.fullName}
          helperText={errors.fullName?.message}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          autoComplete="email"
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="phone"
          label="Phone Number"
          {...register('phone', { 
            required: 'Phone number is required',
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Enter a valid 10-digit phone number'
            }
          })}
          error={!!errors.phone}
          helperText={errors.phone?.message}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          {...register('password', { 
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          {...register('confirmPassword', { 
            required: 'Confirm password is required',
            validate: (val) => val === password || 'Passwords do not match'
          })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          disabled={loading}
          sx={{
            py: 1.2,
            mt: 3,
            mb: 2,
            bgcolor: tokens.colors.primary,
            color: '#ffffff',
            borderRadius: `${tokens.borderRadiusSm}px`,
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: '#23232F' }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Register as Captain'}
        </Button>

        <Box display="flex" justifyContent="center">
          <Typography variant="body2" color="text.secondary">
            Already registered?{' '}
            <Link component={RouterLink} to="/captain/login" color="secondary" fontWeight="bold">
              Log In
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthPageShell>
  );
};

export default WorkerRegister;
