import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Button, Stack, TextField
} from '@mui/material';

interface Schedule {
  sId: number;
  date: string;
  startTime: string;
  endTime: string;
  rId: number;
  professorId?: string;
  cId: number;
  room?: {
    rId: number;
    rName: string;
    rCapacity: number;
    rType: string;
    rDescription: string;
  };
  course?: {
    cId: number;
    cName: string;
    credits: number;
    profesor: string;
  };
}

const DAYS = [
  { key: 1, label: 'E Hënë', js: 1 }, // Monday
  { key: 2, label: 'E Martë', js: 2 },
  { key: 3, label: 'E Mërkurë', js: 3 },
  { key: 4, label: 'E Enjte', js: 4 },
  { key: 5, label: 'E Premte', js: 5 },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
];

function getDayOfWeek(dateString: string) {
  // Returns 1 (Monday) to 5 (Friday)
  const date = new Date(dateString);
  let day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
  if (day === 0) day = 7; // treat Sunday as 7
  return day;
}

function isInSlot(start: string, slot: string) {
  // slot: '08:00', start: '11:00:00'
  return start.startsWith(slot);
}

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // adjust when day is Sunday
  date.setDate(date.getDate() + diff);
  date.setHours(0,0,0,0);
  return date;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isDateInRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

const MySchedulePage: React.FC = () => {
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const weekEnd = addDays(weekStart, 4); // Friday
  const [dateInput, setDateInput] = useState(() => weekStart.toISOString().slice(0, 10));

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = new Date(e.target.value);
    setDateInput(e.target.value);
    setWeekStart(getMonday(picked));
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        let url = '';
        if (user.role === 'Professor') {
          url = `/schedule/professor/${user.id}`;
        } else if (user.role === 'Student') {
          url = `/schedule/student/${user.id}`;
        } else {
          setError('Only students and professors have schedules.');
          setLoading(false);
          return;
        }
        const response = await api.get(url);
        setSchedules(response.data && response.data.$values ? response.data.$values : response.data);
      } catch (err) {
        setError('Failed to load schedule.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [user]);

  // Filter schedules to only those in the selected week
  const weekSchedules = schedules.filter(sch => {
    const schDate = new Date(sch.date);
    return isDateInRange(schDate, weekStart, weekEnd);
  });

  // Build a map: { [day][slot]: schedule }
  const grid: { [day: number]: { [slot: string]: Schedule | undefined } } = {};
  DAYS.forEach(day => {
    grid[day.key] = {};
    TIME_SLOTS.forEach(slot => {
      grid[day.key][slot] = undefined;
    });
  });
  weekSchedules.forEach(sch => {
    const day = getDayOfWeek(sch.date);
    if (day >= 1 && day <= 5) {
      // Find the slot that matches the startTime
      const slot = TIME_SLOTS.find(ts => isInSlot(sch.startTime, ts));
      if (slot) {
        grid[day][slot] = sch;
      }
    }
  });

  const handlePrevWeek = () => setWeekStart(prev => addDays(prev, -7));
  const handleNextWeek = () => setWeekStart(prev => addDays(prev, 7));
  const handleToday = () => setWeekStart(getMonday(new Date()));

  return (
    <Box sx={{ p: 0, m: 0, width: '80vw', minHeight: 'calc(90vh - 64px)', background: 'transparent' }}>
      <Typography variant="h4" mb={2} sx={{ mt: 2 }}>My Schedule</Typography>
      <Stack direction="row" spacing={2} alignItems="center" mb={2} justifyContent="center">
        <Button variant="outlined" onClick={handleToday}>Today</Button>
        <Button variant="outlined" onClick={handlePrevWeek}>Previous Week</Button>
        <TextField
          type="date"
          value={dateInput}
          onChange={handleDateChange}
          size="small"
          sx={{ minWidth: 140 }}
        />
        <Button variant="outlined" onClick={handleNextWeek}>Next Week</Button>
      </Stack>
      <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>
        {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ width: '90vw', boxShadow: 'none', borderRadius: 0, overflowX: 'auto', p: 0, m: 0 }}>
          <Table sx={{ minWidth: 900, width: '90vw' }}>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                {DAYS.map(day => (
                  <TableCell key={day.key} align="center">{day.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {TIME_SLOTS.map(slot => (
                <TableRow key={slot}>
                  <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0' }}>{slot}-
                    {`${String(Number(slot.split(':')[0]) + 1).padStart(2, '0')}:00`}
                  </TableCell>
                  {DAYS.map((day, dayIdx) => {
                    const sch = grid[day.key][slot];
                    return (
                      <TableCell
                        key={day.key}
                        align="center"
                        sx={{
                          height: 70,
                          borderRight: dayIdx < DAYS.length - 1 ? '1px solid #e0e0e0' : undefined,
                        }}
                      >
                        {sch ? (
                          <Box>
                            <Typography variant="subtitle2">{sch.course?.cName || sch.cId}</Typography>
                            <Typography variant="body2" color="textSecondary">{sch.room?.rName || sch.rId}</Typography>
                            <Typography variant="caption">{sch.startTime} - {sch.endTime}</Typography>
                          </Box>
                        ) : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MySchedulePage; 