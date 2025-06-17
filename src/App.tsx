
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import MainLayout from './components/layout/MainLayout';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ClassesPage from './pages/ClassesPage';
import AttendancePage from './pages/AttendancePage';
import GradesPage from './pages/GradesPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AssignmentsPage from './pages/AssignmentsPage';
import ExamsPage from './pages/ExamsPage';
import NotFound from './pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<MainLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="classes" element={<ClassesPage />} />
                  <Route path="attendance" element={<AttendancePage />} />
                  <Route path="grades" element={<GradesPage />} />
                  <Route path="assignments" element={<AssignmentsPage />} />
                  <Route path="exams" element={<ExamsPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </AuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
