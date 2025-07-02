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
  TextField,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  useTheme
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { adminService } from '../services/adminService';
import type { StudyProgram } from '../types';

interface FullSchedule {
  sId: number;
  date: string;
  startTime: string;
  endTime: string;
  rId: number;
  roomName: string;
  roomType: string;
  roomCapacity: number;
  roomDescription: string;
  professorId?: string;
  professorFirstName?: string;
  professorLastName?: string;
  professorEmail?: string;
  cId: number;
  courseName: string;
  credits: number;
  studyProgramId?: number;
  studyProgramName?: string;
  departmentId?: number;
  departmentName?: string;
  year: number; // 1, 2, or 3
  academicYear: string; // e.g., "2023-2026"
}

interface WeekSchedule {
  date: string;
  dayName: string;
  schedules: FullSchedule[];
}

const PublicSchedules: React.FC = () => {
  const theme = useTheme();
  const [schedules, setSchedules] = useState<FullSchedule[]>([]);
  const [filtered, setFiltered] = useState<FullSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'table'>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });
  
  // Filter states
  const [professor, setProfessor] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('');
  const [years, setYears] = useState<number[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [professorOptions, setProfessorOptions] = useState<string[]>([]);
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const [roomOptions, setRoomOptions] = useState<string[]>([]);
  const [studyProgramOptions, setStudyProgramOptions] = useState<StudyProgram[]>([]);
  const [studyProgram, setStudyProgram] = useState<string>('');
  const [pendingStudyProgram, setPendingStudyProgram] = useState<string>('');
  const [pendingProfessor, setPendingProfessor] = useState<string>('');
  const [pendingCourse, setPendingCourse] = useState<string>('');
  const [pendingRoom, setPendingRoom] = useState<string>('');
  const [pendingYear, setPendingYear] = useState<string>('');
  const [pendingAcademicYear, setPendingAcademicYear] = useState<string>('');
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Helper function to get week start (Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Helper function to get week end (Sunday)
  const getWeekEnd = (date: Date): Date => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get day name
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Helper function to organize schedules by week
  const organizeSchedulesByWeek = (schedules: FullSchedule[]): WeekSchedule[] => {
    const weekStart = getWeekStart(currentWeekStart);
    const weekEnd = getWeekEnd(currentWeekStart);
    
    const weekSchedules: WeekSchedule[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      
      const dateString = currentDate.toISOString().split('T')[0];
      const daySchedules = schedules.filter(s => s.date === dateString);
      
      weekSchedules.push({
        date: dateString,
        dayName: getDayName(dateString),
        schedules: daySchedules
      });
    }
    
    return weekSchedules;
  };

  // Week navigation handlers
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const goToCurrentWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(now.setDate(diff)));
  };

  // Get week schedules for current view
  const weekSchedules = organizeSchedulesByWeek(filtered);

  useEffect(() => {
    // Only fetch study programs, professors, courses, rooms for filter options
    // Don't fetch schedules until user applies filters
    adminService.getAllStudyPrograms().then((programs: StudyProgram[]) => {
      setStudyProgramOptions(programs);
    });
    adminService.getAllProfessors().then((profs: any[]) => {
      setProfessorOptions(profs.map((p) => `${p.firstName || p.name || ''} ${p.lastName || p.surname || ''}`.trim()));
    });
    adminService.getAllCourses().then((courses: any[]) => {
      setCourseOptions(courses.map((c) => c.cName || c.CName || c.name || ''));
    });
    adminService.getAllRooms().then((rooms: any[]) => {
      setRoomOptions(rooms.map((r) => r.rName || r.name || ''));
    });
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      let url = '/schedule/dashboard-full';
      const params = new URLSearchParams();
      
      // Only add parameters if they have values
      if (pendingStudyProgram) {
        params.append('studyProgram', pendingStudyProgram);
      }
      if (pendingProfessor) {
        params.append('professor', pendingProfessor);
      }
      if (pendingCourse) {
        params.append('course', pendingCourse);
      }
      if (pendingRoom) {
        params.append('room', pendingRoom);
      }
      if (pendingYear) {
        params.append('year', pendingYear);
      }
      if (pendingAcademicYear) {
        params.append('academicYear', pendingAcademicYear);
      }
      
      // Only make the request if there are actual filters
      if (params.toString()) {
        url += `?${params.toString()}`;
        const res = await api.get(url);
        setSchedules(res.data);
        setFiltered(res.data);
        
        // Update filter options from the fetched data
        setProfessorOptions(Array.from(new Set(res.data.map((s: FullSchedule) => `${s.professorFirstName || ''} ${s.professorLastName || ''}`.trim()).filter(Boolean))));
        setCourseOptions(Array.from(new Set(res.data.map((s: FullSchedule) => s.courseName).filter(Boolean))));
        setRoomOptions(Array.from(new Set(res.data.map((s: FullSchedule) => s.roomName).filter(Boolean))));
        
        // Build years (1, 2, 3)
        const uniqueYears = Array.from(new Set(res.data.map((s: FullSchedule) => s.year))).sort((a, b) => (a as number) - (b as number));
        setYears(uniqueYears as number[]);
        
        // Build academic years
        const uniqueAcademicYears = Array.from(new Set(res.data.map((s: FullSchedule) => s.academicYear).filter(Boolean))).sort();
        setAcademicYears(uniqueAcademicYears as string[]);
      } else {
        // No filters applied, clear the data
        setSchedules([]);
        setFiltered([]);
      }
    } catch (err) {
      setSchedules([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearchPerformed(true);
    await fetchSchedules();
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      {!isAuthenticated && (
        <Box sx={{ position: 'absolute', top: 32, right: 48, zIndex: 10 }}>
          <Button variant="contained" color="primary" size="medium" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </Box>
      )}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', minHeight: '100vh', pl: 4, pr: 4, width: '100%', maxWidth: '100%' }}>
        <Box width="100%">
          <Typography variant="h4" mb={3} fontWeight="bold">Public Schedules</Typography>
          
          {/* Filters */}
          <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="nowrap" sx={{ overflowX: 'auto' }}>
            <Autocomplete
              options={studyProgramOptions.map(sp => sp.spName)}
              value={pendingStudyProgram}
              onChange={(_, value) => setPendingStudyProgram(value || '')}
              inputValue={pendingStudyProgram}
              onInputChange={(_, value) => setPendingStudyProgram(value)}
              renderInput={params => <TextField {...params} label="Study Program" variant="outlined" size="small" />}
              sx={{ width: 160, minWidth: 120 }}
            />
            <Autocomplete
              options={professorOptions}
              value={pendingProfessor}
              onChange={(_, value) => setPendingProfessor(value || '')}
              inputValue={pendingProfessor}
              onInputChange={(_, value) => setPendingProfessor(value)}
              renderInput={params => <TextField {...params} label="Professor" variant="outlined" size="small" />}
              sx={{ width: 160, minWidth: 120 }}
            />
            <Autocomplete
              options={courseOptions}
              value={pendingCourse}
              onChange={(_, value) => setPendingCourse(value || '')}
              inputValue={pendingCourse}
              onInputChange={(_, value) => setPendingCourse(value)}
              renderInput={params => <TextField {...params} label="Course" variant="outlined" size="small" />}
              sx={{ width: 160, minWidth: 120 }}
            />
            <Autocomplete
              options={roomOptions}
              value={pendingRoom}
              onChange={(_, value) => setPendingRoom(value || '')}
              inputValue={pendingRoom}
              onInputChange={(_, value) => setPendingRoom(value)}
              renderInput={params => <TextField {...params} label="Room" variant="outlined" size="small" />}
              sx={{ width: 160, minWidth: 120 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={pendingYear}
                label="Year"
                onChange={e => setPendingYear(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {years.map(y => <MenuItem key={y} value={y}>Year {y}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={pendingAcademicYear}
                label="Academic Year"
                onChange={e => setPendingAcademicYear(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {academicYears.map(ay => <MenuItem key={ay} value={ay}>{ay}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" size="small" onClick={handleSearch} sx={{ height: 36, minWidth: 90 }}>
              Search
            </Button>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <>
            {/* Week Navigation */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <IconButton onClick={goToPreviousWeek}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="h6">
                {getWeekStart(currentWeekStart).toLocaleDateString()} - {getWeekEnd(currentWeekStart).toLocaleDateString()}
              </Typography>
              <Box display="flex" gap={1}>
                <Button variant="outlined" size="small" onClick={goToCurrentWeek}>
                  Today
                </Button>
                <IconButton onClick={goToNextWeek}>
                  <ChevronRight />
                </IconButton>
              </Box>
            </Box>
            {/* Timetable Table View (filtered by week) */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    {[...Array(7)].map((_, i) => {
                      const weekStart = getWeekStart(currentWeekStart);
                      const date = new Date(weekStart);
                      date.setDate(weekStart.getDate() + i);
                      return (
                        <TableCell align="center" key={i} sx={{ fontWeight: 'bold' }}>
                          {getDayName(date.toISOString().split('T')[0])}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Build all unique time slots for the week */}
                  {(() => {
                    // Get all schedules for the current week
                    const weekStart = getWeekStart(currentWeekStart);
                    const weekEnd = getWeekEnd(currentWeekStart);
                    const weekDates = [...Array(7)].map((_, i) => {
                      const d = new Date(weekStart);
                      d.setDate(weekStart.getDate() + i);
                      return d.toISOString().split('T')[0];
                    });
                    const weekSchedulesFlat = filtered.filter(s => weekDates.includes(s.date));
                    const allSlots = Array.from(new Set(weekSchedulesFlat.map(s => `${s.startTime}-${s.endTime}`)));
                    allSlots.sort();
                    if (allSlots.length === 0) {
                      // Show at least one empty row if no slots
                      return [
                        <TableRow key="empty-row">
                          <TableCell sx={{ fontWeight: 'bold', width: 120 }}></TableCell>
                          {weekDates.map((_, dayIdx) => (
                            <TableCell key={dayIdx} align="center" sx={{ verticalAlign: 'top', minWidth: 140, background: theme.palette.background.default }} />
                          ))}
                        </TableRow>
                      ];
                    }
                    return allSlots.map(slot => (
                      <TableRow key={slot}>
                        <TableCell sx={{ fontWeight: 'bold', width: 120 }}>{slot}</TableCell>
                        {weekDates.map((dateString, dayIdx) => {
                          const cellSchedules = weekSchedulesFlat.filter(s => s.date === dateString && `${s.startTime}-${s.endTime}` === slot);
                          return (
                            <TableCell key={dayIdx} align="center" sx={{ verticalAlign: 'top', minWidth: 140, background: theme.palette.background.default }}>
                              {cellSchedules.length === 0 ? null : cellSchedules.map(s => (
                                <Box key={s.sId} sx={{ mb: 1, p: 1, borderRadius: 1, background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#23272f', border: `1px solid ${theme.palette.divider}`, display: 'inline-block', minWidth: 120 }}>
                                  <Typography variant="body2" fontWeight="bold">{s.courseName}</Typography>
                                  <Typography variant="caption" display="block">{s.roomName}</Typography>
                                  <Typography variant="caption" display="block">{s.professorFirstName} {s.professorLastName}</Typography>
                                  {s.studyProgramName && (
                                    <Typography variant="caption" display="block">{s.studyProgramName}</Typography>
                                  )}
                                  <Typography variant="caption" display="block">Year {s.year}, {s.academicYear}</Typography>
                                </Box>
                              ))}
                      </TableCell>
                          );
                        })}
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PublicSchedules; 