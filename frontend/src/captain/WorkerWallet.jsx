import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Card, CardContent, Grid, Button, 
  Divider, TextField, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, List, ListItem, ListItemText, Skeleton
} from '@mui/material';
import { motion } from 'framer-motion';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaymentsIcon from '@mui/icons-material/Payments';
import api from '../services/api';
import toast from 'react-hot-toast';

function WorkerWallet() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchWalletDetails = async () => {
    try {
      const walletRes = await api.get('/api/workers/wallet/');
      setWallet(walletRes.data);

      const statsRes = await api.get('/api/workers/dashboard-stats/');
      setStats(statsRes.data);
    } catch (e) {
      toast.error('Failed to load wallet ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const handleWithdrawFunds = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount)) {
      return toast.error('Please enter a valid numeric amount');
    }
    const val = parseFloat(withdrawAmount);
    if (val <= 0) {
      return toast.error('Amount must be positive');
    }
    if (val > parseFloat(wallet.current_balance)) {
      return toast.error('Insufficient balance to payout');
    }

    setWithdrawing(true);
    try {
      await api.post('/api/workers/wallet/withdraw/', { amount: val });
      toast.success(`Withdrawal of ₹${val} successfully credited to linked bank account!`);
      setWithdrawModalOpen(false);
      setWithdrawAmount('');
      fetchWalletDetails();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payout processing failed');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back to Dashboard */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/captain/dashboard')}
        sx={{ mb: 3, color: '#000000', textTransform: 'none' }}
      >
        Back to Dashboard
      </Button>

      {/* Main Title Banner */}
      <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 4 }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#000000' }} />
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
            Settlement Wallet & Payouts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your settlement transactions, view earnings milestones, and execute bank payouts.
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '12px' }} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: '12px' }} />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={4}>
          {/* Left Column: Wallet Balance Card & Earnings Milestone */}
          <Grid item xs={12} md={5}>
            {/* Balance Card */}
            <Card 
              variant="outlined" 
              sx={{ 
                borderColor: '#000000', 
                borderWidth: '2px', 
                borderRadius: '16px', 
                bgcolor: '#ffffff',
                mb: 3
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="700">
                  AVAILABLE SETTLEMENT BALANCE
                </Typography>
                <Typography variant="h3" fontWeight="900" sx={{ my: 1.5, fontFamily: 'Outfit, sans-serif' }}>
                  ₹{wallet?.current_balance}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
                  <HourglassEmptyIcon sx={{ fontSize: 16, color: '#ed6c02' }} />
                  <Typography variant="caption" color="text.secondary">
                    Pending Verification Payout: <b>₹{wallet?.pending_balance || '0.00'}</b>
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setWithdrawModalOpen(true)}
                  disabled={parseFloat(wallet?.current_balance) <= 0}
                  sx={{ 
                    bgcolor: '#000000', 
                    color: '#ffffff', 
                    py: 1.5, 
                    borderRadius: '8px', 
                    textTransform: 'none',
                    fontWeight: '700',
                    '&:hover': { bgcolor: '#222' }
                  }}
                >
                  Withdraw Payout to Bank
                </Button>
              </CardContent>
            </Card>

            {/* Earnings Milestones */}
            <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', bgcolor: '#ffffff' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2, fontFamily: 'Outfit, sans-serif' }}>
                  Earnings Timeline
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUpIcon color="success" />
                    <Typography variant="body2" color="text.secondary">Today's Earnings</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="800">₹{stats?.today_earnings}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUpIcon color="success" />
                    <Typography variant="body2" color="text.secondary">Weekly Earnings</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="800">₹{stats?.weekly_earnings}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUpIcon color="success" />
                    <Typography variant="body2" color="text.secondary">Monthly Earnings</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="800">₹{stats?.monthly_earnings}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Transaction History Ledger */}
          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', bgcolor: '#ffffff', minHeight: '400px' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 3, fontFamily: 'Outfit, sans-serif' }}>
                  Wallet Transactions Ledger
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List disablePadding>
                  {wallet?.transactions?.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <PaymentsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                      <Typography variant="body2" color="text.secondary">No wallet activity logs found</Typography>
                    </Box>
                  ) : (
                    wallet?.transactions?.map((txn) => (
                      <React.Fragment key={txn.id}>
                        <ListItem sx={{ py: 2, px: 0 }}>
                          <ListItemText
                            primary={txn.description}
                            primaryTypographyProps={{ fontWeight: '700', variant: 'body2' }}
                            secondary={new Date(txn.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          />
                          <Typography 
                            variant="body1" 
                            fontWeight="800" 
                            color={txn.transaction_type === 'credit' ? 'success.main' : 'error.main'}
                          >
                            {txn.transaction_type === 'credit' ? '+' : '-'}₹{txn.amount}
                          </Typography>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Payout Withdrawal Dialog */}
      <Dialog 
        open={withdrawModalOpen} 
        onClose={() => !withdrawing && setWithdrawModalOpen(false)}
        PaperProps={{ style: { borderRadius: '12px', padding: '8px' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800' }}>
          Execute Bank Payout Transfer
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Funds will be instantly transferred into your linked settlement account: <br />
            <b>Account:</b> {stats?.bank_account || 'xxxxxx'} | <b>IFSC:</b> {stats?.ifsc_code || 'xxxx'}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Payout Amount (₹)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            slotProps={{ input: { style: { borderRadius: '8px' } } }}
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
            sx={{ background: '#000000', color: '#ffffff', borderRadius: '8px' }}
          >
            {withdrawing ? 'Processing...' : 'Confirm Bank Payout'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default WorkerWallet;
