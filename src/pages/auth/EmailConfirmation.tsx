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
  Container
} from '@mui/material';
import { CheckCircle, Error, Email } from '@mui/icons-material';
import api from '../../services/api';

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
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent sx={{ p: 4 }}>
            {getStatusContent()}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default EmailConfirmation; 