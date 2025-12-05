const mongoose = require('mongoose');
const memberSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, index: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    phone: { type: String },
    address: { type: String },
    ministry: { type: String, index: true },
    smallGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'SmallGroup' },
    profilePhotoUrl: { type: String },
  },
  { timestamps: true }
);
memberSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});
memberSchema.set('toJSON', { virtuals: true });
memberSchema.set('toObject', { virtuals: true });
module.exports = mongoose.model('Member', memberSchema);