import { Response } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

// Sunday Service
export const createSundayService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await AttendanceService.createSundayService(req.body);
  res.status(201).json({ success: true, message: 'Sunday service created', data: service });
});

export const recordSundayAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const records = await AttendanceService.recordSundayAttendance(req.params.serviceId, req.body.attendees);
  res.status(201).json({ success: true, message: 'Attendance recorded', data: records });
});

export const getSundayServices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const services = await AttendanceService.getSundayServices(limit);
  res.json({ success: true, data: services });
});

export const getSundayServiceById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await AttendanceService.getSundayServiceById(req.params.id);
  res.json({ success: true, data: service });
});

export const updateSundayService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await AttendanceService.updateSundayService(req.params.id, req.body);
  res.json({ success: true, message: 'Sunday service updated', data: service });
});

export const deleteSundayService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await AttendanceService.deleteSundayService(req.params.id);
  res.json({ success: true, message: result.message });
});

// Small Group
export const recordSmallGroupAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const attendance = await AttendanceService.recordSmallGroupAttendance(req.body, req.user!.id);
  res.status(201).json({ success: true, message: 'Small group attendance recorded', data: attendance });
});

export const getSmallGroupAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const attendances = await AttendanceService.getSmallGroupAttendance(req.params.groupId, limit);
  res.json({ success: true, data: attendances });
});

export const deleteSmallGroupAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await AttendanceService.deleteSmallGroupAttendance(req.params.id);
  res.json({ success: true, message: result.message });
});

// Department
export const recordDepartmentAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const attendance = await AttendanceService.recordDepartmentAttendance(req.body);
  res.status(201).json({ success: true, message: 'Department attendance recorded', data: attendance });
});

export const getDepartmentAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const attendances = await AttendanceService.getDepartmentAttendance(req.params.departmentId, limit);
  res.json({ success: true, data: attendances });
});

export const deleteDepartmentAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await AttendanceService.deleteDepartmentAttendance(req.params.id);
  res.json({ success: true, message: result.message });
});