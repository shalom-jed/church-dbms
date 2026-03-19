import { Response } from 'express';
import { EventService } from '../services/event.service';
import { asyncHandler } from '../middleware/error.middleware';
import { AuthRequest } from '../types';

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const events = await EventService.getAll(req.query);

  res.json({
    success: true,
    data: events,
  });
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await EventService.getById(req.params.id);

  res.json({
    success: true,
    data: event,
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await EventService.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: event,
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const event = await EventService.update(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: event,
  });
});

export const deleteEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await EventService.delete(req.params.id);

  res.json({
    success: true,
    message: result.message,
  });
});

export const recordAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const records = await EventService.recordAttendance(req.params.id, req.body.attendees);

  res.status(201).json({
    success: true,
    message: 'Attendance recorded',
    data: records,
  });
});

export const addExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const expense = await EventService.addExpense(req.params.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Expense added',
    data: expense,
  });
});

export const getExpenses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await EventService.getExpenses(req.params.id);

  res.json({
    success: true,
    data: result,
  });
});