// frontend/src/pages/Settings.jsx
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axiosClient.js';

export default function Settings() {
  const { user } = useAuth();

  const handleSeed = async () => {
    try {
      const res = await api.post('/auth/seed-admin');
      alert(res.data.message);
    } catch (e) { alert('Error seeding admin'); }
  };

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-xl font-bold">Settings</h1>
      
      <div className="bg-slate-900 border border-slate-800 p-4 rounded max-w-md">
        <h2 className="text-lg font-semibold mb-2">My Profile</h2>
        <div className="space-y-2 text-slate-300">
            <p><span className="text-slate-500 w-20 inline-block">Name:</span> {user?.name}</p>
            <p><span className="text-slate-500 w-20 inline-block">Email:</span> {user?.email}</p>
            <p><span className="text-slate-500 w-20 inline-block">Role:</span> 
                <span className="bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded uppercase text-[10px] ml-1">{user?.role}</span>
            </p>
        </div>
      </div>

      {/* Admin Only Zone */}
      {user?.role === 'admin' && (
        <div className="bg-slate-900 border border-red-900/50 p-4 rounded max-w-md">
            <h2 className="text-lg font-semibold mb-2 text-red-400">Danger Zone</h2>
            <p className="text-slate-400 mb-3">Initialize the database with a default admin if none exists.</p>
            <button onClick={handleSeed} className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded hover:bg-red-900">
                Seed Default Admin
            </button>
        </div>
      )}
    </div>
  );
}