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
  Divider
} from '@mui/material';
import { Add, Edit, Delete, Refresh, School, Book } from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { StudyProgram } from '../../types';

interface Course {
  cId: number;
  cName: string;
  credits: number;
  pId: number;
  profesor: string;
  spId?: number;
}

interface Department {
  dId: number;
  dName: string;
}

interface StudyProgramWithCourses extends StudyProgram {
  courses?: Course[];
}

interface FormData {
  spName: string;
  dId: string;
  selectedCourseIds: number[];
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
    selectedCourseIds: []
  });
  const [search, setSearch] = useState('');
  const [searchOptions, setSearchOptions] = useState<string[]>([]);

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
      
      // Group courses by study program
      const programsWithCourses = programsData.map(program => ({
        ...program,
        courses: coursesData.filter(course => course.spId === program.spId)
      }));
      
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
        selectedCourseIds: program.courses?.map(c => c.cId) || []
      });
    } else {
      setEditingProgram(null);
      setFormData({
        spName: '',
        dId: '',
        selectedCourseIds: []
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
      selectedCourseIds: []
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (editingProgram) {
        // Update study program and its courses
        await adminService.updateStudyProgram(editingProgram.spId, {
          spName: formData.spName,
          dId: parseInt(formData.dId)
        });
        
        // Update course associations
        for (const courseId of formData.selectedCourseIds) {
          await adminService.updateCourse(courseId, {
            spId: editingProgram.spId
          });
        }
      } else {
        // Create new study program
        const newProgram = await adminService.createStudyProgram({
          spName: formData.spName,
          dId: parseInt(formData.dId)
        });
        
        // Associate courses with the new study program
        for (const courseId of formData.selectedCourseIds) {
          await adminService.updateCourse(courseId, {
            spId: newProgram.spId
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

  const handleRemoveCourse = async (programId: number, courseId: number) => {
    try {
      setError(null);
      await adminService.updateCourse(courseId, {
        spId: null
      });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove course from study program');
    }
  };

  const filteredPrograms = studyPrograms.filter(program => {
    const s = search.toLowerCase();
    return (
      program.spName.toLowerCase().includes(s) ||
      program.spId.toString().includes(s) ||
      program.dName.toLowerCase().includes(s)
    );
  });

  const getDepartmentName = (departmentId: number) => {
    const department = departments.find(d => d.dId === departmentId);
    return department ? department.dName : 'Unknown Department';
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
      {/* Search Bar */}
      <Box mb={2}>
        <Autocomplete
          freeSolo
          options={searchOptions}
          inputValue={search}
          onInputChange={(_, value) => setSearch(value)}
          getOptionLabel={(option) => (typeof option === 'string' ? option : '')}
          renderInput={(params) => (
            <TextField {...params} label="Search Study Programs" variant="outlined" size="small" />
          )}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Study Programs with Courses</Typography>
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

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Study Programs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Study Program</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Courses</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No study programs found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPrograms.map((program) => (
                <TableRow key={program.spId}>
                  <TableCell>{program.spId}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <School sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight="medium">
                        {program.spName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={program.dName} size="small" color="secondary" />
                  </TableCell>
                  <TableCell>
                    <Box>
                      {program.courses && program.courses.length > 0 ? (
                        <List dense sx={{ p: 0 }}>
                          {program.courses.map((course, index) => (
                            <React.Fragment key={course.cId}>
                              <ListItem sx={{ py: 0.5, px: 0 }}>
                                <Book sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                                <ListItemText
                                  primary={course.cName}
                                  secondary={`${course.credits} credits`}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                  secondaryTypographyProps={{ variant: 'caption' }}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveCourse(program.spId, course.cId)}
                                    color="error"
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                              {index < program.courses!.length - 1 && <Divider />}
                            </React.Fragment>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No courses assigned
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(program)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(program.spId)}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProgram ? 'Edit Study Program' : 'Add New Study Program'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Study Program Name"
              value={formData.spName}
              onChange={(e) => setFormData({ ...formData, spName: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.dId}
                onChange={(e) => setFormData({ ...formData, dId: e.target.value })}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.dId} value={dept.dId.toString()}>
                    {dept.dName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Courses</InputLabel>
              <Select
                multiple
                value={formData.selectedCourseIds}
                onChange={(e) => setFormData({ ...formData, selectedCourseIds: e.target.value as number[] })}
                label="Courses"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((courseId) => {
                      const course = courses.find(c => c.cId === courseId);
                      return (
                        <Chip key={courseId} label={course?.cName || courseId} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {courses.map((course) => (
                  <MenuItem key={course.cId} value={course.cId}>
                    {course.cName} ({course.credits} credits)
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
            disabled={!formData.spName || !formData.dId}
          >
            {editingProgram ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 