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

const CustomerLogin = () => {
  const { login, logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'customer') {
        const redirectPath = localStorage.getItem('redirect_after_login');
        if (redirectPath) {
          localStorage.removeItem('redirect_after_login');
          navigate(redirectPath);
        } else {
          navigate('/customer/dashboard');
        }
      } else {
        // Log out worker/admin to allow logging in as customer
        logout();
      }
    }
  }, [isAuthenticated, user, navigate, logout]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const loggedUser = await login(data.email, data.password);
      const redirectPath = localStorage.getItem('redirect_after_login');
      if (loggedUser.role === 'customer') {
        if (redirectPath) {
          localStorage.removeItem('redirect_after_login');
          navigate(redirectPath);
        } else {
          navigate('/customer/dashboard');
        }
      } else {
        await logout();
        toast.error('This portal is only for Customers. Please log in on the Captain Portal.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Customer Login"
      subtitle="Access your Workizo marketplace account"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          autoComplete="email"
          autoFocus
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
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          {...register('password', { required: 'Password is required' })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <Box display="flex" justifyContent="space-between" sx={{ mt: 1, mb: 2 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2" color="primary">
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{
            py: 1.2,
            mb: 2,
            bgcolor: tokens.colors.primary,
            color: '#ffffff',
            borderRadius: `${tokens.borderRadiusSm}px`,
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: '#23232F' }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
        </Button>

        <Box display="flex" justifyContent="center">
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/customer/register" color="primary" fontWeight="bold">
              Register Here
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthPageShell>
  );
};

export default CustomerLogin;
