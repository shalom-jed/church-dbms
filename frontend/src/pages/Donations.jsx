import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donations');
      setDonations(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4 text-xs">
      <h1 className="text-xl font-semibold">Donations</h1>

      {loading ? (
        <div className="text-slate-400">Loading donations...</div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded">
          <table className="min-w-full text-left">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-3 py-2 border-b border-slate-800">Donor</th>
                <th className="px-3 py-2 border-b border-slate-800">Amount</th>
                <th className="px-3 py-2 border-b border-slate-800">Type</th>
                <th className="px-3 py-2 border-b border-slate-800">Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d._id} className="odd:bg-slate-900/40">
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {d.donorName || d.member || '-'}
                  </td>
                  <td className="px-3 py-1.5 border-b border-slate-800">${d.amount}</td>
                  <td className="px-3 py-1.5 border-b border-slate-800">{d.type}</td>
                  <td className="px-3 py-1.5 border-b border-slate-800">
                    {new Date(d.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!donations.length && (
                <tr>
                  <td className="px-3 py-2 text-slate-400" colSpan={4}>
                    No donations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}