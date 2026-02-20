import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Topbar from './components/layout/Topbar.jsx';
import ProtectedRoute from './router/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import MemberDetail from './pages/MemberDetail.jsx';
import SmallGroups from './pages/SmallGroups.jsx';
import GroupDetail from './pages/GroupDetail.jsx';
import Attendance from './pages/Attendance.jsx';
import Donations from './pages/Donations.jsx';
import Events from './pages/Events.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';

function AppLayout() {
  return (
    <div className='min-h-screen flex bg-slate-950 text-slate-50'>
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        <Topbar />
        <main className='flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950'>
          <Routes>
            <Route
              path='/'
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/members'
              element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              }
            />
            <Route
              path='/members/:id'
              element={
                <ProtectedRoute>
                  <MemberDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path='/groups'
              element={
                <ProtectedRoute>
                  <SmallGroups />
                </ProtectedRoute>
              }
            />
            <Route
              path='/groups/:id'
              element={
                <ProtectedRoute>
                  <GroupDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path='/attendance'
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path='/donations'
              element={
                <ProtectedRoute>
                  <Donations />
                </ProtectedRoute>
              }
            />
            <Route
              path='/events'
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path='/reports'
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path='/settings'
              element={
                <ProtectedRoute roles={['admin', 'pastor']} >
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
        path='/login'
        element={user ? <Navigate to='/' replace /> : <Login />}
      />
      <Route path='/*' element={<AppLayout />} />
    </Routes>
  );
}