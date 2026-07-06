import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Card, CardContent, Grid, Button, 
  Divider, TextField, MenuItem, Tabs, Tab, Skeleton, InputAdornment
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import HandymanIcon from '@mui/icons-material/Handyman';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api, { buildApiUrl } from '../services/api';
import toast from 'react-hot-toast';

function WorkerJobHistory() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/api/bookings/my-bookings/');
      setJobs(res.data);
    } catch (e) {
      toast.error('Failed to load job history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (bookingId) => {
    window.open(buildApiUrl(`/api/billing/${bookingId}/download-invoice/`), '_blank');
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.id.toString().includes(search) || 
      job.customer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      job.problem_type?.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'completed') return matchesSearch && job.status === 'completed';
    if (statusFilter === 'pending') return matchesSearch && !['completed', 'cancelled', 'searching'].includes(job.status);
    if (statusFilter === 'cancelled') return matchesSearch && job.status === 'cancelled';
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#2e7d32';
      case 'cancelled': return '#d32f2f';
      case 'searching': return '#0288d1';
      default: return '#ed6c02'; // travelling, arrived, verified, in_progress, etc.
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Back Link */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/captain/dashboard')}
        sx={{ mb: 3, color: '#000000', textTransform: 'none' }}
      >
        Back to Dashboard
      </Button>

      {/* Main Title Banner */}
      <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 4 }}>
        <HistoryIcon sx={{ fontSize: 40, color: '#1A73E8' }} />
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
            Job History Ledger
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search, filter, and review all your assigned job runs and invoices.
          </Typography>
        </Box>
      </Box>

      {/* Search & Filter Controls */}
      <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '12px', mb: 4, bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                placeholder="Search by Job ID, Customer Name, or Service Problem..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    style: { borderRadius: '8px' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                select
                fullWidth
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                slotProps={{ input: { style: { borderRadius: '8px' } } }}
              >
                <MenuItem value="all">All Jobs</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Active / Pending In Progress</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* History List Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} key={n}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))}
        </Grid>
      ) : filteredJobs.length === 0 ? (
        <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '12px', textAlign: 'center', py: 8 }}>
          <CardContent>
            <HandymanIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight="700">No jobs found</Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search terms.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredJobs.map((job, idx) => (
            <Grid item xs={12} key={job.id}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderColor: '#E5E7EB', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                    '&:hover': {
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)',
                      borderColor: '#1A73E8'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={7}>
                        <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1.5 }}>
                          <Typography variant="subtitle1" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
                            Job #{job.id}
                          </Typography>
                          <Box 
                            sx={{ 
                              px: 1.5, py: 0.4, borderRadius: '12px', fontSize: '11px', fontWeight: '800',
                              color: '#ffffff', bgcolor: getStatusColor(job.status), textTransform: 'uppercase'
                            }}
                          >
                            {job.status.replace('_', ' ')}
                          </Box>
                        </Box>

                        <Typography variant="body2" fontWeight="700" sx={{ mb: 0.5 }}>
                          Customer: {job.customer?.full_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Problem: {job.problem_type} — {job.problem_description?.substring(0, 75)}...
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Schedule: <b>{job.preferred_date} | {job.preferred_time}</b>
                        </Typography>
                        
                        {job.repair_token && (
                          <Box sx={{ mt: 1.5, display: 'inline-flex', px: 1.5, py: 0.5, bgcolor: '#F0F7FF', border: '1px solid #C2E0FF', borderRadius: '6px' }}>
                            <Typography variant="caption" color="primary.main" fontWeight="700">
                              Workshop Token: {job.repair_token.token_number} ({job.repair_token.status.replace('_', ' ').toUpperCase()})
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: { md: 'flex-end' }, gap: 1.5 }}>
                        <Box sx={{ textAlign: { md: 'right' } }}>
                          <Typography variant="caption" color="text.secondary">Completed Date</Typography>
                          <Typography variant="body2" fontWeight="800">
                            {new Date(job.updated_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                          </Typography>
                        </Box>

                        <Box display="flex" gap={1.5}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/captain/job/${job.id}`)}
                            endIcon={<OpenInNewIcon fontSize="small" />}
                            sx={{ textTransform: 'none', borderRadius: '6px', borderColor: '#000000', color: '#000000' }}
                          >
                            Job Details
                          </Button>
                          
                          {job.status === 'completed' && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleDownloadInvoice(job.id)}
                              startIcon={<DownloadIcon />}
                              sx={{ textTransform: 'none', borderRadius: '6px', bgcolor: '#000000', color: '#ffffff' }}
                            >
                              Invoice
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default WorkerJobHistory;
