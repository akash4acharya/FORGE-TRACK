import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { RoleGuard } from './components/auth/RoleGuard';
import Login from './pages/Login';
import Forbidden from './pages/Forbidden';
import DevTokens from './pages/DevTokens';

import Dashboard from './pages/mentor/Dashboard';
import Attendance from './pages/mentor/AttendanceMarking';
import History from './pages/mentor/StudentHistory';
import Materials from './pages/mentor/Materials';

// Mock empty pages to satisfy remaining routes
const UploadCsv = () => <div className="text-fg-primary">CSV Upload (Phase 4)</div>;

const MyAttendance = () => <div className="text-fg-primary">My Attendance (Phase 5)</div>;
const Upcoming = () => <div className="text-fg-primary">Upcoming Sessions (Phase 5)</div>;

const RootRedirect = () => {
  const role = localStorage.getItem('role');
  if (role === 'mentor') return <Navigate to="/dashboard" replace />;
  if (role === 'student') return <Navigate to="/me/attendance" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/dev-tokens" element={<DevTokens />} />
      
      <Route path="/" element={<RootRedirect />} />

      {/* Mentor Routes */}
      <Route path="/dashboard" element={<RoleGuard allowedRoles={['mentor']}><Shell><Dashboard /></Shell></RoleGuard>} />
      <Route path="/attendance" element={<RoleGuard allowedRoles={['mentor']}><Shell><Attendance /></Shell></RoleGuard>} />
      <Route path="/history" element={<RoleGuard allowedRoles={['mentor']}><Shell><History /></Shell></RoleGuard>} />
      <Route path="/materials" element={<RoleGuard allowedRoles={['mentor']}><Shell><Materials /></Shell></RoleGuard>} />
      <Route path="/upload" element={<RoleGuard allowedRoles={['mentor']}><Shell><UploadCsv /></Shell></RoleGuard>} />

      {/* Student Routes */}
      <Route path="/me/attendance" element={<RoleGuard allowedRoles={['student']}><Shell><MyAttendance /></Shell></RoleGuard>} />
      <Route path="/me/upcoming" element={<RoleGuard allowedRoles={['student']}><Shell><Upcoming /></Shell></RoleGuard>} />
      <Route path="/me/materials" element={<RoleGuard allowedRoles={['student']}><Shell><Materials /></Shell></RoleGuard>} />
    </Routes>
  );
}

export default App;
