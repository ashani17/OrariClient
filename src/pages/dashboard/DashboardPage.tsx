import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Container,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ViewListIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import type { Schedule } from '../../types/schedule';
import { scheduleService } from '../../services/scheduleService';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recentSchedules, setRecentSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSchedules = async () => {
      try {
        const schedules = await scheduleService.getSchedules();
        setRecentSchedules(schedules.slice(0, 5)); // Get only the 5 most recent schedules
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSchedules();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {getGreeting()}, {user?.name}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome to your dashboard. Here's what's happening with your schedules.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/schedule/create')}
              >
                Create New Schedule
              </Button>
              <Button
                variant="outlined"
                startIcon={<ViewListIcon />}
                onClick={() => navigate('/schedules')}
              >
                View All Schedules
              </Button>
              <Button
                variant="outlined"
                startIcon={<TodayIcon />}
                onClick={() => navigate('/schedule/today')}
              >
                Today's Schedule
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Schedules */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Schedules
            </Typography>
            {isLoading ? (
              <Typography>Loading recent schedules...</Typography>
            ) : recentSchedules.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {recentSchedules.map((schedule) => (
                  <Paper
                    key={schedule.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => navigate(`/schedule/${schedule.id}`)}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      {schedule.courseName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Professor: {schedule.professorName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Room: {schedule.roomName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time: {new Date(schedule.startTime).toLocaleTimeString()} -{' '}
                      {new Date(schedule.endTime).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography>No recent schedules found.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 