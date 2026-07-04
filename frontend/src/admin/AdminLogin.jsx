import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import {
  Container, Paper, Typography, TextField, Button, Box,
  CircularProgress
} from '@mui/material';

const AdminLogin = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'worker') {
        navigate('/captain/dashboard');
      } else if (user.role === 'customer') {
        navigate('/customer/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const loggedUser = await login(data.email, data.password);
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'worker') {
        navigate('/captain/dashboard');
      } else if (loggedUser.role === 'customer') {
        navigate('/customer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #ef4444' }}>
        <Typography variant="h5" component="h1" fontWeight="bold" color="error" gutterBottom>
          Secure Admin Panel Login
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Workizo system administrators only
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Admin Email Address"
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
            label="Admin Password"
            type="password"
            id="password"
            autoComplete="current-password"
            {...register('password', { required: 'Password is required' })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="error"
            disabled={loading}
            sx={{ py: 1.2, mt: 2, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Secure Log In'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLogin;
