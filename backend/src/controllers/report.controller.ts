import { Response } from 'express';
import { ReportService } from '../services/report.service';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await ReportService.getDashboardStats();

  res.json({
    success: true,
    data: stats,
  });
});

export const getMembershipReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const report = await ReportService.getMembershipReport();

  res.json({
    success: true,
    data: report,
  });
});

export const getAttendanceReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query;
  const report = await ReportService.getAttendanceReport(startDate as string, endDate as string);

  res.json({
    success: true,
    data: report,
  });
});