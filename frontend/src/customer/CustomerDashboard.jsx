import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Button, Typography, List, ListItem, ListItemText,
  InputBase, Grid, Chip, CircularProgress, Paper, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, LinearProgress
} from '@mui/material';
import api from '../services/api';
import toast from 'react-hot-toast';
import BookingTimeline from './BookingTimeline';

import HandymanIcon from '@mui/icons-material/Handyman';
import RoomIcon from '@mui/icons-material/Room';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import OpacityIcon from '@mui/icons-material/Opacity';
import CarpenterIcon from '@mui/icons-material/Carpenter';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ConstructionIcon from '@mui/icons-material/Construction';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import SearchIcon from '@mui/icons-material/Search';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

import { tokens, span } from '../design/tokens';
import {
  DashboardPage, DashboardGrid, DashboardCard
} from '../components/dashboard';

// ─── Category styles ──────────────────────────────────────────────────────────
const CATEGORY_STYLES = {
  'Electrician': {
    icon: <FlashOnIcon sx={{ fontSize: 28, color: '#f59e0b' }} />,
    bgColor: 'rgba(245, 158, 11, 0.10)',
    borderColor: '#f59e0b',
  },
  'Plumber': {
    icon: <OpacityIcon sx={{ fontSize: 28, color: '#3b82f6' }} />,
    bgColor: 'rgba(59, 130, 246, 0.10)',
    borderColor: '#3b82f6',
  },
  'Carpenter': {
    icon: <CarpenterIcon sx={{ fontSize: 28, color: '#10b981' }} />,
    bgColor: 'rgba(16, 185, 129, 0.10)',
    borderColor: '#10b981',
  },
  'AC Technician': {
    icon: <AcUnitIcon sx={{ fontSize: 28, color: '#06b6d4' }} />,
    bgColor: 'rgba(6, 182, 212, 0.10)',
    borderColor: '#06b6d4',
  },
  'Mechanic': {
    icon: <ConstructionIcon sx={{ fontSize: 28, color: '#ef4444' }} />,
    bgColor: 'rgba(239, 68, 68, 0.10)',
    borderColor: '#ef4444',
  },
  'Home Cleaning': {
    icon: <CleaningServicesIcon sx={{ fontSize: 28, color: '#8b5cf6' }} />,
    bgColor: 'rgba(139, 92, 246, 0.10)',
    borderColor: '#8b5cf6',
  }
};

const CITIES = ['Ahmedabad', 'Mumbai', 'Delhi NCR', 'Bangalore', 'Pune', 'Surat', 'Vadodara'];

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    searching:        { color: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)'    },
    accepted:         { color: '#1A73E8', bg: 'rgba(26,115,232,0.08)', border: 'rgba(26,115,232,0.2)'   },
    on_the_way:       { color: '#1A73E8', bg: 'rgba(26,115,232,0.08)', border: 'rgba(26,115,232,0.2)'   },
    arrived:          { color: '#0891b2', bg: 'rgba(8,145,178,0.08)',  border: 'rgba(8,145,178,0.2)'    },
    inspection:       { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)'   },
    repair_started:   { color: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)'   },
    repair_completed: { color: '#16A34A', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.2)'   },
    completed:        { color: '#16A34A', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.2)'   },
    cancelled:        { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.2)'   },
  };
  const s = map[status] || { color: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center',
      px: 1.5, py: 0.4,
      borderRadius: '20px',
      bgcolor: s.bg,
      border: `1px solid ${s.border}`,
      flexShrink: 0,
    }}>
      <Typography variant="caption" sx={{ color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {status.replace(/_/g, ' ')}
      </Typography>
    </Box>
  );
}

// Helpers
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const getCardTimelineProgress = (status) => {
  switch (status) {
    case 'searching':
      return 20;
    case 'accepted':
    case 'on_the_way':
      return 40;
    case 'arrived':
    case 'verified':
      return 60;
    case 'inspection':
    case 'repair_started':
    case 'repair_completed':
    case 'waiting_approval':
      return 80;
    case 'completed':
      return 100;
    default:
      return 0;
  }
};

