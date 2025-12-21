const bcrypt = require('bcryptjs');
const { Types } = require('mongoose');
const User = require('../models/User');
const Member = require('../models/Member');
const SmallGroup = require('../models/SmallGroup');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Donation = require('../models/Donation');
const cloudinary = require('../config/cloudinary');
const { generateToken } = require('../utils/jwt');
const { sendCsv } = require('../utils/csv');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ===== Auth Controllers =====
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const match = await user.matchPassword(password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = generateToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const seedAdmin = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ role: 'admin' });
  if (existing) return res.json({ message: 'Admin already exists' });
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@church.local',
    password: 'Admin123!@#',
    role: 'admin',
  });
  res.json({ message: 'Admin created', admin: { id: admin._id, email: admin.email } });
});

// ===== Member Controllers =====
const createMember = asyncHandler(async (req, res) => {
  const { profilePhotoBase64, ...rest } = req.body;
  let profilePhotoUrl;
  if (profilePhotoBase64) {
    const uploaded = await cloudinary.uploader.upload(profilePhotoBase64, {
      folder: 'church/members',
      resource_type: 'image',
    });
    profilePhotoUrl = uploaded.secure_url;
  }
  const member = await Member.create({ ...rest, profilePhotoUrl });
  res.status(201).json(member);
});

const getMembers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    gender,
    ministry,
    smallGroup,
  } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (gender) filter.gender = gender;
  if (ministry) filter.ministry = ministry;
  if (smallGroup) filter.smallGroup = smallGroup;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Member.find(filter)
      .populate('smallGroup', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Member.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

const getMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id).populate('smallGroup');
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.json(member);
});

const updateMember = asyncHandler(async (req, res) => {
  const { profilePhotoBase64, ...rest } = req.body;
  const update = { ...rest };
  if (profilePhotoBase64) {
    const uploaded = await cloudinary.uploader.upload(profilePhotoBase64, {
      folder: 'church/members',
      resource_type: 'image',
    });
    update.profilePhotoUrl = uploaded.secure_url;
  }
  const member = await Member.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.json(member);
});

const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findByIdAndDelete(req.params.id);
  if (!member) return res.status(404).json({ message: 'Member not found' });
  res.json({ message: 'Member deleted' });
});

const importMembers = asyncHandler(async (req, res) => {
  // Expect array of JSON objects (already parsed from CSV on frontend)
  const { rows } = req.body; // [{ fullName, gender, ... }]
  if (!Array.isArray(rows)) return res.status(400).json({ message: 'rows must be array' });
  const created = await Member.insertMany(rows);
  res.json({ inserted: created.length });
});

const exportMembers = asyncHandler(async (req, res) => {
  const members = await Member.find().populate('smallGroup', 'name');
  const rows = members.map((m) => ({
    fullName: m.fullName,
    gender: m.gender,
    phone: m.phone,
    address: m.address,
    ministry: m.ministry,
    smallGroup: m.smallGroup ? m.smallGroup.name : '',
    profilePhotoUrl: m.profilePhotoUrl,
    createdAt: m.createdAt,
  }));
  const columns = [
    { header: 'Full Name', key: 'fullName' },
    { header: 'Gender', key: 'gender' },
    { header: 'Phone', key: 'phone' },
    { header: 'Address', key: 'address' },
    { header: 'Ministry', key: 'ministry' },
    { header: 'Small Group', key: 'smallGroup' },
    { header: 'Profile Photo URL', key: 'profilePhotoUrl' },
    { header: 'Created At', key: 'createdAt' },
  ];
  sendCsv(res, 'members.csv', columns, rows);
});

// ===== Small Group Controllers =====
const createGroup = asyncHandler(async (req, res) => {
  const group = await SmallGroup.create(req.body);
  res.status(201).json(group);
});

const getGroups = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  const groups = await SmallGroup.find(filter).populate('leader', 'fullName').populate('members', 'fullName');
  res.json(groups);
});

const updateGroup = asyncHandler(async (req, res) => {
  const group = await SmallGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!group) return res.status(404).json({ message: 'Group not found' });
  res.json(group);
});

