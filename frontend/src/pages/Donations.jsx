import { useEffect, useState } from 'react';
import api from '../api/axiosClient.js';

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ donorName: '', amount: '', type: 'tithe', date: '', notes: '' });
  const [filters, setFilters] = useState({ type: '', from: '', to: '' });

  const load = async () => {
    setLoading(true);
    try { 
        const params = {};
        if(filters.type) params.type = filters.type;
        if(filters.from) params.from = filters.from;
        if(filters.to) params.to = filters.to;
        const res = await api.get('/donations', { params }); 
        setDonations(res.data); 
    } 
    catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`/donations/${editingId}`, formData);
      else await api.post('/donations', formData);
      setShowModal(false);
      setEditingId(null);
      setFormData({ donorName: '', amount: '', type: 'tithe', date: '', notes: '' });
      load();
    } catch (e) { alert('Error saving donation'); }
  };

  const handleEdit = (d) => {
    setEditingId(d._id);
    setFormData({
        donorName: d.donorName || '',
        amount: d.amount,
        type: d.type,
        date: d.date.split('T')[0],
        notes: d.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete record?")) return;
    try { await api.delete(`/donations/${id}`); load(); } catch (e) { alert('Delete failed'); }
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const authData = JSON.parse(localStorage.getItem('cms_auth') || '{}');

  return (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Donations</h1>
        <div className="flex gap-2">
            <a href={`${baseUrl}/donations/export?token=${authData.token}`} target="_blank" rel="noreferrer" className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-white flex items-center">
                Export CSV
            </a>
            <button onClick={() => { setEditingId(null); setShowModal(true); }} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-white font-medium">
                + Add Donation
            </button>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-900 p-2 rounded border border-slate-800 items-center">
         <span className="text-slate-400 font-bold px-2">Filters:</span>
         <select className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1" 
           value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
           <option value="">All Types</option>
           <option value="tithe">Tithe</option>
           <option value="offering">Offering</option>
           <option value="special">Special</option>
         </select>
         <input type="date" className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1"
           value={filters.from} onChange={e => setFilters({...filters, from: e.target.value})} />
         <span className="text-slate-500">to</span>
         <input type="date" className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1"
           value={filters.to} onChange={e => setFilters({...filters, to: e.target.value})} />
      </div>

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
                <td className="p-3 text-right gap-2">
                    <button onClick={() => handleEdit(d)} className="text-sky-400 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(d._id)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {donations.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-slate-500">No donations found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded w-96 relative">
                <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-slate-400">✕</button>
                <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Donation' : 'Record Donation'}</h2>
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