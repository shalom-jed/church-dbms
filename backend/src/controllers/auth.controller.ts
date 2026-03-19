import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  static register = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  });

  static changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    const result = await AuthService.changePassword(
      req.user!.id,
      oldPassword,
      newPassword
    );

    res.json({
      success: true,
      message: result.message,
    });
  });

  static getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      data: req.user,
    });
  });
}