// UPDATED: Deleting a group now unassigns members
const deleteGroup = asyncHandler(async (req, res) => {
  const group = await SmallGroup.findById(req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  // Remove this group ID from all members who were in it
  await Member.updateMany(
    { smallGroup: group._id },
    { $unset: { smallGroup: "" } }
  );

  await group.deleteOne();
  res.json({ message: 'Group deleted and members unassigned' });
});

// UPDATED: Assigns member to group AND updates member profile
const assignMemberToGroup = asyncHandler(async (req, res) => {
  const { memberId } = req.body;
  
  // 1. Add Member to the Group's "members" array
  const group = await SmallGroup.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { members: memberId } },
    { new: true }
  ).populate('members', 'fullName');

  if (!group) return res.status(404).json({ message: 'Group not found' });

  // 2. Set the Member's "smallGroup" field to this Group ID
  await Member.findByIdAndUpdate(memberId, { smallGroup: req.params.id });

  res.json(group);
});

// UPDATED: Removes member from group AND clears member profile
const removeMemberFromGroup = asyncHandler(async (req, res) => {
  const { memberId } = req.body;
  
  // 1. Remove Member from the Group's "members" array
  const group = await SmallGroup.findByIdAndUpdate(
    req.params.id,
    { $pull: { members: memberId } },
    { new: true }
  ).populate('members', 'fullName');

  if (!group) return res.status(404).json({ message: 'Group not found' });

  // 2. Clear the Member's "smallGroup" field
  await Member.findByIdAndUpdate(memberId, { $unset: { smallGroup: "" } });

  res.json(group);
});

// ===== Attendance Controllers =====
const markAttendance = asyncHandler(async (req, res) => {
  const { date, smallGroup, records } = req.body; // records: [{ member, status }]
  if (!date || !Array.isArray(records)) {
    return res.status(400).json({ message: 'date and records are required' });
  }
  const d = new Date(date);
  const ops = records.map((r) => ({
    updateOne: {
      filter: { date: d, smallGroup: smallGroup || null, member: r.member },
      update: { $set: { status: r.status || 'present' } },
      upsert: true,
    },
  }));
  if (!ops.length) return res.json({ message: 'No records' });
  await Attendance.bulkWrite(ops);
  res.json({ message: 'Attendance saved' });
});

const getAttendanceByDate = asyncHandler(async (req, res) => {
  const { date, smallGroup } = req.query;
  if (!date) return res.status(400).json({ message: 'date is required' });
  const filter = { date: new Date(date) };
  if (smallGroup) filter.smallGroup = smallGroup;
  const records = await Attendance.find(filter)
    .populate('member', 'fullName')
    .populate('smallGroup', 'name');
  res.json(records);
});

const getMemberAttendance = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = { member: req.params.memberId };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const records = await Attendance.find(filter).sort({ date: 1 });
  res.json(records);
});

// ===== Event Controllers =====
const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json(event);
});

const getEvents = asyncHandler(async (req, res) => {
  const { upcoming } = req.query;
  const now = new Date();
  const filter = {};
  if (upcoming === 'true') filter.date = { $gte: now };
  const events = await Event.find(filter).sort({ date: 1 });
  res.json(events);
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json({ message: 'Event deleted' });
});

// ===== Donation Controllers =====
const createDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.create(req.body);
  res.status(201).json(donation);
});

const getDonations = asyncHandler(async (req, res) => {
  const { from, to, type } = req.query;
  const filter = {};
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  if (type) filter.type = type;
  const donations = await Donation.find(filter).sort({ date: -1 });
  res.json(donations);
});

const updateDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!donation) return res.status(404).json({ message: 'Donation not found' });
  res.json(donation);
});

const deleteDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findByIdAndDelete(req.params.id);
  if (!donation) return res.status(404).json({ message: 'Donation not found' });
  res.json({ message: 'Donation deleted' });
});

const exportDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find().sort({ date: -1 });
  const rows = donations.map((d) => ({
    donorName: d.donorName,
    amount: d.amount,
    type: d.type,
    date: d.date,
  }));
  const columns = [
    { header: 'Donor Name', key: 'donorName' },
    { header: 'Amount', key: 'amount' },
    { header: 'Type', key: 'type' },
    { header: 'Date', key: 'date' },
  ];
  sendCsv(res, 'donations.csv', columns, rows);
});

