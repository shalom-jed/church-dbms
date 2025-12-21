import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function Reports() {
  const [data, setData] = useState({ members: null, donations: null, attendance: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/members'),
      api.get('/reports/donations'),
      api.get('/reports/attendance')
    ]).then(([m, d, a]) => {
      setData({ members: m.data, donations: d.data, attendance: a.data });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading Analytics...</div>;

  const ageData = {
    labels: data.members?.ageGroups.map(a => a._id),
    datasets: [{ label: 'Members by Age', data: data.members?.ageGroups.map(a => a.count), backgroundColor: '#6366f1' }]
  };

  const ministryData = {
    labels: data.members?.byMinistry.map(m => m._id || 'None'),
    datasets: [{ data: data.members?.byMinistry.map(m => m.count), backgroundColor: ['#f472b6', '#22c55e', '#eab308', '#3b82f6', '#a855f7'] }]
  };

  const donationData = {
    labels: data.donations?.totalByPeriod.map(d => `${d._id.month}/${d._id.year}`),
    datasets: [{ label: 'Donations ($)', data: data.donations?.totalByPeriod.map(d => d.total), borderColor: '#22c55e', tension: 0.3 }]
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics & Reports</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <h3 className="text-lg font-semibold mb-4 text-slate-300">Age Demographics</h3>
          <Bar data={ageData} />
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <h3 className="text-lg font-semibold mb-4 text-slate-300">Ministry Distribution</h3>
          <div className="h-64 flex justify-center"><Pie data={ministryData} /></div>
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
        <h3 className="text-lg font-semibold mb-4 text-slate-300">Donation Trends</h3>
        <Line data={donationData} />
      </div>

      <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex gap-4">
         <a href="http://localhost:5000/api/members/export" target="_blank" rel="noreferrer" 
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white text-sm">
            📥 Download Member CSV
         </a>
         <a href="http://localhost:5000/api/donations/export" target="_blank" rel="noreferrer" 
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-white text-sm">
            📥 Download Donation CSV
         </a>
      </div>
    </div>
  );
}