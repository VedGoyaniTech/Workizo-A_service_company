import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  Container, Typography, Box, Grid, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  CircularProgress, Alert, TextField, MenuItem, Select, FormControl,
  InputLabel, Card, CardContent, InputAdornment, Switch, Divider,
  Avatar, LinearProgress, Tab, Tabs, Stack
} from '@mui/material';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';

import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HandymanIcon from '@mui/icons-material/Handyman';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StarIcon from '@mui/icons-material/Star';
import CampaignIcon from '@mui/icons-material/Campaign';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CheckIcon from '@mui/icons-material/Check';

import toast from 'react-hot-toast';

const COLORS = ['#1A73E8', '#34A853', '#FBBC05', '#EA4335', '#8F00FF', '#00C9FF'];

const AdminDashboard = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'dashboard';

  return (
    <Container maxWidth={false} sx={{ mb: 6, px: { xs: 0, sm: 1, md: 2 } }}>
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'bookings' && <BookingsView />}
      {activeTab === 'workers' && <WorkersView />}
      {activeTab === 'customers' && <CustomersView />}
      {activeTab === 'categories' && <CategoriesView />}
      {activeTab === 'payments' && <PaymentsView />}
      {activeTab === 'bills' && <BillsView />}
      {activeTab === 'reviews' && <ReviewsView />}
      {activeTab === 'reports' && <ReportsView />}
      {activeTab === 'notifications' && <NotificationsView />}
      {activeTab === 'settings' && <SettingsView />}
      {activeTab === 'profile' && <ProfileView />}
    </Container>
  );
};

