import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class FinanceService {
  // INCOME
  static async getIncomeRecords(filters?: any) {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    const records = await prisma.incomeRecord.findMany({
      where,
      include: {
        category: true,
        member: true,
      },
      orderBy: { date: 'desc' },
    });

    return records;
  }

  static async createIncomeRecord(data: any) {
    // Safety check: Strip 'description' if the frontend accidentally sends it, map to 'notes'
    const { description, ...validData } = data;
    
    const record = await prisma.incomeRecord.create({
      data: {
        ...validData,
        notes: validData.notes || description || undefined,
        date: new Date(data.date || new Date()),
      },
      include: {
        category: true,
        member: true,
      },
    });

    return record;
  }

  static async getIncomeCategories() {
    const categories = await prisma.incomeCategory.findMany({
      include: {
        _count: {
          select: { incomeRecords: true },
        },
      },
    });

    return categories;
  }

  static async createIncomeCategory(data: any) {
    const category = await prisma.incomeCategory.create({
      data,
    });

    return category;
  }

  // EXPENSES
  static async getExpenseRecords(filters?: any) {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    const records = await prisma.expenseRecord.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    return records;
  }

  static async createExpenseRecord(data: any) {
    const record = await prisma.expenseRecord.create({
      data: {
        ...data,
        date: new Date(data.date || new Date()),
      },
      include: {
        category: true,
      },
    });

    return record;
  }

  static async getExpenseCategories() {
    const categories = await prisma.expenseCategory.findMany({
      include: {
        _count: {
          select: { expenseRecords: true },
        },
      },
    });

    return categories;
  }

  static async createExpenseCategory(data: any) {
    const category = await prisma.expenseCategory.create({
      data,
    });

    return category;
  }

  // PLEDGES
  static async getPledges(filters?: any) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.memberId) {
      where.memberId = filters.memberId;
    }

    const pledges = await prisma.pledge.findMany({
      where,
      include: {
        member: true,
      },
      orderBy: { pledgeDate: 'desc' },
    });

    return pledges;
  }

  static async createPledge(data: any) {
    const pledge = await prisma.pledge.create({
      data: {
        ...data,
        pledgeDate: new Date(data.pledgeDate || new Date()),
      },
      include: {
        member: true,
      },
    });

    return pledge;
  }

  static async updatePledge(id: string, data: any) {
    const pledge = await prisma.pledge.update({
      where: { id },
      data,
      include: {
        member: true,
      },
    });

    return pledge;
  }

  // SUMMARY
  static async getSummary(startDate?: string, endDate?: string) {
    const dateFilter = startDate && endDate ? {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    } : {};

    const totalIncome = await prisma.incomeRecord.aggregate({
      where: dateFilter,
      _sum: { amount: true },
    });

    const totalExpenses = await prisma.expenseRecord.aggregate({
      where: dateFilter,
      _sum: { amount: true },
    });

    const incomeByCategory = await prisma.incomeRecord.groupBy({
      by: ['categoryId'],
      where: dateFilter,
      _sum: { amount: true },
    });

    const expenseByCategory = await prisma.expenseRecord.groupBy({
      by: ['categoryId'],
      where: dateFilter,
      _sum: { amount: true },
    });

    const activePledges = await prisma.pledge.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { pledgeAmount: true, amountPaid: true },
    });

    return {
      totalIncome: totalIncome._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      balance: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
      incomeByCategory,
      expenseByCategory,
      pledges: {
        total: activePledges._sum.pledgeAmount || 0,
        paid: activePledges._sum.amountPaid || 0,
        outstanding: (activePledges._sum.pledgeAmount || 0) - (activePledges._sum.amountPaid || 0),
      },
    };
  }
}