const getCardProgressLabel = (status) => {
  switch (status) {
    case 'searching':
      return 'Finding Captain';
    case 'accepted':
    case 'on_the_way':
      return 'Captain Assigned';
    case 'arrived':
    case 'verified':
      return 'Captain Arrived';
    case 'inspection':
    case 'repair_started':
    case 'repair_completed':
    case 'waiting_approval':
      return 'Repair In Progress';
    case 'completed':
      return 'Completed';
    default:
      return 'Processing';
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookings,    setBookings]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Tracking details drawer state
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (bookingId) => {
    setSelectedBookingId(bookingId);
    setDetailsOpen(true);
  };

  useEffect(() => {
    if (location.state?.openBookingId) {
      setSelectedBookingId(location.state.openBookingId);
      setDetailsOpen(true);
      // Clear navigation state to prevent re-opening on back navigate/refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Location state
  const [locationLabel,   setLocationLabel]   = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDenied,  setLocationDenied]  = useState(false);
  const [changeOpen,      setChangeOpen]      = useState(false);
  const [manualCity,      setManualCity]      = useState('');

  // ─── Data fetch ─────────────────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    try {
      const [catsRes, bookingsRes] = await Promise.all([
        api.get('/api/services/categories/'),
        api.get('/api/bookings/my-bookings/')
      ]);
      setCategories(catsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  // ─── Location: init from localStorage or profile ─────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('workizo_location');
    if (stored) {
      setLocationLabel(stored);
    } else if (user?.profile?.city) {
      setLocationLabel(`${user.profile.city}, Gujarat`);
    } else {
      detectLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ─── Geolocation + Reverse Geocode (Nominatim) ───────────────────────────
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationLabel('Location unavailable');
      return;
    }
    setLocationLoading(true);
    setLocationDenied(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const city  = data.address?.city || data.address?.town || data.address?.village || 'Unknown City';
          const state = data.address?.state || '';
          const label = state ? `${city}, ${state}` : city;
          setLocationLabel(label);
          localStorage.setItem('workizo_location', label);
        } catch {
          setLocationLabel('Location detected');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationDenied(true);
        setLocationLoading(false);
        const fallback = user?.profile?.city ? `${user.profile.city}, Gujarat` : 'Ahmedabad, Gujarat';
        setLocationLabel(fallback);
      },
      { timeout: 8000 }
    );
  };

  const saveManualLocation = () => {
    if (!manualCity) return;
    const label = `${manualCity}, India`;
    setLocationLabel(label);
    localStorage.setItem('workizo_location', label);
    setLocationDenied(false);
    setChangeOpen(false);
  };

  // ─── Derived data ────────────────────────────────────────────────────────
  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const pastBookings   = bookings.filter(b =>  ['completed', 'cancelled'].includes(b.status));
  const displayCategories = searchQuery
    ? categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : categories;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <DashboardPage
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Dashboard' }]}
      title={`Good ${getGreeting()}, ${user?.full_name?.split(' ')[0] || 'there'} 👋`}
      description="What service do you need today?"
      loading={loading}
      actions={
        <Button
          variant="contained"
          onClick={() => navigate('/customer/book')}
          sx={{
            bgcolor: tokens.colors.primary,
            color: '#ffffff',
            px: 3,
            borderRadius: `${tokens.borderRadiusSm}px`,
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: '#23232F' }
          }}
        >
          Book a Partner
        </Button>
      }
    >
      <DashboardGrid>

        {/* ── 1. LOCATION CARD ─────────────────────────────────────────── */}
        <Box sx={span.full}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              border: `1px solid ${tokens.borderColor}`,
              borderRadius: `${tokens.borderRadius}px`,
              bgcolor: tokens.colors.paper,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Left accent stripe */}
            <Box sx={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
              background: 'linear-gradient(180deg, #1A73E8 0%, #0F0F14 100%)',
              borderRadius: '12px 0 0 12px'
            }} />

            {/* Location icon */}
            <Box sx={{
              width: 52, height: 52, borderRadius: '50%',
              bgcolor: 'rgba(26,115,232,0.08)',
              border: '1px solid rgba(26,115,232,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, ml: { xs: 1, sm: 1 }
            }}>
              {locationLoading
                ? <CircularProgress size={22} sx={{ color: '#1A73E8' }} />
                : <RoomIcon sx={{ color: '#1A73E8', fontSize: 24 }} />
              }
            </Box>

            {/* Location text */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                📍 Current Location
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'Outfit, sans-serif', mt: 0.25, lineHeight: 1.3 }} noWrap>
                {locationLoading ? 'Detecting location…' : (locationLabel || 'Tap to detect')}
              </Typography>
              {locationDenied && (
                <Typography variant="caption" color="error.main" sx={{ fontWeight: 500, display: 'block', mt: 0.25 }}>
                  Location permission denied. Please select manually.
                </Typography>
              )}
            </Box>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<GpsFixedIcon />}
                onClick={detectLocation}
                disabled={locationLoading}
                sx={{
                  borderColor: '#1A73E8', color: '#1A73E8',
                  borderRadius: `${tokens.borderRadiusSm}px`,
                  textTransform: 'none', fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(26,115,232,0.06)' }
                }}
              >
                Detect
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditLocationAltIcon />}
                onClick={() => setChangeOpen(true)}
                sx={{
                  borderColor: tokens.borderColor, color: tokens.colors.primary,
                  borderRadius: `${tokens.borderRadiusSm}px`,
                  textTransform: 'none', fontWeight: 600,
                  '&:hover': { bgcolor: tokens.colors.bg }
                }}
              >
                Change
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* ── 2. SEARCH BAR ────────────────────────────────────────────── */}
        <Box sx={span.full}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 2.5, py: 1.5,
              border: `1.5px solid ${tokens.borderColor}`,
              borderRadius: `${tokens.borderRadius}px`,
              bgcolor: tokens.colors.paper,
              transition: tokens.transition,
              '&:focus-within': {
                borderColor: '#1A73E8',
                boxShadow: '0 0 0 3px rgba(26,115,232,0.08)'
              }
            }}
          >
            <SearchIcon sx={{ color: tokens.colors.textSecondary, fontSize: 22, flexShrink: 0 }} />
            <InputBase
              fullWidth
              placeholder="Search for a service… (e.g. AC repair, plumber, cleaning)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{ fontSize: '1rem', fontFamily: 'Outfit, sans-serif', '& input': { padding: 0 } }}
            />
            {searchQuery && (
              <Button
                size="small"
                onClick={() => setSearchQuery('')}
                sx={{ minWidth: 0, p: 0.5, color: tokens.colors.textSecondary, textTransform: 'none', lineHeight: 1 }}
              >
                ✕
              </Button>
            )}
          </Paper>
        </Box>

        {/* ── 3. SERVICE CATEGORIES ────────────────────────────────────── */}
        <Box sx={span.full}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'Outfit, sans-serif' }}>
              Services
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a category to book a certified professional
            </Typography>
          </Box>

          {displayCategories.length === 0 && searchQuery ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No services match &quot;<strong>{searchQuery}</strong>&quot;. Try &quot;AC&quot;, &quot;plumber&quot;, etc.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {displayCategories.map((cat) => {
                const styles = CATEGORY_STYLES[cat.name] || {
                  icon: <HandymanIcon sx={{ fontSize: 28, color: '#6B7280' }} />,
                  bgColor: '#F4F6F9',
                  borderColor: '#E5E7EB'
                };
                return (
                  <Grid item xs={6} sm={4} md={2} key={cat.id}>
                    <Box
                      onClick={() => navigate(`/customer/book?category=${cat.id}`)}
                      sx={{
                        p: { xs: 2, md: 2.5 },
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: `${tokens.borderRadius}px`,
                        border: `1px solid ${tokens.borderColor}`,
                        bgcolor: tokens.colors.paper,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                        transition: tokens.transition,
                        userSelect: 'none',
                        '&:hover': {
                          borderColor: styles.borderColor,
                          transform: 'translateY(-3px)',
                          boxShadow: tokens.shadowHover,
                        },
                        '&:active': { transform: 'translateY(0px)' }
                      }}
                    >
                      <Box sx={{
                        width: 52, height: 52, borderRadius: '50%',
                        bgcolor: styles.bgColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {styles.icon}
                      </Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: tokens.colors.primary, lineHeight: 1.2 }}>
                        {cat.name}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>

        {/* ── 4. ACTIVE BOOKINGS ───────────────────────────────────────── */}
        {activeBookings.length > 0 && (
          <Box sx={span.full}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'Outfit, sans-serif' }}>
                  Active Bookings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Live tracking for your ongoing service requests
                </Typography>
              </Box>
              <Chip
                label={`${activeBookings.length} active`}
                size="small"
                sx={{ bgcolor: 'rgba(26,115,232,0.08)', color: '#1A73E8', fontWeight: 700, border: '1px solid rgba(26,115,232,0.15)' }}
              />
            </Box>

            <Grid container spacing={2}>
              {activeBookings.map((bk) => {
                const catStyle = CATEGORY_STYLES[bk.service_category_detail?.name];
                
                // Calculate expected arrival text
                let arrivalText = "";
                if (bk.booking_type === 'instant') {
                  if (bk.status === 'searching') {
                    arrivalText = "Finding nearest Captain...";
                  } else if (['accepted', 'on_the_way'].includes(bk.status)) {
                    arrivalText = "Captain arriving in ~15 mins";
                  } else {
                    arrivalText = "Captain arrived at premises";
                  }
                } else {
                  arrivalText = `Scheduled: ${bk.preferred_date || ''} (${bk.preferred_time || 'Instant'})`;
                }

                return (
                  <Grid item xs={12} sm={6} key={bk.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        border: `1px solid ${tokens.borderColor}`,
                        borderRadius: `${tokens.borderRadius}px`,
                        bgcolor: tokens.colors.paper,
                        display: 'flex', flexDirection: 'column', gap: 1.5,
                        transition: tokens.transition,
                        '&:hover': { borderColor: '#1A73E8', boxShadow: tokens.shadowHover }
                      }}
                    >
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: '10px',
                            bgcolor: catStyle?.bgColor || '#F4F6F9',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {catStyle?.icon || <HandymanIcon sx={{ fontSize: 20, color: '#6B7280' }} />}
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {bk.service_category_detail?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              #{bk.tracking_id || bk.id}
                            </Typography>
                          </Box>
                        </Box>
                        <StatusBadge status={bk.status} />
                      </Box>

                      {/* Captain info */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Assigned Captain</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {bk.worker ? bk.worker.full_name : 'Searching for nearest Captain...'}
                        </Typography>
                      </Box>

                      {/* Expected Arrival */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Expected Arrival</Typography>
                        <Typography variant="body2" fontWeight={600} color={bk.booking_type === 'instant' && bk.status !== 'searching' ? 'primary.main' : 'text.primary'}>
                          {arrivalText}
                        </Typography>
                      </Box>

                      {/* Progress Timeline bar */}
                      <Box sx={{ mt: 0.5 }}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" color="text.secondary">Progress Timeline</Typography>
                          <Typography variant="caption" fontWeight={700} sx={{ color: tokens.colors.primary }}>
                            {getCardProgressLabel(bk.status)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getCardTimelineProgress(bk.status)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#E5E7EB',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: tokens.colors.primary,
                              borderRadius: 3
                            }
                          }}
                        />
                      </Box>

                      {/* CTA */}
                      <Button
                        variant="contained"
                        fullWidth
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => handleViewDetails(bk.id)}
                        sx={{
                          bgcolor: tokens.colors.primary,
                          color: '#ffffff',
                          borderRadius: `${tokens.borderRadiusSm}px`,
                          textTransform: 'none',
                          fontWeight: 700,
                          mt: 1,
                          '&:hover': { bgcolor: '#23232F' }
                        }}
                      >
                        View Details
                      </Button>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* ── 5. BOOKING HISTORY ───────────────────────────────────────── */}
        <Box sx={span.full}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'Outfit, sans-serif' }}>
              Booking History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your past service requests
            </Typography>
          </Box>

          {pastBookings.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4, textAlign: 'center',
                border: `1px dashed ${tokens.borderColor}`,
                borderRadius: `${tokens.borderRadius}px`,
                bgcolor: tokens.colors.bg
              }}
            >
              <HandymanIcon sx={{ fontSize: 40, color: tokens.colors.textMuted, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No completed bookings yet. Book your first service above!
              </Typography>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{ border: `1px solid ${tokens.borderColor}`, borderRadius: `${tokens.borderRadius}px`, overflow: 'hidden' }}
            >
              <List disablePadding>
                {pastBookings.slice(0, 8).map((bk, idx, arr) => {
                  const catStyle = CATEGORY_STYLES[bk.service_category_detail?.name];
                  return (
                    <React.Fragment key={bk.id}>
                      <ListItem
                        sx={{
                          px: 2.5, py: 1.75, cursor: 'pointer',
                          transition: tokens.transition,
                          '&:hover': { bgcolor: tokens.colors.bg }
                        }}
                        onClick={() => handleViewDetails(bk.id)}
                      >
                        <Box sx={{
                          width: 36, height: 36, borderRadius: '8px', mr: 2, flexShrink: 0,
                          bgcolor: catStyle?.bgColor || '#F4F6F9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {catStyle?.icon
                            ? React.cloneElement(catStyle.icon, { sx: { fontSize: 18, color: catStyle.icon.props.sx.color } })
                            : <HandymanIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                          }
                        </Box>
                        <ListItemText
                          primary={bk.service_category_detail?.name}
                          secondary={`${new Date(bk.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}  ·  #${bk.tracking_id || bk.id}`}
                          primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        <StatusBadge status={bk.status} />
                      </ListItem>
                      {idx < arr.length - 1 && (
                        <Divider sx={{ borderColor: tokens.borderColor }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </List>
            </Paper>
          )}
        </Box>

        {/* ── 6. ACCOUNT + SUPPORT ─────────────────────────────────────── */}
        <Box sx={span.half}>
          <DashboardCard title="Account Management" subtitle="Update your profile, contact info, and security settings">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Modify your stored address details, contact credentials, or security keys.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/customer/profile')}
                sx={{ borderColor: '#000000', color: '#000000', borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700, alignSelf: 'flex-start' }}
              >
                Edit Profile
              </Button>
            </Box>
          </DashboardCard>
        </Box>

        <Box sx={span.half}>
          <DashboardCard title="Need Assistance?" subtitle="Raise issues, contact settlement, or get general help">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Raise an issue regarding a completed booking, or contact settlement support.
              </Typography>
              <Button
                variant="outlined"
                disabled
                sx={{ borderColor: tokens.borderColor, color: 'text.secondary', borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700, alignSelf: 'flex-start' }}
              >
                Contact Support
              </Button>
            </Box>
          </DashboardCard>
        </Box>

      </DashboardGrid>

      {/* ── Location Change Dialog ──────────────────────────────────────── */}
      <Dialog
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
        PaperProps={{ sx: { borderRadius: `${tokens.borderRadius}px`, minWidth: 320 } }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
          📍 Change Location
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select your city to find service professionals near you.
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={manualCity}
              onChange={e => setManualCity(e.target.value)}
              displayEmpty
              sx={{ borderRadius: `${tokens.borderRadiusSm}px` }}
            >
              <MenuItem value="" disabled>Select a city</MenuItem>
              {CITIES.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setChangeOpen(false)}
            sx={{ textTransform: 'none', color: tokens.colors.textSecondary }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveManualLocation}
            disabled={!manualCity}
            sx={{
              bgcolor: tokens.colors.primary, color: '#ffffff',
              borderRadius: `${tokens.borderRadiusSm}px`, textTransform: 'none', fontWeight: 700,
              '&:hover': { bgcolor: '#23232F' }
            }}
          >
            Save Location
          </Button>
        </DialogActions>
      </Dialog>

      {selectedBookingId && (
        <BookingTimeline
          bookingId={selectedBookingId}
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedBookingId(null);
            fetchDashboardData();
          }}
          onRefresh={fetchDashboardData}
        />
      )}

    </DashboardPage>
  );
}

export default CustomerDashboard;
