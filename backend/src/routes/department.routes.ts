import { Router } from 'express';
import * as DepartmentController from '../controllers/department.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', DepartmentController.getAll);
router.get('/:id', DepartmentController.getById);
router.post('/', restrictTo('ADMIN'), DepartmentController.create);
router.put('/:id', restrictTo('ADMIN'), DepartmentController.update);
router.delete('/:id', restrictTo('ADMIN'), DepartmentController.deleteDepartment);
router.post('/:id/members', restrictTo('ADMIN'), DepartmentController.addMember);
router.delete('/:id/members/:memberId', restrictTo('ADMIN'), DepartmentController.removeMember);

export default router;