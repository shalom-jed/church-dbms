import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import SmallGroups from './pages/SmallGroups';
import SmallGroupDetail from './pages/SmallGroupDetail';
import Attendance from './pages/Attendance';
import Departments from './pages/Departments';
import DepartmentDetail from './pages/DepartmentDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Finance from './pages/Finance';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><MainLayout><Members /></MainLayout></ProtectedRoute>} />
          <Route path="/members/:id" element={<ProtectedRoute><MainLayout><MemberDetail /></MainLayout></ProtectedRoute>} />
          <Route path="/small-groups" element={<ProtectedRoute><MainLayout><SmallGroups /></MainLayout></ProtectedRoute>} />
          <Route path="/small-groups/:id" element={<ProtectedRoute><MainLayout><SmallGroupDetail /></MainLayout></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><MainLayout><Attendance /></MainLayout></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute><MainLayout><Departments /></MainLayout></ProtectedRoute>} />
          <Route path="/departments/:id" element={<ProtectedRoute><MainLayout><DepartmentDetail /></MainLayout></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><MainLayout><Events /></MainLayout></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><MainLayout><EventDetail /></MainLayout></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><MainLayout><Finance /></MainLayout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;