import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Link,
  LinearProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import type { RegisterData } from '../../services/authService';
import api from '../../services/api';

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

export const Register = () => {
  const navigate = useNavigate();
  const { register, error, isLoading, clearError } = useAuthStore();
  const [data, setData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastName: '',
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const passwordStrength = useMemo(() => {
    if (!data.password) return 0;
    return (passwordRequirements.filter(req => req.regex.test(data.password)).length / passwordRequirements.length) * 100;
  }, [data.password]);

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return 'error';
    if (strength < 70) return 'warning';
    return 'success';
  };

  const validatePassword = (password: string) => {
    const errors = passwordRequirements
      .filter(req => !req.regex.test(password))
      .map(req => req.message);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(data.password)) {
      return;
    }
    if (data.password !== data.confirmPassword) {
      setValidationErrors(['Passwords do not match']);
      return;
    }
    await register(data);
    if (!error) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'password') {
      validatePassword(value);
    }
    if (error) clearError();
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <PublicSchedulesBackgroundTable />
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', minHeight: '100vh', pl: 0, ml: 10 }}>
        <Box sx={{ width: 400, maxWidth: '100%' }}>
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
              Register
            </Typography>
            <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
              Only emails from <strong>fshn.edu.al</strong> and <strong>fshnstudent.info</strong> domains are allowed.
            </Alert>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    label="First Name"
                    name="name"
                    autoComplete="given-name"
                    value={data.name}
                    onChange={handleChange}
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={data.lastName}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={data.email}
                onChange={handleChange}
                type="email"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={data.password}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={data.confirmPassword}
                onChange={handleChange}
              />
              {data.password && (
                <>
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      color={getPasswordStrengthColor(passwordStrength)}
                    />
                  </Box>
                  {validationErrors.length > 0 && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="body2">Password requirements:</Typography>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}
                </>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading || validationErrors.length > 0}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}; 