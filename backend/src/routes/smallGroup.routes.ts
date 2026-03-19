import { Router } from 'express';
import * as SmallGroupController from '../controllers/smallGroup.controller';
import { protect, restrictTo, sgLeaderOnly } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', SmallGroupController.getAll);
router.get('/:id', SmallGroupController.getById);
router.get('/:id/attendance-stats', SmallGroupController.getAttendanceStats);
router.post('/', restrictTo('ADMIN'), SmallGroupController.create);
router.put('/:id', restrictTo('ADMIN'), SmallGroupController.update);
router.delete('/:id', restrictTo('ADMIN'), SmallGroupController.deleteGroup);
router.post('/:id/members', restrictTo('ADMIN'), SmallGroupController.addMember);
router.delete('/:id/members/:memberId', restrictTo('ADMIN'), SmallGroupController.removeMember);

export default router;