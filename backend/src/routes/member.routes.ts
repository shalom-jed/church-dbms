import { Router } from 'express';
import * as MemberController from '../controllers/member.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', MemberController.getAll);
router.get('/stats', MemberController.getStats);
router.get('/:id', MemberController.getById);
router.post('/', restrictTo('ADMIN'), MemberController.create);
router.put('/:id', restrictTo('ADMIN'), MemberController.update);
router.delete('/:id', restrictTo('ADMIN'), MemberController.deleteMember);

export default router;