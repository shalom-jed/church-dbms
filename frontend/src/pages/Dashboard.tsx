import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Welcome back, {user?.username}!</h2>
        <p className="text-gray-600">Role: {user?.role}</p>
        <p className="text-gray-600 mt-2">Email: {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Members</h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Small Groups</h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">This Month's Income</h3>
          <p className="text-3xl font-bold text-green-600">LKR 0</p>
        </div>
      </div>
    </div>
  );
}