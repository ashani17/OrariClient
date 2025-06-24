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
  Button
} from '@mui/material';
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
  year: number;
}

const PublicSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<FullSchedule[]>([]);
  const [filtered, setFiltered] = useState<FullSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState<string>('');
  const [professor, setProfessor] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [years, setYears] = useState<number[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchSchedules();
    // Fetch study programs
    adminService.getAllStudyPrograms().then((programs: StudyProgram[]) => {
      setStudyProgramOptions(programs);
    });
  }, [year]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const url = year ? `/api/schedule/dashboard-full?year=${year}` : '/api/schedule/dashboard-full';
      const res = await api.get(url);
      setSchedules(res.data);
      setFiltered(res.data);
      // Build options
      setDepartmentOptions(Array.from(new Set(res.data.map((s: FullSchedule) => s.departmentName).filter(Boolean))));
      setProfessorOptions(Array.from(new Set(res.data.map((s: FullSchedule) => `${s.professorFirstName || ''} ${s.professorLastName || ''}`.trim()).filter(Boolean))));
      setCourseOptions(Array.from(new Set(res.data.map((s: FullSchedule) => s.courseName).filter(Boolean))));
      setRoomOptions(Array.from(new Set(res.data.map((s: FullSchedule) => s.roomName).filter(Boolean))));
      // Build years
      const uniqueYears = Array.from(new Set(res.data.map((s: FullSchedule) => s.year))).sort((a: number, b: number) => b - a);
      setYears(uniqueYears);
    } catch (err) {
      setSchedules([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let result = schedules;
    if (pendingStudyProgram) {
      result = result.filter(s => s.studyProgramName?.toLowerCase().includes(pendingStudyProgram.toLowerCase()));
    }
    if (pendingProfessor) {
      result = result.filter(s => (`${s.professorFirstName || ''} ${s.professorLastName || ''}`.toLowerCase().includes(pendingProfessor.toLowerCase())));
    }
    if (pendingCourse) {
      result = result.filter(s => s.courseName.toLowerCase().includes(pendingCourse.toLowerCase()));
    }
    if (pendingRoom) {
      result = result.filter(s => s.roomName.toLowerCase().includes(pendingRoom.toLowerCase()));
    }
    setFiltered(result);
  };

  return (
    <Box maxWidth="lg" mx="auto" mt={4} p={4}>
      <Typography variant="h4" mb={3} fontWeight="bold">Public Schedules</Typography>
      {!isAuthenticated && (
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button variant="contained" color="primary" size="small" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </Box>
      )}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} gap={2}>
        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
          <Autocomplete
            options={studyProgramOptions.map(sp => sp.spName)}
            value={pendingStudyProgram}
            onChange={(_, value) => setPendingStudyProgram(value || '')}
            inputValue={pendingStudyProgram}
            onInputChange={(_, value) => setPendingStudyProgram(value)}
            renderInput={params => <TextField {...params} label="Study Program" variant="outlined" size="small" />}
            sx={{ width: 160 }}
          />
          <Autocomplete
            options={departmentOptions}
            value={department}
            onChange={(_, value) => setDepartment(value || '')}
            inputValue={department}
            onInputChange={(_, value) => setDepartment(value)}
            renderInput={params => <TextField {...params} label="Department" variant="outlined" size="small" />}
            sx={{ width: 160 }}
          />
          <Autocomplete
            options={professorOptions}
            value={pendingProfessor}
            onChange={(_, value) => setPendingProfessor(value || '')}
            inputValue={pendingProfessor}
            onInputChange={(_, value) => setPendingProfessor(value)}
            renderInput={params => <TextField {...params} label="Professor" variant="outlined" size="small" />}
            sx={{ width: 160 }}
          />
          <Autocomplete
            options={courseOptions}
            value={pendingCourse}
            onChange={(_, value) => setPendingCourse(value || '')}
            inputValue={pendingCourse}
            onInputChange={(_, value) => setPendingCourse(value)}
            renderInput={params => <TextField {...params} label="Course" variant="outlined" size="small" />}
            sx={{ width: 160 }}
          />
          <Autocomplete
            options={roomOptions}
            value={pendingRoom}
            onChange={(_, value) => setPendingRoom(value || '')}
            inputValue={pendingRoom}
            onInputChange={(_, value) => setPendingRoom(value)}
            renderInput={params => <TextField {...params} label="Room" variant="outlined" size="small" />}
            sx={{ width: 160 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={pendingYear}
              label="Year"
              onChange={e => setPendingYear(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" size="small" onClick={handleSearch} sx={{ height: 36 }}>
            Search
          </Button>
        </Box>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">No schedules found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(s => (
                  <TableRow key={s.sId}>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.startTime}</TableCell>
                    <TableCell>{s.endTime}</TableCell>
                    <TableCell>{s.departmentName}</TableCell>
                    <TableCell>{s.studyProgramName}</TableCell>
                    <TableCell>{s.courseName}</TableCell>
                    <TableCell>{`${s.professorFirstName || ''} ${s.professorLastName || ''}`.trim()}</TableCell>
                    <TableCell>{s.roomName}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PublicSchedules; 