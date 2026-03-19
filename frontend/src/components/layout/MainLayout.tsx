import { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Church DBMS</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.username}</span>
              <button onClick={handleLogout} className="btn-secondary text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-100">
              Dashboard
            </Link>
            <Link to="/members" className="block px-4 py-2 rounded hover:bg-gray-100">
              Members
            </Link>
            <Link to="/small-groups" className="block px-4 py-2 rounded hover:bg-gray-100">
              Small Groups
            </Link>
            <Link to="/attendance" className="block px-4 py-2 rounded hover:bg-gray-100">
              Attendance
            </Link>
            <Link to="/departments" className="block px-4 py-2 rounded hover:bg-gray-100">
              Departments
            </Link>
            <Link to="/events" className="block px-4 py-2 rounded hover:bg-gray-100">
              Events
            </Link>
            <Link to="/finance" className="block px-4 py-2 rounded hover:bg-gray-100">
              Finance
            </Link>
            <Link to="/reports" className="block px-4 py-2 rounded hover:bg-gray-100">
              Reports
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}