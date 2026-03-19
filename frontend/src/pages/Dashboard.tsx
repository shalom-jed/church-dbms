import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/report.service';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username}!</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Total Members</h3>
          <p className="text-3xl font-bold text-primary-600">
            {stats?.members?.total || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Active: {stats?.members?.active || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Small Groups</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats?.groups || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">Departments</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.departments || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-600 mb-2">This Month Balance</h3>
          <p className={`text-3xl font-bold ${stats?.thisMonth?.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            LKR {stats?.thisMonth?.balance?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Income: LKR {stats?.thisMonth?.income?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Sunday Services */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Sunday Services</h3>
          {stats?.recentServices?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.recentServices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="serviceDate" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Line type="monotone" dataKey="totalAttendance" stroke="#0ea5e9" name="Total" strokeWidth={2} />
                <Line type="monotone" dataKey="membersCount" stroke="#10b981" name="Members" strokeWidth={2} />
                <Line type="monotone" dataKey="visitorsCount" stroke="#f59e0b" name="Visitors" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No service data available</p>
          )}
        </div>

        {/* Monthly Finance */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">This Month Finance</h3>
          {stats?.thisMonth && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: 'Income', amount: stats.thisMonth.income },
                  { name: 'Expenses', amount: stats.thisMonth.expenses },
                  { name: 'Balance', amount: Math.abs(stats.thisMonth.balance) },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `LKR ${value.toLocaleString()}`} />
                <Bar dataKey="amount">
                  {[
                    { name: 'Income', amount: stats.thisMonth.income },
                    { name: 'Expenses', amount: stats.thisMonth.expenses },
                    { name: 'Balance', amount: Math.abs(stats.thisMonth.balance) },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Services Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Sunday Services</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitors</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Timers</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentServices?.map((service: any) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(service.serviceDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {service.totalAttendance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.membersCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.visitorsCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.firstTimersCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!stats?.recentServices || stats.recentServices.length === 0) && (
            <p className="text-center py-12 text-gray-500">No recent services</p>
          )}
        </div>
      </div>
    </div>
  );
}