import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppShell } from '../components/layout/AppShell';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

// Student Pages
import Dashboard from '../pages/student/Dashboard';
import Scholarships from '../pages/student/Scholarships';
import ScholarshipDetailPage from '../pages/student/ScholarshipDetailPage';
import Profile from '../pages/student/Profile';
import Documents from '../pages/student/Documents';
import ApplicationsPage from '../pages/student/ApplicationsPage';
import ApplicationDetailPage from '../pages/student/ApplicationDetailPage';
import JAGOPage from '../pages/student/JAGOPage';
import NotificationsPage from '../pages/student/NotificationsPage';
import VerificationCenterPage from '../pages/student/VerificationCenterPage';
import { EligibilityRoadmapPage } from '../pages/student/EligibilityRoadmapPage';
import { ScholarshipRoadmapDetailPage } from '../pages/student/ScholarshipRoadmapDetailPage';

// Provider Pages
import ProviderDashboard from '../pages/provider/ProviderDashboard';
import ProviderScholarships from '../pages/provider/ProviderScholarships';
import ProviderApplications from '../pages/provider/ProviderApplications';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';

const ProtectedRoute = ({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: 'STUDENT' | 'PROVIDER' | 'ADMIN';
}) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-body text-text-muted">
        Loading ShikshaSaarthi...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/unauthorized" replace />;
  return <AppShell>{children}</AppShell>;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Student Portal */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute role="STUDENT">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/scholarships"
        element={
          <ProtectedRoute role="STUDENT">
            <Scholarships />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/scholarships/:id"
        element={
          <ProtectedRoute role="STUDENT">
            <ScholarshipDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute role="STUDENT">
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/documents"
        element={
          <ProtectedRoute role="STUDENT">
            <Documents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/applications"
        element={
          <ProtectedRoute role="STUDENT">
            <ApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/applications/:id"
        element={
          <ProtectedRoute role="STUDENT">
            <ApplicationDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/jago"
        element={
          <ProtectedRoute role="STUDENT">
            <JAGOPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notifications"
        element={
          <ProtectedRoute role="STUDENT">
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/verification"
        element={
          <ProtectedRoute role="STUDENT">
            <VerificationCenterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/eligibility-roadmap"
        element={
          <ProtectedRoute role="STUDENT">
            <EligibilityRoadmapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/eligibility-roadmap/:scholarshipId"
        element={
          <ProtectedRoute role="STUDENT">
            <ScholarshipRoadmapDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="/student/passport" element={<Navigate to="/student/profile" replace />} />

      {/* Provider Portal */}
      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute role="PROVIDER">
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/scholarships"
        element={
          <ProtectedRoute role="PROVIDER">
            <ProviderScholarships />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/applications"
        element={
          <ProtectedRoute role="PROVIDER">
            <ProviderApplications />
          </ProtectedRoute>
        }
      />

      {/* Admin Portal */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
