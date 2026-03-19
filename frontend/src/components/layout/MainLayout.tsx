import { ReactNode, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UsersRound, 
  Calendar, 
  Building2, 
  PartyPopper, 
  Wallet, 
  BarChart3,
  LogOut,
  Menu,
  Plus,
  X
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Members', path: '/members' },
    { icon: UsersRound, label: 'Small Groups', path: '/small-groups' },
    { icon: Calendar, label: 'Attendance', path: '/attendance' },
    { icon: Building2, label: 'Departments', path: '/departments' },
    { icon: PartyPopper, label: 'Events', path: '/events' },
    { icon: Wallet, label: 'Finance', path: '/finance' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
  ];

  const quickActions = [
    { label: 'Add Member', path: '/members' },
    { label: 'Record Attendance', path: '/attendance' },
    { label: 'Add Income', path: '/finance' },
    { label: 'Create Event', path: '/events' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 bg-pattern">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-secondary-600" />
              </button>
              
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="AOG Church Logo" 
                  className="h-12 w-12 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-secondary-900">
                    Assembly of God Church
                  </h1>
                  <p className="text-xs text-secondary-500">Ruwanwella</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-secondary-900">{user?.username}</p>
                <p className="text-xs text-secondary-500">{user?.role}</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn-ghost flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-72'
          } bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] transition-all duration-300 shadow-sm sticky top-[73px]`}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {!sidebarCollapsed && (
            <div className="p-4 mt-4 border-t border-gray-200">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white">
                <h3 className="font-semibold mb-2">Quick Tip</h3>
                <p className="text-sm opacity-90">
                  Use the + button for quick actions!
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto animate-in">
            {children}
          </div>
        </main>
      </div>

      {/* Quick Actions Button */}
      <button
        onClick={() => setShowQuickActions(!showQuickActions)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-hard hover:shadow-2xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
      >
        {showQuickActions ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Quick Actions Menu */}
      {showQuickActions && (
        <div className="fixed bottom-24 right-8 space-y-2 z-50 animate-slide-up">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              onClick={() => setShowQuickActions(false)}
              className="block px-6 py-3 rounded-xl text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600"
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}