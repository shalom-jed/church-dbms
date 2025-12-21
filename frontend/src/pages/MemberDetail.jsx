import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient.js';

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', gender: 'male', phone: '', address: '', ministry: '', dateOfBirth: '', profilePhotoBase64: ''
  });

  const loadMember = () => {
    setLoading(true);
    api.get(`/members/${id}`)
      .then((res) => setMember(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMember(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this member? This action cannot be undone.")) return;
    try {
      await api.delete(`/members/${id}`);
      navigate('/members'); // Redirect to list after delete
    } catch (e) {
      alert("Failed to delete member");
    }
  };

  const handleEditClick = () => {
    setFormData({
      fullName: member.fullName,
      gender: member.gender,
      phone: member.phone || '',
      address: member.address || '',
      ministry: member.ministry || '',
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
      profilePhotoBase64: ''
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePhotoBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/members/${id}`, formData);
      setShowEditModal(false);
      loadMember(); // Reload data to show changes
    } catch (e) {
      alert("Failed to update member");
    }
  };

  if (loading) return <div className="text-slate-400 p-4">Loading Profile...</div>;
  if (!member) return <div className="text-red-400 p-4">Member not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-xs text-slate-300">
      
      {/* Header / Actions */}
      <div className="flex items-center justify-between">
        <Link to="/members" className="text-indigo-400 hover:text-indigo-300">← Back to Members</Link>
        <div className="flex gap-3">
          <button 
            onClick={handleEditClick}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium"
          >
            Edit Profile
          </button>
          <button 
            onClick={handleDelete}
            className="bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-900/50 px-4 py-2 rounded font-medium"
          >
            Delete Member
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Photo & Main Info */}
        <div className="bg-slate-950 p-6 flex flex-col items-center text-center w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 mb-4 bg-slate-800">
            {member.profilePhotoUrl ? (
              <img src={member.profilePhotoUrl} alt={member.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl font-bold">
                {member.fullName.charAt(0)}
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold text-white mb-1">{member.fullName}</h1>
          <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-[10px] uppercase font-bold tracking-wider mb-4">
            {member.ministry || 'No Ministry'}
          </span>
          <p className="text-slate-500">Joined: {new Date(member.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Right: Detailed Fields */}
        <div className="p-6 flex-1 space-y-4">
          <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-2 mb-4">Personal Details</h2>
          
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <label className="block text-slate-500 mb-1">Gender</label>
              <div className="text-white capitalize">{member.gender}</div>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Age / DOB</label>
              <div className="text-white">
                {member.age ? `${member.age} years old` : 'N/A'} 
                <span className="text-slate-500 ml-1">
                   ({member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'No DOB'})
                </span>
              </div>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Phone</label>
              <div className="text-white">{member.phone || '—'}</div>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Address</label>
              <div className="text-white">{member.address || '—'}</div>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-500 mb-1">Small Group</label>
              {member.smallGroup ? (
                <Link to="/groups" className="text-emerald-400 hover:underline">
                  {member.smallGroup.name}
                </Link>
              ) : (
                <span className="text-slate-500">Not assigned</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-lg relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-2 right-2 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" required />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Phone</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Ministry</label>
                <input name="ministry" value={formData.ministry} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Address</label>
                <input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2" />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Update Profile Photo</label>
                <input type="file" onChange={handleFileChange} className="w-full text-slate-400" />
              </div>
              <button type="submit" className="col-span-2 bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-bold mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}