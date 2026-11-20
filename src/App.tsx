import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubmitComplaintPage } from './pages/student/SubmitComplaintPage';
import { MyComplaintsPage } from './pages/student/MyComplaintsPage';
import { ComplaintDetailsPage } from './pages/student/ComplaintDetailsPage';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllComplaintsPage } from './pages/admin/AllComplaintsPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { DepartmentManagementPage } from './pages/admin/DepartmentManagementPage';
import { CategoryManagementPage } from './pages/admin/CategoryManagementPage';

// Shared Pages
import { ReportsPage } from './pages/shared/ReportsPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { SettingsPage } from './pages/shared/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { UserRole } from './types';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-400">
        Verifying college portal session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's permitted dashboard
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'DEPARTMENT_HEAD' || user.role === 'STAFF' || user.role === 'FACULTY')
      return <Navigate to="/staff" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Layout Wrapper
const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Student Dedicated Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit-complaint"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <SubmitComplaintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-complaints"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyComplaintsPage />
              </ProtectedRoute>
            }
          />

          {/* Staff & Faculty Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'FACULTY', 'DEPARTMENT_HEAD']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/complaints"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'FACULTY', 'DEPARTMENT_HEAD']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />

          {/* Administrator Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'DEPARTMENT_HEAD']}>
                <AllComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DepartmentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CategoryManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Authenticated Shared Routes */}
          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute>
                <ComplaintDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppLayout />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
