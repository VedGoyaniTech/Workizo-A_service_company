import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Container, Typography, Button, Box, Grid, Card, CardContent,
  Avatar, TextField, InputAdornment, Select, MenuItem, InputLabel,
  FormControl, CardActionArea, useTheme, Divider, Rating, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RoomIcon from '@mui/icons-material/Room';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import HandymanIcon from '@mui/icons-material/Handyman';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BuildIcon from '@mui/icons-material/Build';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StarsIcon from '@mui/icons-material/Stars';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const ALL_CATEGORIES = [
  { id: '1', name: 'Electrician', icon: <ElectricalServicesIcon sx={{ fontSize: 32, color: '#f59e0b' }} />, bgColor: 'rgba(245, 158, 11, 0.08)', desc: 'Fan, lights & wiring repairs' },
  { id: '2', name: 'Plumber', icon: <PlumbingIcon sx={{ fontSize: 32, color: '#3b82f6' }} />, bgColor: 'rgba(59, 130, 246, 0.08)', desc: 'Taps, pipes & leak fixes' },
  { id: '3', name: 'Carpenter', icon: <HandymanIcon sx={{ fontSize: 32, color: '#10b981' }} />, bgColor: 'rgba(16, 185, 129, 0.08)', desc: 'Furniture, lock & door repairs' },
  { id: '4', name: 'AC Technician', icon: <AcUnitIcon sx={{ fontSize: 32, color: '#06b6d4' }} />, bgColor: 'rgba(6, 182, 212, 0.08)', desc: 'AC filter, gas & serving' },
  { id: '5', name: 'Mechanic', icon: <BuildIcon sx={{ fontSize: 32, color: '#ef4444' }} />, bgColor: 'rgba(239, 68, 68, 0.08)', desc: 'Bike & car engine checks' },
  { id: '6', name: 'Home Cleaning', icon: <CleaningServicesIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />, bgColor: 'rgba(139, 92, 246, 0.08)', desc: 'Deep house & kitchen cleaning' },
];

