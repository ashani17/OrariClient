import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { scheduleService } from '../../services/scheduleService';
import type { Schedule } from '../../types/schedule';
import { ScheduleForm } from '../../components/schedule/ScheduleForm';

export const ScheduleDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSchedule(id);
    }
  }, [id]);

  const fetchSchedule = async (scheduleId: string) => {
    try {
      setIsLoading(true);
      const data = await scheduleService.getScheduleById(scheduleId);
      setSchedule(data);
      setError(null);
    } catch (error) {
      setError('Failed to load schedule details');
      console.error('Error fetching schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updatedData: Partial<Schedule>) => {
    if (!id || !schedule) return;

    try {
      setIsLoading(true);
      const updatedSchedule = await scheduleService.updateSchedule(id, updatedData);
      setSchedule(updatedSchedule);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError('Failed to update schedule');
      console.error('Error updating schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await scheduleService.deleteSchedule(id);
        navigate('/schedules');
      } catch (error) {
        setError('Failed to delete schedule');
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDayOfWeek = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!schedule) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Schedule not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/schedules')}
          sx={{ mb: 3 }}
        >
          Back to Schedules
        </Button>

        <Paper sx={{ p: 3 }}>
          {isEditing ? (
            <Box>
              <Typography variant="h5" gutterBottom>
                Edit Schedule
              </Typography>
              <ScheduleForm
                initialData={schedule}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditing(false)}
              />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Schedule Details</Typography>
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsEditing(true)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Course
                  </Typography>
                  <Typography variant="body1">{schedule.courseName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Professor
                  </Typography>
                  <Typography variant="body1">{schedule.professorName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Room
                  </Typography>
                  <Typography variant="body1">{schedule.roomName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Day
                  </Typography>
                  <Typography variant="body1">{getDayOfWeek(schedule.dayOfWeek)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Time
                  </Typography>
                  <Typography variant="body1">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Semester
                  </Typography>
                  <Typography variant="body1">
                    {schedule.semester} ({schedule.academicYear})
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}; 