// ----------------------------------------------------
// 1. DASHBOARD VIEW
// ----------------------------------------------------
const DashboardView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('accounts/admin/dashboard/stats/');
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress color="primary" />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Loading dashboard intelligence...
        </Typography>
      </Box>
    );
  }

  const { cards, charts, activities } = data || {};

  const cardList = [
    { title: 'Total Customers', val: cards.totalCustomers, icon: <PeopleIcon sx={{ color: '#1A73E8', fontSize: 32 }} /> },
    { title: 'Total Captains', val: cards.totalCaptains, icon: <SupervisorAccountIcon sx={{ color: '#34A853', fontSize: 32 }} /> },
    { title: 'Online Captains', val: cards.onlineCaptains, icon: <CheckCircleIcon sx={{ color: '#34A853', fontSize: 32 }} /> },
    { title: 'Pending Captains', val: cards.pendingApprovals, icon: <SupervisorAccountIcon sx={{ color: '#FBBC05', fontSize: 32 }} /> },
    { title: 'Total Bookings', val: cards.totalBookings, icon: <ReceiptLongIcon sx={{ color: '#1A73E8', fontSize: 32 }} /> },
    { title: 'Active Bookings', val: cards.activeBookings, icon: <ReceiptLongIcon sx={{ color: '#FBBC05', fontSize: 32 }} /> },
    { title: 'Today\'s Revenue', val: `₹${cards.todayRevenue.toFixed(2)}`, icon: <PaymentIcon sx={{ color: '#34A853', fontSize: 32 }} /> },
    { title: 'Monthly Revenue', val: `₹${cards.monthlyRevenue.toFixed(2)}`, icon: <PaymentIcon sx={{ color: '#1A73E8', fontSize: 32 }} /> },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time analytics and platform performance metrics.
          </Typography>
        </Box>
      </Box>

      {/* Metric Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cardList.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ mr: 2, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#6E7280', textTransform: 'uppercase', tracking: 1, display: 'block' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="900" sx={{ color: '#0F0F14', mt: 1, fontFamily: 'Outfit' }}>
                    {card.val}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.02)', p: 1.5, borderRadius: 1.5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52 }}>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Daily Bookings Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Outfit' }}>
              Daily Bookings (Last 30 Days)
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.dailyBookings}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1A73E8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="bookings" stroke="#1A73E8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBookings)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Category Share Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Outfit' }}>
              Service Category Share
            </Typography>
            <Box height={280} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} layout="vertical" align="center" verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Analytics Part 2 */}
      <Grid container spacing={4}>
        {/* Monthly Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Outfit' }}>
              Monthly Revenue Performance
            </Typography>
            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Bar dataKey="revenue" fill="#1A73E8" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Outfit' }}>
              Recent Platform Activities
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activities && activities.map((act, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar sx={{
                    bgcolor: act.type.includes('payment') ? 'rgba(52, 168, 83, 0.1)' : 'rgba(26, 115, 232, 0.1)',
                    color: act.type.includes('payment') ? '#34A853' : '#1A73E8',
                    width: 38, height: 38
                  }}>
                    {act.type.includes('payment') ? <PaymentIcon sx={{ fontSize: 20 }} /> : <HandymanIcon sx={{ fontSize: 20 }} />}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="700" noWrap>{act.title}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" noWrap>{act.description}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              ))}
              {(!activities || activities.length === 0) && (
                <Typography variant="body2" color="text.secondary" align="center">
                  No recent activities recorded.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ----------------------------------------------------
// 2. BOOKINGS VIEW
// ----------------------------------------------------
const BookingsView = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  // Detail view state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  
  // Reassign state
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [captains, setCaptains] = useState([]);
  const [selectedCaptain, setSelectedCaptain] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('accounts/admin/bookings/', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          category: categoryFilter || undefined
        }
      });
      setBookings(res.data);
    } catch (err) {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const catRes = await api.get('accounts/admin/categories/');
        setCategories(catRes.data);
        const captRes = await api.get('accounts/admin/workers/');
        setCaptains(captRes.data.filter(c => c.profile?.approval_status === 'approved'));
      } catch (err) {
        console.error(err);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBookings();
  }, [statusFilter, categoryFilter]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setLoading(true);
      fetchBookings();
    }
  };

  const handleOpenDetails = async (bookingId) => {
    try {
      const res = await api.get(`accounts/admin/bookings/${bookingId}/`);
      setSelectedBooking(res.data);
      setOpenDetailDialog(true);
    } catch (err) {
      toast.error('Failed to load booking details.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.post(`accounts/admin/bookings/${bookingId}/`, { action: 'cancel' });
        toast.success('Booking cancelled.');
        fetchBookings();
        setOpenDetailDialog(false);
      } catch (err) {
        toast.error('Failed to cancel booking.');
      }
    }
  };

  const handleOpenAssign = (booking) => {
    setSelectedBooking(booking);
    setSelectedCaptain('');
    setOpenAssignDialog(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedCaptain) return;
    try {
      await api.post(`accounts/admin/bookings/${selectedBooking.id}/`, {
        action: 'assign',
        worker_id: selectedCaptain
      });
      toast.success('Captain assigned successfully.');
      setOpenAssignDialog(false);
      fetchBookings();
      if (openDetailDialog) {
        handleOpenDetails(selectedBooking.id);
      }
    } catch (err) {
      toast.error('Failed to assign captain.');
    }
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'searching': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
          Booking Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Inspect timelines, view bills, cancel bookings, or reassign service professionals.
        </Typography>
      </Box>

      {/* Filters & Search Header */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by ID, Tracking ID, Customer or Captain... (Press Enter)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Service Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Service Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Booking Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Booking Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="searching">Searching</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchBookings}
              startIcon={<FilterListIcon />}
              sx={{ bgcolor: '#1A73E8', '&:hover': { bgcolor: '#155cb0' } }}
            >
              Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bookings Table */}
      {loading ? (
        <LinearProgress color="primary" />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell fontWeight="700">Booking ID</TableCell>
                <TableCell fontWeight="700">Customer</TableCell>
                <TableCell fontWeight="700">Captain</TableCell>
                <TableCell fontWeight="700">Service Category</TableCell>
                <TableCell fontWeight="700">Status</TableCell>
                <TableCell fontWeight="700">Date</TableCell>
                <TableCell fontWeight="700" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{b.tracking_id || `#${b.id}`}</Typography>
                  </TableCell>
                  <TableCell>{b.customer?.full_name}</TableCell>
                  <TableCell>{b.worker?.full_name || <Typography variant="caption" color="error">Not Assigned</Typography>}</TableCell>
                  <TableCell>{b.service_category_detail?.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={b.status.replace('_', ' ').toUpperCase()}
                      color={getStatusChipColor(b.status)}
                      size="small"
                      sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell>{new Date(b.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <IconButton color="primary" onClick={() => handleOpenDetails(b.id)} size="small">
                        <VisibilityIcon />
                      </IconButton>
                      {!['completed', 'cancelled'].includes(b.status) && (
                        <Button variant="outlined" size="small" onClick={() => handleOpenAssign(b)}>
                          Assign
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    No bookings found matching filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      {selectedBooking && (
        <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Booking Details — {selectedBooking.tracking_id}</Typography>
            <IconButton onClick={() => setOpenDetailDialog(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: '#E5E7EB' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Customer Information</Typography>
                <Typography variant="body1" fontWeight="bold" sx={{ mt: 0.5 }}>{selectedBooking.customer?.full_name}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedBooking.customer?.email}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedBooking.customer?.phone}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{selectedBooking.address}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Captain Details</Typography>
                {selectedBooking.worker ? (
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body1" fontWeight="bold">{selectedBooking.worker.full_name}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedBooking.worker.email}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedBooking.worker.phone}</Typography>
                    <Button variant="text" size="small" onClick={() => handleOpenAssign(selectedBooking)} sx={{ mt: 1 }}>
                      Reassign Professional
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ mt: 1 }}>
                    <Alert severity="warning">No captain assigned yet.</Alert>
                    <Button variant="contained" size="small" onClick={() => handleOpenAssign(selectedBooking)} sx={{ mt: 1.5, bgcolor: '#1A73E8' }}>
                      Assign Professional
                    </Button>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Work Details</Typography>
                <Typography variant="body2"><strong>Problem Category:</strong> {selectedBooking.service_category_detail?.name}</Typography>
                <Typography variant="body2"><strong>Job Type:</strong> {selectedBooking.problem_type}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}><strong>Description:</strong> {selectedBooking.problem_description}</Typography>
              </Grid>

              {/* Photos Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Uploaded Visual Media</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" display="block">Before Photo</Typography>
                    {selectedBooking.before_photo ? (
                      <Box component="img" src={`http://127.0.0.1:8001${selectedBooking.before_photo}`} sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #E5E7EB' }} />
                    ) : 'None'}
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" display="block">After Photo</Typography>
                    {selectedBooking.after_photo ? (
                      <Box component="img" src={`http://127.0.0.1:8001${selectedBooking.after_photo}`} sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #E5E7EB' }} />
                    ) : 'None'}
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" display="block">Spare Part Invoice Copy</Typography>
                    {selectedBooking.spare_part_photo ? (
                      <Box component="img" src={`http://127.0.0.1:8001${selectedBooking.spare_part_photo}`} sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #E5E7EB' }} />
                    ) : 'None'}
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" display="block">Offsite Invoice Copy</Typography>
                    {selectedBooking.invoice_photo ? (
                      <Box component="img" src={`http://127.0.0.1:8001${selectedBooking.invoice_photo}`} sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #E5E7EB' }} />
                    ) : 'None'}
                  </Grid>
                </Grid>
              </Grid>

              {/* Bill Details */}
              {selectedBooking.bill && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Invoice Calculation</Typography>
                  <Paper sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">Base Labour Charge:</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{selectedBooking.bill.labour_charges}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">Spare Parts Charges:</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{selectedBooking.bill.parts_charges}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">GST (18%):</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{selectedBooking.bill.gst}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle2">Grand Total:</Typography>
                      <Typography variant="subtitle2" color="primary" fontWeight="bold">₹{selectedBooking.bill.grand_total}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            {!['completed', 'cancelled'].includes(selectedBooking.status) && (
              <Button color="error" variant="outlined" onClick={() => handleCancelBooking(selectedBooking.id)}>
                Cancel Booking
              </Button>
            )}
            <Button onClick={() => setOpenDetailDialog(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Assign Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)}>
        <DialogTitle>Assign Professional</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: 1 }}>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Available Captains</InputLabel>
            <Select
              value={selectedCaptain}
              onChange={(e) => setSelectedCaptain(e.target.value)}
              label="Available Captains"
            >
              {captains.map((c) => (
                <MenuItem key={c.user.id} value={c.user.id}>
                  {c.user.full_name} ({c.profile?.service_category?.name || 'Unassigned'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmAssign} variant="contained" disabled={!selectedCaptain} sx={{ bgcolor: '#1A73E8' }}>
            Confirm Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ----------------------------------------------------
// 3. WORKERS (CAPTAIN) VIEW
// ----------------------------------------------------
const WorkersView = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [openKYCDialog, setOpenKYCDialog] = useState(false);

  const fetchWorkers = async () => {
    try {
      const res = await api.get('accounts/admin/workers/');
      setWorkers(res.data);
    } catch (err) {
      toast.error('Failed to load workers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleVerify = async (userId, approvalStatus) => {
    try {
      await api.post(`accounts/admin/workers/${userId}/verify/`, { approval_status: approvalStatus });
      toast.success(`Worker status set to ${approvalStatus}.`);
      fetchWorkers();
      setOpenKYCDialog(false);
    } catch (err) {
      toast.error('Failed to update worker state.');
    }
  };

  const handleToggleState = async (userId) => {
    try {
      await api.post(`accounts/admin/users/${userId}/toggle-active/`);
      toast.success('Active state toggled.');
      fetchWorkers();
    } catch (err) {
      toast.error('Failed to toggle worker active state.');
    }
  };

  const handleViewKYC = async (workerId) => {
    try {
      const res = await api.get(`accounts/admin/workers/${workerId}/`);
      setSelectedWorker(res.data);
      setOpenKYCDialog(true);
    } catch (err) {
      toast.error('Failed to load detailed worker KYC.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
          Worker (Captain) Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Approve registrations, check KYC documents, suspend accounts, and view wallets.
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress color="primary" />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell fontWeight="700">Captain</TableCell>
                <TableCell fontWeight="700">Category</TableCell>
                <TableCell fontWeight="700">Experience</TableCell>
                <TableCell fontWeight="700">Online Status</TableCell>
                <TableCell fontWeight="700">Registration Status</TableCell>
                <TableCell fontWeight="700">Rating</TableCell>
                <TableCell fontWeight="700" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workers.map((w) => (
                <TableRow key={w.user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar src={w.profile?.profile_photo ? `http://127.0.0.1:8001${w.profile.profile_photo}` : ''} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{w.user.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{w.user.email} | {w.user.phone}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{w.profile?.service_category?.name || 'N/A'}</TableCell>
                  <TableCell>{w.profile?.experience} Years</TableCell>
                  <TableCell>
                    {w.profile?.online_status ? (
                      <Chip label="ONLINE" color="success" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    ) : (
                      <Chip label="OFFLINE" color="default" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={w.profile?.approval_status?.toUpperCase() || 'PENDING'}
                      color={w.profile?.approval_status === 'approved' ? 'success' : w.profile?.approval_status === 'rejected' ? 'error' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <StarIcon sx={{ color: '#FBBC05', fontSize: 18 }} />
                      <Typography variant="body2">{w.rating || 'N/A'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Button size="small" variant="outlined" onClick={() => handleViewKYC(w.user.id)}>
                        KYC & Wallet
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color={w.user.is_active ? 'warning' : 'success'}
                        onClick={() => handleToggleState(w.user.id)}
                      >
                        {w.user.is_active ? 'Suspend' : 'Activate'}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* KYC & Wallet Dialog */}
      {selectedWorker && (
        <Dialog open={openKYCDialog} onClose={() => setOpenKYCDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Detailed Portfolio — {selectedWorker.user?.full_name}</Typography>
            <IconButton onClick={() => setOpenKYCDialog(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: '#E5E7EB' }}>
            <Grid container spacing={3}>
              {/* Personal */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Contact Info</Typography>
                <Typography variant="body2"><strong>Email:</strong> {selectedWorker.user?.email}</Typography>
                <Typography variant="body2"><strong>Phone:</strong> {selectedWorker.user?.phone}</Typography>
                <Typography variant="body2"><strong>Address:</strong> {selectedWorker.profile?.address}, {selectedWorker.profile?.city}, {selectedWorker.profile?.state}</Typography>
              </Grid>
              {/* Finance */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Bank Details</Typography>
                <Typography variant="body2"><strong>Bank Account:</strong> {selectedWorker.profile?.bank_account || 'N/A'}</Typography>
                <Typography variant="body2"><strong>IFSC Code:</strong> {selectedWorker.profile?.ifsc_code || 'N/A'}</Typography>
                <Typography variant="body2"><strong>PAN Number:</strong> {selectedWorker.profile?.pan_number || 'N/A'}</Typography>
                <Typography variant="body2"><strong>Aadhaar Number:</strong> {selectedWorker.profile?.aadhaar_number || 'N/A'}</Typography>
              </Grid>

              {/* KYC images */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>KYC Identity Cards</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography variant="caption" display="block">Aadhaar Photo</Typography>
                    {selectedWorker.profile?.aadhaar_photo ? (
                      <Box component="img" src={`http://127.0.0.1:8001${selectedWorker.profile.aadhaar_photo}`} sx={{ width: '100%', height: 200, objectFit: 'contain', border: '1px solid #E5E7EB', borderRadius: 1 }} />
                    ) : <Alert severity="warning">No Aadhaar copy uploaded</Alert>}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" display="block">PAN Photo</Typography>
                    {selectedWorker.profile?.pan_photo ? (
                      <Box component="img" src={`http://127.0.0.1:8001${selectedWorker.profile.pan_photo}`} sx={{ width: '100%', height: 200, objectFit: 'contain', border: '1px solid #E5E7EB', borderRadius: 1 }} />
                    ) : <Alert severity="warning">No PAN copy uploaded</Alert>}
                  </Grid>
                </Grid>
              </Grid>

              {/* Wallet Ledger */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Wallet Balance Details</Typography>
                {selectedWorker.wallet ? (
                  <Box>
                    <Box display="flex" gap={4} mb={2}>
                      <Paper sx={{ p: 2, flex: 1, bgcolor: '#F8FAFC' }}>
                        <Typography variant="caption" color="text.secondary">Current Balance</Typography>
                        <Typography variant="h6" fontWeight="bold">₹{selectedWorker.wallet.current_balance}</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, flex: 1, bgcolor: '#F8FAFC' }}>
                        <Typography variant="caption" color="text.secondary">Pending Balance</Typography>
                        <Typography variant="h6" fontWeight="bold">₹{selectedWorker.wallet.pending_balance}</Typography>
                      </Paper>
                    </Box>
                    <Typography variant="caption" display="block" gutterBottom>Transactions Log</Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                            <TableCell>Description</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedWorker.wallet.transactions && selectedWorker.wallet.transactions.map((t) => (
                            <TableRow key={t.id}>
                              <TableCell>{t.description}</TableCell>
                              <TableCell>
                                <Chip label={t.transaction_type.toUpperCase()} size="small" color={t.transaction_type === 'credit' ? 'success' : 'error'} />
                              </TableCell>
                              <TableCell align="right" fontWeight="bold">₹{t.amount}</TableCell>
                              <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                          {(!selectedWorker.wallet.transactions || selectedWorker.wallet.transactions.length === 0) && (
                            <TableRow>
                              <TableCell colSpan={4} align="center">No wallet transactions logged.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Alert severity="info">Wallet ledger not initialized for this account.</Alert>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            {selectedWorker.profile?.approval_status !== 'approved' && (
              <Button variant="contained" color="success" onClick={() => handleVerify(selectedWorker.user.id, 'approved')}>
                Approve Registration
              </Button>
            )}
            {selectedWorker.profile?.approval_status !== 'rejected' && (
              <Button variant="contained" color="error" onClick={() => handleVerify(selectedWorker.user.id, 'rejected')}>
                Reject Registration
              </Button>
            )}
            <Button onClick={() => setOpenKYCDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

// ----------------------------------------------------
// 4. CUSTOMERS VIEW
// ----------------------------------------------------
const CustomersView = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('accounts/admin/customers/');
      setCustomers(res.data);
    } catch (err) {
      toast.error('Failed to load customers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleState = async (userId) => {
    try {
      await api.post(`accounts/admin/users/${userId}/toggle-active/`);
      toast.success('Customer active status toggled.');
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to update customer status.');
    }
  };

  const handleViewHistory = async (customerId) => {
    try {
      const res = await api.get(`accounts/admin/customers/${customerId}/`);
      setSelectedCustomer(res.data);
      setOpenHistoryDialog(true);
    } catch (err) {
      toast.error('Failed to retrieve customer detailed profile.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
          Customer Directory
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track customer profiles, block user accounts, and audit complete service booking histories.
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress color="primary" />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell fontWeight="700">Customer Name</TableCell>
                <TableCell fontWeight="700">Email Address</TableCell>
                <TableCell fontWeight="700">Mobile Phone</TableCell>
                <TableCell fontWeight="700">Location (City)</TableCell>
                <TableCell fontWeight="700">Bookings Placed</TableCell>
                <TableCell fontWeight="700">Status</TableCell>
                <TableCell fontWeight="700" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.user.id} hover>
                  <TableCell fontWeight="bold">{c.user.full_name}</TableCell>
                  <TableCell>{c.user.email}</TableCell>
                  <TableCell>{c.user.phone}</TableCell>
                  <TableCell>{c.profile?.city || 'Not specified'}</TableCell>
                  <TableCell fontWeight="bold" align="center">{c.total_bookings}</TableCell>
                  <TableCell>
                    {c.user.is_active ? (
                      <Chip label="ACTIVE" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                    ) : (
                      <Chip label="BLOCKED" color="error" size="small" sx={{ fontWeight: 'bold' }} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Button size="small" variant="outlined" onClick={() => handleViewHistory(c.user.id)}>
                        Audit logs
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color={c.user.is_active ? 'error' : 'success'}
                        onClick={() => handleToggleState(c.user.id)}
                      >
                        {c.user.is_active ? 'Block' : 'Activate'}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Customer Audit Dialog */}
      {selectedCustomer && (
        <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Customer Profile & History — {selectedCustomer.user?.full_name}</Typography>
            <IconButton onClick={() => setOpenHistoryDialog(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: '#E5E7EB' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Personal Information</Typography>
            <Typography variant="body2"><strong>Email:</strong> {selectedCustomer.user?.email}</Typography>
            <Typography variant="body2"><strong>Phone:</strong> {selectedCustomer.user?.phone}</Typography>
            <Typography variant="body2"><strong>Home Address:</strong> {selectedCustomer.profile?.address || 'N/A'}</Typography>
            <Typography variant="body2"><strong>City/State:</strong> {selectedCustomer.profile?.city}, {selectedCustomer.profile?.state}</Typography>

            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Bookings History</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCustomer.bookings && selectedCustomer.bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell fontWeight="bold">{b.tracking_id}</TableCell>
                      <TableCell>{b.service_category_detail?.name}</TableCell>
                      <TableCell>
                        <Chip label={b.status.toUpperCase()} size="small" />
                      </TableCell>
                      <TableCell>{new Date(b.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {(!selectedCustomer.bookings || selectedCustomer.bookings.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No bookings on file.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Payments log</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCustomer.payments && selectedCustomer.payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.transaction_id || 'N/A'}</TableCell>
                      <TableCell fontWeight="bold">₹{p.amount}</TableCell>
                      <TableCell>{p.method.toUpperCase()}</TableCell>
                      <TableCell>
                        <Chip label={p.status.toUpperCase()} size="small" color={p.status === 'success' ? 'success' : 'error'} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!selectedCustomer.payments || selectedCustomer.payments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No payment transactions on file.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

// ----------------------------------------------------
// 5. SERVICE CATEGORIES VIEW
// ----------------------------------------------------
const CategoriesView = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Edit fields
  const [description, setDescription] = useState('');
  const [baseCharge, setBaseCharge] = useState(0.0);
  const [iconName, setIconName] = useState('');
  const [isCategoryActive, setIsCategoryActive] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await api.get('accounts/admin/categories/');
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setDescription(category.description || '');
    setBaseCharge(category.base_labour_charge || 0.0);
    setIconName(category.icon || '');
    setIsCategoryActive(category.is_active);
    setOpenEditDialog(true);
  };

  const handleConfirmEdit = async () => {
    try {
      await api.put(`accounts/admin/categories/${selectedCategory.id}/`, {
        description,
        icon: iconName,
        base_labour_charge: baseCharge,
        is_active: isCategoryActive
      });
      toast.success('Service Category updated.');
      setOpenEditDialog(false);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to update category.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
          Service Categories Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure baseline labour rates, toggle service availability, and descriptions for the core listings.
        </Typography>
      </Box>

      {loading ? (
        <LinearProgress color="primary" />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell fontWeight="700">Category Name</TableCell>
                <TableCell fontWeight="700">Display Icon</TableCell>
                <TableCell fontWeight="700">Description</TableCell>
                <TableCell fontWeight="700">Base Labour Fee</TableCell>
                <TableCell fontWeight="700">Status</TableCell>
                <TableCell fontWeight="700" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell fontWeight="bold">{c.name}</TableCell>
                  <TableCell>{c.icon || 'Not configured'}</TableCell>
                  <TableCell sx={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.description || 'No description provided.'}
                  </TableCell>
                  <TableCell fontWeight="bold">₹{c.base_labour_charge}</TableCell>
                  <TableCell>
                    {c.is_active ? (
                      <Chip label="ENABLED" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                    ) : (
                      <Chip label="DISABLED" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" size="small" onClick={() => handleOpenEdit(c)}>
                      Configure
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Category Dialog */}
      {selectedCategory && (
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>Configure Service Category — {selectedCategory.name}</DialogTitle>
          <DialogContent sx={{ minWidth: 360, display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
            <TextField
              label="Base Labour Charge (₹)"
              type="number"
              size="small"
              fullWidth
              value={baseCharge}
              onChange={(e) => setBaseCharge(parseFloat(e.target.value) || 0.0)}
            />
            <TextField
              label="Display Icon Name"
              size="small"
              fullWidth
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              helperText="E.g., ElectricalServices, Plumbing, Carpenter, AcUnit, Build, CleaningServices"
            />
            <TextField
              label="Category Description"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">Category Active Status:</Typography>
              <Switch
                checked={isCategoryActive}
                onChange={(e) => setIsCategoryActive(e.target.checked)}
                color="primary"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmEdit} variant="contained" sx={{ bgcolor: '#1A73E8' }}>
              Save Configuration
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

// ----------------------------------------------------
// 6. PAYMENTS VIEW
// ----------------------------------------------------
const PaymentsView = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    try {
      const res = await api.get('accounts/admin/payments/', {
        params: { search: search || undefined }
      });
      setPayments(res.data);
    } catch (err) {
      toast.error('Failed to load payments ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setLoading(true);
      fetchPayments();
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
          Payment Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track transaction details, payout methods, and audit payments success rates.
        </Typography>
      </Box>

      {/* Search Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by Transaction ID, Tracking ID, Customer or Captain... (Press Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={fetchPayments} sx={{ bgcolor: '#1A73E8' }}>
            Search
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <LinearProgress color="primary" />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell fontWeight="700">Payment ID</TableCell>
                <TableCell fontWeight="700">Booking ID</TableCell>
                <TableCell fontWeight="700">Customer</TableCell>
                <TableCell fontWeight="700">Captain</TableCell>
                <TableCell fontWeight="700">Payment Method</TableCell>
                <TableCell fontWeight="700">Amount</TableCell>
                <TableCell fontWeight="700">Status</TableCell>
                <TableCell fontWeight="700">Payment Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.transaction_id || <Typography variant="caption" color="text.disabled">PENDING</Typography>}</TableCell>
                  <TableCell fontWeight="bold">{p.tracking_id}</TableCell>
                  <TableCell>{p.customer_name}</TableCell>
                  <TableCell>{p.worker_name}</TableCell>
                  <TableCell>{p.method.toUpperCase()}</TableCell>
                  <TableCell fontWeight="bold">₹{p.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.status.toUpperCase()}
                      color={p.status === 'success' ? 'success' : p.status === 'failed' ? 'error' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

// ----------------------------------------------------
// 7. BILLS VIEW
// ----------------------------------------------------
const BillsView = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [openBillDialog, setOpenBillDialog] = useState(false);

  const fetchBills = async () => {
    try {
      const res = await api.get('accounts/admin/bills/', {
        params: { search: search || undefined }
      });
      setBills(res.data);
    } catch (err) {
      toast.error('Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setLoading(true);
      fetchBills();
    }
  };

  const handleViewBillDetails = (bill) => {
    setSelectedBill(bill);
    setOpenBillDialog(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
          Invoice & Bill Registry
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track labour fees, spare parts receipts, and inspect copies of uploaded supplier invoices.
        </Typography>
      </Box>

      {/* Search Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by Bill Number, Booking Tracking ID... (Press Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={fetchBills} sx={{ bgcolor: '#1A73E8' }}>
            Filter
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <LinearProgress color="primary" />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell fontWeight="700">Bill Number</TableCell>
                <TableCell fontWeight="700">Booking ID</TableCell>
                <TableCell fontWeight="700">Customer</TableCell>
                <TableCell fontWeight="700">Captain</TableCell>
                <TableCell fontWeight="700">Labour Fee</TableCell>
                <TableCell fontWeight="700">GST (18%)</TableCell>
                <TableCell fontWeight="700">Total Amount</TableCell>
                <TableCell fontWeight="700" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell fontWeight="bold">#INV-{b.id + 5000}</TableCell>
                  <TableCell>{b.booking_detail?.tracking_id}</TableCell>
                  <TableCell>{b.booking_detail?.customer?.full_name}</TableCell>
                  <TableCell>{b.booking_detail?.worker?.full_name || 'N/A'}</TableCell>
                  <TableCell>₹{b.labour_charges}</TableCell>
                  <TableCell>₹{b.gst}</TableCell>
                  <TableCell fontWeight="bold" color="primary">₹{b.grand_total}</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" size="small" onClick={() => handleViewBillDetails(b)}>
                      Inspect Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Bill Detailed View Dialog */}
      {selectedBill && (
        <Dialog open={openBillDialog} onClose={() => setOpenBillDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Invoice Summary — #INV-{selectedBill.id + 5000}</Typography>
            <IconButton onClick={() => setOpenBillDialog(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: '#E5E7EB' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Booking Reference</Typography>
                <Typography variant="body2" fontWeight="bold">{selectedBill.booking_detail?.tracking_id} ({selectedBill.booking_detail?.service_category_detail?.name})</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Customer</Typography>
                <Typography variant="body2">{selectedBill.booking_detail?.customer?.full_name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Captain Professional</Typography>
                <Typography variant="body2">{selectedBill.booking_detail?.worker?.full_name || 'Unassigned'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Purchased Spare Parts / Spare Items List</Typography>
                {selectedBill.items && selectedBill.items.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                          <TableCell>Part Name</TableCell>
                          <TableCell align="center">Qty</TableCell>
                          <TableCell align="right">Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedBill.items.map((i) => (
                          <TableRow key={i.id}>
                            <TableCell>{i.part_name}</TableCell>
                            <TableCell align="center">{i.quantity}</TableCell>
                            <TableCell align="right">₹{i.price}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">No spare items recorded.</Typography>
                )}
              </Grid>

              {/* Uploaded Supplier Copy */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Spare Parts Store Receipt Photo</Typography>
                {selectedBill.booking_detail?.spare_part_photo ? (
                  <Box component="img" src={`http://127.0.0.1:8001${selectedBill.booking_detail.spare_part_photo}`} sx={{ width: '100%', height: 180, objectFit: 'contain', border: '1px solid #E5E7EB', borderRadius: 1 }} />
                ) : (
                  <Typography variant="caption" color="text.disabled">No receipt photo uploaded</Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Offsite Workshop Store Invoice Photo</Typography>
                {selectedBill.booking_detail?.invoice_photo ? (
                  <Box component="img" src={`http://127.0.0.1:8001${selectedBill.booking_detail.invoice_photo}`} sx={{ width: '100%', height: 180, objectFit: 'contain', border: '1px solid #E5E7EB', borderRadius: 1 }} />
                ) : (
                  <Typography variant="caption" color="text.disabled">No workshop invoice photo uploaded</Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBillDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

// ----------------------------------------------------
// 8. RATINGS & REVIEWS VIEW
// ----------------------------------------------------
const ReviewsView = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingVal, setRatingVal] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await api.get('accounts/admin/ratings/', {
        params: { rating: ratingVal || undefined }
      });
      setReviews(res.data);
    } catch (err) {
      toast.error('Failed to load ratings list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [ratingVal]);

  const handleToggleHide = async (reviewId) => {
    try {
      await api.post(`accounts/admin/ratings/${reviewId}/hide/`);
      toast.success('Review visibility state toggled.');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to hide/show review.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
          Ratings & Reviews
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor service feedback, filter ratings, and hide inappropriate or bad language reviews.
        </Typography>
      </Box>

      {/* Filter Header */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Rating</InputLabel>
          <Select
            value={ratingVal}
            onChange={(e) => setRatingVal(e.target.value)}
            label="Filter by Rating"
          >
            <MenuItem value="">All Ratings</MenuItem>
            <MenuItem value="5">5 Stars</MenuItem>
            <MenuItem value="4">4 Stars</MenuItem>
            <MenuItem value="3">3 Stars</MenuItem>
            <MenuItem value="2">2 Stars</MenuItem>
            <MenuItem value="1">1 Star</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <LinearProgress color="primary" />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell fontWeight="700">Booking</TableCell>
                <TableCell fontWeight="700">Customer</TableCell>
                <TableCell fontWeight="700">Captain</TableCell>
                <TableCell fontWeight="700">Rating</TableCell>
                <TableCell fontWeight="700">Review</TableCell>
                <TableCell fontWeight="700">Visibility</TableCell>
                <TableCell fontWeight="700" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell fontWeight="bold">{r.tracking_id}</TableCell>
                  <TableCell>{r.customer_name}</TableCell>
                  <TableCell>{r.worker_name}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <StarIcon sx={{ color: '#FBBC05', fontSize: 18 }} />
                      <Typography variant="body2" fontWeight="bold">{r.rating}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: '300px' }}>{r.review || <Typography variant="caption" color="text.disabled">No text review</Typography>}</TableCell>
                  <TableCell>
                    {r.is_hidden ? (
                      <Chip label="HIDDEN" color="error" size="small" variant="outlined" />
                    ) : (
                      <Chip label="VISIBLE" color="success" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" size="small" color={r.is_hidden ? 'success' : 'error'} onClick={() => handleToggleHide(r.id)}>
                      {r.is_hidden ? 'Show' : 'Hide Review'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

// ----------------------------------------------------
// 9. REPORTS & ANALYTICS VIEW
// ----------------------------------------------------
const ReportsView = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get('accounts/admin/reports/');
        setReportData(res.data);
      } catch (err) {
        toast.error('Failed to load analysis metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleExport = async () => {
    try {
      const response = await api.get('accounts/admin/reports/?export=csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'workizo_bookings_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV Report exported successfully.');
    } catch (err) {
      toast.error('Failed to generate CSV export.');
    }
  };

  if (loading) {
    return <LinearProgress color="primary" />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate detailed platform audit logs, check category revenues, and export CSV logs.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleExport}
          startIcon={<FileDownloadIcon />}
          sx={{ bgcolor: '#1A73E8', '&:hover': { bgcolor: '#155cb0' } }}
        >
          Export CSV Report
        </Button>
      </Box>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 4, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
            <Typography variant="subtitle2" color="text.secondary" uppercase>Success booking Completion Rate</Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ mt: 1, color: '#34A853', fontFamily: 'Outfit' }}>
              {reportData.successRate}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 4, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
            <Typography variant="subtitle2" color="text.secondary" uppercase>Booking Cancellation Rate</Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ mt: 1, color: '#EA4335', fontFamily: 'Outfit' }}>
              {reportData.cancelRate}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Revenue per Service Category Table */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Outfit' }}>
          Revenue Metrics per Service Category
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell fontWeight="700">Category</TableCell>
                <TableCell fontWeight="700" align="center">Total Bookings Count</TableCell>
                <TableCell fontWeight="700" align="right">Aggregated Grand Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.categories && reportData.categories.map((c, idx) => (
                <TableRow key={idx}>
                  <TableCell fontWeight="bold">{c.service_category__name || 'Unspecified'}</TableCell>
                  <TableCell align="center">{c.count}</TableCell>
                  <TableCell align="right" fontWeight="bold">₹{c.total_rev ? parseFloat(c.total_rev).toFixed(2) : '0.00'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

// ----------------------------------------------------
// 10. NOTIFICATIONS BROADCAST VIEW
// ----------------------------------------------------
const NotificationsView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('all_customers');

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('accounts/admin/notifications/');
      setAnnouncements(res.data);
    } catch (err) {
      toast.error('Failed to load announcement log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Please enter a title and message.');
      return;
    }
    try {
      await api.post('accounts/admin/notifications/', {
        title,
        message,
        recipient_type: recipientType
      });
      toast.success('Broadcast announcement sent successfully!');
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to send announcement.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
          Broadcast Announcements
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Send platform maintenance notices, support announcements, or service updates to users.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Creator Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Outfit' }}>
              Create Announcement
            </Typography>
            <form onSubmit={handleBroadcast}>
              <Box display="flex" flexDirection="column" gap={2.5}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Target Recipients</InputLabel>
                  <Select
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value)}
                    label="Target Recipients"
                  >
                    <MenuItem value="all_customers">All Registered Customers</MenuItem>
                    <MenuItem value="all_captains">All Registered Captains</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Announcement Title"
                  size="small"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                  label="Announcement Message Content"
                  size="small"
                  fullWidth
                  multiline
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button type="submit" variant="contained" sx={{ bgcolor: '#1A73E8', '&:hover': { bgcolor: '#155cb0' }, py: 1 }}>
                  Broadcast Announcement
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* History Log */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', minHeight: 350 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Outfit' }}>
              Sent Announcements History Log
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {announcements.map((a) => (
                  <Box key={a.id} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 1.5 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" fontWeight="bold">{a.title}</Typography>
                      <Chip label={a.recipient_type.replace('_', ' ').toUpperCase()} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{a.message}</Typography>
                    <Typography variant="caption" color="text.disabled">
                      Sent on: {new Date(a.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
                {announcements.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 6 }}>
                    No announcements sent yet.
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ----------------------------------------------------
// 11. SYSTEM SETTINGS VIEW
// ----------------------------------------------------
const SettingsView = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [companyName, setCompanyName] = useState('Workizo');
  const [gstPercentage, setGstPercentage] = useState(18.00);
  const [supportEmail, setSupportEmail] = useState('support@workizo.com');
  const [supportPhone, setSupportPhone] = useState('+919876543210');
  const [contactDetails, setContactDetails] = useState('');
  const [terms, setTerms] = useState('');
  const [privacy, setPrivacy] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('accounts/admin/settings/');
        const s = res.data;
        setCompanyName(s.company_name);
        setGstPercentage(parseFloat(s.gst_percentage));
        setSupportEmail(s.support_email);
        setSupportPhone(s.support_phone);
        setContactDetails(s.contact_details || '');
        setTerms(s.terms_conditions || '');
        setPrivacy(s.privacy_policy || '');
      } catch (err) {
        toast.error('Failed to load system settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('accounts/admin/settings/', {
        company_name: companyName,
        gst_percentage: gstPercentage,
        support_email: supportEmail,
        support_phone: supportPhone,
        contact_details: contactDetails,
        terms_conditions: terms,
        privacy_policy: privacy
      });
      toast.success('System Settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update configurations.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LinearProgress color="primary" />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
          System Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure platform parameters, GST values, support channels, and legal copy.
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', maxWidth: 800 }}>
        <form onSubmit={handleSave}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Company Name"
                size="small"
                fullWidth
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="GST Tax Percentage (%)"
                size="small"
                type="number"
                fullWidth
                value={gstPercentage}
                onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0.0)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Support Contact Email"
                size="small"
                type="email"
                fullWidth
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Support Help Phone"
                size="small"
                fullWidth
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Corporate Address / Contacts Info"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Terms & Conditions Copy"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Privacy Policy Copy"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={saving} sx={{ bgcolor: '#1A73E8', '&:hover': { bgcolor: '#155cb0' }, py: 1, px: 4 }}>
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

// ----------------------------------------------------
// 12. ADMIN PROFILE VIEW
// ----------------------------------------------------
const ProfileView = () => {
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('accounts/admin/profile/');
        setName(res.data.full_name);
        setEmail(res.data.email);
        setPhone(res.data.phone || '');
      } catch (err) {
        toast.error('Failed to load profile details.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await api.put('accounts/admin/profile/', {
        full_name: name,
        email,
        phone
      });
      toast.success('Admin Profile updated successfully.');
    } catch (err) {
      toast.error('Failed to save profile details.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error('Please input password values.');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.post('accounts/admin/profile/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      toast.success('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      const errorMsg = err.response?.data?.old_password?.[0] || 'Failed to change password.';
      toast.error(errorMsg);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (profileLoading) {
    return <LinearProgress color="primary" />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" fontFamily="Outfit" color="#0F0F14">
          Admin Profile Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your account credentials, notifications phone, and updates password.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Info Edit */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Outfit' }}>
              Update Profile Details
            </Typography>
            <form onSubmit={handleUpdateProfile}>
              <Stack spacing={2.5}>
                <TextField
                  label="Full Name"
                  size="small"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  label="Email Address"
                  size="small"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  label="Mobile Contact Phone"
                  size="small"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Button type="submit" variant="contained" disabled={profileSaving} sx={{ bgcolor: '#1A73E8', '&:hover': { bgcolor: '#155cb0' }, py: 1 }}>
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>

        {/* Password update */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, fontFamily: 'Outfit' }}>
              Change Account Password
            </Typography>
            <form onSubmit={handleChangePassword}>
              <Stack spacing={2.5}>
                <TextField
                  label="Current Password"
                  type="password"
                  size="small"
                  fullWidth
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <TextField
                  label="New Secure Password"
                  type="password"
                  size="small"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button type="submit" variant="contained" disabled={passwordSaving} sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, py: 1 }}>
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
