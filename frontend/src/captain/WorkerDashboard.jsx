import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Button, Grid, Card, CardContent,
  Switch, FormControlLabel, Alert, Divider, List, ListItem, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress,
  DialogContentText
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

function WorkerDashboard() {
  const { user, updateProfileState } = useAuth();
  const navigate = useNavigate();
  
  const [online, setOnline] = useState(user?.profile?.online_status || false);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Withdrawal States
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // Incoming Job Request Simulation
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [countdown, setCountdown] = useState(20);
  const simulationInterval = useRef(null);
  const countdownInterval = useRef(null);
  const notiWs = useRef(null);

  const fetchStats = async () => {
    try {
      // Wallet Details
      const walletRes = await api.get('/api/workers/wallet/');
      setWallet(walletRes.data);

      // Jobs List
      const jobsRes = await api.get('/api/bookings/my-bookings/');
      setRecentJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load stats & transactions');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    return () => {
      stopSimulation();
    };
  }, []);

  // Update switch state locally if user profile updates
  useEffect(() => {
    if (user?.profile) {
      setOnline(user.profile.online_status);
    }
  }, [user]);

  // Online / Offline Switch
  const handleOnlineToggle = async (event) => {
    setLoading(true);
    const newStatus = event.target.checked;
    try {
      const res = await api.put('/api/accounts/profile/', {
        online_status: newStatus
      });
      setOnline(newStatus);
      updateProfileState(res.data);
      toast.success(newStatus ? 'You are now Online! Waiting for requests.' : 'You are now Offline.');
      
      if (newStatus) {
        startSimulation();
      } else {
        stopSimulation();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update online status.');
    } finally {
      setLoading(false);
    }
  };

  // Job Matching Simulation Trigger
  const startSimulation = () => {
    if (simulationInterval.current) return;
    
    // Check every 25 seconds for an incoming request
    simulationInterval.current = setInterval(() => {
      // Only show if there is no active request on screen
      setIncomingRequest((prev) => {
        if (prev) return prev;
        
        // Play ringtone audio alert
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav');
          audio.play();
        } catch (e) {
          console.log('Audio playback blocked by user interaction rule', e);
        }

        // Setup countdown
        setCountdown(20);
        if (countdownInterval.current) clearInterval(countdownInterval.current);
        countdownInterval.current = setInterval(() => {
          setCountdown((prevCount) => {
            if (prevCount <= 1) {
              clearInterval(countdownInterval.current);
              setIncomingRequest(null);
              toast.error('Simulated job request missed.');
              return 0;
            }
            return prevCount - 1;
          });
        }, 1000);

        // Simulated details
        const earns = Math.floor(Math.random() * 400) + 300;
        return {
          category: user?.profile?.service_category?.name || 'Service Partner',
          distance: (Math.random() * 3 + 1.2).toFixed(1) + ' km away',
          earnings: earns,
          problem: user?.profile?.service_category?.name === 'Electrician' ? 'Short circuit socket' : 
                   user?.profile?.service_category?.name === 'Plumber' ? 'Kitchen washbasin clog' : 
                   'Routine repair & cleaning task',
          location: 'Vastrapur Main Road, Ahmedabad'
        };
      });
    }, 25000);
  };

  const stopSimulation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    setIncomingRequest(null);
  };

  // Synchronize simulation trigger based on online status and approval
  useEffect(() => {
    if (online && user?.profile?.approval_status === 'approved') {
      startSimulation();
    } else {
      stopSimulation();
    }
  }, [online, user]);

  // Establish WebSocket connection for real-time notifications
  useEffect(() => {
    if (online && user?.profile?.approval_status === 'approved') {
      const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
      const token = localStorage.getItem('access_token');
      
      notiWs.current = new WebSocket(`${wsScheme}://127.0.0.1:8001/ws/notifications/?token=${token}`);

      notiWs.current.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'notification' && payload.notification.notification_type === 'incoming_booking_request') {
            const booking = payload.booking;
            
            // Trigger ringtone audio alert
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav');
              audio.play();
            } catch (e) {
              console.log('Audio playback blocked by user interaction rule', e);
            }

            // Set incoming request state with real booking details
            setIncomingRequest({
              id: booking.id,
              category: booking.service_category_detail?.name || 'Service Partner',
              distance: (Math.random() * 3 + 1.2).toFixed(1) + ' km away',
              earnings: Math.floor(Math.random() * 200) + 300,
              problem: booking.problem_type,
              location: `${booking.address}, ${booking.city}`,
              isReal: true
            });

            // Start countdown timer
            setCountdown(30);
            if (countdownInterval.current) clearInterval(countdownInterval.current);
            countdownInterval.current = setInterval(() => {
              setCountdown((prevCount) => {
                if (prevCount <= 1) {
                  clearInterval(countdownInterval.current);
                  setIncomingRequest(null);
                  toast.error('Real-time request missed.');
                  return 0;
                }
                return prevCount - 1;
              });
            }, 1000);
          }
        } catch (err) {
          console.error('Error handling WebSocket notification:', err);
        }
      };

      notiWs.current.onclose = () => {
        console.log('Notification WS closed');
      };
    } else {
      if (notiWs.current) {
        notiWs.current.close();
        notiWs.current = null;
      }
    }

    return () => {
      if (notiWs.current) {
        notiWs.current.close();
        notiWs.current = null;
      }
    };
  }, [online, user]);

  const handleAcceptRequest = async () => {
    const isReal = incomingRequest?.isReal;
    const bookingId = incomingRequest?.id;
    stopSimulation();
    setLoading(true);
    try {
      if (isReal) {
        const res = await api.post(`/api/bookings/bookings/${bookingId}/accept/`);
        toast.success('Job request accepted!');
        navigate(`/captain/job/${res.data.id}`);
      } else {
        const res = await api.post('/api/bookings/bookings/generate-simulation/');
        toast.success('Job request accepted!');
        navigate(`/captain/job/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to accept request');
      if (online) {
        startSimulation();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = () => {
    stopSimulation();
    if (online) {
      startSimulation();
    }
    toast.success('Request declined.');
  };

  // Wallet Payout Withdraw
  const handleWithdrawFunds = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount)) {
      return toast.error('Please enter a valid numeric amount');
    }
    setWithdrawing(true);
    try {
      await api.post('/api/workers/wallet/withdraw/', {
        amount: withdrawAmount
      });
      toast.success(`Withdrawal of ₹${withdrawAmount} processed successfully.`);
      setWithdrawModalOpen(false);
      setWithdrawAmount('');
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Withdrawal processing failed');
    } finally {
      setWithdrawing(false);
    }
  };

  // Generate Recharts Line data from credit transactions
  const getChartData = () => {
    if (!wallet || !wallet.transactions || wallet.transactions.length === 0) {
      return [
        { name: 'Mon', Amount: 0 },
        { name: 'Tue', Amount: 0 },
        { name: 'Wed', Amount: 0 },
        { name: 'Thu', Amount: 0 },
        { name: 'Fri', Amount: 0 },
        { name: 'Sat', Amount: 0 },
        { name: 'Sun', Amount: 0 }
      ];
    }

    // Sort transactions oldest to newest
    const sorted = [...wallet.transactions]
      .filter(t => t.transaction_type === 'credit')
      .slice(-7);

    if (sorted.length === 0) {
      return [
        { name: 'Day 1', Amount: 0 },
        { name: 'Day 2', Amount: 0 },
        { name: 'Day 3', Amount: 0 }
      ];
    }

    return sorted.map((t, idx) => {
      const date = new Date(t.created_at);
      const label = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      return {
        name: label,
        Amount: parseFloat(t.amount)
      };
    });
  };

  const getAlertBanner = () => {
    const statusVal = user?.profile?.approval_status || 'pending';
    if (statusVal === 'approved') {
      return (
        <Alert severity="success" sx={{ mb: 4, borderRadius: '8px' }}>
          Congratulations! Your profile is verified & approved. You are ready to accept customer service requests.
        </Alert>
      );
    } else if (statusVal === 'rejected') {
      return (
        <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>
          Your KYC documentation was rejected by the administrator. Please update details under Profile settings.
        </Alert>
      );
    }
    return (
      <Alert severity="warning" sx={{ mb: 4, borderRadius: '8px' }}>
        Your captain onboarding registration is currently under review by our administration team.
      </Alert>
    );
  };

  if (loadingStats) {
    return <LinearProgress />;
  }

  const completedJobsCount = recentJobs.filter(j => j.status === 'completed').length;
  const activeJob = recentJobs.find(j => !['completed', 'cancelled'].includes(j.status));

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {getAlertBanner()}

      <Grid container spacing={4}>
        {/* Main Panel */}
        <Grid item xs={12} md={8}>
          {/* Welcome and Toggle */}
          <Paper 
            variant="outlined"
            sx={{ 
              p: 4, 
              mb: 4, 
              borderColor: '#E5E7EB',
              borderRadius: '8px',
              background: '#ffffff'
            }}
          >
            <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: '#000000', fontFamily: 'Outfit, sans-serif' }}>
              Welcome, Captain {user?.full_name}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Category: <b>{user?.profile?.service_category?.name || 'Not Assigned (Setup in profile)'}</b>
            </Typography>
            
            <Divider sx={{ mb: 3 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={online}
                  onChange={handleOnlineToggle}
                  disabled={loading || user?.profile?.approval_status !== 'approved'}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#000000',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#000000',
                        opacity: 0.9,
                      },
                    },
                  }}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="700">
                    {online ? 'Status: ONLINE (Receiving requests)' : 'Status: OFFLINE (Unavailable)'}
                  </Typography>
                  {online && (
                    <Box sx={{
                      width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%', ml: 1.5,
                      animation: 'pulse 1.5s infinite'
                    }}>
                      <style>{`
                        @keyframes pulse {
                          0% { transform: scale(0.9); opacity: 1; }
                          50% { transform: scale(1.3); opacity: 0.5; }
                          100% { transform: scale(0.9); opacity: 1; }
                        }
                      `}</style>
                    </Box>
                  )}
                </Box>
              }
            />
          </Paper>

          {/* Active Job Alert Card */}
          {activeJob && (
            <Card variant="outlined" sx={{ borderColor: '#000000', borderWidth: '2px', borderRadius: '8px', mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container justify="space-between" alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <Typography variant="subtitle2" color="primary" fontWeight="700">ACTIVE SERVICE ASSIGNMENT</Typography>
                    <Typography variant="h6" fontWeight="800" sx={{ mt: 1, fontFamily: 'Outfit, sans-serif' }}>
                      Job #{activeJob.id} - {activeJob.customer.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Address: {activeJob.address}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' }, mt: { xs: 2, sm: 0 } }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/captain/job/${activeJob.id}`)}
                      sx={{ background: '#000000', color: '#ffffff', borderRadius: '6px', textTransform: 'none' }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Resume Job
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Performance line chart */}
          <Paper variant="outlined" sx={{ p: 4, mb: 4, borderColor: '#E5E7EB', borderRadius: '8px' }}>
            <Typography variant="h6" fontWeight="800" sx={{ mb: 3, fontFamily: 'Outfit, sans-serif' }}>
              Earnings Graph (Last 7 Jobs)
            </Typography>
            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={getChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#888888" />
                  <YAxis tickLine={false} axisLine={false} stroke="#888888" />
                  <Tooltip cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />
                  <Line type="monotone" dataKey="Amount" stroke="#000000" strokeWidth={3} dot={{ r: 5, fill: '#000000' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Job Management Section */}
          <Typography variant="h6" fontWeight="800" sx={{ mb: 3, fontFamily: 'Outfit, sans-serif' }}>
            Job Management
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: 3, borderColor: '#E5E7EB', borderRadius: '8px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <SignalCellularAltIcon sx={{ fontSize: 36, color: '#000000', mb: 1.5 }} />
                  <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 1 }}>Job Board Status</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    When Online, incoming service calls matching your skills will alert you.
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  disabled
                  sx={{ borderColor: '#E5E7EB', color: 'text.secondary', textTransform: 'none', borderRadius: '6px' }}
                >
                  {online ? 'Active Listener Running' : 'Offline'}
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: 3, borderColor: '#E5E7EB', borderRadius: '8px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <ContactPageIcon sx={{ fontSize: 36, color: '#000000', mb: 1.5 }} />
                  <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 1 }}>Onboarding & KYC</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Update settlement bank details, PAN card photos, or check verification logs.
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/captain/profile')}
                  sx={{ borderColor: '#000000', color: '#000000', textTransform: 'none', borderRadius: '6px' }}
                >
                  Edit Profile Setup
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar Panel */}
        <Grid item xs={12} md={4}>
          {/* Wallet Summary */}
          {wallet && (
            <Paper variant="outlined" sx={{ p: 3, mb: 4, borderColor: '#E5E7EB', borderRadius: '8px' }}>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <AccountBalanceWalletIcon sx={{ mr: 1, color: '#000000' }} />
                <Typography variant="subtitle1" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
                  Settlement Wallet
                </Typography>
              </Box>

              <Typography variant="h4" fontWeight="900" sx={{ mb: 0.5, fontFamily: 'Outfit, sans-serif' }}>
                ₹{wallet.current_balance}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                Pending Payout Balance: ₹{wallet.pending_balance}
              </Typography>

              <Button
                fullWidth
                variant="contained"
                onClick={() => setWithdrawModalOpen(true)}
                disabled={parseFloat(wallet.current_balance) <= 0}
                sx={{ background: '#000000', color: '#ffffff', py: 1.2, borderRadius: '6px', textTransform: 'none' }}
              >
                Withdraw Funds (Payout)
              </Button>
            </Paper>
          )}

          {/* Quick Metrics */}
          <Paper variant="outlined" sx={{ p: 3, mb: 4, borderColor: '#E5E7EB', borderRadius: '8px' }}>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, fontFamily: 'Outfit, sans-serif' }}>
              Performance Metrics
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Verification</Typography>
              <Typography variant="body2" fontWeight="800" sx={{ textTransform: 'capitalize' }}>
                {user?.profile?.approval_status || 'pending'}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Total Completed Jobs</Typography>
              <Typography variant="body2" fontWeight="800">{completedJobsCount}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Ratings Avg</Typography>
              <Typography variant="body2" fontWeight="800">★ 4.8</Typography>
            </Box>
          </Paper>

          {/* Transactions Ledger list */}
          {wallet && wallet.transactions && (
            <Paper variant="outlined" sx={{ p: 3, borderColor: '#E5E7EB', borderRadius: '8px' }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, fontFamily: 'Outfit, sans-serif' }}>
                Recent Wallet Activities
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List disablePadding>
                {wallet.transactions.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">No transactions recorded.</Typography>
                ) : (
                  wallet.transactions.slice(0, 5).map((txn) => (
                    <ListItem key={txn.id} sx={{ px: 0, py: 1 }}>
                      <ListItemText
                        primary={txn.description}
                        secondary={new Date(txn.created_at).toLocaleDateString()}
                      />
                      <Typography variant="body2" fontWeight="800" color={txn.transaction_type === 'credit' ? 'success.main' : 'error.main'}>
                        {txn.transaction_type === 'credit' ? '+' : '-'}₹{txn.amount}
                      </Typography>
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Simulated Incoming Request Overlay */}
      <Dialog 
        open={!!incomingRequest} 
        onClose={() => {}}
        PaperProps={{
          style: {
            borderRadius: '12px',
            border: '2px solid #000000',
            padding: '12px',
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: '900', color: '#000000' }}>
          ⚠️ INCOMING SERVICE REQUEST!
        </DialogTitle>
        <DialogContent>
          {incomingRequest && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h5" fontWeight="800" gutterBottom sx={{ fontFamily: 'Outfit, sans-serif' }}>
                {incomingRequest.category}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Problem: <b>{incomingRequest.problem}</b>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Location: {incomingRequest.location} ({incomingRequest.distance})
              </Typography>
              <Typography variant="h6" color="success.main" fontWeight="800" sx={{ mb: 3 }}>
                Expected Payout: ₹{incomingRequest.earnings}
              </Typography>

              {/* Countdown Progress Slider */}
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={(countdown / 20) * 100} 
                  sx={{ 
                    height: '8px', 
                    borderRadius: '4px',
                    backgroundColor: '#E5E7EB',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#000000'
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Accept within {countdown} seconds
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={handleRejectRequest} 
            variant="outlined"
            sx={{ borderColor: '#000000', color: '#000000', px: 3, py: 1, borderRadius: '6px', textTransform: 'none' }}
          >
            Decline
          </Button>
          <Button 
            onClick={handleAcceptRequest} 
            variant="contained"
            sx={{ background: '#000000', color: '#ffffff', px: 4, py: 1, borderRadius: '6px', textTransform: 'none' }}
          >
            Accept Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdrawal Dialog Modal */}
      <Dialog 
        open={withdrawModalOpen} 
        onClose={() => !withdrawing && setWithdrawModalOpen(false)}
        PaperProps={{ style: { borderRadius: '12px', padding: '8px' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800' }}>
          Withdraw Earnings Payout
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Withdrawal payouts will be credited to your linked settlement bank account (Simulated).
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Enter Amount to Payout (₹)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            slotProps={{ input: { style: { borderRadius: '6px' } } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawModalOpen(false)} disabled={withdrawing} sx={{ color: '#000000' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleWithdrawFunds} 
            variant="contained" 
            disabled={withdrawing}
            sx={{ background: '#000000', color: '#ffffff', borderRadius: '6px' }}
          >
            {withdrawing ? 'Processing...' : 'Confirm Payout'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default WorkerDashboard;
