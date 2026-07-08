import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Container, Typography, Button, Box, Grid, Avatar
} from '@mui/material';
import { tokens } from './design/tokens';
import SchoolIcon from '@mui/icons-material/School';
import HandymanIcon from '@mui/icons-material/Handyman';

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
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', color: '#0F0F14', fontFamily: 'Outfit' }}>
      
      {/* 1. Rapido-style Hero Section */}
      <Box sx={{ py: { xs: 8, md: 14 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            {/* Left side text column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ pr: { md: 4 } }}>
                <Typography 
                  variant="h3" 
                  component="h3" 
                  sx={{ 
                    fontFamily: 'Outfit', 
                    fontWeight: 900, 
                    color: '#0F0F14',
                    mb: 1.5,
                    fontSize: { xs: '2.25rem', md: '3rem' }
                  }}
                >
                  India’s Beloved
                </Typography>
                <Typography 
                  variant="h4" 
                  component="h4" 
                  sx={{ 
                    fontFamily: 'Outfit', 
                    fontWeight: 900, 
                    color: '#0F0F14',
                    mb: 3,
                    fontSize: { xs: '1.75rem', md: '2.25rem' }
                  }}
                >
                  Local Service Platform
                </Typography>
                
                <Typography 
                  variant="subtitle1" 
                  component="label"
                  sx={{ 
                    display: 'block',
                    fontWeight: 800, 
                    color: '#0F0F14', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    fontSize: '0.85rem',
                    mb: 1.5
                  }}
                >
                  We are not an option, we are a choice
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#4B5563', 
                    lineHeight: 1.75, 
                    mb: 4,
                    fontSize: '1.05rem'
                  }}
                >
                  We're #1 choice of 10 Million people because we're the solution of India's intra-city household and professional service booking problems. With assured safety, we also provide economically priced bookings.
                </Typography>

                <Typography 
                  variant="subtitle1" 
                  component="label"
                  sx={{ 
                    display: 'block',
                    fontWeight: 800, 
                    color: '#0F0F14', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.15em',
                    fontSize: '0.85rem',
                    mb: 1.5
                  }}
                >
                  What makes us different?
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#4B5563', 
                    lineHeight: 1.75,
                    fontSize: '1.05rem'
                  }}
                >
                  Our certified professionals can dodge the booking delays during peak hours and get to your location to solve your problem in a jiffy! So when you think travel, think Rapido; when you think home service, think WORKIZO.
                </Typography>
              </Box>
            </Grid>

            {/* Right side double overlapping image representation */}
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: { xs: '320px', sm: '420px' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Image Box 1: Bottom Left */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    bottom: '5%',
                    left: '5%',
                    width: '65%',
                    height: '70%',
                    bgcolor: '#F4F6F9',
                    borderRadius: `${tokens.borderRadius}px`,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    zIndex: 1,
                    transition: tokens.transition,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      zIndex: 3
                    }
                  }}
                >
                  <HandymanIcon sx={{ fontSize: 48, color: '#0F0F14', mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F0F14', fontSize: '1.1rem' }}>
                    WORKIZO Customer
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', textAlign: 'center', mt: 0.5 }}>
                    Book trusted professionals in one click.
                  </Typography>
                </Box>

                {/* Image Box 2: Top Right Overlapping */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: '5%',
                    right: '5%',
                    width: '65%',
                    height: '70%',
                    bgcolor: '#0F0F14',
                    color: '#ffffff',
                    borderRadius: `${tokens.borderRadius}px`,
                    border: '1px solid #0F0F14',
                    boxShadow: '0 20px 45px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    zIndex: 2,
                    transition: tokens.transition,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      zIndex: 3
                    }
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 48, color: '#ffffff', mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '1.1rem' }}>
                    LJ University Incubated
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', textAlign: 'center', mt: 0.5 }}>
                    Proudly built as a tech startup.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 2. Champions of our success story */}
      <Box sx={{ bgcolor: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            {/* Left Column header */}
            <Grid item xs={12} md={5}>
              <Box>
                <Typography 
                  variant="h3" 
                  component="label"
                  sx={{ 
                    fontFamily: 'Outfit',
                    fontWeight: 900, 
                    color: '#0F0F14', 
                    display: 'block',
                    lineHeight: 1.2,
                    mb: 3,
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}
                >
                  Champions of our success story
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#4B5563', 
                    lineHeight: 1.8,
                    fontSize: '1.05rem'
                  }}
                >
                  WORKIZO has come a long way ever since its conceptualization at LJ University in 2026. With a lot of hardwork and perseverance, we have built a trusted marketplace. As a brand and as a service, it is our constant endeavour to redefine ourselves.
                </Typography>
              </Box>
            </Grid>

            {/* Right Column Team members circles */}
            <Grid item xs={12} md={7}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: { xs: 4, sm: 6 }, 
                  justifyContent: 'center', 
                  flexWrap: 'wrap'
                }}
              >
                {/* Rishi -> Vivek */}
                <Box sx={{ textAlign: 'center', minWidth: '140px' }}>
                  <Box 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: '50%', 
                      overflow: 'hidden', 
                      mx: 'auto',
                      mb: 2,
                      border: '4px solid #FFFFFF',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#0F0F14'
                    }}
                  >
                    <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 900 }}>
                      AV
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F0F14', mb: 0.5 }}>
                    Ambariya Vivek
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Founder
                  </Typography>
                </Box>

                {/* Pavan -> Ved */}
                <Box sx={{ textAlign: 'center', minWidth: '140px' }}>
                  <Box 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: '50%', 
                      overflow: 'hidden', 
                      mx: 'auto',
                      mb: 2,
                      border: '4px solid #FFFFFF',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#0F0F14'
                    }}
                  >
                    <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 900 }}>
                      VG
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F0F14', mb: 0.5 }}>
                    Ved Goyani
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Founder
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 3. Jobs @ WORKIZO / Work with us */}
      <Box sx={{ py: { xs: 10, md: 14 } }}>
        <Container maxWidth="md">
          <Box 
            sx={{ 
              textAlign: 'center', 
              bgcolor: '#0F0F14', 
              color: '#ffffff',
              borderRadius: `${tokens.borderRadius}px`,
              p: { xs: 6, md: 8 },
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          >
            <Typography 
              variant="h3" 
              component="h3" 
              sx={{ 
                fontFamily: 'Outfit', 
                fontWeight: 900, 
                mb: 2.5,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Jobs @ WORKIZO
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#9CA3AF', 
                lineHeight: 1.7, 
                mb: 4.5,
                maxWidth: '500px',
                mx: 'auto'
              }}
            >
              Join us in exploring a world of endless opportunities. Let’s find a spot for you.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/captain/login')}
              sx={{ 
                bgcolor: '#ffffff', 
                color: '#000000', 
                borderRadius: '24px', 
                fontWeight: 'bold',
                px: 5,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: '#F3F4F6'
                }
              }}
            >
              Work with us
            </Button>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default AboutUs;
