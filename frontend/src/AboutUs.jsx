import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Container, Typography, Button, Box, Avatar
} from '@mui/material';
import { keyframes } from '@mui/system';
import { tokens } from './design/tokens';

// Very slow and subtle floating animations (2px - 4px movement)
const floatSubtle1 = keyframes`
  0% { transform: translate(0px, 0px) rotate(0deg); }
  50% { transform: translate(3px, -3px) rotate(3deg); }
  100% { transform: translate(0px, 0px) rotate(0deg); }
`;

const floatSubtle2 = keyframes`
  0% { transform: translate(0px, 0px) rotate(0deg); }
  50% { transform: translate(-3px, 3px) rotate(-3deg); }
  100% { transform: translate(0px, 0px) rotate(0deg); }
`;

// WORKIZO Branded Outline Icons
const serviceIcons = [
  // Wrench
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/></svg>,
  // Light Bulb
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
  // Paint Roller
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12v4H6z"/><path d="M19 7v5a2 2 0 0 1-2 2H9v7"/><path d="M5 21h8"/></svg>,
  // Gear
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  // Snowflake
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5 7 19"/><path d="M7 5 17 19"/><path d="M20 12H4"/><path d="m12 6 2-2M12 6l-2-2"/><path d="m12 18 2 2M12 18l-2 2"/><path d="m6 12-2 2M6 12l-2-2"/><path d="m18 12 2 2M18 12l-2-2"/></svg>,
  // Water Drop
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z"/></svg>,
  // Home
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  // Toolbox
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><path d="M16 12H8v4h8z"/></svg>,
  // Hammer
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 4 4"/><path d="M21.5 12H16l-3.5 3.5L10 13l3.5-3.5V4z"/><path d="m9 16-5.5 5.5a1 1 0 0 1-1.4 0l-1.6-1.6a1 1 0 0 1 0-1.4L6 13"/></svg>,
  // Electric Bolt
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  // Fan
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 9c1.5-1.5 2-4 1-5s-3.5-.5-5 1c-1.5 1.5-.5 3.5 1 5c-1.5 1.5-4 1-5-1s-.5-3.5 1-5c1.5-1.5 3.5-.5 5 1c1.5-1.5 1-4-1-5s-3.5.5-5 2c-1.5 1.5-.5 3.5 1 5"/></svg>,
  // Measuring Tape
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/><circle cx="10" cy="10" r="3"/><path d="M18 10h4v7a3 3 0 0 1-3 3h-9"/></svg>,
  // Screwdriver
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6 4 4"/><path d="M16 4h4v4h-4z"/><path d="m15 9-9 9H2v-4l9-9"/></svg>
];

