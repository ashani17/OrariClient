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
  Chip,
  Avatar
} from '@mui/material';
import { Add, Delete, Refresh, School, Person } from '@mui/icons-material';
import { adminService, CreateEnrollmentDTO } from '../../services/adminService';

interface Enrollment {
  eId: number;
  studentId: string;
  cId: number;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  courses?: {
    cId: number;
    cName: string;
    credits: number;
    profesor: string;
  };
}

interface Student {
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

export default function EnrollmentsManagement() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CreateEnrollmentDTO>({
    studentId: '',
    courseId: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [enrollmentsData, studentsData, coursesData] = await Promise.all([
        adminService.getAllEnrollments(),
        adminService.getAllStudents(),
        adminService.getAllCourses()
      ]);
      setEnrollments(enrollmentsData);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      studentId: '',
      courseId: 0
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      studentId: '',
      courseId: 0
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      await adminService.createEnrollment(formData);
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create enrollment');
    }
  };

  const handleDelete = async (studentId: string, courseId: number) => {
    if (window.confirm('Are you sure you want to remove this enrollment?')) {
      try {
        setError(null);
        await adminService.deleteEnrollment(studentId, courseId);
        loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete enrollment');
      }
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getStudentEmail = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.email : '';
  };

  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.cId === courseId);
    return course ? course.cName : 'Unknown Course';
  };

  const getCourseCredits = (courseId: number) => {
    const course = courses.find(c => c.cId === courseId);
    return course ? course.credits : 0;
  };

  const getCourseProfessor = (courseId: number) => {
    const course = courses.find(c => c.cId === courseId);
    return course ? course.profesor : 'Unknown Professor';
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Enrollments Management</Typography>
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
            onClick={handleOpenDialog}
          >
            Add Enrollment
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Enrollments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Professor</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No enrollments found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enrollment) => (
                <TableRow key={enrollment.eId}>
                  <TableCell>{enrollment.eId}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {getStudentName(enrollment.studentId)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {getStudentEmail(enrollment.studentId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main' }}>
                        <School />
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {getCourseName(enrollment.cId)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getCourseCredits(enrollment.cId)} 
                      size="small" 
                      color="primary" 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {getCourseProfessor(enrollment.cId)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(enrollment.studentId, enrollment.cId)}
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

      {/* Create Enrollment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Enrollment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Student</InputLabel>
              <Select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                label="Student"
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Course</InputLabel>
              <Select
                value={formData.courseId.toString()}
                onChange={(e) => setFormData({ ...formData, courseId: parseInt(e.target.value) })}
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
            disabled={!formData.studentId || !formData.courseId}
          >
            Create Enrollment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 