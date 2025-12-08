import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [members, setMembers] = useState(null);
  const [donations, setDonations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/reports/members'),
      api.get('/reports/donations'),
    ])
      .then(([d1, d2, d3]) => {
        setDashboard(d1.data);
        setMembers(d2.data);
        setDonations(d3.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-slate-300">Loading reports...</div>;

  return (
    <div className="space-y-4 text-xs">
      <h1 className="text-xl font-semibold">Reports</h1>

      <div className="border border-slate-800 rounded p-3 bg-slate-900">
        <h2 className="font-semibold mb-2">Summary</h2>
        <p className="text-slate-300">
          Members: {dashboard?.totalMembers ?? 0} · Groups:{' '}
          {dashboard?.totalGroups ?? 0} · Total Donations: $
          {dashboard?.totalDonations?.toFixed?.(2) ?? '0.00'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-slate-800 rounded p-3 bg-slate-900">
          <h3 className="font-semibold mb-2">Members by Month (raw)</h3>
          <pre className="text-[10px] text-slate-300 whitespace-pre-wrap">
            {JSON.stringify(members?.membersByMonth, null, 2)}
          </pre>
        </div>
        <div className="border border-slate-800 rounded p-3 bg-slate-900">
          <h3 className="font-semibold mb-2">Donations by Period (raw)</h3>
          <pre className="text-[10px] text-slate-300 whitespace-pre-wrap">
            {JSON.stringify(donations?.totalByPeriod, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}