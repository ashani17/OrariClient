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
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Grid
} from '@mui/material';
import { Add, Edit, Delete, Refresh, School, Book } from '@mui/icons-material';
import { adminService, StudyProgramCourseAssignment, StudyProgramWithCourses } from '../../services/adminService';
import { StudyProgram } from '../../types';

interface Course {
  cId: number;
  cName: string;
  credits: number;
  pId: number;
  profesor: string;
}

interface Department {
  dId: number;
  dName: string;
}

interface FormData {
  spName: string;
  dId: string;
  courseAssignments: StudyProgramCourseAssignment[];
}

export default function StudyProgramCoursesManagement() {
  const [studyPrograms, setStudyPrograms] = useState<StudyProgramWithCourses[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<StudyProgramWithCourses | null>(null);
  const [formData, setFormData] = useState<FormData>({
    spName: '',
    dId: '',
    courseAssignments: []
  });
  const [search, setSearch] = useState('');
  const [searchOptions, setSearchOptions] = useState<string[]>([]);

  // Academic year options
  const academicYearOptions = [
    '2023-2026',
    '2024-2027',
    '2025-2028',
    '2026-2029',
    '2027-2030'
  ];

  // Year options
  const yearOptions = [1, 2, 3];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (studyPrograms.length > 0) {
      const options = studyPrograms.map(sp => sp.spName);
      setSearchOptions(Array.from(new Set(options)));
    }
  }, [studyPrograms]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [programsData, coursesData, departmentsData] = await Promise.all([
        adminService.getAllStudyPrograms(),
        adminService.getAllCourses(),
        adminService.getAllDepartments ? adminService.getAllDepartments() : []
      ]);
      
      // Get detailed study programs with courses
      const programsWithCourses = await Promise.all(
        programsData.map(async (program: StudyProgram) => {
          try {
            return await adminService.getStudyProgramWithCourses(program.spId);
          } catch (error) {
            // If detailed fetch fails, return basic program info
            return {
              ...program,
              courses: []
            };
          }
        })
      );
      
      setStudyPrograms(programsWithCourses);
      setCourses(coursesData);
      setDepartments(departmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (program?: StudyProgramWithCourses) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        spName: program.spName,
        dId: program.dId.toString(),
        courseAssignments: program.courses.map(c => ({
          courseId: c.courseId,
          year: c.year,
          academicYear: c.academicYear
        }))
      });
    } else {
      setEditingProgram(null);
      setFormData({
        spName: '',
        dId: '',
        courseAssignments: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProgram(null);
    setFormData({
      spName: '',
      dId: '',
      courseAssignments: []
    });
  };

  const handleAddCourseAssignment = () => {
    setFormData(prev => ({
      ...prev,
      courseAssignments: [
        ...prev.courseAssignments,
        {
          courseId: 0,
          year: 1,
          academicYear: '2023-2026'
        }
      ]
    }));
  };

  const handleRemoveCourseAssignment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      courseAssignments: prev.courseAssignments.filter((_, i) => i !== index)
    }));
  };

  const handleCourseAssignmentChange = (index: number, field: keyof StudyProgramCourseAssignment, value: any) => {
    setFormData(prev => ({
      ...prev,
      courseAssignments: prev.courseAssignments.map((assignment, i) => 
        i === index ? { ...assignment, [field]: value } : assignment
      )
    }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (editingProgram) {
        // Update study program with course assignments
        await adminService.updateStudyProgram(editingProgram.spId, {
          spName: formData.spName,
          dId: parseInt(formData.dId),
          courseAssignments: formData.courseAssignments
        });
      } else {
        // Create new study program
        const newProgram = await adminService.createStudyProgram({
          spName: formData.spName,
          dId: parseInt(formData.dId)
        });
        
        // Update with course assignments
        if (formData.courseAssignments.length > 0) {
          await adminService.updateStudyProgram(newProgram.spId, {
            spName: formData.spName,
            dId: parseInt(formData.dId),
            courseAssignments: formData.courseAssignments
          });
        }
      }
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save study program');
    }
  };

  const handleDelete = async (programId: number) => {
    if (window.confirm('Are you sure you want to delete this study program? This will also remove all course associations.')) {
      try {
        setError(null);
        await adminService.deleteStudyProgram(programId);
        loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete study program');
      }
    }
  };

  const getDepartmentName = (departmentId: number) => {
    const department = departments.find(d => d.dId === departmentId);
    return department?.dName || 'Unknown Department';
  };

  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.cId === courseId);
    return course?.cName || 'Unknown Course';
  };

  const filteredPrograms = studyPrograms.filter(program => {
    const s = search.toLowerCase();
    return (
      program.spName.toLowerCase().includes(s) ||
      program.spId.toString().includes(s) ||
      getDepartmentName(program.dId).toLowerCase().includes(s)
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" display="flex" alignItems="center">
          <School sx={{ mr: 1 }} />
          Study Programs with Courses
        </Typography>
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
            Add Study Program
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Box mb={3}>
        <Autocomplete
          options={searchOptions}
          value={search}
          onChange={(_, value) => setSearch(value || '')}
          inputValue={search}
          onInputChange={(_, value) => setSearch(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search study programs"
              variant="outlined"
              size="small"
            />
          )}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Study Programs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Courses</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrograms.map((program) => (
              <TableRow key={program.spId}>
                <TableCell>{program.spId}</TableCell>
                <TableCell>{program.spName}</TableCell>
                <TableCell>{getDepartmentName(program.dId)}</TableCell>
                <TableCell>
                  {program.courses.length > 0 ? (
                    <Box>
                      {program.courses.map((course, index) => (
                        <Chip
                          key={index}
                          label={`${course.courseName} (Year ${course.year}, ${course.academicYear})`}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No courses assigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(program)}
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(program.spId)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProgram ? 'Edit Study Program' : 'Add Study Program'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Study Program Name"
                  value={formData.spName}
                  onChange={(e) => setFormData(prev => ({ ...prev, spName: e.target.value }))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={formData.dId}
                    onChange={(e) => setFormData(prev => ({ ...prev, dId: e.target.value }))}
                    label="Department"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.dId} value={dept.dId}>
                        {dept.dName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Course Assignments</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAddCourseAssignment}
                >
                  Add Course
                </Button>
              </Box>

              {formData.courseAssignments.map((assignment, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Course</InputLabel>
                        <Select
                          value={assignment.courseId}
                          onChange={(e) => handleCourseAssignmentChange(index, 'courseId', e.target.value)}
                          label="Course"
                        >
                          {courses.map((course) => (
                            <MenuItem key={course.cId} value={course.cId}>
                              {course.cName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Year</InputLabel>
                        <Select
                          value={assignment.year}
                          onChange={(e) => handleCourseAssignmentChange(index, 'year', e.target.value)}
                          label="Year"
                        >
                          {yearOptions.map((year) => (
                            <MenuItem key={year} value={year}>
                              Year {year}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Academic Year</InputLabel>
                        <Select
                          value={assignment.academicYear}
                          onChange={(e) => handleCourseAssignmentChange(index, 'academicYear', e.target.value)}
                          label="Academic Year"
                        >
                          {academicYearOptions.map((academicYear) => (
                            <MenuItem key={academicYear} value={academicYear}>
                              {academicYear}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        {assignment.courseId ? getCourseName(assignment.courseId) : 'Select course'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveCourseAssignment(index)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {formData.courseAssignments.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                  No courses assigned. Click "Add Course" to assign courses to this study program.
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProgram ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 