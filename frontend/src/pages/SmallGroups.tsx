import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { smallGroupService } from '../services/smallGroup.service';
import type { SmallGroup } from '../services/smallGroup.service';
import toast from 'react-hot-toast';
import SmallGroupForm from '../components/SmallGroupForm';
import { Users, MapPin, Calendar, Clock, Plus, Edit, Trash2, TrendingUp, Eye } from 'lucide-react';

export default function SmallGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<SmallGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SmallGroup | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await smallGroupService.getAll();
      setGroups(data);
    } catch (error) {
      toast.error('Failed to load small groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      await smallGroupService.delete(id);
      toast.success('Group deleted successfully');
      loadGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete group');
    }
  };

  const handleEdit = (group: SmallGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroup(group);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingGroup(null);
    loadGroups();
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Small Groups</h1>
          <p className="text-secondary-500 mt-1">{groups.length} groups</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Small Group</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Groups</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{groups.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Groups</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {groups.filter(g => g.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Members</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {groups.reduce((sum, g) => sum + (g._count?.members || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div 
            key={group.id} 
            className="card hover-lift border-l-4 border-primary-500 cursor-pointer"
            onClick={() => navigate(`/small-groups/${group.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">{group.groupName}</h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    group.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {group.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {group.leaderMember && (
                <div className="flex items-center text-sm text-secondary-600 bg-gray-50 p-2 rounded-lg">
                  <Users className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-secondary-500">Leader</p>
                    <p className="font-medium text-secondary-900">
                      {group.leaderMember.firstName} {group.leaderMember.lastName}
                    </p>
                  </div>
                </div>
              )}

              {group.meetingDay && (
                <div className="flex items-center text-sm text-secondary-600">
                  <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                  <span>
                    {group.meetingDay}
                    {group.meetingTime && (
                      <>
                        {' '}at <Clock className="w-3 h-3 inline mx-1" />
                        {group.meetingTime}
                      </>
                    )}
                  </span>
                </div>
              )}

              {group.meetingLocation && (
                <div className="flex items-center text-sm text-secondary-600">
                  <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                  <span className="truncate">{group.meetingLocation}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm text-secondary-600">Members</span>
                <span className="text-lg font-bold text-primary-600">{group._count?.members || 0}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/small-groups/${group.id}`);
                }}
                className="flex-1 btn-primary text-sm flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={(e) => handleEdit(group, e)}
                className="px-3 py-2 btn-secondary text-sm"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(group.id);
                }}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
          <p className="text-secondary-500">No small groups found</p>
        </div>
      )}

      {showForm && <SmallGroupForm group={editingGroup} onClose={handleFormClose} />}
    </div>
  );
}