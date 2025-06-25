import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { adminService, CreateStudentDTO, CreateProfessorDTO, CreateAdminDTO, UpdateUserDTO } from '../../services/adminService';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  phone?: string;
}

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'Student' | 'Professor' | 'Admin';
  phone: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Student',
    phone: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      console.log('Fetched users:', data);
      console.log('First user roles:', data[0]?.roles);
      console.log('First user roles type:', typeof data[0]?.roles);
      console.log('First user roles is array:', Array.isArray(data[0]?.roles));
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (editingUser) {
        // Update existing user
        const updateData: UpdateUserDTO = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password || undefined,
        };
        await adminService.updateUser(editingUser.id, updateData);
      } else {
        // Create new user
        if (formData.role === 'Student') {
          const studentData: CreateStudentDTO = {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
          };
          await adminService.createStudent(studentData);
        } else if (formData.role === 'Professor') {
          const professorData: CreateProfessorDTO = {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || undefined,
          };
          await adminService.createProfessor(professorData);
        } else if (formData.role === 'Admin') {
          const adminData: CreateAdminDTO = {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
          };
          await adminService.createAdmin(adminData);
        }
      }
      setOpenDialog(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        loadUsers();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  const handleEditUser = (user: User) => {
    const userRoles = getRoles(user);
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      role: (userRoles.length > 0 ? userRoles[0] : 'Student') as 'Student' | 'Professor' | 'Admin',
      phone: user.phone || '',
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'Student',
      phone: '',
    });
  };

  const getRoles = (user: any): string[] => {
    if (!user.roles) return [];
    
    // Handle different possible formats
    if (Array.isArray(user.roles)) {
      return user.roles;
    }
    
    if (typeof user.roles === 'string') {
      return [user.roles];
    }
    
    if (typeof user.roles === 'object' && user.roles.$values) {
      return Array.isArray(user.roles.$values) ? user.roles.$values : [];
    }
    
    return [];
  };

  const filteredUsers = users.filter(user => {
    const userRoles = getRoles(user);
    return selectedRole === 'all' || userRoles.includes(selectedRole);
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Professor': return 'warning';
      case 'Student': return 'success';
      case 'No Role': return 'default';
      default: return 'default';
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
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Users Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setOpenDialog(true);
          }}
        >
          Add User
        </Button>
      </Box>

      <Box mb={2}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={selectedRole}
            label="Filter by Role"
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="Student">Students</MenuItem>
            <MenuItem value="Professor">Professors</MenuItem>
            <MenuItem value="Admin">Admins</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.firstName ?? ''} {user.lastName ?? ''}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {(() => {
                    const userRoles = getRoles(user);
                    console.log('User roles for', user.email, ':', userRoles);
                    return userRoles.length > 0 ? (
                      userRoles.map((role, idx) => (
                        <Chip
                          key={role + '-' + user.id}
                          label={role}
                          color={getRoleColor(role) as any}
                          size="small"
                          sx={{ mr: 0.5 }}
                        />
                      ))
                    ) : (
                      <Chip label="No Role" color={getRoleColor('No Role') as any} size="small" />
                    );
                  })()}
                </TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditUser(user)} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteUser(user.id)} 
                    size="small"
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Only emails from <strong>fshn.edu.al</strong> and <strong>fshnstudent.info</strong> domains are allowed.
          </Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            {!editingUser && (
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                required
              />
            )}
            {editingUser && (
              <TextField
                label="New Password (leave blank to keep current)"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <MenuItem value="Student">Student</MenuItem>
                <MenuItem value="Professor">Professor</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 