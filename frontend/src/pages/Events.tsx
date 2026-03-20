import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/event.service';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, Users, Eye, PartyPopper, TrendingUp } from 'lucide-react';

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    description: '',
    expectedAttendance: '',
    status: 'UPCOMING',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      setEvents(data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const eventData = {
        ...formData,
        expectedAttendance: formData.expectedAttendance
          ? parseInt(formData.expectedAttendance)
          : undefined,
      };

      if (editingEvent) {
        await eventService.update(editingEvent.id, eventData);
        toast.success('Event updated successfully');
      } else {
        await eventService.create(eventData);
        toast.success('Event created successfully');
      }
      setShowForm(false);
      resetForm();
      loadEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save event');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventService.delete(id);
      toast.success('Event deleted successfully');
      loadEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const handleEdit = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setFormData({
      eventName: event.eventName,
      eventDate: event.eventDate.split('T')[0],
      eventTime: event.eventTime || '',
      venue: event.venue || '',
      description: event.description || '',
      expectedAttendance: event.expectedAttendance?.toString() || '',
      status: event.status,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      eventName: '',
      eventDate: '',
      eventTime: '',
      venue: '',
      description: '',
      expectedAttendance: '',
      status: 'UPCOMING',
    });
    setEditingEvent(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const upcomingEvents = events.filter(e => e.status === 'UPCOMING');
  const completedEvents = events.filter(e => e.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Events</h1>
          <p className="text-secondary-500 mt-1">{events.length} events</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Upcoming</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{upcomingEvents.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{completedEvents.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Events</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{events.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="card hover-lift cursor-pointer border-l-4 border-primary-500"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white">
                    <PartyPopper className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900">{event.eventName}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-secondary-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                    <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                  </div>
                  {event.eventTime && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-primary-500" />
                      <span>{event.eventTime}</span>
                    </div>
                  )}
                  {event.venue && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                      <span>{event.venue}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-primary-500" />
                    <span>
                      {event.actualAttendance > 0 ? `${event.actualAttendance} attended` : 'No attendance'}
                      {event.expectedAttendance ? ` / ${event.expectedAttendance} expected` : ''}
                    </span>
                  </div>
                </div>

                {event.description && (
                  <p className="mt-3 text-sm text-secondary-600 line-clamp-2">{event.description}</p>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/events/${event.id}`);
                  }}
                  className="btn-primary text-sm flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Details</span>
                </button>
                <button
                  onClick={(e) => handleEdit(event, e)}
                  className="px-3 py-2 btn-secondary text-sm"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(event.id, e)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="card text-center py-12">
          <PartyPopper className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
          <p className="text-secondary-500">No events found</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-hard animate-scale-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-secondary-900">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-secondary-400 hover:text-secondary-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Event Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Date *</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Time</label>
                    <input
                      type="time"
                      className="input"
                      value={formData.eventTime}
                      onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Venue</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Expected Attendance</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.expectedAttendance}
                      onChange={(e) => setFormData({ ...formData, expectedAttendance: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      className="input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="UPCOMING">Upcoming</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}