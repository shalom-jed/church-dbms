import { Router } from 'express';
import * as AttendanceController from '../controllers/attendance.controller';
import { protect, restrictTo, sgLeaderOnly } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Sunday Service
router.post('/sunday', restrictTo('ADMIN'), AttendanceController.createSundayService);
router.get('/sunday', AttendanceController.getSundayServices);
router.get('/sunday/:id', AttendanceController.getSundayServiceById);
router.put('/sunday/:id', restrictTo('ADMIN'), AttendanceController.updateSundayService);
router.delete('/sunday/:id', restrictTo('ADMIN'), AttendanceController.deleteSundayService);
router.post('/sunday/:serviceId/record', restrictTo('ADMIN'), AttendanceController.recordSundayAttendance);

// Small Group
router.post('/small-group', sgLeaderOnly, AttendanceController.recordSmallGroupAttendance);
router.get('/small-group/:groupId', AttendanceController.getSmallGroupAttendance);
router.delete('/small-group/:id', restrictTo('ADMIN'), AttendanceController.deleteSmallGroupAttendance);

// Department
router.post('/department', restrictTo('ADMIN'), AttendanceController.recordDepartmentAttendance);
router.get('/department/:departmentId', AttendanceController.getDepartmentAttendance);
router.delete('/department/:id', restrictTo('ADMIN'), AttendanceController.deleteDepartmentAttendance);

export default router;