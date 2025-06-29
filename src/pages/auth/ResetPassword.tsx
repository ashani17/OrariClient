import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  LinearProgress,
  Stack,
  Link,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../services/api';
import { ThemeToggle } from "../../components/ThemeToggle";

interface ResetPasswordProps {
  mode: 'light' | 'dark';
  onToggleTheme: () => void;
}

const passwordRequirements = [
  { regex: /.{8,}/, message: 'At least 8 characters' },
  { regex: /[A-Z]/, message: 'At least one uppercase letter' },
  { regex: /[a-z]/, message: 'At least one lowercase letter' },
  { regex: /[0-9]/, message: 'At least one number' },
  { regex: /[^A-Za-z0-9]/, message: 'At least one special character' },
];

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

export const ResetPassword: React.FC<ResetPasswordProps> = ({ mode, onToggleTheme }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { error, isLoading, clearError, resetPassword } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const validatePassword = (password: string) => {
    const errors = passwordRequirements
      .filter(req => !req.regex.test(password))
      .map(req => req.message);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      return;
    }
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    if (token) {
      await resetPassword(token, password);
      if (!error) {
        navigate('/login');
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    setPasswordsMatch(newPassword === confirmPassword);
    if (error) clearError();
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordsMatch(password === newConfirmPassword);
    if (error) clearError();
  };

  const passwordStrength = (password: string) => {
    if (!password) return 0;
    return (passwordRequirements.filter(req => req.regex.test(password)).length / passwordRequirements.length) * 100;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return 'error';
    if (strength < 70) return 'warning';
    return 'success';
  };

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
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Enter your new password below.
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
                  name="password"
                  label="New Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading || password !== confirmPassword}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
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