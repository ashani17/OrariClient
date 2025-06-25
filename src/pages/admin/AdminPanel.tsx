import { Box, Typography, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import UsersManagement from '../../components/admin/UsersManagement';
import CoursesManagement from '../../components/admin/CoursesManagement';
import EnrollmentsManagement from '../../components/admin/EnrollmentsManagement';
import SchedulesManagement from '../../components/admin/SchedulesManagement';
import RoomsManagement from '../../components/admin/RoomsManagement';
import StudyProgramsManagement from '../../components/admin/StudyProgramsManagement';
import StudyProgramCoursesManagement from '../../components/admin/StudyProgramCoursesManagement';
import DepartmentsManagement from '../../components/admin/DepartmentsManagement';
import { useState } from 'react';

const sections = ['Users', 'Courses', 'Enrollments', 'Departments', 'Schedules', 'Rooms', 'Study Programs', 'Study Programs with Courses'];

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
          {selected === 'Departments' && <DepartmentsManagement />}
          {selected === 'Schedules' && <SchedulesManagement />}
          {selected === 'Rooms' && <RoomsManagement />}
          {selected === 'Study Programs' && <StudyProgramsManagement />}
          {selected === 'Study Programs with Courses' && <StudyProgramCoursesManagement />}
        </Box>
      </Box>
    </Box>
  );
} 