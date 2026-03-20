import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';
import { Calendar, Users, Plus, CheckCircle, XCircle, ChevronDown, ChevronUp, Trash2, Edit } from 'lucide-react';

export default function Attendance() {
  const [services, setServices] = useState<any[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [serviceDate, setServiceDate] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<any>(null);

  useEffect(() => {
    loadServices();
    loadMembers();
  }, []);

  const loadServices = async () => {
    try {
      const data = await attendanceService.getSundayServices(20);
      setServices(data);
    } catch (error) {
      console.error('Failed to load services');
    }
  };

  const loadMembers = async () => {
    try {
      const data = await memberService.getAll();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let serviceId: string;

      if (editingService) {
        // Update existing service
        await attendanceService.updateSundayService(editingService.id, {
          notes: serviceNotes,
        });
        serviceId = editingService.id;
      } else {
        // Create new service
        const service = await attendanceService.createSundayService({
          serviceDate,
          notes: serviceNotes,
        });
        serviceId = service.id;
      }

      // Record attendance
      const attendees = selectedMembers.map((memberId) => ({ memberId }));
      await attendanceService.recordSundayAttendance(serviceId, attendees);

      toast.success(editingService ? 'Attendance updated successfully' : 'Attendance recorded successfully');
      setShowForm(false);
      resetForm();
      loadServices();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setServiceDate(service.serviceDate.split('T')[0]);
    setServiceNotes(service.notes || '');
    const attendedIds = service.attendanceRecords?.map((r: any) => r.member?.id).filter(Boolean) || [];
    setSelectedMembers(attendedIds);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service and all its attendance records?')) return;

    try {
      await attendanceService.deleteSundayService(id);
      toast.success('Service deleted successfully');
      loadServices();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete service');
    }
  };

  const resetForm = () => {
    setServiceDate('');
    setServiceNotes('');
    setSelectedMembers([]);
    setEditingService(null);
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleExpand = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Sunday Service Attendance</h1>
          <p className="text-secondary-500 mt-1">{services.length} services recorded</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Record Attendance</span>
        </button>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {services.map((service) => {
          const isExpanded = expandedService === service.id;
          const attendedMembers = service.attendanceRecords?.filter((r: any) => r.member) || [];
          const attendedMemberIds = attendedMembers.map((r: any) => r.member?.id);
          const absentMembers = members.filter(m => !attendedMemberIds.includes(m.id));

          return (
            <div key={service.id} className="card">
              {/* Service Header */}
              <div className="flex justify-between items-center">
                <div
                  className="flex items-center space-x-4 flex-1 cursor-pointer"
                  onClick={() => toggleExpand(service.id)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-secondary-900 text-lg">
                      {new Date(service.serviceDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-secondary-600 mt-1">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Total: <strong className="ml-1">{service.totalAttendance}</strong>
                      </span>
                      <span className="text-green-600">Members: {service.membersCount}</span>
                      <span className="text-blue-600">Visitors: {service.visitorsCount}</span>
                    </div>
                    {service.notes && <p className="text-sm text-secondary-500 mt-1">{service.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {service.totalAttendance} attended
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(service); }}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit attendance"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(service.id); }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleExpand(service.id)} className="p-2">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-secondary-400" /> : <ChevronDown className="w-5 h-5 text-secondary-400" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-200 animate-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Present */}
                    <div>
                      <h4 className="font-bold text-green-700 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Present ({attendedMembers.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {attendedMembers.map((record: any) => (
                          <div key={record.id} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {record.member?.firstName?.[0]}{record.member?.lastName?.[0]}
                            </div>
                            <span className="text-sm font-medium text-secondary-900">
                              {record.member?.firstName} {record.member?.lastName}
                            </span>
                          </div>
                        ))}
                        {attendedMembers.length === 0 && (
                          <p className="text-sm text-secondary-500 py-4 text-center">No members recorded</p>
                        )}
                      </div>
                    </div>

                    {/* Absent */}
                    <div>
                      <h4 className="font-bold text-red-700 mb-3 flex items-center">
                        <XCircle className="w-5 h-5 mr-2" />
                        Absent ({absentMembers.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {absentMembers.map((member) => (
                          <div key={member.id} className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                            <div className="w-8 h-8 bg-red-400 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {member.firstName[0]}{member.lastName[0]}
                            </div>
                            <span className="text-sm font-medium text-secondary-900">
                              {member.firstName} {member.lastName}
                            </span>
                          </div>
                        ))}
                        {absentMembers.length === 0 && (
                          <p className="text-sm text-secondary-500 py-4 text-center">Everyone was present! 🎉</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {services.length === 0 && (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
            <p className="text-secondary-500">No attendance records found</p>
          </div>
        )}
      </div>

      {/* Record/Edit Attendance Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-hard animate-scale-up">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-secondary-900">
                  {editingService ? 'Edit Attendance' : 'Record Sunday Attendance'}
                </h2>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="text-secondary-400 hover:text-secondary-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Service Date *</label>
                    <input
                      type="date"
                      className="input"
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                      required
                      disabled={!!editingService}
                    />
                  </div>
                  <div>
                    <label className="label">Notes</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Special Sunday"
                      value={serviceNotes}
                      onChange={(e) => setServiceNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label mb-0">
                      Select Members Present ({selectedMembers.length}/{members.length})
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMembers(members.map(m => m.id))}
                        className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMembers([])}
                        className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-3 max-h-64 overflow-y-auto space-y-2">
                    {members.map((member) => {
                      const isSelected = selectedMembers.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => toggleMember(member.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-green-100 border-2 border-green-400'
                              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                              isSelected ? 'bg-green-500' : 'bg-secondary-400'
                            }`}>
                              {member.firstName[0]}{member.lastName[0]}
                            </div>
                            <span className="font-medium text-secondary-900">
                              {member.firstName} {member.lastName}
                            </span>
                          </div>
                          {isSelected ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-secondary-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary" disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingService ? 'Update Attendance' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}