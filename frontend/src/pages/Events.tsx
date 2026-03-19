import { useState, useEffect } from 'react';
import { eventService } from '../services/event.service';
import toast from 'react-hot-toast';

export default function Events() {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventService.delete(id);
      toast.success('Event deleted successfully');
      loadEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const handleEdit = (event: any) => {
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
        <h1 className="text-3xl font-bold">Events</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Event
        </button>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{event.eventName}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      event.status === 'UPCOMING'
                        ? 'bg-blue-100 text-blue-800'
                        : event.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p>
                      <strong>Date:</strong>{' '}
                      {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                    {event.eventTime && (
                      <p>
                        <strong>Time:</strong> {event.eventTime}
                      </p>
                    )}
                    {event.venue && (
                      <p>
                        <strong>Venue:</strong> {event.venue}
                      </p>
                    )}
                  </div>
                  <div>
                    {event.expectedAttendance && (
                      <p>
                        <strong>Expected:</strong> {event.expectedAttendance}
                      </p>
                    )}
                    <p>
                      <strong>Actual:</strong> {event.actualAttendance}
                    </p>
                  </div>
                </div>

                {event.description && (
                  <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <button onClick={() => handleEdit(event)} className="btn-secondary text-sm">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500">No events found</div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
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
                      onChange={(e) =>
                        setFormData({ ...formData, eventDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Time</label>
                    <input
                      type="time"
                      className="input"
                      value={formData.eventTime}
                      onChange={(e) =>
                        setFormData({ ...formData, eventTime: e.target.value })
                      }
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
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="label">Expected Attendance</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.expectedAttendance}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedAttendance: e.target.value })
                    }
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