const OFFERS = [
  { title: 'Summer AC Servicing', desc: 'Starting at just ₹299. Deep cleaning, filter washing.', tag: 'BESTSELLER', gradient: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', price: '₹299', textColor: '#0F0F14', tagBg: '#BAE6FD', tagColor: '#0369A1' },
  { title: 'Full Home Cleaning', desc: 'Flat 20% Off. Deep wash, kitchen & bathroom sanitizing.', tag: 'FESTIVE SPECIAL', gradient: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', price: '₹999', textColor: '#0F0F14', tagBg: '#BBF7D0', tagColor: '#15803D' },
  { title: 'Express Electrician', desc: 'Captains arrive within 45 mins. Secure wiring fixes.', tag: 'SUPER FAST', gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', price: '₹99', textColor: '#0F0F14', tagBg: '#FDE68A', tagColor: '#B45309' },
];

const TESTIMONIALS = [
  { name: 'Kunal Patel', location: 'Satellite, Ahmedabad', text: 'Booked an AC servicing Captain. He arrived within an hour with proper tools and fixed the cooling immediately. Excellent service!', rating: 5 },
  { name: 'Aarushi Shah', location: 'Vastrapur, Ahmedabad', text: 'The deep kitchen cleaning was flawless. Vetted professional, safe background checks. Very reliable.', rating: 5 },
  { name: 'Mehul Mehta', location: 'Bopal, Ahmedabad', text: 'Quick carpenter booking to fix our entrance door latch. Fair pricing, no hassles. Fully satisfied.', rating: 4 },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('Ahmedabad');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = ALL_CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryClick = (catName) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/customer/login');
    } else {
      toast.success(`You selected ${catName}. Service Booking will be unlocked in Phase 2.`);
    }
  };

  return (
    <Box sx={{ pb: 8 }}>
      
      {/* Hero Header with Location and Search */}
      <Box 
        sx={{
          background: '#ffffff',
          pt: { xs: 8, md: 10 },
          pb: { xs: 6, md: 8 },
          borderBottom: '1px solid #E5E7EB',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: '2.2rem', md: '3.4rem' },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              mb: 1.5,
              color: '#0F0F14'
            }}
          >
            Home services, on demand.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5, fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
            Connecting you with background-verified local service professionals.
          </Typography>

          {/* Search bar widget */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 1, 
              display: 'flex', 
              alignItems: 'center', 
              mx: 'auto', 
              maxWidth: '650px', 
              backgroundColor: '#ffffff',
              border: '1px solid #E5E7EB',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 0 }
            }}
          >
            {/* Location selector */}
            <Box display="flex" alignItems="center" sx={{ pl: 1, minWidth: '160px', width: { xs: '100%', sm: 'auto' } }}>
              <RoomIcon sx={{ color: '#000000', mr: 1 }} />
              <Select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                variant="standard"
                disableUnderline
                sx={{ 
                  color: '#0F0F14', 
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <MenuItem value="Ahmedabad">Ahmedabad</MenuItem>
                <MenuItem value="Mumbai">Mumbai</MenuItem>
                <MenuItem value="Delhi">Delhi NCR</MenuItem>
                <MenuItem value="Bangalore">Bangalore</MenuItem>
                <MenuItem value="Pune">Pune</MenuItem>
              </Select>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, mx: 2, borderColor: '#E5E7EB' }} />

            {/* Service Search Input */}
            <TextField
              placeholder="Search for 'AC service', 'plumber', 'electrician'..."
              variant="standard"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#6B7280', ml: { xs: 0, sm: 1 } }} />
                  </InputAdornment>
                ),
                style: { color: '#0F0F14', fontSize: '0.95rem' }
              }}
              sx={{ width: '100%' }}
            />
          </Paper>
        </Container>
      </Box>

      {/* Urban Company Circular Icon Grid */}
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Typography variant="h5" fontWeight="bold" align="center" sx={{ mb: 4 }}>
          Select a Service Category
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          {filteredCategories.map((cat) => (
            <Grid item xs={6} sm={4} md={2} key={cat.id} sx={{ textAlign: 'center' }}>
              <Box 
                onClick={() => handleCategoryClick(cat.name)}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: cat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1.5,
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  transition: 'transform 0.2s, border-color 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    borderColor: '#000000'
                  }
                }}
              >
                {cat.icon}
              </Box>
              <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                {cat.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {cat.desc}
              </Typography>
            </Grid>
          ))}
          {filteredCategories.length === 0 && (
            <Box sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              No categories match your search. Try "AC", "electrician", etc.
            </Box>
          )}
        </Grid>
      </Container>

      {/* Offers and Promotions list */}
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
          Offers for you in {city}
        </Typography>

        <Box 
          sx={{ 
            display: 'flex', 
            gap: 3, 
            overflowX: 'auto', 
            pb: 2,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {OFFERS.map((offer, idx) => (
            <Card 
              key={idx}
              sx={{ 
                minWidth: { xs: '280px', sm: '360px' }, 
                background: offer.gradient, 
                borderColor: '#E5E7EB', 
                borderRadius: 2
              }}
            >
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Chip 
                  label={offer.tag} 
                  size="small" 
                  sx={{ 
                    bgcolor: offer.tagBg, 
                    color: offer.tagColor, 
                    fontWeight: 'bold',
                    width: 'fit-content',
                    mb: 2,
                    fontSize: '0.7rem'
                  }} 
                />
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: offer.textColor }}>
                  {offer.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, flexGrow: 1 }}>
                  {offer.desc}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    {offer.price}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small"
                    onClick={() => navigate('/customer/login')}
                  >
                    Book Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Safety & Assurance Section */}
      <Container maxWidth="lg" sx={{ mt: 10, pt: 8, borderTop: '1px solid #E5E7EB' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={5}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
              Workizo Quality & Safety Assurance
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Just like India's top home platforms, we prioritize trust, background verification, and quality of work.
            </Typography>
            <Button variant="outlined" color="primary" onClick={() => navigate('/captain/register')}>
              Become a Verified Captain
            </Button>
          </Grid>
          <Grid item xs={12} md={7}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#E5E7EB' }}>
                  <VerifiedUserIcon color="primary" sx={{ fontSize: 36, mb: 1.5 }} />
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    100% KYC Verified
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Every Captain is verified via Aadhaar & PAN background checks prior to platform listing.
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#E5E7EB' }}>
                  <MonetizationOnIcon color="primary" sx={{ fontSize: 36, mb: 1.5 }} />
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Standardized Pricing
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No bargaining. Get fixed, fair quotes for all categories before work begins.
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ p: 3, backgroundColor: '#ffffff', borderColor: '#E5E7EB' }}>
                  <StarsIcon sx={{ color: '#F59E0B', fontSize: 36, mb: 1.5 }} />
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Elite Trained Captains
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Only experienced local experts are matched to guarantee 100% satisfaction.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Ahmedabad Testimonials */}
      <Container maxWidth="lg" sx={{ mt: 10, pt: 8, borderTop: '1px solid #E5E7EB' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 5 }}>
          Customer reviews in Ahmedabad
        </Typography>

        <Grid container spacing={3}>
          {TESTIMONIALS.map((test, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ p: 3, height: '100%', backgroundColor: '#ffffff', borderColor: '#E5E7EB' }}>
                <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#000000' }}>{test.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {test.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {test.location}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={test.rating} readOnly size="small" sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  "{test.text}"
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

    </Box>
  );
};

// Simple Mock chip for promotions
const Chip = ({ label, size, sx }) => (
  <Box 
    sx={{ 
      px: 1.5, 
      py: 0.5, 
      borderRadius: 1, 
      display: 'inline-block',
      ...sx 
    }}
  >
    <Typography variant="caption">{label}</Typography>
  </Box>
);

export default LandingPage;
