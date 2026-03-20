import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { departmentService } from '../services/department.service';
import type { Department } from '../services/department.service';
import { attendanceService } from '../services/attendance.service';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Users, Calendar, Edit, UserPlus, X, 
  CheckCircle, XCircle, History, Building2, Crown, Trash2
} from 'lucide-react';

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<any>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingPurpose, setMeetingPurpose] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<{[key: string]: boolean}>({});
  const [attendanceNotes, setAttendanceNotes] = useState('');

  const [editData, setEditData] = useState({
    departmentName: '',
    description: '',
    meetingSchedule: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (id) {
      loadDepartment();
      loadAllMembers();
      loadAttendanceHistory();
    }
  }, [id]);

  const loadDepartment = async () => {
    try {
      setLoading(true);
      const data = await departmentService.getById(id!);
      setDepartment(data);

      const records: {[key: string]: boolean} = {};
      data.members?.forEach((m: any) => {
        records[m.member.id] = false;
      });
      setAttendanceRecords(records);

      setEditData({
        departmentName: data.departmentName,
        description: data.description || '',
        meetingSchedule: data.meetingSchedule || '',
        status: data.status,
      });
    } catch (error) {
      toast.error('Failed to load department');
      navigate('/departments');
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
      const data = await attendanceService.getDepartmentAttendance(id!);
      setAttendanceHistory(data);
    } catch (error) {
      console.error('Failed to load attendance');
    }
  };

  const handleAddMember = async (memberId: string) => {
    try {
      await departmentService.addMember(id!, memberId);
      toast.success('Member added to department');
      loadDepartment();
      setShowAddMember(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the department?')) return;
    try {
      await departmentService.removeMember(id!, memberId);
      toast.success('Member removed');
      loadDepartment();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await departmentService.update(id!, editData);
      toast.success('Department updated');
      setShowEditForm(false);
      loadDepartment();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update');
    }
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (!confirm('Delete this attendance record?')) return;
    try {
      await attendanceService.deleteDepartmentAttendance(attendanceId);
      toast.success('Attendance deleted');
      loadAttendanceHistory();
    } catch (error: any) {
      toast.error('Failed to delete attendance');
    }
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const attendees = Object.entries(attendanceRecords).map(([memberId, present]) => ({
        memberId, present,
      }));

      await attendanceService.recordDepartmentAttendance({
        departmentId: id,
        meetingDate: attendanceDate,
        meetingPurpose,
        notes: attendanceNotes,
        attendees,
      });

      toast.success('Attendance recorded!');
      setShowAttendanceForm(false);
      setMeetingPurpose('');
      setAttendanceNotes('');
      loadAttendanceHistory();

      const records: {[key: string]: boolean} = {};
      department.members?.forEach((m: any) => {
        records[m.member.id] = false;
      });
      setAttendanceRecords(records);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record attendance');
    }
  };

  const toggleAttendance = (memberId: string) => {
    setAttendanceRecords(prev => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const markAllPresent = () => {
    const records: {[key: string]: boolean} = {};
    department.members?.forEach((m: any) => { records[m.member.id] = true; });
    setAttendanceRecords(records);
  };

  const markAllAbsent = () => {
    const records: {[key: string]: boolean} = {};
    department.members?.forEach((m: any) => { records[m.member.id] = false; });
    setAttendanceRecords(records);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!department) return null;

  const deptMembersWithoutHead = department.members?.filter(
    (m: any) => m.member.id !== department.headId
  ) || [];

  const availableMembers = allMembers.filter(
    m => !department.members?.some((dm: any) => dm.member.id === m.id)
  );

  const presentCount = Object.values(attendanceRecords).filter(Boolean).length;
  const totalMembersCount = department.members?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/departments')} className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Departments</span>
        </button>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowAttendanceForm(true)} className="btn-primary flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
          <button onClick={() => setShowEditForm(true)} className="btn-secondary flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Department Header */}
      <div className="card border-l-4 border-primary-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-secondary-900">{department.departmentName}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${department.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {department.status}
              </span>
            </div>
            {department.description && <p className="text-secondary-600 mt-2">{department.description}</p>}
            {department.meetingSchedule && (
              <div className="flex items-center text-secondary-600 mt-2">
                <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                <span>{department.meetingSchedule}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-primary-600">{totalMembersCount}</p>
            <p className="text-secondary-500">Members</p>
          </div>
        </div>
      </div>

      {/* Head Card */}
      {department.head && (
        <div className="card bg-gradient-to-br from-primary-50 to-orange-50 border-primary-200">
          <h3 className="text-lg font-bold text-secondary-900 mb-3 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-primary-500" />
            Department Head
          </h3>
          <div className="flex items-center space-x-4 p-3 bg-white rounded-xl cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/members/${department.head.id}`)}>
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
              {department.head.firstName[0]}{department.head.lastName[0]}
            </div>
            <div>
              <p className="font-bold text-secondary-900 text-lg">{department.head.firstName} {department.head.lastName}</p>
              <p className="text-sm text-secondary-500">{department.head.phonePrimary || department.head.email || ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-secondary-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-500" />
              Members ({deptMembersWithoutHead.length})
            </h3>
            <button onClick={() => setShowAddMember(true)} className="btn-secondary text-sm flex items-center space-x-1">
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>

          {deptMembersWithoutHead.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {deptMembersWithoutHead.map((membership: any) => (
                <div key={membership.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => navigate(`/members/${membership.member.id}`)}>
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {membership.member.firstName[0]}{membership.member.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{membership.member.firstName} {membership.member.lastName}</p>
                      <p className="text-xs text-secondary-500">{membership.role}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveMember(membership.member.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No members besides the head</p>
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="card">
          <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center">
            <History className="w-5 h-5 mr-2 text-primary-500" />
            Meeting Attendance
          </h3>

          {attendanceHistory.length > 0 ? (
            <div className="space-y-3">
              {attendanceHistory.slice(0, 10).map((attendance: any) => {
                const presentMembers = attendance.records?.filter((r: any) => r.present) || [];
                const absentMembers = attendance.records?.filter((r: any) => !r.present) || [];
                return (
                  <details key={attendance.id} className="bg-gray-50 rounded-xl overflow-hidden">
                    <summary className="p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-secondary-900">{new Date(attendance.meetingDate).toLocaleDateString()}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-primary-600">{attendance.totalAttendance}/{totalMembersCount}</span>
                          <button onClick={(e) => { e.preventDefault(); handleDeleteAttendance(attendance.id); }} className="p-1 text-red-500 hover:bg-red-100 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {attendance.meetingPurpose && <p className="text-sm text-secondary-500 mt-1">{attendance.meetingPurpose}</p>}
                    </summary>
                    <div className="px-3 pb-3 border-t border-gray-200 mt-1 pt-2">
                      {presentMembers.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-bold text-green-600 mb-1 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />Present ({presentMembers.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {presentMembers.map((r: any) => (
                              <span key={r.id} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{r.member?.firstName} {r.member?.lastName}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {absentMembers.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-red-600 mb-1 flex items-center">
                            <XCircle className="w-3 h-3 mr-1" />Absent ({absentMembers.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {absentMembers.map((r: any) => (
                              <span key={r.id} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">{r.member?.firstName} {r.member?.lastName}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No attendance records</p>
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
                <h2 className="text-xl font-bold text-secondary-900">Add Member</h2>
                <button onClick={() => setShowAddMember(false)} className="text-secondary-400 hover:text-secondary-600"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {availableMembers.length > 0 ? (
                <div className="space-y-2">
                  {availableMembers.map((member) => (
                    <button key={member.id} onClick={() => handleAddMember(member.id)} className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 border-2 border-transparent hover:border-primary-200 transition-all text-left">
                      <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">{member.firstName[0]}{member.lastName[0]}</div>
                      <div>
                        <p className="font-medium text-secondary-900">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-secondary-500">{member.membershipStatus}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-secondary-500 py-8">All members are already in this department</p>
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
                <h2 className="text-xl font-bold text-secondary-900">Mark Meeting Attendance</h2>
                <button onClick={() => setShowAttendanceForm(false)} className="text-secondary-400 hover:text-secondary-600"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <form onSubmit={handleSubmitAttendance}>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Meeting Date *</label>
                    <input type="date" className="input" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Meeting Purpose</label>
                    <input type="text" className="input" placeholder="e.g., Weekly rehearsal" value={meetingPurpose} onChange={(e) => setMeetingPurpose(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label mb-0">Members ({presentCount}/{totalMembersCount})</label>
                    <div className="flex space-x-2">
                      <button type="button" onClick={markAllPresent} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">All Present</button>
                      <button type="button" onClick={markAllAbsent} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">All Absent</button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-3">
                    {department.members?.map((membership: any) => {
                      const isHead = membership.member.id === department.headId;
                      return (
                        <button key={membership.member.id} type="button" onClick={() => toggleAttendance(membership.member.id)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${attendanceRecords[membership.member.id] ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${attendanceRecords[membership.member.id] ? 'bg-green-500' : isHead ? 'bg-primary-500' : 'bg-secondary-400'}`}>
                              {membership.member.firstName[0]}{membership.member.lastName[0]}
                            </div>
                            <div className="text-left">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-secondary-900">{membership.member.firstName} {membership.member.lastName}</span>
                                {isHead && <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full flex items-center"><Crown className="w-3 h-3 mr-1" />Head</span>}
                              </div>
                            </div>
                          </div>
                          {attendanceRecords[membership.member.id] ? <CheckCircle className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-secondary-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea className="input" rows={2} value={attendanceNotes} onChange={(e) => setAttendanceNotes(e.target.value)} />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAttendanceForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-hard animate-scale-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-secondary-900">Edit Department</h2>
                <button onClick={() => setShowEditForm(false)} className="text-secondary-400 hover:text-secondary-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleUpdateDepartment} className="space-y-4">
                <div>
                  <label className="label">Department Name *</label>
                  <input type="text" className="input" value={editData.departmentName} onChange={(e) => setEditData({...editData, departmentName: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} />
                </div>
                <div>
                  <label className="label">Meeting Schedule</label>
                  <input type="text" className="input" value={editData.meetingSchedule} onChange={(e) => setEditData({...editData, meetingSchedule: e.target.value})} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={editData.status} onChange={(e) => setEditData({...editData, status: e.target.value})}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowEditForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}