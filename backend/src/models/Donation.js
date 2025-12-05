const mongoose = require('mongoose');
const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['tithe', 'offering', 'special'], required: true },
    date: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Donation', donationSchema);