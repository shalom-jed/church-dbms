import React, { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [memberStats, setMemberStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, memRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/members')
        ]);
        setStats(dashRes.data);
        setMemberStats(memRes.data);
      } catch (error) {
        console.error("Dashboard load failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-slate-400 p-4">Loading Dashboard...</div>;
  if (!stats || !memberStats) return <div className="text-red-400 p-4">Error loading data.</div>;

  // Chart Data Preparation
  const attendanceData = {
    labels: stats.attendanceTrend.map(d => new Date(d._id).toLocaleDateString()),
    datasets: [{
      label: 'Attendance',
      data: stats.attendanceTrend.map(d => d.present),
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56,189,248,0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const donationData = {
    labels: stats.donationsByMonth.map(d => `${d._id.month}/${d._id.year}`),
    datasets: [{
      label: 'Donations ($)',
      data: stats.donationsByMonth.map(d => d.total),
      backgroundColor: '#10b981',
      borderRadius: 4
    }]
  };

  const ministryData = {
    labels: memberStats.byMinistry.map(m => m._id || 'Unassigned'),
    datasets: [{
      data: memberStats.byMinistry.map(m => m.count),
      backgroundColor: ['#f472b6', '#818cf8', '#34d399', '#fbbf24', '#60a5fa'],
      borderWidth: 0
    }]
  };

  const ageData = {
    labels: memberStats.ageGroups.map(a => a._id),
    datasets: [{
      label: 'Members',
      data: memberStats.ageGroups.map(a => a.count),
      backgroundColor: '#a78bfa',
      borderRadius: 4
    }]
  };

  return (
    <div className="space-y-6 text-xs text-slate-300">
      <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <p className="text-slate-400">Total Members</p>
          <p className="text-3xl font-bold text-sky-400 mt-1">{stats.totalMembers}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <p className="text-slate-400">Small Groups</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.totalGroups}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <p className="text-slate-400">Total Donations</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">${stats.totalDonations.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <p className="text-slate-400">Upcoming Events</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{stats.upcomingEvents.length}</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <h3 className="font-semibold text-white mb-4">Attendance Trend</h3>
          <div className="h-64">
            <Line data={attendanceData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <h3 className="font-semibold text-white mb-4">Ministry Distribution</h3>
          <div className="h-64 flex justify-center">
            <Pie data={ministryData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <h3 className="font-semibold text-white mb-4">Age Demographics</h3>
          <div className="h-48">
            <Bar data={ageData} options={{ maintainAspectRatio: false, indexAxis: 'y' }} />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <h3 className="font-semibold text-white mb-4">Monthly Donations</h3>
          <div className="h-48">
            <Bar data={donationData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        
        {/* Upcoming Events List */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col">
          <h3 className="font-semibold text-white mb-4">Upcoming Events</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {stats.upcomingEvents.length === 0 ? <p className="text-slate-500">No upcoming events.</p> : 
              stats.upcomingEvents.map(ev => (
                <div key={ev._id} className="bg-slate-800/50 p-2 rounded border-l-2 border-purple-500">
                  <p className="text-white font-medium">{ev.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(ev.date).toLocaleDateString()} @ {ev.time || 'TBD'}
                  </p>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}