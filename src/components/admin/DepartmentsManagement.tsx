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
  Autocomplete
} from '@mui/material';
import { Add, Edit, Delete, Refresh, Assignment } from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { Department, CreateDepartmentDto } from '../../types';

export default function DepartmentsManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<CreateDepartmentDto>({
    dName: ''
  });
  const [search, setSearch] = useState('');
  const [searchOptions, setSearchOptions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (departments.length > 0) {
      const options = departments.map(d => d.dName);
      setSearchOptions(Array.from(new Set(options)));
    }
  }, [departments]);

  const filteredDepartments = departments.filter(department => {
    const s = search.toLowerCase();
    return (
      department.dName.toLowerCase().includes(s) ||
      department.dId.toString().includes(s)
    );
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const departmentsData = await adminService.getAllDepartments();
      setDepartments(departmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        dName: department.dName
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        dName: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDepartment(null);
    setFormData({
      dName: ''
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (!formData.dName) {
        setError('Department name is required.');
        return;
      }
      if (editingDepartment) {
        await adminService.updateDepartment(editingDepartment.dId, formData);
      } else {
        await adminService.createDepartment(formData);
      }
      handleCloseDialog();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save department');
    }
  };

  const handleDelete = async (dId: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        setError(null);
        await adminService.deleteDepartment(dId);
        loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete department');
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
          renderInput={(params) => (
            <TextField {...params} label="Search Departments" variant="outlined" size="small" />
          )}
          sx={{ width: 300 }}
        />
      </Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Departments Management</Typography>
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
            Add Department
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Departments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No departments found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((department) => (
                <TableRow key={department.dId}>
                  <TableCell>{department.dId}</TableCell>
                  <TableCell>{department.dName}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(department)}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(department.dId)}
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

      {/* Create/Edit Department Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDepartment ? 'Edit Department' : 'Add New Department'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Department Name"
              value={formData.dName}
              onChange={(e) => setFormData({ ...formData, dName: e.target.value })}
              margin="normal"
              required
              placeholder="e.g., Computer Science, Mathematics"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.dName}
          >
            {editingDepartment ? 'Update' : 'Create'} Department
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 