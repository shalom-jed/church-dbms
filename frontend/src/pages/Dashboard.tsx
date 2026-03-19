import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/report.service';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, UsersRound, Building2, TrendingUp, TrendingDown, Calendar, Wallet } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await reportService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-hard">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}! 👋</h1>
        <p className="text-primary-100">Here's what's happening with your church today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <div className="stat-card from-blue-500 to-blue-600">
          <div className="flex justify-between items-start mb-4">
            <Users className="w-8 h-8" />
            <span className="text-sm bg-white/20 px-2 py-1 rounded-lg">
              {stats?.members?.active || 0} Active
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Members</p>
          <p className="text-4xl font-bold">{stats?.members?.total || 0}</p>
        </div>

        {/* Small Groups */}
        <div className="stat-card from-green-500 to-green-600">
          <div className="flex justify-between items-start mb-4">
            <UsersRound className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Small Groups</p>
          <p className="text-4xl font-bold">{stats?.groups || 0}</p>
        </div>

        {/* Departments */}
        <div className="stat-card from-purple-500 to-purple-600">
          <div className="flex justify-between items-start mb-4">
            <Building2 className="w-8 h-8" />
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Departments</p>
          <p className="text-4xl font-bold">{stats?.departments || 0}</p>
        </div>

        {/* Monthly Balance */}
        <div className={`stat-card ${stats?.thisMonth?.balance >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'}`}>
          <div className="flex justify-between items-start mb-4">
            <Wallet className="w-8 h-8" />
            {stats?.thisMonth?.balance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
          <p className="text-sm opacity-90 mb-1">This Month Balance</p>
          <p className="text-3xl font-bold">LKR {stats?.thisMonth?.balance?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sunday Service Trends */}
        <div className="card">
          <h3 className="text-xl font-bold text-secondary-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary-500" />
            Sunday Service Attendance
          </h3>
          {stats?.recentServices?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.recentServices}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="serviceDate" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Line type="monotone" dataKey="totalAttendance" stroke="#f97316" name="Total" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} />
                <Line type="monotone" dataKey="membersCount" stroke="#10b981" name="Members" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                <Line type="monotone" dataKey="visitorsCount" stroke="#6366f1" name="Visitors" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-secondary-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No service data available</p>
            </div>
          )}
        </div>

        {/* Monthly Finance */}
        <div className="card">
          <h3 className="text-xl font-bold text-secondary-900 mb-6 flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-primary-500" />
            This Month Finance
          </h3>
          {stats?.thisMonth && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Income', amount: stats.thisMonth.income, fill: '#10b981' },
                  { name: 'Expenses', amount: stats.thisMonth.expenses, fill: '#ef4444' },
                  { name: 'Balance', amount: Math.abs(stats.thisMonth.balance), fill: stats.thisMonth.balance >= 0 ? '#f97316' : '#991b1b' },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value: any) => `LKR ${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Services Table */}
      <div className="card">
        <h3 className="text-xl font-bold text-secondary-900 mb-6">Recent Sunday Services</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-bold text-secondary-600 uppercase">Date</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-secondary-600 uppercase">Total</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-secondary-600 uppercase">Members</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-secondary-600 uppercase">Visitors</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-secondary-600 uppercase">First Timers</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentServices?.map((service: any) => (
                <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-secondary-900">
                    {new Date(service.serviceDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary-100 text-primary-700">
                      {service.totalAttendance}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-secondary-600">{service.membersCount}</td>
                  <td className="py-4 px-4 text-sm text-secondary-600">{service.visitorsCount}</td>
                  <td className="py-4 px-4 text-sm text-secondary-600">{service.firstTimersCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats?.recentServices || stats.recentServices.length === 0) && (
            <div className="text-center py-12 text-secondary-400">
              <p>No recent services</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}