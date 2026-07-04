import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Card, CardContent, Grid, Button, 
  Divider, Switch, FormControlLabel, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import ShieldIcon from '@mui/icons-material/Shield';
import DescriptionIcon from '@mui/icons-material/Description';
import toast from 'react-hot-toast';

function WorkerSettings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveSettings = () => {
    toast.success('Preferences saved successfully!');
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
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
        <SettingsIcon sx={{ fontSize: 40, color: '#1A73E8' }} />
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
            System Settings & Support
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure system configurations, notification channels, or consult policies.
          </Typography>
        </Box>
      </Box>

      {/* Preferences Section */}
      <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', mb: 4, bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="800" sx={{ mb: 2, fontFamily: 'Outfit, sans-serif' }}>
            General Preferences
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications} 
                    onChange={(e) => setNotifications(e.target.checked)} 
                    color="primary"
                  />
                }
                label="Receive Sound Notifications (sound alerts for incoming bookings)"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={darkMode} 
                    onChange={(e) => setDarkMode(e.target.checked)} 
                    color="primary"
                  />
                }
                label="Mock Dark Mode Theme"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Application Language</InputLabel>
                <Select
                  value={language}
                  label="Application Language"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <MenuItem value="en">English (US)</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                  <MenuItem value="gu">ગુજરાતી (Gujarati)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            onClick={handleSaveSettings}
            sx={{ 
              bgcolor: '#000000', 
              color: '#ffffff', 
              mt: 4, 
              px: 4, 
              borderRadius: '8px', 
              textTransform: 'none',
              '&:hover': { bgcolor: '#222' }
            }}
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Help & Support Contact */}
      <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', mb: 4, bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <HelpIcon color="primary" />
            <Typography variant="h6" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
              Help & Support Hotline
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Got questions or queries regarding service payouts, verification checks, or client disputes? Reach our dedicated Captain assistance team:
          </Typography>
          <Typography variant="body2" fontWeight="700">
            Email Support: captain-support@workizo.com <br />
            Phone Assistance: +91 79 4004 0404 (Mon-Sat, 9am to 6pm)
          </Typography>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card variant="outlined" sx={{ borderColor: '#E5E7EB', borderRadius: '16px', bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <ShieldIcon color="primary" />
            <Typography variant="h6" fontWeight="800" sx={{ fontFamily: 'Outfit, sans-serif' }}>
              Privacy & Legal Policies
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle2" fontWeight="700" sx={{ mt: 2 }}>
            Terms & Conditions of Service
          </Typography>
          <Typography variant="caption" color="text.secondary" paragraph>
            As a verified WORKIZO service Captain, you are an independent service partner. Agreeing to work bookings requires compliance with regional safety guidelines, providing timely check-ins via QR code verification, and honest invoice submissions. Cancellations made post-acceptance may reduce your acceptance and completion score metrics.
          </Typography>

          <Typography variant="subtitle2" fontWeight="700" sx={{ mt: 2 }}>
            Partner Privacy Policy
          </Typography>
          <Typography variant="caption" color="text.secondary">
            WORKIZO tracks location data exclusively when you toggle your status to ONLINE to search and present bookings matching your service category inside Ahmedabad region. Settlement bank documents, Aadhaar cards, and PAN documents uploaded during registration are stored securely and never shared with third-party networks.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default WorkerSettings;