// Spaced outline coordinates grid layout
const patternIcons = [
  // Left side coordinate nodes
  { x: 5, y: 15, rotate: 15, size: 28, iconIdx: 0, anim: floatSubtle1 },
  { x: 24, y: 8, rotate: -20, size: 24, iconIdx: 1, anim: floatSubtle2 },
  { x: 42, y: 18, rotate: 30, size: 32, iconIdx: 2, anim: floatSubtle1 },
  { x: 12, y: 48, rotate: 45, size: 22, iconIdx: 3, anim: floatSubtle2 },
  { x: 30, y: 42, rotate: -15, size: 36, iconIdx: 4, anim: floatSubtle1 },
  { x: 48, y: 52, rotate: 10, size: 28, iconIdx: 5, anim: floatSubtle2 },
  { x: 18, y: 78, rotate: -35, size: 30, iconIdx: 6, anim: floatSubtle1 },
  { x: 35, y: 82, rotate: 25, size: 26, iconIdx: 7, anim: floatSubtle2 },
  { x: 52, y: 88, rotate: 0, size: 34, iconIdx: 8, anim: floatSubtle1 },
  
  // Right side coordinate nodes
  { x: 62, y: 12, rotate: 40, size: 30, iconIdx: 9, anim: floatSubtle2 },
  { x: 80, y: 6, rotate: -15, size: 24, iconIdx: 10, anim: floatSubtle1 },
  { x: 92, y: 18, rotate: 35, size: 32, iconIdx: 11, anim: floatSubtle2 },
  { x: 68, y: 45, rotate: -25, size: 22, iconIdx: 12, anim: floatSubtle1 },
  { x: 88, y: 50, rotate: 15, size: 28, iconIdx: 0, anim: floatSubtle2 },
  { x: 64, y: 76, rotate: 30, size: 36, iconIdx: 1, anim: floatSubtle1 },
  { x: 78, y: 88, rotate: -10, size: 26, iconIdx: 2, anim: floatSubtle2 },
  { x: 94, y: 80, rotate: 20, size: 30, iconIdx: 3, anim: floatSubtle1 }
];

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
      
      {/* 1. New "About WORKIZO" Hero Section with Branded Wallpaper Pattern */}
      <Box 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          pt: '80px', 
          pb: '80px',
          bgcolor: '#FFFFFF', // Solid clean white background to prevent any blue gradient overlap
          borderBottom: '1px solid #F3F4F6'
        }}
      >
        {/* Render Branded Repeating Service Pattern */}
        {patternIcons.map((node, index) => (
          <Box 
            key={index}
            sx={{ 
              position: 'absolute',
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              color: '#3B82F6', // Clear but extremely subtle blue outline
              opacity: 0.09,    // Set opacity to 9% so it's perfectly visible on clean white background
              transform: `rotate(${node.rotate}deg)`,
              animation: `${node.anim} 14s ease-in-out infinite`,
              zIndex: 0,
              pointerEvents: 'none',
              display: { 
                xs: index < 7 ? 'block' : 'none', // Less icons on mobile
                sm: 'block' 
              }
            }}
          >
            {serviceIcons[node.iconIdx]}
          </Box>
        ))}

        <Container 
          maxWidth={false} 
          sx={{ 
            position: 'relative',
            zIndex: 1,
            maxWidth: '1280px', 
            mx: 'auto',
            px: { xs: 3, md: 4 }
          }}
        >
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',       // Mobile
                sm: '1fr',       // Tablet stack
                md: '55% 45%'    // Desktop
              },
              gap: '64px',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            {/* Left Side (55%) */}
            <Box sx={{ maxWidth: { md: '620px', xs: '100%' }, mx: { xs: 'auto', md: 0 } }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: '#6B7280', 
                  fontWeight: 800, 
                  letterSpacing: '0.2em',
                  display: 'block',
                  mb: '16px',
                  fontSize: '0.8rem'
                }}
              >
                ABOUT WORKIZO
              </Typography>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontFamily: 'Outfit', 
                  fontWeight: 900, 
                  color: '#0F0F14',
                  lineHeight: 1.15,
                  mb: '32px',
                  fontSize: { xs: '2.25rem', md: '3.25rem' }
                }}
              >
                Connecting Customers with Trusted Local Professionals.
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', mb: '40px' }}>
                <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.8, fontSize: '1.05rem' }}>
                  WORKIZO is a technology-driven local service platform developed to simplify the way customers book trusted home service professionals.
                </Typography>
                <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.8, fontSize: '1.05rem' }}>
                  Our platform connects customers with verified electricians, plumbers, carpenters, AC technicians, experts, and home cleaning experts in real time through a transparent, reliable, and user-friendly booking experience.
                </Typography>
                <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.8, fontSize: '1.05rem' }}>
                  By combining modern web technologies with real-time communication, WORKIZO aims to create better opportunities for local professionals while delivering fast and dependable services to customers.
                </Typography>
              </Box>

              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  flexWrap: 'wrap'
                }}
              >
                <Button 
                  variant="contained" 
                  onClick={handleBookServiceClick}
                  sx={{ 
                    bgcolor: '#0F0F14', 
                    color: '#ffffff', 
                    borderRadius: '24px', 
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.25,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#222222',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Book a Service
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/captain/login')}
                  sx={{ 
                    borderColor: '#0F0F14', 
                    color: '#0F0F14', 
                    borderRadius: '24px', 
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.25,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      borderColor: '#222222',
                      bgcolor: 'rgba(15, 15, 20, 0.04)'
                    }
                  }}
                >
                  Become a Captain
                </Button>
              </Box>
            </Box>

            {/* Right Side (45%) */}
            <Box 
              sx={{ 
                position: 'relative',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: { xs: 'center', md: 'flex-start' },
                width: '100%',
                maxWidth: { md: '480px', xs: '100%' },
                mx: 'auto'
              }}
            >
              {/* Single soft light-blue circular glow behind the image card to create depth */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: '-10%',
                  left: '-10%',
                  width: '120%',
                  height: '120%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, rgba(255,255,255,0) 70%)',
                  filter: 'blur(30px)',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}
              />

              {/* Premium image placeholder card */}
              <Box 
                sx={{ 
                  width: '100%', 
                  aspectRatio: '16/9', 
                  bgcolor: '#F4F6F9', 
                  borderRadius: '24px', 
                  boxShadow: '0 20px 40px rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6B7280',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  mb: '24px',
                  position: 'relative',
                  zIndex: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 25px 50px rgba(59, 130, 246, 0.15)'
                  }
                }}
              >
                LJ University Campus Image
              </Box>
              
              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, position: 'relative', zIndex: 2 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#9CA3AF', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  Proudly Built at
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontFamily: 'Outfit', 
                    fontWeight: 800, 
                    color: '#0F0F14',
                    mb: 0.5
                  }}
                >
                  LJ University
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#6B7280', 
                    fontWeight: 600
                  }}
                >
                  Innovation • Entrepreneurship • Technology
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 2. Existing "Champions of our startup project" Section */}
      <Box 
        sx={{ 
          pt: '64px',
          pb: '80px',
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #F3F4F6'
        }}
      >
        <Container 
          maxWidth={false} 
          sx={{ 
            maxWidth: '1280px', 
            mx: 'auto',
            px: { xs: 3, md: 4 }
          }}
        >
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '55% 45%',
                md: '60% 40%'
              },
              gap: '64px',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Left Column (60% Desktop / 55% Tablet) */}
            <Box 
              sx={{ 
                maxWidth: { sm: '600px', xs: '100%' }, 
                mx: { xs: 'auto', sm: 0 },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontFamily: 'Outfit', 
                  fontWeight: 900, 
                  color: '#0F0F14',
                  lineHeight: 1.15,
                  mb: '32px',
                  fontSize: { xs: '2.5rem', md: '3.75rem' },
                  mx: { xs: 'auto', sm: 0 }
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
                of our startup project
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#4B5563', 
                  lineHeight: 1.8, 
                  mb: '24px',
                  fontSize: '1.05rem',
                  mx: { xs: 'auto', sm: 0 }
                }}
              >
                WORKIZO is our startup project developed as part of our coursework at LJ University. With dedication and hardwork, we have created a comprehensive local service platform that demonstrates real-world application of technology in solving booking and service delivery challenges.
              </Typography>

              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#4B5563', 
                  lineHeight: 1.8,
                  fontSize: '1.05rem',
                  mx: { xs: 'auto', sm: 0 }
                }}
              >
                This project showcases our skills in web development, database management, and user experience design, combining cutting-edge technology with practical solutions to revolutionize household services.
              </Typography>
            </Box>

            {/* Right Column (40% Desktop / 45% Tablet) */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                justifyContent: 'center',
                alignItems: 'center',
                gap: '56px',
                width: '100%',
                mx: 'auto'
              }}
            >
              {/* Profile 1: Ambariya Vivek */}
              <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                      width: 176, 
                      height: 176, 
                      bgcolor: '#0F0F14', 
                      color: '#ffffff',
                      fontFamily: 'Outfit',
                      fontSize: '2.75rem',
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
              <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                      width: 176, 
                      height: 176, 
                      bgcolor: '#0F0F14', 
                      color: '#ffffff',
                      fontFamily: 'Outfit',
                      fontSize: '2.75rem',
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
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default AboutUs;
