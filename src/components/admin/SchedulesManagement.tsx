import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Avatar,
  Tabs,
  Tab
} from '@mui/material';
import { Add, Delete, Refresh, Schedule, Room, School, Person } from '@mui/icons-material';
import { adminService, CreateScheduleDTO } from '../../services/adminService';
import RecurringSchedulesManagement from './RecurringSchedulesManagement';

interface Schedule {
  sId: number;
  date: string;
  startTime: string;
  endTime: string;
  rId: number;
  professorId?: string;
  cId: number;
  eId?: number;
  room?: {
    rId: number;
    rName: string;
    rCapacity: number;
    rType: string;
    rDescription: string;
  };
  professor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course?: {
    cId: number;
    cName: string;
    credits: number;
    profesor: string;
  };
}

interface Room {
  rId: number;
  rName: string;
  rCapacity: number;
  rType: string;
  rDescription: string;
}

interface Professor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Course {
  cId: number;
  cName: string;
  credits: number;
  pId: number;
  profesor: string;
}

export default function SchedulesManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<CreateScheduleDTO>({
    date: '',
    startTime: '',
    endTime: '',
    rId: 0,
    professorId: '',
    cId: 0
  });
  const [tab, setTab] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [schedulesData, roomsData, professorsData, coursesData] = await Promise.all([
        adminService.getAllSchedules(),
        adminService.getAllRooms(),
        adminService.getAllProfessors(),
        adminService.getAllCourses()
      ]);
      setSchedules(schedulesData);
      setRooms(roomsData);
      setProfessors(professorsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        rId: schedule.rId,
        professorId: schedule.professorId || '',
        cId: schedule.cId
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        rId: 0,
        professorId: '',
        cId: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
    setFormData({
      date: '',
      startTime: '',
      endTime: '',
      rId: 0,
      professorId: '',
      cId: 0
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      // Ensure time fields are in HH:mm:ss format
      const padTime = (t: string) => t.length === 5 ? t + ':00' : t;
      const payload = {
        ...formData,
        startTime: padTime(formData.startTime),
        endTime: padTime(formData.endTime),
      };
      if (editingSchedule) {
        await adminService.updateSchedule(editingSchedule.sId, payload);
        handleCloseDialog();
        loadData();
      } else {
        await adminService.createSchedule(payload);
        handleCloseDialog();
        loadData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule');
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        setError(null);
        await adminService.deleteSchedule(scheduleId);
        loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete schedule');
      }
    }
  };

  const getRoomName = (roomId: number) => {
    const room = rooms.find(r => r.rId === roomId);
    return room ? room.rName : 'Unknown Room';
  };

  const getRoomCapacity = (roomId: number) => {
    const room = rooms.find(r => r.rId === roomId);
    return room ? room.rCapacity : 0;
  };

  const getRoomType = (roomId: number) => {
    const room = rooms.find(r => r.rId === roomId);
    return room ? room.rType : '';
  };

  const getProfessorName = (professorId?: string) => {
    if (!professorId) return 'Not Assigned';
    const professor = professors.find(p => p.id === professorId);
    return professor ? `${professor.firstName} ${professor.lastName}` : 'Unknown Professor';
  };

  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.cId === courseId);
    return course ? course.cName : 'Unknown Course';
  };

  const getCourseCredits = (courseId: number) => {
    const course = courses.find(c => c.cId === courseId);
    return course ? course.credits : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Regular Schedules" />
        <Tab label="Recurring Schedules" />
      </Tabs>
      {tab === 0 && (
        <Box>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Schedules Management</Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadData}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Add Schedule
              </Button>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Schedules Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Date & Day</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Professor</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No schedules found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => (
                    <TableRow key={schedule.sId}>
                      <TableCell>{schedule.sId}</TableCell>
                      <TableCell>
                        <Box>
                          <Chip 
                            label={formatDate(schedule.date)} 
                            size="small" 
                            color="primary" 
                            sx={{ mb: 0.5 }}
                          />
                          <Typography variant="caption" display="block" color="textSecondary">
                            {getDayOfWeek(schedule.date)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'info.main' }}>
                            <Room />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {getRoomName(schedule.rId)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {getRoomCapacity(schedule.rId)} seats • {getRoomType(schedule.rId)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main' }}>
                            <School />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {getCourseName(schedule.cId)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {getCourseCredits(schedule.cId)} credits
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'success.main' }}>
                            <Person />
                          </Avatar>
                          <Typography variant="body2">
                            {getProfessorName(schedule.professorId)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(schedule)}
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          <Schedule />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(schedule.sId)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Create/Edit Schedule Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 1 }}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  margin="normal"
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <Box display="flex" gap={2}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    margin="normal"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="End Time"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    margin="normal"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Room</InputLabel>
                  <Select
                    value={formData.rId.toString()}
                    onChange={(e) => setFormData({ ...formData, rId: parseInt(e.target.value) })}
                    label="Room"
                  >
                    {rooms.map((room) => (
                      <MenuItem key={room.rId} value={room.rId}>
                        {room.rName} - {room.rCapacity} capacity ({room.rType})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Professor</InputLabel>
                  <Select
                    value={formData.professorId}
                    onChange={(e) => setFormData({ ...formData, professorId: e.target.value })}
                    label="Professor"
                  >
                    <MenuItem value="">Not Assigned</MenuItem>
                    {professors.map((professor) => (
                      <MenuItem key={professor.id} value={professor.id}>
                        {professor.firstName} {professor.lastName} ({professor.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={formData.cId.toString()}
                    onChange={(e) => setFormData({ ...formData, cId: parseInt(e.target.value) })}
                    label="Course"
                  >
                    {courses.map((course) => (
                      <MenuItem key={course.cId} value={course.cId}>
                        {course.cName} - {course.credits} credits ({course.profesor})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={!formData.date || !formData.startTime || !formData.endTime || !formData.rId || !formData.cId}
              >
                {editingSchedule ? 'Update' : 'Create'} Schedule
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      {tab === 1 && <RecurringSchedulesManagement />}
    </Box>
  );
} 