import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './LandingPage';
import CustomerLogin from './customer/CustomerLogin';
import CustomerRegister from './customer/CustomerRegister';
import WorkerLogin from './captain/WorkerLogin';
import WorkerRegister from './captain/WorkerRegister';
import AdminLogin from './admin/AdminLogin';
import ForgotPassword from './components/ForgotPassword';
import CustomerProfile from './customer/CustomerProfile';
import WorkerProfile from './captain/WorkerProfile';
import CustomerDashboard from './customer/CustomerDashboard';
import WorkerDashboard from './captain/WorkerDashboard';
import AdminDashboard from './admin/AdminDashboard';
import BookingFlow from './customer/BookingFlow';
import BookingTimeline from './customer/BookingTimeline';
import WorkerJobDetails from './captain/WorkerJobDetails';
import WorkerJobHistory from './captain/WorkerJobHistory';
import WorkerWallet from './captain/WorkerWallet';
import WorkerSettings from './captain/WorkerSettings';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/customer/login" element={<CustomerLogin />} />
              <Route path="/customer/register" element={<CustomerRegister />} />
              <Route path="/captain/login" element={<WorkerLogin />} />
              <Route path="/captain/register" element={<WorkerRegister />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Customer Protected Routes */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/book"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <BookingFlow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/booking/:id"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <BookingTimeline />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />

              {/* Captain Protected Routes */}
              <Route
                path="/captain/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/captain/job/:id"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerJobDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/captain/profile"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/captain/history"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerJobHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/captain/wallet"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerWallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/captain/settings"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerSettings />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#0F0F14',
                border: '1px solid #E5E7EB'
              }
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
