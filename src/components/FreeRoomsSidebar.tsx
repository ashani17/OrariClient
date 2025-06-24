import React, { useState } from 'react';
import { Drawer, Box, Typography, IconButton, TextField, Button, List, ListItem, ListItemText, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MeetingRoom from '@mui/icons-material/MeetingRoom';
import roomService from '../services/roomService';

interface FreeRoomsSidebarProps {
  open: boolean;
  onClose: () => void;
}

const FreeRoomsSidebar: React.FC<FreeRoomsSidebarProps> = ({ open, onClose }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setRooms([]);
    try {
      const res = await roomService.getFreeRooms(date, startTime, endTime);
      setRooms(res.data);
    } catch (e) {
      setError('Failed to fetch rooms.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: 1400 }}>
      <Box sx={{ width: 350, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Check Free Rooms</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Start Time"
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="End Time"
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleSearch} disabled={!date || !startTime || !endTime || loading} sx={{ mb: 2 }}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {rooms.length > 0 && (
            <List>
              {rooms.map(room => (
                <ListItem key={room.rId}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                      <MeetingRoom />
                    </Avatar>
                    <ListItemText
                      primary={room.rName}
                      secondary={`Capacity: ${room.rCapacity} | Type: ${room.rType}`}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
          {rooms.length === 0 && !loading && (
            <Typography variant="body2" color="textSecondary">No rooms found for the selected time.</Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default FreeRoomsSidebar; 