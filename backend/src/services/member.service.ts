import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class MemberService {
  static async getAll(filters?: any) {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phonePrimary: { contains: filters.search } },
      ];
    }

    if (filters?.membershipStatus) {
      where.membershipStatus = filters.membershipStatus;
    }

    if (filters?.gender) {
      where.gender = filters.gender;
    }

    const members = await prisma.member.findMany({
      where,
      include: {
        family: true,
        smallGroupMemberships: {
          include: { group: true },
        },
        departmentMemberships: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return members;
  }

  static async getById(id: string) {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        family: {
          include: {
            members: true,
          },
        },
        smallGroupMemberships: {
          include: { group: true },
        },
        departmentMemberships: {
          include: { department: true },
        },
        incomeRecords: {
          include: { category: true },
          orderBy: { date: 'desc' },
          take: 10,
        },
        pledges: true,
      },
    });

    if (!member) {
      throw new AppError('Member not found', 404);
    }

    return member;
  }

  static async create(data: any, createdById: string) {
    const member = await prisma.member.create({
      data: {
        ...data,
        createdById,
      },
      include: {
        family: true,
      },
    });

    return member;
  }

  static async update(id: string, data: any) {
    const member = await prisma.member.update({
      where: { id },
      data,
      include: {
        family: true,
      },
    });

    return member;
  }

  static async delete(id: string) {
    // Check if member has a user account
    const user = await prisma.user.findFirst({
      where: { memberId: id },
    });

    if (user) {
      throw new AppError('Cannot delete member with user account', 400);
    }

    await prisma.member.delete({
      where: { id },
    });

    return { message: 'Member deleted successfully' };
  }

  static async getStats() {
    const total = await prisma.member.count();
    const active = await prisma.member.count({
      where: { membershipStatus: 'MEMBER' },
    });
    const visitors = await prisma.member.count({
      where: { membershipStatus: 'VISITOR' },
    });
    const leaders = await prisma.member.count({
      where: { membershipStatus: 'LEADER' },
    });
    const baptized = await prisma.member.count({
      where: { baptismStatus: 'BAPTIZED' },
    });

    const genderStats = await prisma.member.groupBy({
      by: ['gender'],
      _count: true,
    });

    return {
      total,
      active,
      visitors,
      leaders,
      baptized,
      genderStats,
    };
  }
}