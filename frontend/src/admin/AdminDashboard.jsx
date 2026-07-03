import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Container, Typography, Box, Grid, Paper, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  CircularProgress, Alert
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Document Viewer Modal State
  const [openDocDialog, setOpenDocDialog] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState({ name: '', aadhaar: '', pan: '', profile: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const customersRes = await api.get('accounts/admin/customers/');
      const workersRes = await api.get('accounts/admin/workers/');
      setCustomers(customersRes.data);
      setWorkers(workersRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrative lists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyWorker = async (userId, approvalStatus) => {
    try {
      await api.post(`accounts/admin/workers/${userId}/verify/`, {
        approval_status: approvalStatus
      });
      toast.success(`Worker registration ${approvalStatus} successfully.`);
      fetchData(); // reload
    } catch (err) {
      console.error(err);
      toast.error('Failed to update worker verification status.');
    }
  };

  const handleToggleUserActive = async (userId) => {
    try {
      const res = await api.post(`accounts/admin/users/${userId}/toggle-active/`);
      toast.success(res.data.message);
      fetchData(); // reload
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to change user state.');
    }
  };

  const handleViewKYC = (worker) => {
    const profile = worker.profile || {};
    setSelectedDocs({
      name: worker.user.full_name,
      aadhaar: profile.aadhaar_photo ? `http://127.0.0.1:8001${profile.aadhaar_photo}` : '',
      pan: profile.pan_photo ? `http://127.0.0.1:8001${profile.pan_photo}` : '',
      profile: profile.profile_photo ? `http://127.0.0.1:8001${profile.profile_photo}` : '',
      aadhaarNum: profile.aadhaar_number || 'N/A',
      panNum: profile.pan_number || 'N/A',
    });
    setOpenDocDialog(true);
  };

  const getApprovalChip = (status) => {
    if (status === 'approved') return <Chip label="Approved" color="success" size="small" />;
    if (status === 'rejected') return <Chip label="Rejected" color="error" size="small" />;
    return <Chip label="Pending" color="warning" size="small" />;
  };

  if (loading && customers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Admin Operations Panel
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} color="primary">
          <Tab label={`Captains (${workers.length})`} />
          <Tab label={`Customers (${customers.length})`} />
        </Tabs>
      </Box>

      {/* Workers Panel */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAFAFB' }}>
                <TableCell>Name</TableCell>
                <TableCell>Email / Phone</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Exp (Yrs)</TableCell>
                <TableCell>KYC Docs</TableCell>
                <TableCell>Approval Status</TableCell>
                <TableCell>Account State</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.user.id} hover>
                  <TableCell fontWeight="bold">{worker.user.full_name}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{worker.user.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{worker.user.phone}</Typography>
                  </TableCell>
                  <TableCell>{worker.profile?.service_category?.name || 'Unassigned'}</TableCell>
                  <TableCell>{worker.profile?.experience || 0} Yrs</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewKYC(worker)}
                    >
                      View KYC
                    </Button>
                  </TableCell>
                  <TableCell>{getApprovalChip(worker.profile?.approval_status)}</TableCell>
                  <TableCell>
                    {worker.user.is_active ? (
                      <Chip label="Active" color="success" variant="outlined" size="small" />
                    ) : (
                      <Chip label="Deactivated" color="error" variant="outlined" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      {worker.profile?.approval_status !== 'approved' && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleVerifyWorker(worker.user.id, 'approved')}
                        >
                          Approve
                        </Button>
                      )}
                      {worker.profile?.approval_status !== 'rejected' && (
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleVerifyWorker(worker.user.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color={worker.user.is_active ? 'warning' : 'primary'}
                        size="small"
                        onClick={() => handleToggleUserActive(worker.user.id)}
                      >
                        {worker.user.is_active ? 'Suspend' : 'Activate'}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {workers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">No worker accounts registered yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Customers Panel */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAFAFB' }}>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>City / State</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((cust) => (
                <TableRow key={cust.user.id} hover>
                  <TableCell fontWeight="bold">{cust.user.full_name}</TableCell>
                  <TableCell>{cust.user.email}</TableCell>
                  <TableCell>{cust.user.phone}</TableCell>
                  <TableCell>
                    {cust.profile?.city ? `${cust.profile.city}, ${cust.profile.state}` : 'Not Provided'}
                  </TableCell>
                  <TableCell>
                    {cust.user.is_active ? (
                      <Chip label="Active" color="success" size="small" />
                    ) : (
                      <Chip label="Deactivated" color="error" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color={cust.user.is_active ? 'error' : 'success'}
                      size="small"
                      onClick={() => handleToggleUserActive(cust.user.id)}
                    >
                      {cust.user.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No customer accounts registered yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Document Viewer Dialog */}
      <Dialog 
        open={openDocDialog} 
        onClose={() => setOpenDocDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#ffffff', border: '1px solid #E5E7EB' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">KYC Document Inspection — {selectedDocs.name}</Typography>
          <IconButton onClick={() => setOpenDocDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#E5E7EB' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="secondary" gutterBottom>
                Aadhaar Document (No: {selectedDocs.aadhaarNum})
              </Typography>
              {selectedDocs.aadhaar ? (
                <Box 
                  component="img" 
                  src={selectedDocs.aadhaar} 
                  alt="Aadhaar Copy"
                  sx={{ width: '100%', height: 'auto', maxHeight: 300, objectFit: 'contain', border: '1px solid #E5E7EB', borderRadius: 1 }}
                />
              ) : (
                <Alert severity="warning">No Aadhaar document uploaded yet.</Alert>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="secondary" gutterBottom>
                PAN Document (No: {selectedDocs.panNum})
              </Typography>
              {selectedDocs.pan ? (
                <Box 
                  component="img" 
                  src={selectedDocs.pan} 
                  alt="PAN Copy"
                  sx={{ width: '100%', height: 'auto', maxHeight: 300, objectFit: 'contain', border: '1px solid #E5E7EB', borderRadius: 1 }}
                />
              ) : (
                <Alert severity="warning">No PAN document uploaded yet.</Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDocDialog(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
