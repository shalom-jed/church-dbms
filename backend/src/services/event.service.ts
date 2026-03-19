import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class EventService {
  static async getAll(filters?: any) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.upcoming) {
      where.eventDate = { gte: new Date() };
      where.status = 'UPCOMING';
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        attendance: {
          include: { member: true },
        },
        expenses: true,
        _count: {
          select: { attendance: true, expenses: true },
        },
      },
      orderBy: { eventDate: 'desc' },
    });

    return events;
  }

  static async getById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendance: {
          include: { member: true },
        },
        expenses: true,
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return event;
  }

  static async create(data: any) {
    const event = await prisma.event.create({
      data: {
        ...data,
        eventDate: new Date(data.eventDate),
      },
    });

    return event;
  }

  static async update(id: string, data: any) {
    const event = await prisma.event.update({
      where: { id },
      data: {
        ...data,
        ...(data.eventDate && { eventDate: new Date(data.eventDate) }),
      },
    });

    return event;
  }

  static async delete(id: string) {
    await prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  static async recordAttendance(eventId: string, attendees: any[]) {
    const records = await prisma.$transaction(
      attendees.map((attendee) =>
        prisma.eventAttendance.create({
          data: {
            eventId,
            ...attendee,
          },
        })
      )
    );

    // Update actual attendance count
    await prisma.event.update({
      where: { id: eventId },
      data: {
        actualAttendance: records.length,
      },
    });

    return records;
  }

  static async addExpense(eventId: string, data: any) {
    const expense = await prisma.eventExpense.create({
      data: {
        eventId,
        ...data,
        date: new Date(data.date || new Date()),
      },
    });

    return expense;
  }

  static async getExpenses(eventId: string) {
    const expenses = await prisma.eventExpense.findMany({
      where: { eventId },
      orderBy: { date: 'desc' },
    });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return { expenses, total };
  }
}