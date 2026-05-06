import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import HistoryPage from './pages/History';
import Profile from './pages/Profile';
import OrganizationManagement from './pages/OrganizationManagement';
import UserManagement from './pages/UserManagement';
import GlobalTasks from './pages/GlobalTasks';
import SystemHealth from './pages/SystemHealth';
import TeacherStudents from './pages/TeacherStudents';
import TeacherMyStudents from './pages/TeacherMyStudents';
import TeacherTasks from './pages/TeacherTasks';
import TeacherPerformance from './pages/TeacherPerformance';

// Import the Video-Style Tests (The ones ending in 'Test.jsx')
import TestInterface from './pages/TestInterface'; // Speaking
import ListeningTest from './pages/ListeningTest';
import ReadingTest from './pages/ReadingTest';
import WritingTest from './pages/WritingTest';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/organizations" element={<OrganizationManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/tasks" element={<GlobalTasks />} />
          <Route path="/admin/health" element={<SystemHealth />} />

          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/my-students" element={<TeacherMyStudents />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/tasks" element={<TeacherTasks />} />
          <Route path="/teacher/performance" element={<TeacherPerformance />} />

          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<Profile />} />

          {/* Speaking Module (Dynamic ID for Food, Family, etc.) */}
          <Route path="/test/:id" element={<TestInterface />} />

          {/* Other Modules */}
          <Route path="/listening" element={<ListeningTest />} />
          <Route path="/reading" element={<ReadingTest />} />
          <Route path="/writing" element={<WritingTest />} />

          {/* Dynamic module routes for direct task links */}
          <Route path="/listening-test/:id" element={<ListeningTest />} />
          <Route path="/reading-test/:id" element={<ReadingTest />} />
          <Route path="/writing-test/:id" element={<WritingTest />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;