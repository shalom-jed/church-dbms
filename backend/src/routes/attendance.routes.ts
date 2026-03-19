import { Router } from 'express';
import * as AttendanceController from '../controllers/attendance.controller';
import { protect, restrictTo, sgLeaderOnly } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// Sunday Service
router.post('/sunday', restrictTo('ADMIN'), AttendanceController.createSundayService);
router.post('/sunday/:serviceId', restrictTo('ADMIN'), AttendanceController.recordSundayAttendance);
router.get('/sunday', AttendanceController.getSundayServices);

// Small Group
router.post('/small-group', sgLeaderOnly, AttendanceController.recordSmallGroupAttendance);
router.get('/small-group/:groupId', AttendanceController.getSmallGroupAttendance);

// Department
router.post('/department', restrictTo('ADMIN'), AttendanceController.recordDepartmentAttendance);
router.get('/department/:departmentId', AttendanceController.getDepartmentAttendance);

export default router;