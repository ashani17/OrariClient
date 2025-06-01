import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import type { Schedule, CreateScheduleDto } from '../../types/schedule';

interface ScheduleFormProps {
  initialData?: Schedule;
  onSubmit: (data: CreateScheduleDto | Partial<Schedule>) => Promise<void>;
  onCancel: () => void;
}

export const ScheduleForm = ({ initialData, onSubmit, onCancel }: ScheduleFormProps) => {
  const [formData, setFormData] = useState<CreateScheduleDto>({
    courseId: initialData?.courseId || '',
    professorId: initialData?.professorId || '',
    roomId: initialData?.roomId || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    dayOfWeek: initialData?.dayOfWeek || 1,
    semester: initialData?.semester || 1,
    academicYear: initialData?.academicYear || new Date().getFullYear().toString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime') => (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date.toISOString(),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Course ID"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Professor ID"
              name="professorId"
              value={formData.professorId}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Room ID"
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Day of Week</InputLabel>
              <Select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                label="Day of Week"
                onChange={handleChange}
                required
              >
                <MenuItem value={1}>Monday</MenuItem>
                <MenuItem value={2}>Tuesday</MenuItem>
                <MenuItem value={3}>Wednesday</MenuItem>
                <MenuItem value={4}>Thursday</MenuItem>
                <MenuItem value={5}>Friday</MenuItem>
                <MenuItem value={6}>Saturday</MenuItem>
                <MenuItem value={0}>Sunday</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Start Time"
              value={formData.startTime ? new Date(formData.startTime) : null}
              onChange={handleTimeChange('startTime')}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="End Time"
              value={formData.endTime ? new Date(formData.endTime) : null}
              onChange={handleTimeChange('endTime')}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Semester"
              name="semester"
              type="number"
              value={formData.semester}
              onChange={handleChange}
              required
              inputProps={{ min: 1, max: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Academic Year"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {initialData ? 'Update' : 'Create'} Schedule
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}; 