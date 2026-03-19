import { Router } from 'express';
import * as EventController from '../controllers/event.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', EventController.getAll);
router.get('/:id', EventController.getById);
router.post('/', restrictTo('ADMIN'), EventController.create);
router.put('/:id', restrictTo('ADMIN'), EventController.update);
router.delete('/:id', restrictTo('ADMIN'), EventController.deleteEvent);
router.post('/:id/attendance', restrictTo('ADMIN'), EventController.recordAttendance);
router.post('/:id/expenses', restrictTo('ADMIN'), EventController.addExpense);
router.get('/:id/expenses', EventController.getExpenses);

export default router;