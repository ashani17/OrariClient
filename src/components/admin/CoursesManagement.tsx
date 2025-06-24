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
  Chip,
  Autocomplete
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { adminService, CreateCourseDTO } from '../../services/adminService';
import { StudyProgram } from '../../types';

interface Course {
  cId: number;
  cName: string;
  credits: number;
  pId: number;
  profesor: string;
  spId: number;
}

interface Professor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CourseForm {
  cName: string;
  credits: number;
  pId: string; // string for Select, convert to number for backend
  profesor: string;
  spId: string; // study program id as string for Select
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseForm>({
    cName: '',
    credits: 0,
    pId: '',
    profesor: '',
    spId: ''
  });
  const [search, setSearch] = useState('');
  const [searchOptions, setSearchOptions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      const options = courses.map(c => c.cName);
      setSearchOptions(Array.from(new Set(options)));
    }
  }, [courses]);

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

  const loadStudyPrograms = async () => {
    try {
      const programs = await adminService.getAllStudyPrograms();
      setStudyPrograms(programs);
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    loadStudyPrograms();
  }, []);

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        cName: course.cName,
        credits: course.credits,
        pId: course.pId ? course.pId.toString() : '',
        profesor: course.profesor,
        spId: course.spId ? course.spId.toString() : ''
      });
    } else {
      setEditingCourse(null);
      setFormData({
        cName: '',
        credits: 0,
        pId: '',
        profesor: '',
        spId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
    setFormData({
      cName: '',
      credits: 0,
      pId: '',
      profesor: '',
      spId: ''
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (!formData.pId || formData.pId.trim() === "") {
        setError("Professor is required.");
        return;
      }
      if (!formData.spId || formData.spId.trim() === "") {
        setError("Study Program is required.");
        return;
      }
      const payload = {
        cName: formData.cName,
        credits: formData.credits,
        pId: formData.pId.trim(),
        profesor: formData.profesor,
        studyProgramId: Number(formData.spId)
      };
      if (editingCourse) {
        await adminService.updateCourse(editingCourse.cId, payload);
      } else {
        await adminService.createCourse(payload);
      }
      handleCloseDialog();
      loadData();
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
      pId: professorId,
      profesor: professor ? `${professor.firstName} ${professor.lastName}` : ''
    });
  };

  const getProfessorName = (professorId: number) => {
    const professor = professors.find(p => p.id === professorId.toString());
    return professor ? `${professor.firstName} ${professor.lastName}` : 'Unknown Professor';
  };

  const filteredCourses = courses.filter(course => {
    const s = search.toLowerCase();
    const professorName = getProfessorName(course.pId).toLowerCase();
    return (
      course.cName.toLowerCase().includes(s) ||
      course.cId.toString().includes(s) ||
      course.credits.toString().includes(s) ||
      professorName.includes(s)
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search Bar */}
      <Box mb={2}>
        <Autocomplete
          freeSolo
          options={searchOptions}
          inputValue={search}
          onInputChange={(_, value) => setSearch(value)}
          getOptionLabel={(option) => (typeof option === 'string' ? option : '')}
          renderInput={(params) => (
            <TextField {...params} label="Search Courses" variant="outlined" size="small" />
          )}
          sx={{ width: 300 }}
        />
      </Box>
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
              <TableCell>Study Programs</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No courses found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => (
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
                  <TableCell>{studyPrograms.filter(sp => course.spId != null && sp.spId != null && course.spId.toString() === sp.spId.toString()).map(sp => sp.spName).join(', ')}</TableCell>
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
              value={formData.cName}
              onChange={(e) => setFormData({ ...formData, cName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Credits"
              type="number"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
              margin="normal"
              required
              inputProps={{ min: 1, max: 10 }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Study Program</InputLabel>
              <Select
                value={formData.spId}
                onChange={(e) => setFormData({ ...formData, spId: e.target.value })}
                label="Study Program"
              >
                {studyPrograms.map((sp) => (
                  <MenuItem key={sp.spId} value={sp.spId.toString()}>
                    {sp.spName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Professor</InputLabel>
              <Select
                value={formData.pId}
                onChange={(e) => setFormData({ ...formData, pId: e.target.value })}
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
            disabled={!formData.cName || !formData.pId || formData.credits <= 0}
          >
            {editingCourse ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 