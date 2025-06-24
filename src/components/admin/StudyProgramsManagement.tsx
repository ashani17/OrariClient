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
  Autocomplete
} from '@mui/material';
import { Add, Edit, Delete, Refresh, School } from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { StudyProgram, CreateStudyProgramDto } from '../../types';

interface Department {
  dId: number;
  dName: string;
}

export default function StudyProgramsManagement() {
  const [programs, setPrograms] = useState<StudyProgram[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<StudyProgram | null>(null);
  const [formData, setFormData] = useState<CreateStudyProgramDto>({
    spName: '',
    dId: 0
  });
  const [search, setSearch] = useState('');
  const [searchOptions, setSearchOptions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (programs.length > 0) {
      const options = programs.map(p => p.spName);
      setSearchOptions(Array.from(new Set(options)));
    }
  }, [programs]);

  const filteredPrograms = programs.filter(program => {
    const s = search.toLowerCase();
    return (
      program.spName.toLowerCase().includes(s) ||
      program.spId.toString().includes(s) ||
      program.dName.toLowerCase().includes(s)
    );
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [programsData, departmentsData] = await Promise.all([
        adminService.getAllStudyPrograms(),
        adminService.getAllDepartments ? adminService.getAllDepartments() : []
      ]);
      setPrograms(programsData);
      setDepartments(departmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (program?: StudyProgram) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        spName: program.spName,
        dId: program.dId
      });
    } else {
      setEditingProgram(null);
      setFormData({
        spName: '',
        dId: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProgram(null);
    setFormData({
      spName: '',
      dId: 0
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (!formData.spName || !formData.dId) {
        setError('Name and Department are required.');
        return;
      }
      if (editingProgram) {
        await adminService.updateStudyProgram(editingProgram.spId, formData);
      } else {
        await adminService.createStudyProgram(formData);
      }
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save study program');
    }
  };

  const handleDelete = async (spId: number) => {
    if (window.confirm('Are you sure you want to delete this study program?')) {
      try {
        setError(null);
        await adminService.deleteStudyProgram(spId);
        loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete study program');
      }
    }
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
        <Typography variant="h5">Study Programs Management</Typography>
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
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No study programs found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPrograms.map((program) => (
                <TableRow key={program.spId}>
                  <TableCell>{program.spId}</TableCell>
                  <TableCell>{program.spName}</TableCell>
                  <TableCell>{program.dName}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(program)}
                      color="primary"
                      sx={{ mr: 1 }}
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

      {/* Create/Edit Study Program Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
              placeholder="e.g., Computer Science, Mathematics"
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.dId}
                onChange={(e) => setFormData({ ...formData, dId: Number(e.target.value) })}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.dId} value={dept.dId}>
                    {dept.dName}
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
            {editingProgram ? 'Update' : 'Create'} Study Program
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 