import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', protect, restrictTo('ADMIN'), AuthController.register);
router.post('/change-password', protect, AuthController.changePassword);
router.get('/me', protect, AuthController.getMe);

export default router;