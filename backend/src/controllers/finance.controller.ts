import { Response } from 'express';
import { FinanceService } from '../services/finance.service';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

// Income
export const getIncomeRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
  const records = await FinanceService.getIncomeRecords(req.query);

  res.json({
    success: true,
    data: records,
  });
});

export const createIncomeRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await FinanceService.createIncomeRecord(req.body);

  res.status(201).json({
    success: true,
    message: 'Income record created',
    data: record,
  });
});

export const getIncomeCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await FinanceService.getIncomeCategories();

  res.json({
    success: true,
    data: categories,
  });
});

export const createIncomeCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await FinanceService.createIncomeCategory(req.body);

  res.status(201).json({
    success: true,
    message: 'Income category created',
    data: category,
  });
});

// Expenses
export const getExpenseRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
  const records = await FinanceService.getExpenseRecords(req.query);

  res.json({
    success: true,
    data: records,
  });
});

export const createExpenseRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await FinanceService.createExpenseRecord(req.body);

  res.status(201).json({
    success: true,
    message: 'Expense record created',
    data: record,
  });
});

export const getExpenseCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await FinanceService.getExpenseCategories();

  res.json({
    success: true,
    data: categories,
  });
});

export const createExpenseCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await FinanceService.createExpenseCategory(req.body);

  res.status(201).json({
    success: true,
    message: 'Expense category created',
    data: category,
  });
});

// Pledges
export const getPledges = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pledges = await FinanceService.getPledges(req.query);

  res.json({
    success: true,
    data: pledges,
  });
});

export const createPledge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pledge = await FinanceService.createPledge(req.body);

  res.status(201).json({
    success: true,
    message: 'Pledge created',
    data: pledge,
  });
});

export const updatePledge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pledge = await FinanceService.updatePledge(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Pledge updated',
    data: pledge,
  });
});

// Summary
export const getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query;
  const summary = await FinanceService.getSummary(startDate as string, endDate as string);

  res.json({
    success: true,
    data: summary,
  });
});