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
  Avatar,
  Autocomplete
} from '@mui/material';
import { Add, Edit, Delete, Refresh, MeetingRoom } from '@mui/icons-material';
import { adminService, CreateRoomDTO } from '../../services/adminService';

interface Room {
  rId: number;
  rName: string;
  rCapacity: number;
  rType: string;
  rDescription: string;
}

const roomTypes = [
  'Classroom',
  'Laboratory',
  'Auditorium',
  'Conference Room',
  'Computer Lab',
  'Study Room',
  'Office',
  'Other'
];

export default function RoomsManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<CreateRoomDTO>({
    rName: '',
    rCapacity: 0,
    rType: '',
    rDescription: ''
  });
  const [search, setSearch] = useState('');
  const [searchOptions, setSearchOptions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (rooms.length > 0) {
      const options = rooms.map(r => r.rName);
      setSearchOptions(Array.from(new Set(options)));
    }
  }, [rooms]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const roomsData = await adminService.getAllRooms();
      setRooms(roomsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        rName: room.rName,
        rCapacity: room.rCapacity,
        rType: room.rType,
        rDescription: room.rDescription
      });
    } else {
      setEditingRoom(null);
      setFormData({
        rName: '',
        rCapacity: 0,
        rType: '',
        rDescription: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRoom(null);
    setFormData({
      rName: '',
      rCapacity: 0,
      rType: '',
      rDescription: ''
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (editingRoom) {
        // Update room (if update endpoint exists)
        // await adminService.updateRoom(editingRoom.rId, formData);
        setError('Update functionality not yet implemented');
      } else {
        // Create new room
        await adminService.createRoom(formData);
        handleCloseDialog();
        loadData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save room');
    }
  };

  const handleDelete = async (roomId: number) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        setError(null);
        // await adminService.deleteRoom(roomId);
        setError('Delete functionality not yet implemented');
        // loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete room');
      }
    }
  };

  const getRoomTypeColor = (roomType: string) => {
    switch (roomType.toLowerCase()) {
      case 'classroom':
        return 'primary';
      case 'laboratory':
        return 'secondary';
      case 'auditorium':
        return 'success';
      case 'conference room':
        return 'info';
      case 'computer lab':
        return 'warning';
      case 'study room':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCapacityColor = (capacity: number) => {
    if (capacity >= 100) return 'error';
    if (capacity >= 50) return 'warning';
    if (capacity >= 20) return 'info';
    return 'success';
  };

  const filteredRooms = rooms.filter(room => {
    const s = search.toLowerCase();
    return (
      room.rName.toLowerCase().includes(s) ||
      room.rId.toString().includes(s) ||
      room.rType.toLowerCase().includes(s) ||
      (room.rDescription || '').toLowerCase().includes(s)
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
            <TextField {...params} label="Search Rooms" variant="outlined" size="small" />
          )}
          sx={{ width: 300 }}
        />
      </Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Rooms Management</Typography>
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
            Add Room
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Rooms Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No rooms found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRooms.map((room) => (
                <TableRow key={room.rId}>
                  <TableCell>{room.rId}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                        <MeetingRoom />
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {room.rName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={room.rType} 
                      size="small" 
                      color={getRoomTypeColor(room.rType) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${room.rCapacity} seats`} 
                      size="small" 
                      color={getCapacityColor(room.rCapacity) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 200 }}>
                      {room.rDescription || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(room)}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(room.rId)}
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

      {/* Create/Edit Room Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRoom ? 'Edit Room' : 'Add New Room'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Room Name"
              value={formData.rName}
              onChange={(e) => setFormData({ ...formData, rName: e.target.value })}
              margin="normal"
              required
              placeholder="e.g., Room 101, Lab A, Auditorium 1"
            />
            <TextField
              fullWidth
              label="Capacity"
              type="number"
              value={formData.rCapacity}
              onChange={(e) => setFormData({ ...formData, rCapacity: parseInt(e.target.value) || 0 })}
              margin="normal"
              required
              inputProps={{ min: 1, max: 1000 }}
              placeholder="Number of seats"
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Room Type</InputLabel>
              <Select
                value={formData.rType}
                onChange={(e) => setFormData({ ...formData, rType: e.target.value })}
                label="Room Type"
              >
                {roomTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              value={formData.rDescription}
              onChange={(e) => setFormData({ ...formData, rDescription: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              placeholder="Optional description of the room, equipment, or special features"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.rName || !formData.rType || formData.rCapacity <= 0}
          >
            {editingRoom ? 'Update' : 'Create'} Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 