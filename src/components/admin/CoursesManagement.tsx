import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  Chip
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { adminService, CreateCourseDTO } from '../../services/adminService';

interface Course {
  cId: number;
  cName: string;
  credits: number;
  pId: number;
  profesor: string;
}

interface Professor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CreateCourseDTO>({
    CName: '',
    Credits: 0,
    PId: 0,
    Profesor: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesData, professorsData] = await Promise.all([
        adminService.getAllCourses(),
        adminService.getAllProfessors()
      ]);
      setCourses(coursesData);
      setProfessors(professorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        CName: course.cName,
        Credits: course.credits,
        PId: course.pId,
        Profesor: course.profesor
      });
    } else {
      setEditingCourse(null);
      setFormData({
        CName: '',
        Credits: 0,
        PId: 0,
        Profesor: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
    setFormData({
      CName: '',
      Credits: 0,
      PId: 0,
      Profesor: ''
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (editingCourse) {
        // Update course (if update endpoint exists)
        // await adminService.updateCourse(editingCourse.cId, formData);
        setError('Update functionality not yet implemented');
      } else {
        // Create new course
        await adminService.createCourse(formData);
        handleCloseDialog();
        loadData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save course');
    }
  };

  const handleDelete = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        setError(null);
        await adminService.deleteCourse(courseId);
        loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete course');
      }
    }
  };

  const handleProfessorChange = (professorId: string) => {
    const professor = professors.find(p => p.id === professorId);
    setFormData({
      ...formData,
      PId: parseInt(professorId),
      Profesor: professor ? `${professor.firstName} ${professor.lastName}` : ''
    });
  };

  const getProfessorName = (professorId: number) => {
    const professor = professors.find(p => p.id === professorId.toString());
    return professor ? `${professor.firstName} ${professor.lastName}` : 'Unknown Professor';
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
        <Typography variant="h5">Courses Management</Typography>
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
            Add Course
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Courses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Professor</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No courses found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.cId}>
                  <TableCell>{course.cId}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {course.cName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={course.credits} size="small" color="primary" />
                  </TableCell>
                  <TableCell>{getProfessorName(course.pId)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(course)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(course.cId)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Course Name"
              value={formData.CName}
              onChange={(e) => setFormData({ ...formData, CName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Credits"
              type="number"
              value={formData.Credits}
              onChange={(e) => setFormData({ ...formData, Credits: parseInt(e.target.value) || 0 })}
              margin="normal"
              required
              inputProps={{ min: 1, max: 10 }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Professor</InputLabel>
              <Select
                value={formData.PId.toString()}
                onChange={(e) => handleProfessorChange(e.target.value)}
                label="Professor"
              >
                {professors.map((professor) => (
                  <MenuItem key={professor.id} value={professor.id}>
                    {professor.firstName} {professor.lastName} ({professor.email})
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
            disabled={!formData.CName || !formData.PId || formData.Credits <= 0}
          >
            {editingCourse ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 