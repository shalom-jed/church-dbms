import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/event.service';
import { memberService } from '../services/member.service';
import type { Member } from '../services/member.service';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Edit, Plus, Trash2, CheckCircle, XCircle, X, Wallet } from 'lucide-react';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<any>({ expenses: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [expenseData, setExpenseData] = useState({ expenseCategory: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (id) { loadEvent(); loadMembers(); loadExpenses(); }
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await eventService.getById(id!);
      setEvent(data);
      const attendedIds = data.attendance?.map((a: any) => a.memberId).filter(Boolean) || [];
      setSelectedMembers(attendedIds);
    } catch (error) {
      toast.error('Failed to load event');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try { const data = await memberService.getAll(); setMembers(data); } catch (error) { console.error('Failed to load members'); }
  };

  const loadExpenses = async () => {
    try { const data = await eventService.getExpenses(id!); setExpenses(data); } catch (error) { console.error('Failed to load expenses'); }
  };

  const handleRecordAttendance = async () => {
    try {
      const attendees = selectedMembers.map(memberId => ({ memberId }));
      await eventService.recordAttendance(id!, attendees);
      toast.success('Attendance recorded');
      setShowAttendance(false);
      loadEvent();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record attendance');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventService.addExpense(id!, { ...expenseData, amount: parseFloat(expenseData.amount) });
      toast.success('Expense added');
      setShowExpenseForm(false);
      setExpenseData({ expenseCategory: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      loadExpenses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add expense');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this event?')) return;
    try {
      await eventService.delete(id!);
      toast.success('Event deleted');
      navigate('/events');
    } catch (error: any) {
      toast.error('Failed to delete event');
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]);
  };

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>);
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/events')} className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 transition-colors">
          <ArrowLeft className="w-5 h-5" /><span>Back to Events</span>
        </button>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowAttendance(true)} className="btn-primary flex items-center space-x-2"><CheckCircle className="w-4 h-4" /><span>Record Attendance</span></button>
          <button onClick={handleDelete} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center space-x-2"><Trash2 className="w-4 h-4" /><span>Delete</span></button>
        </div>
      </div>

      {/* Event Info */}
      <div className="card border-l-4 border-primary-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-3xl font-bold text-secondary-900">{event.eventName}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${event.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' : event.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{event.status}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center text-secondary-600"><Calendar className="w-4 h-4 mr-2 text-primary-500" /><span>{new Date(event.eventDate).toLocaleDateString()}</span></div>
              {event.eventTime && <div className="flex items-center text-secondary-600"><Clock className="w-4 h-4 mr-2 text-primary-500" /><span>{event.eventTime}</span></div>}
              {event.venue && <div className="flex items-center text-secondary-600"><MapPin className="w-4 h-4 mr-2 text-primary-500" /><span>{event.venue}</span></div>}
              <div className="flex items-center text-secondary-600"><Users className="w-4 h-4 mr-2 text-primary-500" /><span>Attendance: {event.actualAttendance}</span></div>
            </div>
            {event.description && <p className="text-secondary-600 mt-4">{event.description}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance */}
        <div className="card">
          <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-primary-500" />Attendance ({event.attendance?.length || 0})</h3>
          {event.attendance?.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {event.attendance.map((record: any) => (
                <div key={record.id} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">{record.member?.firstName?.[0]}{record.member?.lastName?.[0]}</div>
                  <span className="text-sm font-medium text-secondary-900">{record.member?.firstName} {record.member?.lastName}</span>
                </div>
              ))}
            </div>
          ) : (<p className="text-secondary-500 text-center py-8">No attendance recorded</p>)}
        </div>

        {/* Expenses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-secondary-900 flex items-center"><Wallet className="w-5 h-5 mr-2 text-primary-500" />Expenses (LKR {expenses.total?.toLocaleString() || 0})</h3>
            <button onClick={() => setShowExpenseForm(true)} className="btn-secondary text-sm flex items-center space-x-1"><Plus className="w-4 h-4" /><span>Add</span></button>
          </div>
          {expenses.expenses?.length > 0 ? (
            <div className="space-y-2">
              {expenses.expenses.map((exp: any) => (
                <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-secondary-900">{exp.expenseCategory}</p>
                    <p className="text-xs text-secondary-500">{exp.description} · {new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-secondary-900">LKR {exp.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (<p className="text-secondary-500 text-center py-8">No expenses recorded</p>)}
        </div>
      </div>

      {/* Record Attendance Modal */}
      {showAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-hard animate-scale-up max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-secondary-900">Record Event Attendance</h2>
                <button onClick={() => setShowAttendance(false)} className="text-secondary-400 hover:text-secondary-600"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center justify-between mb-3">
                <label className="label mb-0">Select Attendees ({selectedMembers.length})</label>
                <div className="flex space-x-2">
                  <button onClick={() => setSelectedMembers(members.map(m => m.id))} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">Select All</button>
                  <button onClick={() => setSelectedMembers([])} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Clear All</button>
                </div>
              </div>
              <div className="space-y-2 border border-gray-200 rounded-xl p-3 max-h-64 overflow-y-auto">
                {members.map((member) => {
                  const isSelected = selectedMembers.includes(member.id);
                  return (
                    <button key={member.id} type="button" onClick={() => toggleMember(member.id)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isSelected ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${isSelected ? 'bg-green-500' : 'bg-secondary-400'}`}>{member.firstName[0]}{member.lastName[0]}</div>
                        <span className="font-medium text-secondary-900">{member.firstName} {member.lastName}</span>
                      </div>
                      {isSelected ? <CheckCircle className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-secondary-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button onClick={() => setShowAttendance(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleRecordAttendance} className="btn-primary">Save Attendance</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-hard animate-scale-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-secondary-900">Add Expense</h2>
                <button onClick={() => setShowExpenseForm(false)} className="text-secondary-400 hover:text-secondary-600"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div><label className="label">Category *</label><input type="text" className="input" placeholder="e.g., Venue, Food, Transport" value={expenseData.expenseCategory} onChange={(e) => setExpenseData({...expenseData, expenseCategory: e.target.value})} required /></div>
                <div><label className="label">Amount (LKR) *</label><input type="number" step="0.01" className="input" value={expenseData.amount} onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})} required /></div>
                <div><label className="label">Date *</label><input type="date" className="input" value={expenseData.date} onChange={(e) => setExpenseData({...expenseData, date: e.target.value})} required /></div>
                <div><label className="label">Description</label><textarea className="input" rows={2} value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})} /></div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowExpenseForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Add Expense</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}