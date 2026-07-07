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
    <Box sx={{ bgcolor: tokens.colors.bg, minHeight: '100vh', py: { xs: 6, md: 10 } }}>
      {/* 1. Hero Section */}
      <Container maxWidth="lg" sx={{ mb: { xs: 8, md: 12 } }}>
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
          {/* Left Side Info */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: tokens.colors.accent, 
                  fontWeight: 800, 
                  letterSpacing: '0.15em',
                  display: 'block',
                  mb: 1.5
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
                  color: tokens.colors.primary,
                  lineHeight: 1.15,
                  mb: 3,
                  fontSize: { xs: '2.25rem', md: '3rem' }
                }}
              >
                Building WORKIZO,<br />
                One Service Request at a Time.
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: tokens.colors.textSecondary, 
                  lineHeight: 1.7, 
                  mb: 2.5,
                  fontSize: '1.05rem'
                }}
              >
                WORKIZO is a technology-driven local service platform built to connect customers with trusted service professionals in real time.
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: tokens.colors.textSecondary, 
                  lineHeight: 1.7,
                  fontSize: '1.05rem' 
                }}
              >
                Our goal is to simplify local service booking while creating more job opportunities for skilled workers through a transparent, fast, and reliable digital ecosystem.
              </Typography>
            </Box>
          </Grid>

          {/* Right Side College Placement Card */}
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                bgcolor: '#0F0F14',
                color: '#ffffff',
                borderRadius: `${tokens.borderRadius}px`,
                p: { xs: 4, sm: 6 },
                textAlign: 'center',
                boxShadow: tokens.shadow,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: tokens.transition,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: tokens.shadowHover,
                }
              }}
            >
              {/* College Hub Placeholder representation */}
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(26, 115, 232, 0.1)', 
                  color: tokens.colors.accent, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto',
                  mb: 3
                }}
              >
                <SchoolIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: 'Outfit', 
                  fontWeight: 900, 
                  color: '#ffffff',
                  mb: 1
                }}
              >
                LJ University
              </Typography>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: tokens.colors.textMuted,
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: '0.8rem'
                }}
              >
                Innovation • Learning • Entrepreneurship
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* 2. Our Journey Section */}
      <Box sx={{ bgcolor: tokens.colors.paper, borderTop: `1px solid ${tokens.borderColor}`, borderBottom: `1px solid ${tokens.borderColor}`, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            {/* Left Side Icon visual */}
            <Grid item xs={12} md={5} sx={{ order: { xs: 2, md: 1 } }}>
              <Box 
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: tokens.colors.bg,
                  borderRadius: `${tokens.borderRadius}px`,
                  p: 6,
                  border: `1px solid ${tokens.borderColor}`
                }}
              >
                <TimelineIcon sx={{ fontSize: 120, color: tokens.colors.primary }} />
              </Box>
            </Grid>

            {/* Right Side story text */}
            <Grid item xs={12} md={7} sx={{ order: { xs: 1, md: 2 } }}>
              <Box>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: tokens.colors.accent, 
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
                    color: tokens.colors.primary, 
                    mb: 3
                  }}
                >
                  Our Journey
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: tokens.colors.textSecondary, 
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
                    color: tokens.colors.textSecondary, 
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
                    color: tokens.colors.textSecondary, 
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
      <Container maxWidth="lg" sx={{ my: { xs: 8, md: 12 } }}>
        <Grid container spacing={4}>
          {/* Mission */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', p: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: tokens.colors.accent, mb: 2 }}>
                  <ElectricBoltIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800, mb: 2 }}>
                  Mission
                </Typography>
                <Typography variant="body2" sx={{ color: tokens.colors.textSecondary, lineHeight: 1.6 }}>
                  To simplify home service booking through technology.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Vision */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', p: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: tokens.colors.accent, mb: 2 }}>
                  <VisibilityIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800, mb: 2 }}>
                  Vision
                </Typography>
                <Typography variant="body2" sx={{ color: tokens.colors.textSecondary, lineHeight: 1.6 }}>
                  To become India's most trusted local service platform.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Values */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', p: 2 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: tokens.colors.accent, mb: 2 }}>
                  <StarIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800, mb: 2 }}>
                  Values
                </Typography>
                <Box display="flex" flexDirection="column" gap={0.5} alignItems="center">
                  {['Trust', 'Transparency', 'Reliability', 'Innovation'].map((val) => (
                    <Typography key={val} variant="body2" sx={{ color: tokens.colors.textSecondary, fontWeight: 600 }}>
                      ✓ {val}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* 4. Our Team Section */}
      <Box sx={{ bgcolor: tokens.colors.paper, borderTop: `1px solid ${tokens.borderColor}`, borderBottom: `1px solid ${tokens.borderColor}`, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: tokens.colors.accent, fontWeight: 800, letterSpacing: '0.15em' }}>
              TEAM MEMBERS
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: 'Outfit', fontWeight: 900, color: tokens.colors.primary, mt: 1, mb: 2 }}>
              Meet The Team Behind WORKIZO
            </Typography>
            <Typography variant="body1" sx={{ color: tokens.colors.textSecondary, maxWidth: '600px', mx: 'auto' }}>
              Passionate innovators working together to build a smarter future for local services.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {/* Team Card 1: Ambariya Vivek */}
            <Grid item xs={12} sm={6} md={5}>
              <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Styled Avatar Placeholder */}
                  <Avatar 
                    sx={{ 
                      width: 90, 
                      height: 90, 
                      bgcolor: tokens.colors.primary, 
                      color: '#ffffff',
                      fontFamily: 'Outfit',
                      fontSize: '2rem',
                      fontWeight: 800,
                      mb: 2.5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    AV
                  </Avatar>
                  <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                    Ambariya Vivek
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: tokens.colors.accent, fontWeight: 700, mb: 2 }}>
                    Startup Head
                  </Typography>
                  <Typography variant="body2" sx={{ color: tokens.colors.textSecondary, lineHeight: 1.6, mb: 3 }}>
                    Leading the vision, planning, development, and execution of the WORKIZO platform while driving innovation and product strategy.
                  </Typography>

                  <Box display="flex" gap={1}>
                    <IconButton size="small" sx={{ color: tokens.colors.textSecondary, '&:hover': { color: '#0A66C2' } }}>
                      <LinkedInIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: tokens.colors.textSecondary, '&:hover': { color: tokens.colors.accent } }}>
                      <EmailIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: tokens.colors.textSecondary, '&:hover': { color: '#000000' } }}>
                      <GitHubIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Team Card 2: Ved Goyani */}
            <Grid item xs={12} sm={6} md={5}>
              <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Styled Avatar Placeholder */}
                  <Avatar 
                    sx={{ 
                      width: 90, 
                      height: 90, 
                      bgcolor: tokens.colors.primary, 
                      color: '#ffffff',
                      fontFamily: 'Outfit',
                      fontSize: '2rem',
                      fontWeight: 800,
                      mb: 2.5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    VG
                  </Avatar>
                  <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                    Ved Goyani
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: tokens.colors.accent, fontWeight: 700, mb: 2 }}>
                    Team Member
                  </Typography>
                  <Typography variant="body2" sx={{ color: tokens.colors.textSecondary, lineHeight: 1.6, mb: 3 }}>
                    Contributing to development, research, testing, and implementation of features to build a reliable and scalable service platform.
                  </Typography>

                  <Box display="flex" gap={1}>
                    <IconButton size="small" sx={{ color: tokens.colors.textSecondary, '&:hover': { color: '#0A66C2' } }}>
                      <LinkedInIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: tokens.colors.textSecondary, '&:hover': { color: tokens.colors.accent } }}>
                      <EmailIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: tokens.colors.textSecondary, '&:hover': { color: '#000000' } }}>
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
      <Container maxWidth="lg" sx={{ my: { xs: 8, md: 12 } }}>
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
          {/* Left Side text */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: tokens.colors.accent, 
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
                  color: tokens.colors.primary, 
                  mb: 3
                }}
              >
                Proudly Built at LJ University
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: tokens.colors.textSecondary, 
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
                  color: tokens.colors.textSecondary, 
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
                  color: tokens.colors.textSecondary, 
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
                boxShadow: tokens.shadow,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                minHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, color: tokens.colors.accent }} />
              <Typography variant="h5" sx={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                LJ University Startup Campus
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.colors.textMuted, maxWidth: '320px' }}>
                Providing mentorship, resources, and ecosystem support for student entrepreneurs.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* 6. Why WORKIZO Section */}
      <Box sx={{ bgcolor: tokens.colors.paper, borderTop: `1px solid ${tokens.borderColor}`, borderBottom: `1px solid ${tokens.borderColor}`, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: tokens.colors.accent, fontWeight: 800, letterSpacing: '0.15em' }}>
              ADVANTAGES
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: 'Outfit', fontWeight: 900, color: tokens.colors.primary, mt: 1, mb: 2 }}>
              Why Choose WORKIZO?
            </Typography>
            <Typography variant="body1" sx={{ color: tokens.colors.textSecondary, maxWidth: '600px', mx: 'auto' }}>
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
                <Card sx={{ height: '100%', p: 1 }}>
                  <CardContent sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ color: tokens.colors.accent, mr: 2, display: 'flex', alignItems: 'flex-start', mt: 0.5 }}>
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontFamily: 'Outfit', fontWeight: 700, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: tokens.colors.textSecondary, lineHeight: 1.6 }}>
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
      <Container maxWidth="lg" sx={{ my: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: tokens.colors.accent, fontWeight: 800, letterSpacing: '0.15em' }}>
            ENGINEERING
          </Typography>
          <Typography variant="h3" sx={{ fontFamily: 'Outfit', fontWeight: 900, color: tokens.colors.primary, mt: 1, mb: 2 }}>
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
                borderColor: tokens.borderColor, 
                fontWeight: 600,
                borderRadius: '8px',
                '&:hover': {
                  borderColor: tokens.colors.accent,
                  bgcolor: tokens.colors.accentLight
                },
                transition: tokens.transition
              }}
            />
          ))}
        </Box>
      </Container>

      {/* 8. Footer CTA Section */}
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Box 
          sx={{ 
            bgcolor: '#0F0F14',
            color: '#ffffff',
            borderRadius: `${tokens.borderRadius}px`,
            p: { xs: 5, md: 8 },
            textAlign: 'center',
            boxShadow: tokens.shadow,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              fontFamily: 'Outfit', 
              fontWeight: 900, 
              color: '#ffffff',
              mb: 2.5
            }}
          >
            Join the WORKIZO Journey
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: tokens.colors.textMuted, 
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
