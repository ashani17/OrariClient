import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import { Delete, Add, Edit, EventBusy } from '@mui/icons-material';
import recurringScheduleService from '../../services/recurringScheduleService';
import { adminService } from '../../services/adminService';

interface RecurringSchedule {
  id: number;
  courseId: number;
  roomId: number;
  professorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

export default function RecurringSchedulesManagement() {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<RecurringSchedule | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [form, setForm] = useState({
    courseId: '',
    roomId: '',
    professorId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchedules();
    loadDropdowns();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recurringScheduleService.getRecurringSchedules();
      setSchedules(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recurring schedules');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [courses, rooms, professors] = await Promise.all([
        adminService.getAllCourses(),
        adminService.getAllRooms(),
        adminService.getAllProfessors(),
      ]);
      setCourses(courses);
      setRooms(rooms);
      setProfessors(professors);
    } catch (err) {
      // ignore for now
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this recurring schedule?')) return;
    try {
      await recurringScheduleService.deleteRecurringSchedule(id);
      loadSchedules();
    } catch (err: any) {
      setError(err.message || 'Failed to delete recurring schedule');
    }
  };

  const handleOpenDialog = (schedule?: RecurringSchedule) => {
    setEditingSchedule(schedule || null);
    setForm(schedule ? {
      courseId: String(schedule.courseId),
      roomId: String(schedule.roomId),
      professorId: schedule.professorId,
      dayOfWeek: String(schedule.dayOfWeek),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
    } : {
      courseId: '',
      roomId: '',
      professorId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      startDate: '',
      endDate: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const padTime = (t: string) => t.length === 5 ? t + ':00' : t;
      const payload = {
        courseId: Number(form.courseId),
        roomId: Number(form.roomId),
        professorId: form.professorId,
        dayOfWeek: Number(form.dayOfWeek),
        startTime: padTime(form.startTime),
        endTime: padTime(form.endTime),
        startDate: form.startDate,
        endDate: form.endDate,
      };
      if (editingSchedule) {
        await recurringScheduleService.updateRecurringSchedule(editingSchedule.id, payload);
      } else {
        await recurringScheduleService.createRecurringSchedule(payload);
      }
      setOpenDialog(false);
      setEditingSchedule(null);
      loadSchedules();
    } catch (err: any) {
      setError(err.message || 'Failed to save recurring schedule');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return form.courseId && form.roomId && form.professorId && form.dayOfWeek !== '' && form.startTime && form.endTime && form.startDate && form.endDate;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ flex: 1 }}>Recurring Schedules</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Recurring Schedule
        </Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Course ID</TableCell>
                <TableCell>Room ID</TableCell>
                <TableCell>Professor ID</TableCell>
                <TableCell>Day of Week</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.courseId}</TableCell>
                  <TableCell>{s.roomId}</TableCell>
                  <TableCell>{s.professorId}</TableCell>
                  <TableCell>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][s.dayOfWeek]}</TableCell>
                  <TableCell>{s.startTime}</TableCell>
                  <TableCell>{s.endTime}</TableCell>
                  <TableCell>{s.startDate}</TableCell>
                  <TableCell>{s.endDate}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(s)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(s.id)}><Delete /></IconButton>
                    <IconButton title="Manage Exceptions"><EventBusy /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSchedule ? 'Edit Recurring Schedule' : 'Add Recurring Schedule'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Course</InputLabel>
              <Select name="courseId" value={form.courseId} label="Course" onChange={handleSelectChange}>
                {courses.map((c) => (
                  <MenuItem key={c.cId} value={String(c.cId)}>{c.cName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Room</InputLabel>
              <Select name="roomId" value={form.roomId} label="Room" onChange={handleSelectChange}>
                {rooms.map((r) => (
                  <MenuItem key={r.rId} value={String(r.rId)}>{r.rName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Professor</InputLabel>
              <Select name="professorId" value={form.professorId} label="Professor" onChange={handleSelectChange}>
                {professors.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Day of Week</InputLabel>
              <Select name="dayOfWeek" value={form.dayOfWeek} label="Day of Week" onChange={handleSelectChange}>
                {['Monday','Tuesday','Wednesday','Thursday','Friday'].map((d, i) => (
                  <MenuItem key={i+1} value={String(i+1)}>{d}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField name="startTime" label="Start Time" type="time" value={form.startTime} onChange={handleInputChange} required InputLabelProps={{ shrink: true }} inputProps={{ step: 60 }} />
            <TextField name="endTime" label="End Time" type="time" value={form.endTime} onChange={handleInputChange} required InputLabelProps={{ shrink: true }} inputProps={{ step: 60 }} />
            <TextField name="startDate" label="Start Date" type="date" value={form.startDate} onChange={handleInputChange} required InputLabelProps={{ shrink: true }} />
            <TextField name="endDate" label="End Date" type="date" value={form.endDate} onChange={handleInputChange} required InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!isFormValid() || saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 