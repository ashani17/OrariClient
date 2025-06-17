import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider
} from '@mui/material';
import {
  People,
  School,
  Assignment,
  Schedule,
  MeetingRoom
} from '@mui/icons-material';

interface AdminSidebarProps {
  selected: string;
  onSelect: (section: string) => void;
  sections: string[];
}

const getIcon = (section: string) => {
  switch (section) {
    case 'Users':
      return <People />;
    case 'Courses':
      return <School />;
    case 'Enrollments':
      return <Assignment />;
    case 'Schedules':
      return <Schedule />;
    case 'Rooms':
      return <MeetingRoom />;
    default:
      return <People />;
  }
};

export default function AdminSidebar({ selected, onSelect, sections }: AdminSidebarProps) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider'
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Admin Panel
        </Typography>
      </Box>
      <Divider />
      <List>
        {sections.map((section) => (
          <ListItem key={section} disablePadding>
            <ListItemButton
              selected={selected === section}
              onClick={() => onSelect(section)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: selected === section ? 'primary.contrastText' : 'inherit' }}>
                {getIcon(section)}
              </ListItemIcon>
              <ListItemText primary={section} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
} 