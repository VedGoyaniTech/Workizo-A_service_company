import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Container, Typography, Button, Box, Grid, Avatar
} from '@mui/material';
import { tokens } from './design/tokens';

const AboutUs = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBookServiceClick = () => {
    if (isAuthenticated) {
      navigate('/customer/book');
    } else {
      toast.error('Please log in first to book a service');
      localStorage.setItem('redirect_after_login', '/customer/book');
      navigate('/customer/login');
    }
  };

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '80vh', color: '#0F0F14', fontFamily: 'Outfit', py: { xs: 10, md: 16 } }}>
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 6, lg: 10 }} alignItems="center">
          
          {/* Left Column: Academic Project Description */}
          <Grid item xs={12} md={6.5}>
            <Box sx={{ pr: { md: 4 } }}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontFamily: 'Outfit', 
                  fontWeight: 900, 
                  color: '#0F0F14',
                  lineHeight: 1.15,
                  mb: 4,
                  fontSize: { xs: '2.5rem', md: '3.75rem' }
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    position: 'relative', 
                    display: 'inline-block',
                    pb: 0.5,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      bgcolor: '#0F0F14'
                    }
                  }}
                >
                  Champions
                </Box>{' '}
                of our academic project
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#4B5563', 
                  lineHeight: 1.8, 
                  mb: 3,
                  fontSize: '1.05rem',
                  maxWidth: '640px'
                }}
              >
                WORKIZO is our academic project developed as part of our coursework at LJ University. With dedication and hardwork, we have created a comprehensive local service platform that demonstrates real-world application of technology in solving booking and service delivery challenges.
              </Typography>

              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#4B5563', 
                  lineHeight: 1.8,
                  fontSize: '1.05rem',
                  maxWidth: '640px'
                }}
              >
                This project showcases our skills in web development, database management, and user experience design, combining cutting-edge technology with practical solutions to revolutionize household services.
              </Typography>
            </Box>
          </Grid>

          {/* Right Column: Two Profile Circles */}
          <Grid item xs={12} md={5.5}>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: { xs: 4, sm: 8 }, 
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              {/* Profile 1: Ambariya Vivek */}
              <Box sx={{ textAlign: 'center', minWidth: '180px' }}>
                <Box 
                  sx={{
                    display: 'inline-block',
                    p: '6px',
                    border: '3px solid #0F0F14',
                    borderRadius: '50%',
                    mb: 2.5,
                    transition: tokens.transition,
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      bgcolor: '#0F0F14', 
                      color: '#ffffff',
                      fontFamily: 'Outfit',
                      fontSize: '2.5rem',
                      fontWeight: 900
                    }}
                  >
                    AV
                  </Avatar>
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'Outfit', 
                    fontWeight: 800, 
                    color: '#0F0F14',
                    mb: 0.5,
                    fontSize: '1.15rem'
                  }}
                >
                  Ambariya Vivek
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6B7280', 
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Project Leader
                </Typography>
              </Box>

              {/* Profile 2: Ved Goyani */}
              <Box sx={{ textAlign: 'center', minWidth: '180px' }}>
                <Box 
                  sx={{
                    display: 'inline-block',
                    p: '6px',
                    border: '3px solid #0F0F14',
                    borderRadius: '50%',
                    mb: 2.5,
                    transition: tokens.transition,
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      bgcolor: '#0F0F14', 
                      color: '#ffffff',
                      fontFamily: 'Outfit',
                      fontSize: '2.5rem',
                      fontWeight: 900
                    }}
                  >
                    VG
                  </Avatar>
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'Outfit', 
                    fontWeight: 800, 
                    color: '#0F0F14',
                    mb: 0.5,
                    fontSize: '1.15rem'
                  }}
                >
                  Ved Goyani
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6B7280', 
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Team Member
                </Typography>
              </Box>

            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default AboutUs;
