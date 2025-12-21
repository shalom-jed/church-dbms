// frontend/src/pages/Donations.jsx
import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ donorName: '', amount: '', type: 'tithe', date: '', notes: '' });

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/donations'); setDonations(res.data); } 
    catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/donations', formData);
      setShowModal(false);
      setFormData({ donorName: '', amount: '', type: 'tithe', date: '', notes: '' });
      load();
    } catch (e) { alert('Error saving donation'); }
  };

  const handleDelete = async (id) => {
    if(!confirm("Delete record?")) return;
    await api.delete(`/donations/${id}`);
    load();
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Donations</h1>
        <div className="flex gap-2">
            <a href="http://localhost:5000/api/donations/export" target="_blank" className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-white">
                Export CSV
            </a>
            <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-white font-medium">
                + Add Donation
            </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-x-auto border border-slate-800 rounded">
        <table className="min-w-full text-left bg-slate-900/50">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Donor</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {donations.map((d) => (
              <tr key={d._id} className="hover:bg-slate-800/50">
                <td className="p-3">{new Date(d.date).toLocaleDateString()}</td>
                <td className="p-3 font-medium">{d.donorName || 'Anonymous'}</td>
                <td className="p-3 capitalize">{d.type}</td>
                <td className="p-3 text-emerald-400 font-mono">${d.amount}</td>
                <td className="p-3 text-right">
                    <button onClick={() => handleDelete(d._id)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded w-96 relative">
                <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-slate-400">✕</button>
                <h2 className="text-lg font-bold mb-4">Record Donation</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input className="w-full bg-slate-800 border border-slate-700 rounded p-2" placeholder="Donor Name" 
                        value={formData.donorName} onChange={e => setFormData({...formData, donorName: e.target.value})} />
                    <select className="w-full bg-slate-800 border border-slate-700 rounded p-2"
                        value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="tithe">Tithe</option>
                        <option value="offering">Offering</option>
                        <option value="special">Special</option>
                    </select>
                    <input className="w-full bg-slate-800 border border-slate-700 rounded p-2" type="number" placeholder="Amount" required
                        value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                    <input className="w-full bg-slate-800 border border-slate-700 rounded p-2" type="date" required
                        value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded text-white font-bold">Save Record</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}