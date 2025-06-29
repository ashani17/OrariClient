import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Stack, Tab, Tabs, Switch, FormControlLabel, Chip, Divider } from '@mui/material';
import { Email, CheckCircle, Warning, Brightness4, Brightness7 } from '@mui/icons-material';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface SettingsProps {
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
}

const Settings: React.FC<SettingsProps> = ({ mode, setMode }) => {
  const { user, refreshUser } = useAuthStore();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const isAdmin = user?.role === 'Admin';

  // Email verification state
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
  const [emailVerificationMessage, setEmailVerificationMessage] = useState<string | null>(null);

  // Password reset state
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDetailsOpen = () => {
    setDetailsOpen(true);
    setEditError(null);
    setEditSuccess(null);
    setTab(0);
    setForm({
      name: user?.name || '',
      surname: user?.surname || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  };
  const handleDetailsClose = () => {
    setDetailsOpen(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    setEditError(null);
    setEditSuccess(null);
    setEditLoading(true);
    try {
      // Always send all fields, but only allow non-admins to edit phone
      const updateData = {
        name: form.name,
        surname: form.surname,
        email: form.email,
        phone: form.phone
      };
      await authService.updateProfile(updateData);
      setEditSuccess('Profile updated successfully!');
      refreshUser();
      setDetailsOpen(false);
    } catch (e: any) {
      setEditError(e?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // Email verification logic
  const handleResendEmailVerification = async () => {
    if (!user?.email) {
      setEmailVerificationMessage('No email address found.');
      return;
    }

    setEmailVerificationLoading(true);
    setEmailVerificationMessage(null);

    try {
      const response = await api.post('/auth/resend-confirmation', {
        email: user.email
      });

      if (response.data.success) {
        setEmailVerificationMessage('Confirmation email sent successfully! Please check your inbox.');
      } else {
        setEmailVerificationMessage(response.data.message || 'Failed to send confirmation email.');
      }
    } catch (error: any) {
      setEmailVerificationMessage(error.response?.data?.message || 'Failed to send confirmation email. Please try again.');
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  // Password reset logic (unchanged)
  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setSuccess(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleResetPassword = async () => {
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword('', newPassword);
      setSuccess('Password reset successfully!');
      setOpen(false);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 500 }}>
      <Typography variant="h3" fontWeight="bold" mb={4}>Settings</Typography>
      <Stack spacing={3}>
        {/* Email Verification Button at the Top */}
        <Box>
          <Button 
            variant={user?.emailConfirmed ? 'outlined' : 'contained'} 
            color={user?.emailConfirmed ? 'success' : 'primary'} 
            onClick={handleResendEmailVerification}
            disabled={user?.emailConfirmed || emailVerificationLoading}
            startIcon={<Email />}
            sx={{ mb: 1, width: '100%' }}
          >
            {user?.emailConfirmed ? 'Email Verified' : (emailVerificationLoading ? 'Sending...' : 'Verify Email')}
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {user?.emailConfirmed ? (
              <Chip icon={<CheckCircle />} label="Verified" color="success" size="small" />
            ) : (
              <Chip icon={<Warning />} label="Not Verified" color="warning" size="small" />
            )}
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          {!user?.emailConfirmed && (
            <Typography variant="body2" color="text.secondary" mb={1}>
              Your email address is not verified. Please check your inbox for a confirmation email, or click the button above to resend it.
            </Typography>
          )}
          {emailVerificationMessage && (
            <Alert 
              severity={emailVerificationMessage.includes('successfully') ? 'success' : 'info'} 
              sx={{ mt: 1 }}
            >
              {emailVerificationMessage}
            </Alert>
          )}
        </Box>

        {/* Theme Settings Section */}
        <Box>
          <Typography variant="h6" mb={2}>Theme</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={mode === 'dark'}
                onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')}
                icon={<Brightness4 />}
                checkedIcon={<Brightness7 />}
              />
            }
            label={`${mode === 'dark' ? 'Dark' : 'Light'} Mode`}
          />
          <Typography variant="body2" color="text.secondary" mt={1}>
            Switch between light and dark themes for better viewing experience.
          </Typography>
        </Box>

        <Divider />

        {/* User Details Section */}
        <Box>
          <Typography variant="h6" mb={2}>User Details</Typography>
          <Button variant="outlined" onClick={handleDetailsOpen}>
            View / Edit Details
          </Button>
          <Dialog open={detailsOpen} onClose={handleDetailsClose} maxWidth="xs" fullWidth>
            <DialogTitle>User Details</DialogTitle>
            <DialogContent>
              <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Details" />
              </Tabs>
              {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
              {editSuccess && <Alert severity="success" sx={{ mb: 2 }}>{editSuccess}</Alert>}
              <TextField
                label="First Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={!isAdmin}
              />
              <TextField
                label="Last Name"
                name="surname"
                value={form.surname}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={!isAdmin}
              />
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={!isAdmin}
              />
              <TextField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="Add phone number"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDetailsClose} disabled={editLoading}>Cancel</Button>
              <Button onClick={handleSave} variant="contained" color="primary" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        <Box>
          <Typography variant="h6" mb={2}>Password</Typography>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Reset Password
          </Button>
        </Box>
      </Stack>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            autoFocus
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" color="primary" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 