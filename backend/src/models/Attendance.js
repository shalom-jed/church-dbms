const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    smallGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'SmallGroup' },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    status: { type: String, enum: ['present', 'absent'], default: 'present' },
    notes: { type: String },
  },
  { timestamps: true }
);
attendanceSchema.index({ date: 1, member: 1, smallGroup: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', attendanceSchema);