import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { smallGroupService } from '../services/smallGroup.service';
import type { SmallGroup } from '../services/smallGroup.service';
import { attendanceService } from '../services/attendance.service';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Users, MapPin, Calendar, Clock, Edit, 
  UserPlus, X, CheckCircle, XCircle, History, Crown
} from 'lucide-react';
import SmallGroupForm from '../components/SmallGroupForm';

export default function SmallGroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  
  // Attendance form state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingTopic, setMeetingTopic] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<{[key: string]: boolean}>({});
  const [attendanceNotes, setAttendanceNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadGroup();
      loadAllMembers();
      loadAttendanceHistory();
    }
  }, [id]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const data = await smallGroupService.getById(id!);
      setGroup(data);
      
      // Initialize attendance records with all group members
      const records: {[key: string]: boolean} = {};
      data.members?.forEach((m: any) => {
        records[m.member.id] = false;
      });
      setAttendanceRecords(records);
    } catch (error) {
      toast.error('Failed to load group details');
      navigate('/small-groups');
    } finally {
      setLoading(false);
    }
  };

  const loadAllMembers = async () => {
    try {
      const data = await memberService.getAll();
      setAllMembers(data);
    } catch (error) {
      console.error('Failed to load members');
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      const data = await attendanceService.getSmallGroupAttendance(id!);
      setAttendanceHistory(data);
    } catch (error) {
      console.error('Failed to load attendance history');
    }
  };

  const handleAddMember = async (memberId: string) => {
    try {
      await smallGroupService.addMember(id!, memberId);
      toast.success('Member added to group');
      loadGroup();
      setShowAddMember(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the group?')) return;
    
    try {
      await smallGroupService.removeMember(id!, memberId);
      toast.success('Member removed from group');
      loadGroup();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const attendees = Object.entries(attendanceRecords).map(([memberId, present]) => ({
        memberId,
        present,
      }));

      await attendanceService.recordSmallGroupAttendance({
        groupId: id,
        meetingDate: attendanceDate,
        meetingTopic,
        notes: attendanceNotes,
        attendees,
      });

      toast.success('Attendance recorded successfully!');
      setShowAttendanceForm(false);
      setMeetingTopic('');
      setAttendanceNotes('');
      loadAttendanceHistory();
      
      // Reset attendance records
      const records: {[key: string]: boolean} = {};
      group.members?.forEach((m: any) => {
        records[m.member.id] = false;
      });
      setAttendanceRecords(records);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record attendance');
    }
  };

  const toggleAttendance = (memberId: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const markAllPresent = () => {
    const records: {[key: string]: boolean} = {};
    group.members?.forEach((m: any) => {
      records[m.member.id] = true;
    });
    setAttendanceRecords(records);
  };

  const markAllAbsent = () => {
    const records: {[key: string]: boolean} = {};
    group.members?.forEach((m: any) => {
      records[m.member.id] = false;
    });
    setAttendanceRecords(records);
  };

  const handleFormClose = () => {
    setShowForm(false);
    loadGroup();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!group) return null;

  // Filter out leader from members list and available members
  const groupMembersWithoutLeader = group.members?.filter(
    (membership: any) => membership.member.id !== group.leaderId
  ) || [];

  const availableMembers = allMembers.filter(
    m => !group.members?.some((gm: any) => gm.member.id === m.id)
  );

  const presentCount = Object.values(attendanceRecords).filter(Boolean).length;
  const totalMembersCount = group.members?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/small-groups')}
          className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Small Groups</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAttendanceForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Group</span>
          </button>
        </div>
      </div>

      {/* Group Header Card */}
      <div className="card border-l-4 border-primary-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-secondary-900">{group.groupName}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                group.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {group.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {group.meetingDay && (
                <div className="flex items-center text-secondary-600">
                  <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                  <span>{group.meetingDay}</span>
                </div>
              )}
              {group.meetingTime && (
                <div className="flex items-center text-secondary-600">
                  <Clock className="w-4 h-4 mr-2 text-primary-500" />
                  <span>{group.meetingTime}</span>
                </div>
              )}
              {group.meetingLocation && (
                <div className="flex items-center text-secondary-600">
                  <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                  <span>{group.meetingLocation}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-4xl font-bold text-primary-600">{totalMembersCount}</p>
            <p className="text-secondary-500">Members</p>
          </div>
        </div>
      </div>

      {/* Leader Card */}
      {group.leaderMember && (
        <div className="card bg-gradient-to-br from-primary-50 to-orange-50 border-primary-200">
          <h3 className="text-lg font-bold text-secondary-900 mb-3 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-primary-500" />
            Group Leader
          </h3>
          <div 
            className="flex items-center space-x-4 p-3 bg-white rounded-xl cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/members/${group.leaderMember.id}`)}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
              {group.leaderMember.firstName[0]}{group.leaderMember.lastName[0]}
            </div>
            <div>
              <p className="font-bold text-secondary-900 text-lg">
                {group.leaderMember.firstName} {group.leaderMember.lastName}
              </p>
              <p className="text-sm text-secondary-500">
                {group.leaderMember.phonePrimary || group.leaderMember.email || 'No contact info'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members List - Takes 2 columns */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-secondary-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-500" />
              Group Members ({groupMembersWithoutLeader.length})
            </h3>
            <button 
              onClick={() => setShowAddMember(true)}
              className="btn-secondary text-sm flex items-center space-x-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
          
          {groupMembersWithoutLeader.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groupMembersWithoutLeader.map((membership: any) => (
                <div 
                  key={membership.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div 
                    className="flex items-center space-x-3 cursor-pointer flex-1"
                    onClick={() => navigate(`/members/${membership.member.id}`)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {membership.member.firstName[0]}{membership.member.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">
                        {membership.member.firstName} {membership.member.lastName}
                      </p>
                      <p className="text-xs text-secondary-500">{membership.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(membership.member.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No members besides the leader</p>
              <p className="text-sm mt-1">Click "Add Member" to add members to this group</p>
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="card">
          <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center">
            <History className="w-5 h-5 mr-2 text-primary-500" />
            Recent Attendance
          </h3>
          
          {attendanceHistory.length > 0 ? (
            <div className="space-y-3">
              {attendanceHistory.slice(0, 10).map((attendance: any) => (
                <div key={attendance.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-secondary-900">
                      {new Date(attendance.meetingDate).toLocaleDateString()}
                    </p>
                    <span className="text-sm font-bold text-primary-600">
                      {attendance.totalAttendance}/{totalMembersCount}
                    </span>
                  </div>
                  {attendance.meetingTopic && (
                    <p className="text-sm text-secondary-500">{attendance.meetingTopic}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No attendance records yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-hard animate-scale-up max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-secondary-900">Add Member to Group</h2>
                <button
                  onClick={() => setShowAddMember(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {availableMembers.length > 0 ? (
                <div className="space-y-2">
                  {availableMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleAddMember(member.id)}
                      className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border-2 border-transparent transition-all text-left"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-secondary-500">{member.membershipStatus}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-secondary-300 mb-2" />
                  <p className="text-secondary-500">All members are already in this group</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mark Attendance Modal */}
      {showAttendanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-hard animate-scale-up max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-secondary-900">Mark Weekly Attendance</h2>
                <button
                  onClick={() => setShowAttendanceForm(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmitAttendance}>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Meeting Date *</label>
                    <input
                      type="date"
                      className="input"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Topic/Theme</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Prayer Meeting"
                      value={meetingTopic}
                      onChange={(e) => setMeetingTopic(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label mb-0">
                      Members Present ({presentCount}/{totalMembersCount})
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={markAllPresent}
                        className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Mark All Present
                      </button>
                      <button
                        type="button"
                        onClick={markAllAbsent}
                        className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Mark All Absent
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-3">
                    {group.members?.map((membership: any) => {
                      const isLeader = membership.member.id === group.leaderId;
                      return (
                        <button
                          key={membership.member.id}
                          type="button"
                          onClick={() => toggleAttendance(membership.member.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                            attendanceRecords[membership.member.id]
                              ? 'bg-green-100 border-2 border-green-400'
                              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                              attendanceRecords[membership.member.id]
                                ? 'bg-green-500'
                                : isLeader 
                                  ? 'bg-primary-500'
                                  : 'bg-secondary-400'
                            }`}>
                              {membership.member.firstName[0]}{membership.member.lastName[0]}
                            </div>
                            <div className="text-left">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-secondary-900">
                                  {membership.member.firstName} {membership.member.lastName}
                                </span>
                                {isLeader && (
                                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full flex items-center">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Leader
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {attendanceRecords[membership.member.id] ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-secondary-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label">Notes (optional)</label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Any notes about this meeting..."
                    value={attendanceNotes}
                    onChange={(e) => setAttendanceNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAttendanceForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && <SmallGroupForm group={group} onClose={handleFormClose} />}
    </div>
  );
}