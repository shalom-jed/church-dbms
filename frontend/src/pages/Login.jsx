import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@church.local');
  const [password, setPassword] = useState('Admin123!@#');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-sm border border-slate-800 rounded-lg p-6 bg-slate-900">
        <h1 className="text-lg font-semibold mb-4">Church CMS Login</h1>
        {error && <div className="mb-3 text-xs text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block mb-1 text-slate-300">Email</label>
            <input
              type="email"
              className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block mb-1 text-slate-300">Password</label>
            <input
              type="password"
              className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-1.5 mt-2 rounded bg-indigo-600 text-xs font-medium hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}