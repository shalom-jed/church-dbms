import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, 
  Heart, Users, Building2, Edit, Trash2 
} from 'lucide-react';
import MemberForm from '../components/MemberForm';

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (id) loadMember();
  }, [id]);

  const loadMember = async () => {
    try {
      setLoading(true);
      const data = await memberService.getById(id!);
      setMember(data);
    } catch (error) {
      toast.error('Failed to load member details');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      await memberService.delete(id!);
      toast.success('Member deleted successfully');
      navigate('/members');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete member');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    loadMember();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/members')}
          className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Members</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowForm(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button 
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="card">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {member.firstName[0]}{member.lastName[0]}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-secondary-900">
                {member.firstName} {member.lastName}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                member.membershipStatus === 'MEMBER' ? 'bg-green-100 text-green-700' :
                member.membershipStatus === 'LEADER' ? 'bg-purple-100 text-purple-700' :
                member.membershipStatus === 'VISITOR' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {member.membershipStatus}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center text-secondary-600">
                <User className="w-4 h-4 mr-2 text-primary-500" />
                <span>{member.gender}</span>
              </div>
              {member.email && (
                <div className="flex items-center text-secondary-600">
                  <Mail className="w-4 h-4 mr-2 text-primary-500" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.phonePrimary && (
                <div className="flex items-center text-secondary-600">
                  <Phone className="w-4 h-4 mr-2 text-primary-500" />
                  <span>{member.phonePrimary}</span>
                </div>
              )}
              {member.dateOfBirth && (
                <div className="flex items-center text-secondary-600">
                  <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                  <span>{new Date(member.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="card">
          <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary-500" />
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-secondary-500">Full Name</span>
              <span className="font-medium text-secondary-900">{member.firstName} {member.lastName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-secondary-500">Gender</span>
              <span className="font-medium text-secondary-900">{member.gender}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-secondary-500">Date of Birth</span>
              <span className="font-medium text-secondary-900">
                {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-secondary-500">Marital Status</span>
              <span className="font-medium text-secondary-900">{member.maritalStatus || 'N/A'}</span>
            </div>
            {member.address && (
              <div className="py-2">
                <span className="text-secondary-500 block mb-1">Address</span>
                <span className="font-medium text-secondary-900 flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-primary-500" />
                  {member.address}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Spiritual Information */}
        <div className="card">
          <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-primary-500" />
            Spiritual Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-secondary-500">Membership Status</span>
              <span className="font-medium text-secondary-900">{member.membershipStatus}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-secondary-500">Baptism Status</span>
              <span className={`font-medium ${
                member.baptismStatus === 'BAPTIZED' ? 'text-green-600' : 'text-secondary-900'
              }`}>
                {member.baptismStatus}
              </span>
            </div>
            {member.baptismDate && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-secondary-500">Baptism Date</span>
                <span className="font-medium text-secondary-900">
                  {new Date(member.baptismDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-secondary-500">Join Date</span>
              <span className="font-medium text-secondary-900">
                {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Small Groups */}
        <div className="card">
          <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary-500" />
            Small Groups
          </h3>
          {member.smallGroupMemberships?.length > 0 ? (
            <div className="space-y-2">
              {member.smallGroupMemberships.map((membership: any) => (
                <div 
                  key={membership.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate(`/small-groups/${membership.group.id}`)}
                >
                  <div>
                    <p className="font-medium text-secondary-900">{membership.group.groupName}</p>
                    <p className="text-sm text-secondary-500">{membership.role}</p>
                  </div>
                  <span className="text-primary-600">View →</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-4">Not in any small group</p>
          )}
        </div>

        {/* Departments */}
        <div className="card">
          <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-primary-500" />
            Departments
          </h3>
          {member.departmentMemberships?.length > 0 ? (
            <div className="space-y-2">
              {member.departmentMemberships.map((membership: any) => (
                <div 
                  key={membership.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-secondary-900">{membership.department.departmentName}</p>
                    <p className="text-sm text-secondary-500">{membership.role}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-4">Not in any department</p>
          )}
        </div>
      </div>

      {/* Emergency Contact */}
      {(member.emergencyContactName || member.emergencyContactPhone) && (
        <div className="card">
          <h3 className="text-lg font-bold text-secondary-900 mb-4">Emergency Contact</h3>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-secondary-900">{member.emergencyContactName || 'N/A'}</p>
              <p className="text-secondary-500">{member.emergencyContactPhone || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {showForm && <MemberForm member={member} onClose={handleFormClose} />}
    </div>
  );
}