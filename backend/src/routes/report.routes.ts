import { Router } from 'express';
import * as ReportController from '../controllers/report.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/dashboard', ReportController.getDashboardStats);
router.get('/membership', ReportController.getMembershipReport);
router.get('/attendance', ReportController.getAttendanceReport);
router.get('/absentees', ReportController.getAbsenteeReport);

export default router;