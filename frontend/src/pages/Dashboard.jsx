import React, { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
);
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get('/reports/dashboard').then((res) => setStats(res.data));
  }, []);
  if (!stats) return <div className='text-xs text-slate-300'>Loading dashboard...</div>;
  const attendanceLabels = stats.attendanceTrend.map((d) => new Date(d._id).toLocaleDateString());
  const attendanceData = stats.attendanceTrend.map((d) => d.present);
  const genderLabels = stats.genderStats.map((g) => g._id || 'Unknown');
  const genderData = stats.genderStats.map((g) => g.count);
  const donationLabels = stats.donationsByMonth.map((d) => `${d._id.month}/${d._id.year}`);
  const donationData = stats.donationsByMonth.map((d) => d.total);
  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-semibold'>Dashboard</h1>
      <div className='grid md:grid-cols-4 gap-4 text-xs'>
        <div className='rounded-lg border border-slate-800 bg-slate-900 p-3'>
          <div className='text-slate-400'>Total Members</div>
          <div className='text-2xl font-semibold text-sky-300'>{stats.totalMembers}</div>
        </div>
        <div className='rounded-lg border border-slate-800 bg-slate-900 p-3'>
          <div className='text-slate-400'>Small Groups</div>
          <div className='text-2xl font-semibold text-emerald-300'>{stats.totalGroups}</div>
        </div>
        <div className='rounded-lg border border-slate-800 bg-slate-900 p-3'>
          <div className='text-slate-400'>Total Donations</div>
          <div className='text-2xl font-semibold text-amber-300'>${stats.totalDonations.toFixed(2)}</div>
        </div>
        <div className='rounded-lg border border-slate-800 bg-slate-900 p-3'>
          <div className='text-slate-400'>Upcoming Events</div>
          <div className='text-2xl font-semibold text-purple-300'>{stats.upcomingEvents.length}</div>
        </div>
      </div>
      <div className='grid md:grid-cols-2 gap-4'>
        <div className='rounded-lg border border-slate-800 bg-slate-900 p-3'>
          <div className='text-[11px] text-slate-400 mb-2'>Attendance Trend</div>
          <Line
            data={{
              labels: attendanceLabels,
              datasets: [
                {
                  label: 'Present',
                  data: attendanceData,
                  borderColor: '#38bdf8',
                  backgroundColor: 'rgba(56,189,248,0.2)',
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </div>
        <div className='rounded-lg border border-slate-800 bg-slate-900 p-3'>
          <div className='text-[11px] text-slate-400 mb-2'>Gender Distribution</div>
          <Doughnut
            data={{
              labels: genderLabels,
              datasets: [
                {
                  data: genderData,
                  backgroundColor: ['#38bdf8', '#f97316', '#a855f7'],
                },
              ],
            }}
          />
        </div>
      </div>
      <div className='rounded-lg border border-slate-800 bg-slate-900 p-3'>
        <div className='text-[11px] text-slate-400 mb-2'>Monthly Donations</div>
        <Bar
          data={{
            labels: donationLabels,
            datasets: [
              {
                label: 'Donations',
                data: donationData,
                backgroundColor: '#22c55e',
              },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { display: false } } }}
        />
      </div>
    </div>
  );
}