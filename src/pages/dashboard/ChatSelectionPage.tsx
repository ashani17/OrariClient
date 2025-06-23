import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper, Button, TextField, Popper, ListSubheader, Fab } from '@mui/material';
import { Person } from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import AddIcon from '@mui/icons-material/Add';

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  roles: string[];
}

const ChatSelectionPage: React.FC = () => {
  const [professors, setProfessors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const users = await adminService.getAllUsers();
        const professorUsers = users.filter((user: User) => Array.isArray(user.roles) && user.roles.includes('Professor'));
        setProfessors(professorUsers);
      } catch (error) {
        console.error('Error fetching professors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessors();
  }, []);

  const handleProfessorSelect = (professorId: string) => {
    setSearch('');
    setShowSearch(false);
    setAnchorEl(null);
    navigate(`/chat?userId=${professorId}`);
  };

  const filteredProfessors = showSearch && search
    ? professors.filter(
        (prof) =>
          (prof.name && prof.name.toLowerCase().includes(search.toLowerCase())) ||
          (prof.surname && prof.surname.toLowerCase().includes(search.toLowerCase())) ||
          (prof.email && prof.email.toLowerCase().includes(search.toLowerCase()))
      )
    : professors;

  // Suggestions for dropdown (limit to 5)
  const suggestions = search
    ? professors.filter(
        (prof) =>
          (prof.name && prof.name.toLowerCase().includes(search.toLowerCase())) ||
          (prof.surname && prof.surname.toLowerCase().includes(search.toLowerCase())) ||
          (prof.email && prof.email.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 5)
    : [];

  if (loading) {
    return <Typography>Loading professors...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        Select Professor to Chat With
      </Typography>
      <Paper>
        <List>
          {filteredProfessors.length === 0 ? (
            <ListItem>
              <ListItemText primary="No professors found." />
            </ListItem>
          ) : (
            filteredProfessors.map((professor) => (
              <ListItem
                key={professor.id}
                button
                onClick={() => handleProfessorSelect(professor.id)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${professor.name || ''} ${professor.surname || ''}`.trim() || professor.email}
                  secondary={professor.email}
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
      {/* Floating New Chat Button */}
      <Fab
        color="primary"
        aria-label="new chat"
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1301 }}
        onClick={() => setShowSearch((prev) => !prev)}
      >
        <AddIcon />
      </Fab>
      {showSearch && (
        <Box sx={{ position: 'fixed', bottom: 100, right: 32, width: 320, zIndex: 1302, bgcolor: 'background.paper', p: 2, borderRadius: 2, boxShadow: 3 }}>
          <TextField
            fullWidth
            label="Search professor by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            sx={{ mb: 2 }}
          />
          <Paper>
            <List dense>
              {suggestions.length === 0 ? (
                <ListItem><ListItemText primary="No results" /></ListItem>
              ) : (
                suggestions.map((professor) => (
                  <ListItem
                    key={professor.id}
                    button
                    onClick={() => handleProfessorSelect(professor.id)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${professor.name || ''} ${professor.surname || ''}`.trim() || professor.email}
                      secondary={professor.email}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ChatSelectionPage; 