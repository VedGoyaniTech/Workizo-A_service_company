import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Container, Typography, Button, Box, Grid, Card, CardContent, 
  Avatar, IconButton, Divider, Chip
} from '@mui/material';
import { tokens } from './design/tokens';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import SecurityIcon from '@mui/icons-material/Security';
import TimelineIcon from '@mui/icons-material/Timeline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import AutorenewIcon from '@mui/icons-material/Autorenew';

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
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', color: '#0F0F14' }}>
      
      {/* 1. Hero Section */}
      <Box sx={{ py: { xs: 8, md: 14 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            {/* Left Side Info */}
            <Grid item xs={12} md={7}>
              <Box>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: '#0F0F14', 
                    fontWeight: 800, 
                    letterSpacing: '0.2em',
                    display: 'block',
                    mb: 2,
                    fontSize: '0.8rem'
                  }}
                >
                  ABOUT WORKIZO
                </Typography>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{ 
                    fontFamily: 'Outfit', 
                    fontWeight: 900, 
                    color: '#0F0F14',
                    lineHeight: 1.1,
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.75rem' }
                  }}
                >
                  Building WORKIZO,<br />
                  One Service Request at a Time.
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#4B5563', 
                    lineHeight: 1.75, 
                    mb: 3,
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }}
                >
                  WORKIZO is a technology-driven local service platform built to connect customers with trusted service professionals in real time.
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#6B7280', 
                    lineHeight: 1.75,
                    fontSize: '1.05rem' 
                  }}
                >
                  Our goal is to simplify local service booking while creating more job opportunities for skilled workers through a transparent, fast, and reliable digital ecosystem.
                </Typography>
              </Box>
            </Grid>

            {/* Right Side College Placement Card */}
            <Grid item xs={12} md={5}>
              <Box 
                sx={{ 
                  bgcolor: '#0F0F14',
                  color: '#ffffff',
                  borderRadius: `${tokens.borderRadius}px`,
                  p: { xs: 5, sm: 7 },
                  textAlign: 'center',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #0F0F14',
                  transition: tokens.transition,
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.25)',
                  }
                }}
              >
                <Box 
                  sx={{ 
                    width: 72, 
                    height: 72, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(255, 255, 255, 0.1)', 
                    color: '#ffffff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 36 }} />
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontFamily: 'Outfit', 
                    fontWeight: 900, 
                    color: '#ffffff',
                    mb: 1.5
                  }}
                >
                  LJ University
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: '#9CA3AF',
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                  }}
                >
                  Innovation • Learning • Entrepreneurship
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 2. Our Journey Section */}
      <Box sx={{ bgcolor: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            {/* Left Side Icon visual */}
            <Grid item xs={12} md={5} sx={{ order: { xs: 2, md: 1 } }}>
              <Box 
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#FFFFFF',
                  borderRadius: `${tokens.borderRadius}px`,
                  p: 6,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                }}
              >
                <TimelineIcon sx={{ fontSize: 100, color: '#0F0F14' }} />
              </Box>
            </Grid>

            {/* Right Side story text */}
            <Grid item xs={12} md={7} sx={{ order: { xs: 1, md: 2 } }}>
              <Box>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: '#0F0F14', 
                    fontWeight: 800, 
                    letterSpacing: '0.15em',
                    display: 'block',
                    mb: 1
                  }}
                >
                  HISTORY
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontFamily: 'Outfit', 
                    fontWeight: 900, 
                    color: '#0F0F14', 
                    mb: 3,
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}
                >
                  Our Journey
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#4B5563', 
                    lineHeight: 1.8, 
                    mb: 2.5,
                    fontSize: '1.05rem'
                  }}
                >
                  WORKIZO was conceptualized and developed as an innovation-driven startup project at LJ University.
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#4B5563', 
                    lineHeight: 1.8, 
                    mb: 2.5,
                    fontSize: '1.05rem'
                  }}
                >
                  The vision behind WORKIZO is to bridge the gap between customers and skilled local workers by providing a simple, transparent, and real-time service booking platform.
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#6B7280', 
                    lineHeight: 1.8,
                    fontSize: '1.05rem'
                  }}
                >
                  The platform focuses on empowering local professionals while delivering faster and more reliable home services to customers.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 3. Our Mission / Vision / Values Section */}
      <Box sx={{ py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Mission */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                <CardContent sx={{ textAlign: 'center', p: 0 }}>
                  <Box sx={{ color: '#0F0F14', mb: 2 }}>
                    <ElectricBoltIcon sx={{ fontSize: 36 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800, mb: 1.5 }}>
                    Mission
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6 }}>
                    To simplify home service booking through technology.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Vision */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                <CardContent sx={{ textAlign: 'center', p: 0 }}>
                  <Box sx={{ color: '#0F0F14', mb: 2 }}>
                    <VisibilityIcon sx={{ fontSize: 36 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800, mb: 1.5 }}>
                    Vision
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6 }}>
                    To become India's most trusted local service platform.
                  </Typography>
                </CardContent>
              </Grid>

              {/* Values */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                  <CardContent sx={{ textAlign: 'center', p: 0 }}>
                    <Box sx={{ color: '#0F0F14', mb: 2 }}>
                      <StarIcon sx={{ fontSize: 36 }} />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800, mb: 1.5 }}>
                      Values
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={0.5} alignItems="center">
                      {['Trust', 'Transparency', 'Reliability', 'Innovation'].map((val) => (
                        <Typography key={val} variant="body2" sx={{ color: '#4B5563', fontWeight: 600 }}>
                          ✓ {val}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
      </Box>

      {/* 4. Our Team Section */}
      <Box sx={{ bgcolor: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#0F0F14', fontWeight: 800, letterSpacing: '0.15em' }}>
              TEAM MEMBERS
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: 'Outfit', fontWeight: 900, color: '#0F0F14', mt: 1, mb: 2 }}>
              Meet The Team Behind WORKIZO
            </Typography>
            <Typography variant="body1" sx={{ color: '#4B5563', maxWidth: '600px', mx: 'auto' }}>
              Passionate innovators working together to build a smarter future for local services.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {/* Team Card 1: Ambariya Vivek */}
            <Grid item xs={12} sm={6} md={5}>
              <Card sx={{ height: '100%', p: 4, border: '1px solid #E5E7EB', boxShadow: 'none', textAlign: 'center', bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0 }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: '#0F0F14', 
                      color: '#ffffff',
                      fontFamily: 'Outfit',
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      mb: 2.5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >
                    AV
                  </Avatar>
                  <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                    Ambariya Vivek
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#6B7280', fontWeight: 700, mb: 2 }}>
                    Startup Head
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6, mb: 3 }}>
                    Leading the vision, planning, development, and execution of the WORKIZO platform while driving innovation and product strategy.
                  </Typography>

                  <Box display="flex" gap={1}>
                    <IconButton size="small" sx={{ color: '#0F0F14', '&:hover': { color: '#000000', bgcolor: 'rgba(0,0,0,0.04)' } }}>
                      <LinkedInIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#0F0F14', '&:hover': { color: '#000000', bgcolor: 'rgba(0,0,0,0.04)' } }}>
                      <EmailIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#0F0F14', '&:hover': { color: '#000000', bgcolor: 'rgba(0,0,0,0.04)' } }}>
                      <GitHubIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Team Card 2: Ved Goyani */}
            <Grid item xs={12} sm={6} md={5}>
              <Card sx={{ height: '100%', p: 4, border: '1px solid #E5E7EB', boxShadow: 'none', textAlign: 'center', bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0 }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: '#0F0F14', 
                      color: '#ffffff',
                      fontFamily: 'Outfit',
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      mb: 2.5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  >
                    VG
                  </Avatar>
                  <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                    Ved Goyani
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#6B7280', fontWeight: 700, mb: 2 }}>
                    Team Member
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6, mb: 3 }}>
                    Contributing to development, research, testing, and implementation of features to build a reliable and scalable service platform.
                  </Typography>

                  <Box display="flex" gap={1}>
                    <IconButton size="small" sx={{ color: '#0F0F14', '&:hover': { color: '#000000', bgcolor: 'rgba(0,0,0,0.04)' } }}>
                      <LinkedInIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#0F0F14', '&:hover': { color: '#000000', bgcolor: 'rgba(0,0,0,0.04)' } }}>
                      <EmailIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#0F0F14', '&:hover': { color: '#000000', bgcolor: 'rgba(0,0,0,0.04)' } }}>
                      <GitHubIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 5. Our College Section */}
      <Box sx={{ py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            {/* Left Side text */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: '#0F0F14', 
                    fontWeight: 800, 
                    letterSpacing: '0.15em',
                    display: 'block',
                    mb: 1
                  }}
                >
                  INCUBATOR
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontFamily: 'Outfit', 
                    fontWeight: 900, 
                    color: '#0F0F14', 
                    mb: 3
                  }}
                >
                  Proudly Built at LJ University
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#4B5563', 
                    lineHeight: 1.75, 
                    mb: 2.5,
                    fontSize: '1.05rem'
                  }}
                >
                  WORKIZO is proudly developed as an innovation-focused startup project at LJ University.
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#4B5563', 
                    lineHeight: 1.75, 
                    mb: 2.5,
                    fontSize: '1.05rem'
                  }}
                >
                  The university has provided an environment that encourages creativity, entrepreneurship, teamwork, and practical problem solving.
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#6B7280', 
                    lineHeight: 1.75,
                    fontSize: '1.05rem'
                  }}
                >
                  This project reflects our commitment to transforming innovative ideas into real-world digital solutions.
                </Typography>
              </Box>
            </Grid>

            {/* Right Side College image placeholder */}
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  bgcolor: '#0F0F14',
                  color: '#ffffff',
                  borderRadius: `${tokens.borderRadius}px`,
                  p: { xs: 6, sm: 8 },
                  textAlign: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  border: '1px solid #0F0F14',
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2
                }}
              >
                <SchoolIcon sx={{ fontSize: 60, color: '#ffffff' }} />
                <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                  LJ University Startup Campus
                </Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF', maxWidth: '320px' }}>
                  Providing mentorship, resources, and ecosystem support for student entrepreneurs.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 6. Why WORKIZO Section */}
      <Box sx={{ bgcolor: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#0F0F14', fontWeight: 800, letterSpacing: '0.15em' }}>
              ADVANTAGES
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: 'Outfit', fontWeight: 900, color: '#0F0F14', mt: 1, mb: 2 }}>
              Why Choose WORKIZO?
            </Typography>
            <Typography variant="body1" sx={{ color: '#4B5563', maxWidth: '600px', mx: 'auto' }}>
              Designed to optimize local household bookings and create stable opportunities.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                title: 'Real-Time Service Requests',
                desc: 'Instant connection between customers and available service professionals.',
                icon: <ElectricBoltIcon />
              },
              {
                title: 'Verified Professionals',
                desc: 'Only approved and verified captains can accept bookings.',
                icon: <SecurityIcon />
              },
              {
                title: 'Transparent Workflow',
                desc: 'Track every service request from booking to completion.',
                icon: <VisibilityIcon />
              },
              {
                title: 'Technology Driven',
                desc: 'Built using React, Django, MySQL, AI-powered OCR, and real-time communication.',
                icon: <TerminalIcon />
              }
            ].map((feature, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Card sx={{ height: '100%', p: 1, border: '1px solid #E5E7EB', boxShadow: 'none', bgcolor: '#FFFFFF' }}>
                  <CardContent sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ color: '#0F0F14', mr: 2, display: 'flex', alignItems: 'flex-start', mt: 0.5 }}>
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontFamily: 'Outfit', fontWeight: 700, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6 }}>
                        {feature.desc}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 7. Technology Stack Section */}
      <Box sx={{ py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="overline" sx={{ color: '#0F0F14', fontWeight: 800, letterSpacing: '0.15em' }}>
              ENGINEERING
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: 'Outfit', fontWeight: 900, color: '#0F0F14', mt: 1, mb: 2 }}>
              Technology Stack
            </Typography>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1.5} justifyContent="center" sx={{ maxWidth: '800px', mx: 'auto' }}>
            {[
              { name: 'React', icon: <TerminalIcon sx={{ fontSize: 16 }} /> },
              { name: 'Django', icon: <CloudQueueIcon sx={{ fontSize: 16 }} /> },
              { name: 'MySQL', icon: <StorageIcon sx={{ fontSize: 16 }} /> },
              { name: 'WebSockets', icon: <AutorenewIcon sx={{ fontSize: 16 }} /> },
              { name: 'OpenCV', icon: <VisibilityIcon sx={{ fontSize: 16 }} /> },
              { name: 'EasyOCR', icon: <VisibilityIcon sx={{ fontSize: 16 }} /> },
              { name: 'JWT Authentication', icon: <SecurityIcon sx={{ fontSize: 16 }} /> },
              { name: 'Google Authentication', icon: <SecurityIcon sx={{ fontSize: 16 }} /> },
              { name: 'Responsive Design', icon: <TerminalIcon sx={{ fontSize: 16 }} /> }
            ].map((tech) => (
              <Chip 
                key={tech.name}
                icon={tech.icon}
                label={tech.name}
                variant="outlined"
                sx={{ 
                  px: 1.5, 
                  py: 2.2, 
                  borderColor: '#E5E7EB', 
                  color: '#0F0F14',
                  fontWeight: 600,
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  '&:hover': {
                    borderColor: '#0F0F14',
                    bgcolor: 'rgba(0,0,0,0.04)'
                  },
                  transition: tokens.transition
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* 8. Footer CTA Section */}
      <Container maxWidth="md" sx={{ pb: 10 }}>
        <Box 
          sx={{ 
            bgcolor: '#0F0F14',
            color: '#ffffff',
            borderRadius: `${tokens.borderRadius}px`,
            p: { xs: 6, md: 8 },
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid #0F0F14'
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              fontFamily: 'Outfit', 
              fontWeight: 900, 
              color: '#ffffff',
              mb: 2.5,
              fontSize: { xs: '2rem', md: '2.75rem' }
            }}
          >
            Join the WORKIZO Journey
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#9CA3AF', 
              lineHeight: 1.7, 
              mb: 5,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Whether you're looking for trusted home services or want to become a verified service professional, WORKIZO is built to make the experience simple, reliable, and efficient.
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button 
              variant="contained" 
              onClick={handleBookServiceClick}
              sx={{ 
                bgcolor: '#ffffff', 
                color: '#000000', 
                borderRadius: '24px', 
                fontWeight: 'bold',
                px: 4,
                py: 1.25,
                '&:hover': {
                  bgcolor: '#F3F4F6'
                }
              }}
            >
              Book a Service
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/captain/login')}
              sx={{ 
                borderColor: '#ffffff', 
                color: '#ffffff', 
                borderRadius: '24px', 
                fontWeight: 'bold',
                px: 4,
                py: 1.25,
                '&:hover': {
                  borderColor: '#E5E7EB',
                  bgcolor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Become a Captain
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUs;
