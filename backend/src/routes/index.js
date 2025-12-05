const express = require('express');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const ctrl = require('../controllers');
const router = express.Router();
// ===== Auth =====
router.post(
  '/auth/login',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  validateRequest,
  ctrl.login
);
router.get('/auth/me', authenticate, ctrl.getMe);
router.post('/auth/seed-admin', ctrl.seedAdmin);
// ===== Members =====
router.post(
  '/members',
  authenticate,
  authorizeRoles('admin', 'pastor', 'editor'),
  [body('fullName').notEmpty(), body('gender').isIn(['male', 'female', 'other'])],
  validateRequest,
  ctrl.createMember
);
router.get('/members', authenticate, ctrl.getMembers);
router.get('/members/:id', authenticate, ctrl.getMember);
router.put(
  '/members/:id',
  authenticate,
  authorizeRoles('admin', 'pastor', 'editor'),
  ctrl.updateMember
);
router.delete(
  '/members/:id',
  authenticate,
  authorizeRoles('admin', 'pastor'),
  ctrl.deleteMember
);
router.post(
  '/members/import',
  authenticate,
  authorizeRoles('admin', 'pastor'),
  ctrl.importMembers
);
router.get(
  '/members/export',
  authenticate,
  authorizeRoles('admin', 'pastor'),
  ctrl.exportMembers
);
// ===== Small Groups =====
router.post(
  '/groups',
  authenticate,
  authorizeRoles('admin', 'pastor', 'editor'),
  [body('name').notEmpty()],
  validateRequest,
  ctrl.createGroup
);
router.get('/groups', authenticate, ctrl.getGroups);
router.put(
  '/groups/:id',
  authenticate,
  authorizeRoles('admin', 'pastor', 'editor'),
  ctrl.updateGroup
);
router.delete(
  '/groups/:id',
  authenticate,
  authorizeRoles('admin', 'pastor'),
  ctrl.deleteGroup
);
router.post(
  '/groups/:id/assign',
  authenticate,
  authorizeRoles('admin', 'pastor', 'editor'),
  [body('memberId').notEmpty()],
  validateRequest,
  ctrl.assignMemberToGroup
);
router.post(
  '/groups/:id/remove',
  authenticate,
  authorizeRoles('admin', 'pastor', 'editor'),
  [body('memberId').notEmpty()],
  validateRequest,
  ctrl.removeMemberFromGroup
);
// ===== Attendance =====
router.post(
  '/attendance',
  authenticate,
  authorizeRoles('admin', 'pastor', 'editor'),
  [body('date').notEmpty(), body('records').isArray()],
  validateRequest,
  ctrl.markAttendance
);
router.get('/attendance', authenticate, ctrl.getAttendanceByDate);
router.get('/attendance/member/:memberId', authenticate, ctrl.getMemberAttendance);
// ===== Events =====
router.post(
  '/events',
  authenticate,
  authorizeRoles('admin', 'pastor', 'editor'),
  [body('title').notEmpty(), body('date').notEmpty()],
  validateRequest,
  ctrl.createEvent
);
router.get('/events', authenticate, ctrl.getEvents);
router.put(
  '/events/:id',
  authenticate,
  authorizeRoles('admin', 'pastor', 'editor'),
  ctrl.updateEvent
);
router.delete(
  '/events/:id',
  authenticate,
  authorizeRoles('admin', 'pastor'),
  ctrl.deleteEvent
);
// ===== Donations =====
router.post(
  '/donations',
  authenticate,
  authorizeRoles('admin', 'pastor', 'editor'),
  [body('amount').isNumeric(), body('type').isIn(['tithe', 'offering', 'special']), body('date').notEmpty()],
  validateRequest,
  ctrl.createDonation
);
router.get('/donations', authenticate, ctrl.getDonations);
router.put(
  '/donations/:id',
  authenticate,
  authorizeRoles('admin', 'pastor', 'editor'),
  ctrl.updateDonation
);
router.delete(
  '/donations/:id',
  authenticate,
  authorizeRoles('admin', 'pastor'),
  ctrl.deleteDonation
);
router.get(
  '/donations/export',
  authenticate,
  authorizeRoles('admin', 'pastor'),
  ctrl.exportDonations
);
// ===== Reports =====
router.get('/reports/dashboard', authenticate, ctrl.dashboardStats);
router.get('/reports/members', authenticate, ctrl.memberReports);
router.get('/reports/attendance', authenticate, ctrl.attendanceReports);
router.get('/reports/donations', authenticate, ctrl.donationReports);
router.get('/reports/groups', authenticate, ctrl.groupReports);
router.get('/reports/events', authenticate, ctrl.eventReports);
module.exports = router;