import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Tooltip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { scheduleService } from '../../services/scheduleService';
import { useApiRequest } from '../../hooks/useApiRequest';
import type { Schedule } from '../../types/schedule';
import { PdfService } from '../../services/pdfService';
import { useTheme } from '@mui/material/styles';

export const SchedulesPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const {
    data: schedules = [],
    isLoading,
    error: apiError,
    executeRequest,
    cancelRequest
  } = useApiRequest<Schedule[]>();

  const fetchSchedules = async () => {
    try {
      await executeRequest(
        {
          method: 'GET',
          url: '/schedules'
        },
        {
          onError: (error) => {
            setError(error.message);
          }
        }
      );
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await scheduleService.deleteSchedule(id);
        // Refresh the list after deletion
        fetchSchedules();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to delete schedule');
      }
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const handleDownloadPDF = async () => {
    try {
      if (!schedules || schedules.length === 0) {
        setError('No schedules to generate PDF for');
        return;
      }

      // Get unique years from schedules
      const uniqueYears = [...new Set(schedules.map(s => s.academicYear).filter(Boolean))];
      
      // Create filename with years
      const years = uniqueYears.length > 0 ? uniqueYears.join('_') : 'AllYears';
      const filename = `Schedules_${years}`;

      // Create a formatted content string from the schedules for table parsing
      const content = schedules.map((schedule) => {
        return `Day: ${getDayOfWeek(schedule.dayOfWeek)}
Time: ${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}
Course: ${schedule.courseName || schedule.courseId || 'N/A'}
Professor: ${schedule.professorName || schedule.professorId || 'N/A'}
Room: ${schedule.roomName || schedule.roomId || 'N/A'}
Semester: ${schedule.semester} (${schedule.academicYear})`;
      }).join('\n\n');

      const result = await PdfService.generatePdf({
        title: 'Schedules Report',
        content: content,
        filename: filename
      });

      PdfService.downloadPdf(result.blob, result.filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
  };

  // Fetch schedules on component mount
  useEffect(() => {
    fetchSchedules();
    // Cleanup function to cancel any pending requests
    return () => {
      cancelRequest();
    };
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Schedules
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/schedule/create')}
              sx={{ mr: 2 }}
            >
              Create Schedule
            </Button>
            <Button
              variant="outlined"
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

          {isLoading && <LinearProgress />}

        <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Course</TableCell>
                  <TableCell>Professor</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Day</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {schedules?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((schedule) => (
                    <TableRow key={schedule.id} hover>
                      <TableCell>{schedule.courseName}</TableCell>
                      <TableCell>{schedule.professorName}</TableCell>
                      <TableCell>{schedule.roomName}</TableCell>
                      <TableCell>{getDayOfWeek(schedule.dayOfWeek)}</TableCell>
                      <TableCell>
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </TableCell>
                      <TableCell>
                        {schedule.semester} ({schedule.academicYear})
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/schedule/${schedule.id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={schedules?.length ?? 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>
    </Container>
  );
}; 