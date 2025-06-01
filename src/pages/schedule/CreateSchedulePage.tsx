import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { scheduleService } from '../../services/scheduleService';
import type { CreateScheduleDto } from '../../types/schedule';
import { ScheduleForm } from '../../components/schedule/ScheduleForm';

export const CreateSchedulePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (data: CreateScheduleDto) => {
    try {
      await scheduleService.createSchedule(data);
      navigate('/schedules');
    } catch (error) {
      setError('Failed to create schedule');
      console.error('Error creating schedule:', error);
    }
  };

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
          <Typography variant="h5" gutterBottom>
            Create New Schedule
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <ScheduleForm
            onSubmit={handleCreate}
            onCancel={() => navigate('/schedules')}
          />
        </Paper>
      </Box>
    </Container>
  );
}; 