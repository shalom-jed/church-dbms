import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import { AppError } from './error.middleware';

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized to access this route', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      memberId: decoded.memberId,
      assignedGroupId: decoded.assignedGroupId,
    };

    next();
  } catch (error) {
    next(new AppError('Not authorized to access this route', 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

export const sgLeaderOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }

  const groupId = req.params.groupId || req.body.groupId;

  if (
    req.user.role === 'ADMIN' ||
    (req.user.role === 'SG_LEADER' && req.user.assignedGroupId === groupId)
  ) {
    return next();
  }

  return next(
    new AppError('Only group leaders can access this resource', 403)
  );
};