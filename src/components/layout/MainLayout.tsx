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
  ChevronLeft,
  ChevronRight,
  Chat,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getRolesFromToken, decodeJwtToken } from '../../utils/jwtUtils';
import FreeRoomsSidebar from '../FreeRoomsSidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
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
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [freeRoomsOpen, setFreeRoomsOpen] = useState(false);

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
  
  // Add 'My Schedule' for students and professors
  const showMySchedule = user && (user.role === 'Student' || user.role === 'Professor');
  const showChat = user && (user.role === 'Admin' || user.role === 'Professor');
  
  // Add 'Check Free Rooms' for professors and admins
  const showFreeRooms = user && (user.role === 'Admin' || user.role === 'Professor');
  
  const allMenuItems = (user?.role === 'Admin' || isAdminFromToken)
    ? [
        ...menuItems,
        { text: 'Check Free Rooms', icon: <Schedule />, path: '/free-rooms', action: () => setFreeRoomsOpen(true) },
        { text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' }
      ]
    : showMySchedule
      ? [
          ...menuItems.slice(0, 1),
          { text: 'My Schedule', icon: <Schedule />, path: '/my-schedule' },
          ...(showChat ? [{ text: 'Chat', icon: <Chat />, path: '/chat' }] : []),
          ...(showFreeRooms ? [{ text: 'Check Free Rooms', icon: <Schedule />, path: '/free-rooms', action: () => setFreeRoomsOpen(true) }] : []),
          ...menuItems.slice(1)
        ]
      : showChat
        ? [
            ...menuItems.slice(0, 1),
            { text: 'Chat', icon: <Chat />, path: '/chat' },
            ...(showFreeRooms ? [{ text: 'Check Free Rooms', icon: <Schedule />, path: '/free-rooms', action: () => setFreeRoomsOpen(true) }] : []),
            ...menuItems.slice(1)
          ]
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
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 64 }}>
        <IconButton onClick={() => setSidebarOpen(false)} size="small">
          <ChevronLeft />
        </IconButton>
      </Toolbar>
      <List>
        {allMenuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              if (item.action) item.action();
              else navigate(item.path);
              setSidebarOpen(false);
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
          width: '100%',
          ml: 0,
        }}
      >
        <Toolbar>
          {/* Floating button to open sidebar */}
          {!sidebarOpen && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setSidebarOpen(true)}
              sx={{ mr: 2, position: 'fixed', left: 16, top: 16, zIndex: 1301 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, ml: sidebarOpen ? 0 : 6 }}>
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
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      {/* Overlay Drawer for all screen sizes */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            zIndex: 1302,
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          transition: 'width 0.2s',
        }}
      >
        <Toolbar />
        {children}
      </Box>
      <FreeRoomsSidebar open={freeRoomsOpen} onClose={() => setFreeRoomsOpen(false)} />
    </Box>
  );
}; 