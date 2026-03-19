import { Response } from 'express';
import { SmallGroupService } from '../services/smallGroup.service';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const groups = await SmallGroupService.getAll();

  res.json({
    success: true,
    data: groups,
  });
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const group = await SmallGroupService.getById(req.params.id);

  res.json({
    success: true,
    data: group,
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const group = await SmallGroupService.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Small group created successfully',
    data: group,
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const group = await SmallGroupService.update(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Small group updated successfully',
    data: group,
  });
});

export const deleteGroup = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await SmallGroupService.delete(req.params.id);

  res.json({
    success: true,
    message: result.message,
  });
});

export const addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { memberId, role } = req.body;
  const membership = await SmallGroupService.addMember(req.params.id, memberId, role);

  res.status(201).json({
    success: true,
    message: 'Member added to group',
    data: membership,
  });
});

export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await SmallGroupService.removeMember(req.params.id, req.params.memberId);

  res.json({
    success: true,
    message: result.message,
  });
});

export const getAttendanceStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await SmallGroupService.getAttendanceStats(req.params.id);

  res.json({
    success: true,
    data: stats,
  });
});