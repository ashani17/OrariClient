import { Box, Typography, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import UsersManagement from '../../components/admin/UsersManagement';
import CoursesManagement from '../../components/admin/CoursesManagement';
import EnrollmentsManagement from '../../components/admin/EnrollmentsManagement';
import SchedulesManagement from '../../components/admin/SchedulesManagement';
import RoomsManagement from '../../components/admin/RoomsManagement';
import { useState } from 'react';

const sections = ['Users', 'Courses', 'Enrollments', 'Schedules', 'Rooms'];

export default function AdminPanel() {
  const [selected, setSelected] = useState('Users');
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AdminSidebar selected={selected} onSelect={setSelected} sections={sections} />
      <Box sx={{ flex: 1, p: 4, overflow: 'auto' }}>
        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Back to Homepage
          </Button>
          <Typography variant="h4">
            Admin Panel - {selected}
          </Typography>
        </Box>
        
        {/* Section content */}
        <Box>
          {selected === 'Users' && <UsersManagement />}
          {selected === 'Courses' && <CoursesManagement />}
          {selected === 'Enrollments' && <EnrollmentsManagement />}
          {selected === 'Schedules' && <SchedulesManagement />}
          {selected === 'Rooms' && <RoomsManagement />}
        </Box>
      </Box>
    </Box>
  );
} 