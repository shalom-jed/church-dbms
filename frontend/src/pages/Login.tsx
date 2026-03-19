import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="AOG Church Logo" 
              className="h-24 w-24 object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Assembly of God Church
          </h1>
          <p className="text-secondary-300">Ruwanwella</p>
          <p className="text-secondary-400 text-sm mt-2">Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-hard p-8 animate-scale-up">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label flex items-center space-x-2">
                <Mail className="w-4 h-4 text-secondary-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@church.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <Lock className="w-4 h-4 text-secondary-500" />
                <span>Password</span>
              </label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-secondary-500">
              Secure access for authorized staff only
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-secondary-400 text-sm mt-6">
          © 2026 Assembly of God Church - Ruwanwella
        </p>
      </div>
    </div>
  );
}