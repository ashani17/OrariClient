import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Schedule,
  People,
  Settings,
  AccountCircle,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getRolesFromToken, decodeJwtToken } from '../../utils/jwtUtils';

interface MainLayoutProps {
  children: ReactNode;
}

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Schedule', icon: <Schedule />, path: '/schedule' },
  { text: 'Users', icon: <People />, path: '/users' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

export const MainLayout = ({ children }: MainLayoutProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuthStore();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Refresh user state from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    console.log('useEffect - localStorage user:', userStr);
    console.log('useEffect - localStorage token:', token);
    
    if (userStr && token) {
      try {
        const userFromStorage = JSON.parse(userStr);
        console.log('useEffect - Parsed user from storage:', userFromStorage);
        // Refresh the auth store with the user from localStorage
        refreshUser();
      } catch (error) {
        console.log('useEffect - Error parsing user from storage:', error);
      }
    }
  }, [refreshUser]);

  // Debug logging
  console.log('MainLayout - User:', user);
  console.log('MainLayout - User role:', user?.role);
  console.log('MainLayout - Is admin?', user?.role === 'Admin');
  
  // Log localStorage contents
  console.log('localStorage token:', localStorage.getItem('token'));
  console.log('localStorage user:', localStorage.getItem('user'));
  
  // Log JWT token
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = decodeJwtToken(token);
      console.log('JWT Payload:', payload);
      
      const roles = getRolesFromToken(token);
      console.log('JWT Roles:', roles);
      
      // Check if user has Admin role
      const isAdmin = roles.includes('Admin');
      console.log('Is Admin from token:', isAdmin);
    } catch (error) {
      console.log('Error parsing JWT:', error);
    }
  } else {
    console.log('No token found in localStorage');
  }

  // Check if user has Admin role from token
  const tokenRoles = token ? getRolesFromToken(token) : [];
  const isAdminFromToken = tokenRoles.includes('Admin');
  
  // Add admin menu items if user is admin (check both user object and token)
  const allMenuItems = (user?.role === 'Admin' || isAdminFromToken)
    ? [...menuItems, { text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' }]
    : menuItems;

  console.log('Menu items:', allMenuItems);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box>
      <Toolbar />
      <List>
        {allMenuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) {
                handleDrawerToggle();
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Orari
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {user?.name} {user?.surname}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <Typography variant="body1">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}; 