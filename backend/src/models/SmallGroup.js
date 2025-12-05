const mongoose = require('mongoose');
const smallGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    location: { type: String },
    meetingDay: { type: String }, // e.g. Sunday
    meetingTime: { type: String }, // e.g. 18:00
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
    notes: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model('SmallGroup', smallGroupSchema);