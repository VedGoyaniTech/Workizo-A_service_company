import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import {
  TextField, Button, Box, Link, CircularProgress, Typography, Divider
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';

import toast from 'react-hot-toast';
import { tokens } from '../design/tokens';
import { AuthPageShell } from '../components/dashboard';

const WorkerLogin = () => {
  const { login, logout, isAuthenticated, user, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'worker') {
        navigate('/captain/dashboard');
      } else {
        // Log out other roles to allow logging in as captain
        logout();
      }
    }
  }, [isAuthenticated, user, navigate, logout]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const loggedUser = await login(data.email, data.password);
      if (loggedUser.role === 'worker') {
        navigate('/captain/dashboard');
      } else {
        await logout();
        toast.error('This portal is only for Captains. Please log in on the Customer Portal.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const loggedUser = await googleLogin(credentialResponse.credential, 'worker');
      if (loggedUser.role === 'worker') {
        navigate('/captain/dashboard');
      } else {
        await logout();
        toast.error('This portal is only for Captains. Please log in on the Customer Portal.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    setLoading(true);
    try {
      const email = prompt("Enter mock Google email:", "captaintest@workizo.com");
      if (!email) {
        setLoading(false);
        return;
      }
      const name = prompt("Enter mock Google Full Name:", "Google Captain");
      if (!name) {
        setLoading(false);
        return;
      }
      const dashedName = name.replace(/\s+/g, '-');
      const mockToken = `mock_token_worker_${email}_${dashedName}`;
      
      const loggedUser = await googleLogin(mockToken, 'worker');
      if (loggedUser.role === 'worker') {
        navigate('/captain/dashboard');
      } else {
        await logout();
        toast.error('This portal is only for Captains. Please log in on the Customer Portal.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Captain Portal Login"
      subtitle="Manage your bookings, online status, and verification"
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
          color="secondary"
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

        <Divider sx={{ my: 2 }}>or</Divider>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'MOCK_CLIENT_ID' ? (
          <Box display="flex" justifyContent="center" width="100%" mb={2}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast.error("Google Sign-In failed.");
              }}
              text="continue_with"
              width="396"
            />
          </Box>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            onClick={handleMockGoogleLogin}
            disabled={loading}
            sx={{
              py: 1.2,
              mb: 2,
              borderRadius: `${tokens.borderRadiusSm}px`,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#E5E7EB',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              '&:hover': {
                borderColor: '#D1D5DB',
                bgcolor: '#F9FAFB'
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        )}

        <Box display="flex" justifyContent="center">
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/captain/register" color="secondary" fontWeight={600}>
              Register as Captain
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthPageShell>
  );
};

export default WorkerLogin;
