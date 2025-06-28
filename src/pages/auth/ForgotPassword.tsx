import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeToggle } from '../../components/ThemeToggle';

interface ForgotPasswordProps {
  mode: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ mode, onToggleTheme }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { error, isLoading, clearError, requestPasswordReset } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestPasswordReset(email);
    if (!error) {
      setIsSubmitted(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) clearError();
  };

  if (isSubmitted) {
    return (
      <Box sx={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
        <PublicSchedulesBackgroundTable />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', px: 4 }}>
          <Container component="main" maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Form Section */}
            <Box sx={{ flex: 1, maxWidth: 400 }}>
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
                <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                  If an account exists with this email, you will receive password reset instructions.
                </Alert>
                <Link href="/login" variant="body2">
                  Return to login
                </Link>
              </Paper>
            </Box>

            {/* Logo Section */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Orari Logo"
                sx={{
                  height: 300,
                  width: 'auto',
                  maxWidth: '100%',
                }}
              />
            </Box>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <PublicSchedulesBackgroundTable />
      
      {/* Theme Toggle in top-right corner */}
      <Box sx={{ 
        position: 'fixed', 
        top: 16, 
        right: 16, 
        zIndex: 10 
      }}>
        <ThemeToggle mode={mode} onToggle={onToggleTheme} />
      </Box>
      
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
                Forgot Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
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

function PublicSchedulesBackgroundTable() {
  const [schedules, setSchedules] = useState<any[]>([]);
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