// ===== Reports Controllers =====
const dashboardStats = asyncHandler(async (req, res) => {
  const [
    totalMembers,
    totalGroups,
    totalDonations,
    donationsByMonth,
    upcomingEvents,
    genderStats,
  ] = await Promise.all([
    Member.countDocuments(),
    SmallGroup.countDocuments(),
    Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Donation.aggregate([
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(5),
    Member.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]),
  ]);
  const attendanceTrend = await Attendance.aggregate([
    { $group: { _id: '$date', present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }, total: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({
    totalMembers,
    totalGroups,
    totalDonations: totalDonations[0]?.total || 0,
    donationsByMonth,
    upcomingEvents,
    genderStats,
    attendanceTrend,
  });
});

const memberReports = asyncHandler(async (req, res) => {
  const membersByMonth = await Member.aggregate([
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  const ageGroups = await Member.aggregate([
    {
      $project: {
        age: {
          $divide: [
            { $subtract: [new Date(), '$dateOfBirth'] },
            1000 * 60 * 60 * 24 * 365,
          ],
        },
      },
    },
    {
      $bucket: {
        groupBy: '$age',
        boundaries: [0, 18, 30, 45, 60, 120],
        default: 'Unknown',
        output: { count: { $sum: 1 } },
      },
    },
  ]);
  const genders = await Member.aggregate([
    { $group: { _id: '$gender', count: { $sum: 1 } } },
  ]);
  const byMinistry = await Member.aggregate([
    { $group: { _id: '$ministry', count: { $sum: 1 } } },
  ]);
  const byGroup = await Member.aggregate([
    { $group: { _id: '$smallGroup', count: { $sum: 1 } } },
  ]);
  res.json({ membersByMonth, ageGroups, genders, byMinistry, byGroup });
});

const attendanceReports = asyncHandler(async (req, res) => {
  const { from, to, smallGroup, ministry } = req.query;
  const match = {};
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);
  }
  if (smallGroup) match.smallGroup = new Types.ObjectId(smallGroup);
  const pipeline = [{ $match: match }];
  if (ministry) {
    pipeline.push({
      $lookup: {
        from: 'members',
        localField: 'member',
        foreignField: '_id',
        as: 'member',
      },
    });
    pipeline.push({ $unwind: '$member' });
    pipeline.push({ $match: { 'member.ministry': ministry } });
  }
  const daily = await Attendance.aggregate([
    ...pipeline,
    {
      $group: {
        _id: '$date',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const byGroup = await Attendance.aggregate([
    ...pipeline,
    {
      $group: {
        _id: '$smallGroup',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
  ]);
  const byMember = await Attendance.aggregate([
    ...pipeline,
    {
      $group: {
        _id: '$member',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
  ]);
  res.json({ daily, byGroup, byMember });
});

const donationReports = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const match = {};
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);
  }
  const totalByPeriod = await Donation.aggregate([
    { $match: match },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  const byType = await Donation.aggregate([
    { $match: match },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  const byDate = await Donation.aggregate([
    { $match: match },
    { $group: { _id: '$date', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
  ]);
  res.json({ totalByPeriod, byType, byDate });
});

const groupReports = asyncHandler(async (req, res) => {
  const groupSizes = await SmallGroup.aggregate([
    { $project: { name: 1, size: { $size: '$members' } } },
  ]);
  const attendanceByGroup = await Attendance.aggregate([
    {
      $group: {
        _id: '$smallGroup',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
  ]);
  res.json({ groupSizes, attendanceByGroup });
});

const eventReports = asyncHandler(async (req, res) => {
  const now = new Date();
  const upcoming = await Event.countDocuments({ date: { $gte: now } });
  const past = await Event.countDocuments({ date: { $lt: now } });
  const byMonth = await Event.aggregate([
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  res.json({ upcoming, past, byMonth });
});

module.exports = {
  // auth
  login,
  getMe,
  seedAdmin,
  // members
  createMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
  importMembers,
  exportMembers,
  // groups
  createGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  assignMemberToGroup,
  removeMemberFromGroup,
  // attendance
  markAttendance,
  getAttendanceByDate,
  getMemberAttendance,
  // events
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  // donations
  createDonation,
  getDonations,
  updateDonation,
  deleteDonation,
  exportDonations,
  // reports
  dashboardStats,
  memberReports,
  attendanceReports,
  donationReports,
  groupReports,
  eventReports,
};