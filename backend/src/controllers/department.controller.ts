import { Response } from 'express';
import { DepartmentService } from '../services/department.service';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const departments = await DepartmentService.getAll();

  res.json({
    success: true,
    data: departments,
  });
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const department = await DepartmentService.getById(req.params.id);

  res.json({
    success: true,
    data: department,
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const department = await DepartmentService.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: department,
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const department = await DepartmentService.update(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Department updated successfully',
    data: department,
  });
});

export const deleteDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await DepartmentService.delete(req.params.id);

  res.json({
    success: true,
    message: result.message,
  });
});

export const addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { memberId, role } = req.body;
  const membership = await DepartmentService.addMember(req.params.id, memberId, role);

  res.status(201).json({
    success: true,
    message: 'Member added to department',
    data: membership,
  });
});

export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await DepartmentService.removeMember(req.params.id, req.params.memberId);

  res.json({
    success: true,
    message: result.message,
  });
});