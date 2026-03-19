import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import SmallGroups from './pages/SmallGroups';
import Attendance from './pages/Attendance';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Members />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
  path="/small-groups"
  element={
    <ProtectedRoute>
      <MainLayout>
        <SmallGroups />
      </MainLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/attendance"
  element={
    <ProtectedRoute>
      <MainLayout>
        <Attendance />
      </MainLayout>
    </ProtectedRoute>
  }
/>
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;