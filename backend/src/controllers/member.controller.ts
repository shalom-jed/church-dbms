import { Response } from 'express';
import { MemberService } from '../services/member.service';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const members = await MemberService.getAll(req.query);

  res.json({
    success: true,
    data: members,
  });
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const member = await MemberService.getById(req.params.id);

  res.json({
    success: true,
    data: member,
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const member = await MemberService.create(req.body, req.user!.id);

  res.status(201).json({
    success: true,
    message: 'Member created successfully',
    data: member,
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const member = await MemberService.update(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Member updated successfully',
    data: member,
  });
});

export const deleteMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await MemberService.delete(req.params.id);

  res.json({
    success: true,
    message: result.message,
  });
});

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await MemberService.getStats();

  res.json({
    success: true,
    data: stats,
  });
});