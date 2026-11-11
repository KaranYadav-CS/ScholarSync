import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DemoBanner from './components/DemoBanner';

// Public Pages
import HomePage from './pages/HomePage';
import ScholarshipsPage from './pages/ScholarshipsPage';
import ScholarshipDetailPage from './pages/ScholarshipDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Student Pages
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import EligibleScholarshipsPage from './pages/student/EligibleScholarshipsPage';
import ApplicationFormPage from './pages/student/ApplicationFormPage';
import MyApplicationsPage from './pages/student/MyApplicationsPage';
import ApplicationDetailPage from './pages/student/ApplicationDetailPage';

// Verifier Pages
import VerifierDashboardPage from './pages/verifier/VerifierDashboardPage';
import VerifierReviewPage from './pages/verifier/VerifierReviewPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminScholarshipsPage from './pages/admin/AdminScholarshipsPage';
import ScholarshipFormPage from './pages/admin/ScholarshipFormPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import UserManagementPage from './pages/admin/UserManagementPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function Layout({ children, withSidebar = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DemoBanner />
      <Navbar />
      <div className="flex-1 flex">
        {withSidebar && <Sidebar />}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${withSidebar ? 'max-w-7xl' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/scholarships"
            element={
              <Layout>
                <ScholarshipsPage />
              </Layout>
            }
          />
          <Route
            path="/scholarships/:id"
            element={
              <Layout>
                <ScholarshipDetailPage />
              </Layout>
            }
          />
          <Route
            path="/login"
            element={
              <Layout>
                <LoginPage />
              </Layout>
            }
          />
          <Route
            path="/register"
            element={
              <Layout>
                <RegisterPage />
              </Layout>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <Layout>
                <UnauthorizedPage />
              </Layout>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Layout withSidebar>
                  <StudentDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Layout withSidebar>
                  <StudentProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/eligible-scholarships"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Layout withSidebar>
                  <EligibleScholarshipsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Layout withSidebar>
                  <MyApplicationsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications/new/:scholarshipId"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Layout withSidebar>
                  <ApplicationFormPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Layout withSidebar>
                  <ApplicationDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Verifier Routes */}
          <Route
            path="/verifier/dashboard"
            element={
              <ProtectedRoute allowedRoles={['VERIFIER']}>
                <Layout withSidebar>
                  <VerifierDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/verifier/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['VERIFIER']}>
                <Layout withSidebar>
                  <VerifierReviewPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Scholarship Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN']}>
                <Layout withSidebar>
                  <AdminDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/scholarships"
            element={
              <ProtectedRoute allowedRoles={['SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN']}>
                <Layout withSidebar>
                  <AdminScholarshipsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/scholarships/new"
            element={
              <ProtectedRoute allowedRoles={['SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN']}>
                <Layout withSidebar>
                  <ScholarshipFormPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute allowedRoles={['SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN']}>
                <Layout withSidebar>
                  <AdminApplicationsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN']}>
                <Layout withSidebar>
                  <AdminAnalyticsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN']}>
                <Layout withSidebar>
                  <AuditLogsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* System Admin Routes */}
          <Route
            path="/system/users"
            element={
              <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                <Layout withSidebar>
                  <UserManagementPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <Layout>
                <NotFoundPage />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
