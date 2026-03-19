import { useState, useEffect } from 'react';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';
import MemberForm from '../components/MemberForm';
import { Search, Plus, Edit, Trash2, User, Phone, Mail } from 'lucide-react';
import { exportMembersToPDF, exportMembersToExcel } from '../utils/exportUtils';
import { Download, FileText, Table } from 'lucide-react';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getAll();
      setMembers(data);
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      await memberService.delete(id);
      toast.success('Member deleted successfully');
      loadMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete member');
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMember(null);
    loadMembers();
  };

  const filteredMembers = members.filter((member) =>
    `${member.firstName} ${member.lastName} ${member.email} ${member.phonePrimary}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
<div className="flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold text-secondary-900">Members</h1>
    <p className="text-secondary-500 mt-1">{members.length} total members</p>
  </div>
  <div className="flex items-center space-x-3">
    <div className="relative group">
      <button className="btn-secondary flex items-center space-x-2">
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-hard border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        <button
          onClick={() => exportMembersToPDF(filteredMembers)}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm"
        >
          <FileText className="w-4 h-4 text-red-500" />
          <span>Export to PDF</span>
        </button>
        <button
          onClick={() => exportMembersToExcel(filteredMembers)}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm"
        >
          <Table className="w-4 h-4 text-green-500" />
          <span>Export to Excel</span>
        </button>
      </div>
    </div>
    <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
      <Plus className="w-5 h-5" />
      <span>Add Member</span>
    </button>
  </div>
</div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search members by name, email, or phone..."
            className="input pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="card group hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {member.firstName[0]}{member.lastName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900">
                    {member.firstName} {member.lastName}
                  </h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 mt-1">
                    {member.membershipStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {member.email && (
                <div className="flex items-center text-sm text-secondary-600">
                  <Mail className="w-4 h-4 mr-2 text-secondary-400" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.phonePrimary && (
                <div className="flex items-center text-sm text-secondary-600">
                  <Phone className="w-4 h-4 mr-2 text-secondary-400" />
                  <span>{member.phonePrimary}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-secondary-600">
                <User className="w-4 h-4 mr-2 text-secondary-400" />
                <span>{member.gender}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleEdit(member)}
                className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="card text-center py-12">
          <User className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
          <p className="text-secondary-500">No members found</p>
        </div>
      )}

      {showForm && <MemberForm member={editingMember} onClose={handleFormClose} />}
    </div>
  );
}