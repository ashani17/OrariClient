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
  useTheme,
  Alert
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import api from '../../services/api';
import { adminService } from '../../services/adminService';
import type { StudyProgram } from '../../types';
import { PdfService } from '../../services/pdfService';

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
  group?: string;
}

interface WeekSchedule {
  date: string;
  dayName: string;
  schedules: FullSchedule[];
}

const AllSchedulesDashboard: React.FC = () => {
  const theme = useTheme();
  const [schedules, setSchedules] = useState<FullSchedule[]>([]);
  const [filtered, setFiltered] = useState<FullSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
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
  const [pendingProfessor, setPendingProfessor] = useState<string>('');
  const [pendingCourse, setPendingCourse] = useState<string>('');
  const [pendingRoom, setPendingRoom] = useState<string>('');
  const [pendingYear, setPendingYear] = useState<string>('');
  const [pendingAcademicYear, setPendingAcademicYear] = useState<string>('');
  const [studyProgramOptions, setStudyProgramOptions] = useState<StudyProgram[]>([]);
  const [pendingStudyProgram, setPendingStudyProgram] = useState<string>('');
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [pendingGroup, setPendingGroup] = useState('');
  
  // Predefined group options
  const predefinedGroups = ['A1', 'A2', 'B1', 'B2'];
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });

  useEffect(() => {
    console.log('🚀 AllSchedulesDashboard component mounted');
    console.log('📚 Loading initial filter options...');
    
    // Only fetch study programs, professors, courses, rooms for filter options
    // Don't fetch schedules until user applies filters
    adminService.getAllStudyPrograms().then((programs: StudyProgram[]) => {
      console.log('📚 Study programs loaded:', programs);
      console.log('📚 Study program names:', programs.map(p => p.spName));
      setStudyProgramOptions(programs);
    }).catch(err => {
      console.error('❌ Error loading study programs:', err);
    });
    
    adminService.getAllProfessors().then((profs: any[]) => {
      const professorNames = profs.map((p) => `${p.firstName || p.name || ''} ${p.lastName || p.surname || ''}`.trim());
      console.log('👨‍🏫 Professors loaded:', profs);
      console.log('👨‍🏫 Professor names:', professorNames);
      setProfessorOptions(professorNames);
    }).catch(err => {
      console.error('❌ Error loading professors:', err);
    });
    
    adminService.getAllCourses().then((courses: any[]) => {
      const courseNames = courses.map((c) => c.cName || c.CName || c.name || '');
      console.log('📖 Courses loaded:', courses);
      console.log('📖 Course names:', courseNames);
      setCourseOptions(courseNames);
    }).catch(err => {
      console.error('❌ Error loading courses:', err);
    });
    
    adminService.getAllRooms().then((rooms: any[]) => {
      const roomNames = rooms.map((r) => r.rName || r.name || '');
      console.log('🏫 Rooms loaded:', rooms);
      console.log('🏫 Room names:', roomNames);
      setRoomOptions(roomNames);
    }).catch(err => {
      console.error('❌ Error loading rooms:', err);
    });
    
    // Set predefined group options
    console.log('👥 Setting predefined groups:', predefinedGroups);
    setGroupOptions(predefinedGroups);
    
    console.log('✅ Initial data loading completed');
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    console.log('🔄 Starting fetchSchedules...');
    console.log('📋 Current filters:', {
      studyProgram: pendingStudyProgram,
      professor: pendingProfessor,
      course: pendingCourse,
      room: pendingRoom,
      year: pendingYear,
      academicYear: pendingAcademicYear,
      group: pendingGroup
    });
    
    try {
      let url = '/schedule/dashboard-full';
      const params = new URLSearchParams();
      
      // Only add parameters if they have values
      if (pendingStudyProgram) {
        params.append('studyProgram', pendingStudyProgram);
        console.log('📚 Adding studyProgram filter:', pendingStudyProgram);
      }
      if (pendingProfessor) {
        params.append('professor', pendingProfessor);
        console.log('👨‍🏫 Adding professor filter:', pendingProfessor);
      }
      if (pendingCourse) {
        params.append('course', pendingCourse);
        console.log('📖 Adding course filter:', pendingCourse);
      }
      if (pendingRoom) {
        params.append('room', pendingRoom);
        console.log('🏫 Adding room filter:', pendingRoom);
      }
      if (pendingYear) {
        params.append('year', pendingYear);
        console.log('📅 Adding year filter:', pendingYear);
      }
      if (pendingAcademicYear) {
        params.append('academicYear', pendingAcademicYear);
        console.log('🎓 Adding academicYear filter:', pendingAcademicYear);
      }
      if (pendingGroup) {
        params.append('group', pendingGroup);
        console.log('👥 Adding group filter:', pendingGroup);
      }
      
      // Only make the request if there are actual filters
      if (params.toString()) {
        url += `?${params.toString()}`;
        console.log('🌐 Making API request to:', url);
        
        const res = await api.get(url);
        console.log('✅ API Response received:', res);
        console.log('📊 Raw data:', res.data);
        console.log('📈 Number of schedules received:', res.data.length);
        
        setSchedules(res.data);
        setFiltered(res.data);
        
        // Log sample data
        if (res.data.length > 0) {
          console.log('📋 Sample schedule data:', res.data[0]);
          console.log('📋 Sample schedule with study program:', {
            courseName: res.data[0].courseName,
            studyProgramName: res.data[0].studyProgramName,
            group: res.data[0].group,
            date: res.data[0].date,
            professor: `${res.data[0].professorFirstName} ${res.data[0].professorLastName}`
          });
        }
        
        // Update filter options from the fetched data
        const professorOptionsFromData = Array.from(new Set(res.data.map((s: FullSchedule) => `${s.professorFirstName || ''} ${s.professorLastName || ''}`.trim()).filter(Boolean)));
        const courseOptionsFromData = Array.from(new Set(res.data.map((s: FullSchedule) => s.courseName).filter(Boolean)));
        const roomOptionsFromData = Array.from(new Set(res.data.map((s: FullSchedule) => s.roomName).filter(Boolean)));
        
        console.log('👨‍🏫 Professor options from data:', professorOptionsFromData);
        console.log('📖 Course options from data:', courseOptionsFromData);
        console.log('🏫 Room options from data:', roomOptionsFromData);
        
        setProfessorOptions(professorOptionsFromData.map(String));
        setCourseOptions(courseOptionsFromData.map(String));
        setRoomOptions(roomOptionsFromData.map(String));
        
        // Build years (1, 2, 3)
        const uniqueYears = Array.from(new Set(res.data.map((s: FullSchedule) => s.year)))
          .filter(year => year !== undefined && year !== null && !isNaN(year))
          .sort((a, b) => (a as number) - (b as number));
        console.log('📅 Years from data:', uniqueYears);
        setYears((uniqueYears as (number | undefined)[]).filter((y): y is number => typeof y === 'number'));
        
        // Build academic years
        const uniqueAcademicYears = Array.from(new Set(res.data.map((s: FullSchedule) => s.academicYear).filter(Boolean))).sort();
        console.log('🎓 Academic years from data:', uniqueAcademicYears);
        setAcademicYears(uniqueAcademicYears as string[]);
        
        // Check for study programs
        const studyProgramsInData = Array.from(new Set(res.data.map((s: FullSchedule) => s.studyProgramName).filter(Boolean)));
        console.log('📚 Study programs in data:', studyProgramsInData);
        
        // Check for groups
        const groupsInData = Array.from(new Set(res.data.map((s: FullSchedule) => s.group).filter(Boolean)));
        console.log('👥 Groups in data:', groupsInData);
        
      } else {
        console.log('⚠️ No filters applied, clearing data');
        // No filters applied, clear the data
        setSchedules([]);
        setFiltered([]);
      }
    } catch (err) {
      console.error('❌ Error fetching schedules:', err);
      console.error('❌ Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      setSchedules([]);
      setFiltered([]);
    } finally {
      setLoading(false);
      console.log('✅ fetchSchedules completed');
    }
  };

  const handleSearch = async () => {
    console.log('🔍 Search button clicked!');
    console.log('🎯 Search triggered with filters:', {
      studyProgram: pendingStudyProgram,
      professor: pendingProfessor,
      course: pendingCourse,
      room: pendingRoom,
      year: pendingYear,
      academicYear: pendingAcademicYear,
      group: pendingGroup
    });
    setSearchPerformed(true);
    await fetchSchedules();
  };

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

  // Helper function to get day name
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
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

  const handleDownloadPDF = async () => {
    try {
    // Get all schedules for the current week
    const weekStart = getWeekStart(currentWeekStart);
    const weekEnd = getWeekEnd(currentWeekStart);
      const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d.toISOString().split('T')[0];
    });
    const weekSchedulesFlat = filtered.filter(s => weekDates.includes(s.date));
      
      // Create formatted content for table parsing
      const contentLines: string[] = [];
      
      if (weekSchedulesFlat.length === 0) {
        contentLines.push('No schedules found for this week.');
      } else {
        weekSchedulesFlat.forEach(schedule => {
          contentLines.push(`Day: ${getDayName(schedule.date)}`);
          contentLines.push(`Time: ${schedule.startTime.substring(0,5)} - ${schedule.endTime.substring(0,5)}`);
          contentLines.push(`Course: ${schedule.courseName}`);
          contentLines.push(`Professor: ${schedule.professorFirstName || ''} ${schedule.professorLastName || ''}`.trim());
          contentLines.push(`Room: ${schedule.roomName}`);
          contentLines.push(`Semester: ${schedule.year} (${schedule.academicYear})`);
          contentLines.push('');
        });
      }

      const content = contentLines.join('\n');

      // Create filename with study programs, years, and week info
      const uniquePrograms = [...new Set(weekSchedulesFlat.map(s => s.studyProgramName).filter(Boolean))];
      const uniqueYears = [...new Set(weekSchedulesFlat.map(s => s.academicYear).filter(Boolean))];
      const weekInfo = `${weekStart.toISOString().slice(0, 10)}_${weekEnd.toISOString().slice(0, 10)}`;
      
      const programNames = uniquePrograms.length > 0 ? uniquePrograms.join('_') : 'AllPrograms';
      const years = uniqueYears.length > 0 ? uniqueYears.join('_') : 'AllYears';
      const filename = `${programNames}_${years}_${weekInfo}`;

      const result = await PdfService.generatePdf({
        title: 'Schedule Dashboard Report',
        content: content,
        filename: filename
      });

      PdfService.downloadPdf(result.blob, result.filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
  };

  // Log when filtered data changes
  useEffect(() => {
    console.log('📊 Filtered data updated:', {
      totalSchedules: schedules.length,
      filteredSchedules: filtered.length,
      searchPerformed: searchPerformed
    });
    
    if (filtered.length > 0) {
      console.log('📋 First filtered schedule:', filtered[0]);
    }
  }, [filtered, schedules, searchPerformed]);

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3} fontWeight="bold">Schedule Dashboard</Typography>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="outlined" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
      </Box>
      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <Autocomplete
          options={studyProgramOptions.map(sp => sp.spName)}
          value={pendingStudyProgram}
          onChange={(_, value) => setPendingStudyProgram(value || '')}
          inputValue={pendingStudyProgram}
          onInputChange={(_, value) => setPendingStudyProgram(value)}
          renderInput={params => <TextField {...params} label="Study Program" variant="outlined" size="small" />}
          sx={{ width: 200 }}
        />
        <Autocomplete
          options={professorOptions}
          value={pendingProfessor}
          onChange={(_, value) => setPendingProfessor(value || '')}
          inputValue={pendingProfessor}
          onInputChange={(_, value) => setPendingProfessor(value)}
          renderInput={params => <TextField {...params} label="Professor" variant="outlined" size="small" />}
          sx={{ width: 200 }}
        />
        <Autocomplete
          options={courseOptions}
          value={pendingCourse}
          onChange={(_, value) => setPendingCourse(value || '')}
          inputValue={pendingCourse}
          onInputChange={(_, value) => setPendingCourse(value)}
          renderInput={params => <TextField {...params} label="Course" variant="outlined" size="small" />}
          sx={{ width: 200 }}
        />
        <Autocomplete
          options={roomOptions}
          value={pendingRoom}
          onChange={(_, value) => setPendingRoom(value || '')}
          inputValue={pendingRoom}
          onInputChange={(_, value) => setPendingRoom(value)}
          renderInput={params => <TextField {...params} label="Room" variant="outlined" size="small" />}
          sx={{ width: 200 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={pendingYear}
            label="Year"
            onChange={e => setPendingYear(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {years.map(y => <MenuItem key={y} value={y.toString()}>Year {y}</MenuItem>)}
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
        <Autocomplete
          options={groupOptions}
          value={pendingGroup}
          onChange={(_, value) => setPendingGroup(value || '')}
          inputValue={pendingGroup}
          onInputChange={(_, value) => setPendingGroup(value)}
          renderInput={params => <TextField {...params} label="Group" variant="outlined" size="small" />}
          sx={{ width: 120 }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch} sx={{ height: 40 }}>
          Search
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
                {Array.from({ length: 7 }, (_, i) => {
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
                const weekDates = Array.from({ length: 7 }, (_, i) => {
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
                            <Box key={s.sId} sx={{ mb: 1, p: 1, borderRadius: 1, background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, display: 'inline-block', minWidth: 120, color: theme.palette.text.primary }}>
                              <Typography variant="body2" fontWeight="bold" color="inherit">{s.courseName}</Typography>
                              <Typography variant="caption" display="block" color="inherit">{s.roomName}</Typography>
                              <Typography variant="caption" display="block" color="inherit">{s.professorFirstName} {s.professorLastName}</Typography>
                              {s.studyProgramName && (
                                <Typography variant="caption" display="block" color="inherit">{s.studyProgramName}</Typography>
                              )}
                              <Typography variant="caption" display="block" color="inherit">Year {s.year}, {s.academicYear}</Typography>
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
  );
};

export default AllSchedulesDashboard; 