import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReportService {
  static async getDashboardStats() {
    const totalMembers = await prisma.member.count();
    const activeMembers = await prisma.member.count({
      where: { membershipStatus: 'MEMBER' },
    });
    const totalGroups = await prisma.smallGroup.count();
    const totalDepartments = await prisma.department.count();

    // Recent Sunday services
    const recentServices = await prisma.sundayService.findMany({
      orderBy: { serviceDate: 'desc' },
      take: 4,
    });

    // This month's finance
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const monthIncome = await prisma.incomeRecord.aggregate({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const monthExpenses = await prisma.expenseRecord.aggregate({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    return {
      members: {
        total: totalMembers,
        active: activeMembers,
      },
      groups: totalGroups,
      departments: totalDepartments,
      recentServices,
      thisMonth: {
        income: monthIncome._sum.amount || 0,
        expenses: monthExpenses._sum.amount || 0,
        balance: (monthIncome._sum.amount || 0) - (monthExpenses._sum.amount || 0),
      },
    };
  }

  static async getMembershipReport() {
    const byStatus = await prisma.member.groupBy({
      by: ['membershipStatus'],
      _count: true,
    });

    const byGender = await prisma.member.groupBy({
      by: ['gender'],
      _count: true,
    });

    const byBaptism = await prisma.member.groupBy({
      by: ['baptismStatus'],
      _count: true,
    });

    return {
      byStatus,
      byGender,
      byBaptism,
    };
  }

  static async getAttendanceReport(startDate?: string, endDate?: string) {
    const dateFilter = startDate && endDate ? {
      serviceDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    } : {};

    const sundayServices = await prisma.sundayService.findMany({
      where: dateFilter,
      orderBy: { serviceDate: 'asc' },
    });

    const avgAttendance = sundayServices.length > 0
      ? Math.round(sundayServices.reduce((sum, s) => sum + s.totalAttendance, 0) / sundayServices.length)
      : 0;

    return {
      services: sundayServices,
      averageAttendance: avgAttendance,
      totalServices: sundayServices.length,
    };
  }
}