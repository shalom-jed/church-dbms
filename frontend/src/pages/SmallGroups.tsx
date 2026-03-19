import { useState, useEffect } from 'react';
import { smallGroupService } from '../services/smallGroup.service';
import type { SmallGroup } from '../services/smallGroup.service';
import toast from 'react-hot-toast';
import SmallGroupForm from '../components/SmallGroupForm';
import { useNavigate } from 'react-router-dom';

export default function SmallGroups() {
  const [groups, setGroups] = useState<SmallGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SmallGroup | null>(null);
  const navigate = useNavigate();

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

  const handleEdit = (group: SmallGroup) => {
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Small Groups</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Small Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{group.groupName}</h3>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  group.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {group.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {group.leaderMember && (
                <p>
                  <strong>Leader:</strong> {group.leaderMember.firstName}{' '}
                  {group.leaderMember.lastName}
                </p>
              )}
              {group.meetingDay && (
                <p>
                  <strong>Meets:</strong> {group.meetingDay}{' '}
                  {group.meetingTime && `at ${group.meetingTime}`}
                </p>
              )}
              {group.meetingLocation && (
                <p>
                  <strong>Location:</strong> {group.meetingLocation}
                </p>
              )}
              <p>
                <strong>Members:</strong> {group._count?.members || 0}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/small-groups/${group.id}`)}
                className="btn-primary text-sm flex-1"
              >
                View Details
              </button>
              <button
                onClick={() => handleEdit(group)}
                className="btn-secondary text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(group.id)}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No small groups found</p>
        </div>
      )}

      {showForm && <SmallGroupForm group={editingGroup} onClose={handleFormClose} />}
    </div>
  );
}