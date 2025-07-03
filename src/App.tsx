import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import EmailConfirmation from './pages/auth/EmailConfirmation';
import { theme, darkTheme } from './theme';
import { CssBaseline } from '@mui/material';
import { useAuthStore } from './store/authStore';
import { useApiHealth } from './hooks/useApiHealth';
import { useSystemTheme } from './hooks/useSystemTheme';
import AdminPanel from './pages/admin/AdminPanel';
import { MySchedulePage, ChatPage, PublicSchedules, Settings } from './pages';
import { useEffect, useState } from 'react';
import DashboardPage from './pages/dashboard/DashboardPage';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const systemTheme = useSystemTheme();
  
  // Initialize theme from localStorage or system preference
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    // If no saved preference, use system theme
    return systemTheme;
  });
  
  // Update theme when system theme changes (only if user hasn't set a preference)
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode');
    if (!savedTheme) {
      setMode(systemTheme);
    }
  }, [systemTheme]);
  
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const handleToggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };
  
  // Add API health check
  useApiHealth();

  return (
    <ThemeProvider theme={mode === 'dark' ? darkTheme : theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login mode={mode} onToggleTheme={handleToggleTheme} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register mode={mode} onToggleTheme={handleToggleTheme} />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ForgotPassword mode={mode} onToggleTheme={handleToggleTheme} />
              )
            }
          />
          <Route
            path="/reset-password"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ResetPassword mode={mode} onToggleTheme={handleToggleTheme} />
              )
            }
          />
          <Route
            path="/confirm-email"
            element={<EmailConfirmation />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                {user?.role === 'Admin' ? (
                  <AdminPanel />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedules"
            element={
              <PublicSchedules mode={mode} onToggleTheme={handleToggleTheme} />
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout mode={mode} onToggleTheme={handleToggleTheme}>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/schedule" element={<h1>Schedule</h1>} />
                    <Route path="/my-schedule" element={<MySchedulePage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/users" element={<h1>Users</h1>} />
                    <Route path="/settings" element={<Settings mode={mode} setMode={setMode} />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
