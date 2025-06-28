import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface ThemeToggleProps {
  mode: 'light' | 'dark';
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ mode, onToggle }) => {
  const theme = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
      <IconButton 
        onClick={onToggle} 
        color="inherit"
        sx={{ 
          ml: 1,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
}; 