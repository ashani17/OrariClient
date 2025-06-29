import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Link,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip
} from '@mui/material';
import { CheckCircle, Error, Email } from '@mui/icons-material';
import api from '../../services/api';
import { Link as RouterLink } from 'react-router-dom';

function PublicSchedulesBackgroundTable() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await api.get('/schedule/dashboard-full');
        setSchedules(res.data);
      } catch {
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      filter: 'blur(6px) grayscale(0.2)',
      opacity: 0.7,
      background: 'rgba(30,30,30,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Box sx={{ width: '80vw', maxHeight: '80vh', overflow: 'auto' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Study Program</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Professor</TableCell>
                <TableCell>Room</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">No schedules found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                schedules.slice(0, 20).map((s) => (
                  <TableRow key={s.sId}>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.startTime}</TableCell>
                    <TableCell>{s.endTime}</TableCell>
                    <TableCell>{s.departmentName}</TableCell>
                    <TableCell>{s.studyProgramName}</TableCell>
                    <TableCell>
                      <Chip label={s.courseName} size="small" color="primary" />
                    </TableCell>
                    <TableCell>{`${s.professorFirstName || ''} ${s.professorLastName || ''}`.trim()}</TableCell>
                    <TableCell>
                      <Chip label={s.roomName} size="small" color="secondary" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

const EmailConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  useEffect(() => {
    const confirmEmail = async () => {
      if (!userId || !token) {
        setStatus('error');
        setMessage('Invalid confirmation link. Please check your email and try again.');
        return;
      }

      try {
        const response = await api.post('/authentication/confirm-email', {
          userId,
          token
        });

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
        } else {
          setStatus('error');
          setMessage(response.data.message);
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to confirm email. Please try again.');
      }
    };

    confirmEmail();
  }, [userId, token]);

  const handleResendEmail = async () => {
    setStatus('loading');
    try {
      // This would need the user's email, which we don't have in the URL
      // You might want to add a form to enter email for resending
      setMessage('Please use the "Forgot Password" or "Resend Confirmation" feature from the login page.');
      setStatus('expired');
    } catch (error) {
      setStatus('error');
      setMessage('Failed to resend confirmation email.');
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress size={60} />
            <Typography variant="h6">Confirming your email...</Typography>
          </Box>
        );

      case 'success':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CheckCircle color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h5" color="success.main" gutterBottom>
              Email Confirmed!
            </Typography>
            <Typography variant="body1" textAlign="center">
              {message}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </Box>
        );

      case 'error':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Error color="error" sx={{ fontSize: 60 }} />
            <Typography variant="h5" color="error.main" gutterBottom>
              Confirmation Failed
            </Typography>
            <Typography variant="body1" textAlign="center">
              {message}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleResendEmail}
              sx={{ mt: 2 }}
            >
              Resend Confirmation Email
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </Box>
        );

      case 'expired':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Email color="warning" sx={{ fontSize: 60 }} />
            <Typography variant="h5" color="warning.main" gutterBottom>
              Link Expired
            </Typography>
            <Typography variant="body1" textAlign="center">
              {message}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <PublicSchedulesBackgroundTable />
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', px: 4 }}>
        <Container component="main" maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Form Section */}
          <Box sx={{ flex: 1, maxWidth: 400, order: { xs: 2, md: 1 } }}>
            <Paper
              elevation={3}
              sx={{
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Typography component="h1" variant="h5">
                Email Confirmation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Please check your email and click the confirmation link to activate your account.
              </Typography>
              <Box sx={{ mt: 3, width: '100%' }}>
                {status === 'error' && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {message}
                  </Alert>
                )}
                {status === 'success' && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {message}
                  </Alert>
                )}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleResendEmail}
                  disabled={status === 'loading'}
                  sx={{ mb: 2 }}
                >
                  {status === 'loading' ? 'Sending...' : 'Resend Confirmation Email'}
                </Button>
                <Stack spacing={1} sx={{ textAlign: 'center' }}>
                  <Link component={RouterLink} to="/login" variant="body2">
                    Back to Sign In
                  </Link>
                </Stack>
              </Box>
              <Box mt={2} textAlign="center">
                <Link component={RouterLink} to="/schedules" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500, fontSize: '1.3rem', display: 'inline-block', margin: '12px auto 0 auto' }}>
                  View Public Schedules
                </Link>
              </Box>
            </Paper>
          </Box>

          {/* Logo Section */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            order: { xs: 1, md: 2 },
            mb: { xs: 3, md: 0 }
          }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Orari Logo"
              sx={{
                height: { xs: 150, sm: 200, md: 279.5 },
                width: 'auto',
                maxWidth: '100%',
              }}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default EmailConfirmation; 