import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Button, Grid, Card, CardContent,
  Switch, FormControlLabel, Alert, Divider, List, ListItem, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress,
  DialogContentText, Skeleton, Avatar, Tooltip as MuiTooltip
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api, { buildWsUrl } from '../services/api';
import toast from 'react-hot-toast';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpIcon from '@mui/icons-material/Help';
import StarIcon from '@mui/icons-material/Star';
import HandymanIcon from '@mui/icons-material/Handyman';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

function WorkerDashboard() {
  const { user, updateProfileState } = useAuth();
  const navigate = useNavigate();
  
  const online = !!user?.profile?.online_status;
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [availableBookings, setAvailableBookings] = useState([]);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  // Sound Alert ref
  const alertAudio = useRef(null);

  // WebSocket reference
  const notiWs = useRef(null);
  const pollingInterval = useRef(null);

  const loadDashboardData = async () => {
    try {
      const statsRes = await api.get('/api/workers/dashboard-stats/');
      setStats(statsRes.data);
      
      // Sync online status and approval status in auth state if they mismatch
      const backendOnline = !!statsRes.data.online_status;
      const backendApproval = statsRes.data.verification_status;
      const frontendOnline = !!user?.profile?.online_status;
      const frontendApproval = user?.profile?.approval_status;

      if (backendOnline !== frontendOnline || backendApproval !== frontendApproval) {
        updateProfileState({
          user: user,
          profile: {
            ...user.profile,
            online_status: backendOnline,
            approval_status: backendApproval
          }
        });
      }

      const walletRes = await api.get('/api/workers/wallet/');
      setWallet(walletRes.data);

      const jobsRes = await api.get('/api/bookings/my-bookings/');
      setRecentJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAvailableBookings = async () => {
    try {
      const res = await api.get('/api/bookings/available-requests/');
      setAvailableBookings(res.data);
    } catch (err) {
      console.error('Error fetching available requests:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    alertAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav');
    
    return () => {
      if (notiWs.current) notiWs.current.close();
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  // Sync available bookings fetching and WebSocket connections based on online state
  useEffect(() => {
    if (online && user?.profile?.approval_status === 'approved') {
      fetchAvailableBookings();

      // Start periodic 5s polling as backup
      if (pollingInterval.current) clearInterval(pollingInterval.current);
      pollingInterval.current = setInterval(fetchAvailableBookings, 5000);

      // Connect notification websocket
      const token = localStorage.getItem('access_token');
      notiWs.current = new WebSocket(buildWsUrl('/ws/notifications/', `?token=${token}`));

      notiWs.current.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'booking_available') {
            const booking = payload.booking;
            // Add new request to available requests list if it matches category
            setAvailableBookings((prev) => {
              if (prev.some(b => b.id === booking.id)) return prev;
              return [booking, ...prev];
            });

            // Trigger ringtone alert
            try {
              alertAudio.current.play();
            } catch (e) {
              console.log('Audio playback blocked', e);
            }
            toast.success(`New request #${booking.id} matching your skills is available!`);
          } else if (payload.type === 'booking_taken') {
            const takenId = payload.booking_id;
            // Remove request accepted by another worker
            setAvailableBookings((prev) => prev.filter(b => b.id !== takenId));
          }
        } catch (err) {
          console.error(err);
        }
      };

      notiWs.current.onclose = () => {
        console.log('Notification WS closed');
      };
    } else {
      setAvailableBookings([]);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      if (notiWs.current) {
        notiWs.current.close();
        notiWs.current = null;
      }
    }
  }, [user]);

  const handleOnlineToggle = async (event) => {
    setTogglingOnline(true);
    const newStatus = event.target.checked;
    try {
      const res = await api.put('/api/accounts/profile/', {
        online_status: newStatus
      });
      updateProfileState(res.data);
      toast.success(newStatus ? 'You are now Online! Listening for matching bookings.' : 'You are now Offline.');
      
      // Reload stats to verify sync
      const statsRes = await api.get('/api/workers/dashboard-stats/');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to change online status');
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    setAcceptingId(bookingId);
    try {
      const res = await api.post(`/api/bookings/bookings/${bookingId}/accept/`);
      toast.success('Service booking accepted successfully!');
      navigate(`/captain/job/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not accept booking request');
      fetchAvailableBookings();
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    setRejectingId(bookingId);
    try {
      await api.post(`/api/bookings/bookings/${bookingId}/reject/`);
      setAvailableBookings((prev) => prev.filter(b => b.id !== bookingId));
      toast.success('Request declined.');
    } catch (err) {
      toast.error('Failed to decline request');
    } finally {
      setRejectingId(null);
    }
  };

  if (loadingStats) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="rectangular" height={120} sx={{ mb: 4, borderRadius: '12px' }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} sx={{ mb: 4, borderRadius: '12px' }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '12px' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={250} sx={{ mb: 4, borderRadius: '12px' }} />
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: '12px' }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  const activeJob = recentJobs.find(j => !['completed', 'cancelled', 'searching'].includes(j.status));

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Verification Warning Banners */}
      {stats?.verification_status === 'pending' && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: '12px', border: '1px solid #ffe0b2' }}>
          Your KYC document verification status is pending approval. You will receive service bookings as soon as the administrator approves your profile.
        </Alert>
      )}
      {stats?.verification_status === 'rejected' && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: '12px', border: '1px solid #ffcdd2' }}>
          Your government KYC documents were rejected. Please update your Aadhaar/PAN photo files under Profile settings.
        </Alert>
      )}

      {/* Quick Navigation Panel Options */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="900" sx={{ color: '#0F0F14', fontFamily: 'Outfit, sans-serif' }}>
          Captain Dashboard
        </Typography>
        
        <Box display="flex" gap={1.5}>
          <Button 
            variant="outlined" 
            startIcon={<AccountBalanceWalletIcon />} 
            onClick={() => navigate('/captain/wallet')}
            sx={{ borderColor: '#000000', color: '#000000', borderRadius: '8px', textTransform: 'none' }}
          >
            Wallet
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<HistoryIcon />} 
            onClick={() => navigate('/captain/history')}
            sx={{ borderColor: '#000000', color: '#000000', borderRadius: '8px', textTransform: 'none' }}
          >
            History
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<SettingsIcon />} 
            onClick={() => navigate('/captain/settings')}
            sx={{ borderColor: '#000000', color: '#000000', borderRadius: '8px', textTransform: 'none' }}
          >
            Settings
          </Button>
        </Box>
      </Box>

      {/* Top Banner Profile Summary & Online Switch */}
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderColor: '#E5E7EB', 
          borderRadius: '16px', 
          background: 'linear-gradient(to right, #ffffff, #F0F7FF)' 
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar 
              src={stats?.profile_photo || ''} 
              sx={{ width: 80, height: 80, border: '2px solid #1A73E8', bgcolor: '#1A73E8', fontSize: 32, fontWeight: '800' }}
            >
              {stats?.worker_name?.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          
          <Grid item xs={12} sm>
            <Typography variant="h5" fontWeight="900" sx={{ fontFamily: 'Outfit, sans-serif' }}>
              {stats?.welcome_message}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Category: <b>{stats?.service_category}</b> | Approval Status: <b style={{ textTransform: 'uppercase', color: stats?.verification_status === 'approved' ? '#2e7d32' : '#ed6c02' }}>{stats?.verification_status}</b>
            </Typography>
          </Grid>

          <Grid item>
            <MuiTooltip title={stats?.verification_status !== 'approved' ? "KYC verification pending admin approval" : ""}>
              <span>
                <FormControlLabel
                  control={
                    <Switch
                      checked={online}
                      onChange={handleOnlineToggle}
                      disabled={togglingOnline || stats?.verification_status !== 'approved'}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#1A73E8',
                          '& + .MuiSwitch-track': {
                            backgroundColor: '#1A73E8',
                            opacity: 0.9,
                          },
                        },
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="800">
                        {online ? 'ONLINE' : 'OFFLINE'}
                      </Typography>
                      {online && (
                        <Box sx={{
                          width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%', ml: 1.5,
                          animation: 'pulse 1.5s infinite'
                        }} />
                      )}
                    </Box>
                  }
                />
              </span>
            </MuiTooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Grid: Left Panel for Jobs Feed, Right for stats */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Active Assignment Callout */}
          {activeJob && (
            <Card 
              variant="outlined" 
              sx={{ 
                borderColor: '#1A73E8', 
                borderWidth: '2px', 
                borderRadius: '16px', 
                mb: 4, 
                bgcolor: '#F4F9FF' 
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container justify="space-between" alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="caption" color="primary" fontWeight="800">ACTIVE SERVICE JOB</Typography>
                    <Typography variant="h6" fontWeight="800" sx={{ mt: 0.5, fontFamily: 'Outfit, sans-serif' }}>
                      Job #{activeJob.id} — {activeJob.customer?.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Address: {activeJob.address}, {activeJob.city}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/captain/job/${activeJob.id}`)}
                      sx={{ bgcolor: '#000000', color: '#ffffff', borderRadius: '8px', textTransform: 'none' }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Resume Job
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Bookings requests Board Feed */}
          <Typography variant="h6" fontWeight="900" sx={{ mb: 2, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventAvailableIcon /> Available Bookings Board
          </Typography>
          
          {!online ? (
            <Paper variant="outlined" sx={{ py: 8, px: 3, textAlign: 'center', borderRadius: '16px', borderColor: '#E5E7EB' }}>
              <Typography variant="subtitle1" fontWeight="700">You are Offline</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Toggle your status to ONLINE in the profile banner to start receiving client request cards.
              </Typography>
            </Paper>
          ) : availableBookings.length === 0 ? (
            <Paper variant="outlined" sx={{ py: 8, px: 3, textAlign: 'center', borderRadius: '16px', borderColor: '#E5E7EB' }}>
              <Typography variant="subtitle1" fontWeight="700">No bookings nearby</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Listening for real customer service requests matching your skill category...
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {availableBookings.map((b) => (
                <Grid item xs={12} sm={6} key={b.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: '16px', 
                      borderColor: '#E5E7EB',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                      '&:hover': {
                        borderColor: '#1A73E8',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Ref: <b>#{b.id}</b>
                        </Typography>
                        <Box 
                          sx={{ 
                            px: 1.5, py: 0.4, borderRadius: '12px', fontSize: '10px', fontWeight: '800',
                            color: '#1A73E8', bgcolor: '#F0F7FF', textTransform: 'uppercase'
                          }}
                        >
                          {b.booking_type === 'instant' ? 'Instant Service' : 'Slot Service'}
                        </Box>
                      </Box>

                      <Typography variant="subtitle1" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
                        {b.customer?.full_name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Category: <b>{b.service_category_detail?.name}</b>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Area: <b>{b.city} ({b.pincode})</b>
                      </Typography>
                      
                      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#FAFAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                        <Typography variant="caption" color="text.secondary" display="block">Problem Summary:</Typography>
                        <Typography variant="body2" fontWeight="700">{b.problem_type}</Typography>
                      </Box>

                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
                        Preferred Schedule: <b>{b.preferred_date} | {b.preferred_time}</b>
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Box display="flex" gap={1.5}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => handleRejectBooking(b.id)}
                          disabled={rejectingId === b.id || acceptingId === b.id}
                          sx={{ borderColor: '#E5E7EB', color: '#6B7280', textTransform: 'none', borderRadius: '8px' }}
                        >
                          Reject
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleAcceptBooking(b.id)}
                          disabled={acceptingId === b.id || rejectingId === b.id}
                          sx={{ bgcolor: '#000000', color: '#ffffff', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#222' } }}
                        >
                          {acceptingId === b.id ? 'Accepting...' : 'Accept'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Performance chart */}
          <Paper variant="outlined" sx={{ p: 4, mt: 4, borderColor: '#E5E7EB', borderRadius: '16px', bgcolor: '#ffffff' }}>
            <Typography variant="h6" fontWeight="800" sx={{ mb: 3, fontFamily: 'Outfit, sans-serif' }}>
              Performance Earnings Graph
            </Typography>
            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={stats?.performance_graph || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#888888" />
                  <YAxis tickLine={false} axisLine={false} stroke="#888888" />
                  <Tooltip cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />
                  <Line type="monotone" dataKey="Amount" stroke="#1A73E8" strokeWidth={3} dot={{ r: 5, fill: '#1A73E8' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar Metrics and activities ledger */}
        <Grid item xs={12} md={4}>
          {/* Wallet Mini Balance Card */}
          <Paper variant="outlined" sx={{ p: 3, mb: 4, borderColor: '#E5E7EB', borderRadius: '16px', bgcolor: '#ffffff' }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <AccountBalanceWalletIcon sx={{ mr: 1, color: '#1A73E8' }} />
              <Typography variant="subtitle2" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
                Settlement Wallet
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="950" sx={{ fontFamily: 'Outfit, sans-serif' }}>
              ₹{stats?.wallet_balance}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total complete earnings: ₹{stats?.weekly_earnings} this week
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/captain/wallet')}
              sx={{ mt: 2.5, bgcolor: '#000000', color: '#ffffff', borderRadius: '8px', textTransform: 'none' }}
            >
              View Settlement
            </Button>
          </Paper>

          {/* Quick Metrics */}
          <Paper variant="outlined" sx={{ p: 3, mb: 4, borderColor: '#E5E7EB', borderRadius: '16px', bgcolor: '#ffffff' }}>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, fontFamily: 'Outfit, sans-serif' }}>
              Performance Metrics
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Worker Rating</Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <StarIcon sx={{ color: '#ffb300', fontSize: 16 }} />
                <Typography variant="body2" fontWeight="800">★ {stats?.rating}</Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Acceptance Rate</Typography>
              <Typography variant="body2" fontWeight="800">{stats?.acceptance_rate}%</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
              <Typography variant="body2" fontWeight="800">{stats?.completion_rate}%</Typography>
            </Box>
            
            <Divider sx={{ my: 1.5 }} />
            
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Total Assigned Jobs</Typography>
              <Typography variant="body2" fontWeight="800">{stats?.total_jobs}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Completed Jobs</Typography>
              <Typography variant="body2" fontWeight="800">{stats?.completed_jobs}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Active / Pending Jobs</Typography>
              <Typography variant="body2" fontWeight="800">{stats?.pending_jobs}</Typography>
            </Box>
          </Paper>

          {/* Recent Activity Logs */}
          <Paper variant="outlined" sx={{ p: 3, borderColor: '#E5E7EB', borderRadius: '16px', bgcolor: '#ffffff' }}>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, fontFamily: 'Outfit, sans-serif' }}>
              Recent Activities
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List disablePadding>
              {stats?.recent_activity?.length === 0 ? (
                <Typography variant="caption" color="text.secondary">No activities logged yet.</Typography>
              ) : (
                stats?.recent_activity?.map((act) => (
                  <ListItem key={act.id} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={act.title}
                      primaryTypographyProps={{ fontWeight: '700', variant: 'body2' }}
                      secondary={
                        <>
                          <Typography component="span" variant="caption" color="text.secondary" display="block">
                            {act.description}
                          </Typography>
                          <Typography component="span" variant="caption" color="text.disabled" sx={{ fontSize: '9px' }}>
                            {new Date(act.time).toLocaleDateString()} at {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default WorkerDashboard;
