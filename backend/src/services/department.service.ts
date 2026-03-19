import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class DepartmentService {
  static async getAll() {
    const departments = await prisma.department.findMany({
      include: {
        head: true,
        members: {
          include: { member: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { departmentName: 'asc' },
    });

    return departments;
  }

  static async getById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        head: true,
        members: {
          include: { member: true },
        },
        attendance: {
          orderBy: { meetingDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    return department;
  }

  static async create(data: any) {
    const department = await prisma.department.create({
      data,
      include: {
        head: true,
      },
    });

    return department;
  }

  static async update(id: string, data: any) {
    const department = await prisma.department.update({
      where: { id },
      data,
      include: {
        head: true,
      },
    });

    return department;
  }

  static async delete(id: string) {
    await prisma.department.delete({
      where: { id },
    });

    return { message: 'Department deleted successfully' };
  }

  static async addMember(departmentId: string, memberId: string, role: string = 'MEMBER') {
    const existing = await prisma.departmentMember.findUnique({
      where: {
        departmentId_memberId: { departmentId, memberId },
      },
    });

    if (existing) {
      throw new AppError('Member already in this department', 400);
    }

    const membership = await prisma.departmentMember.create({
      data: {
        departmentId,
        memberId,
        role: role as any,
      },
      include: {
        member: true,
      },
    });

    return membership;
  }

  static async removeMember(departmentId: string, memberId: string) {
    await prisma.departmentMember.delete({
      where: {
        departmentId_memberId: { departmentId, memberId },
      },
    });

    return { message: 'Member removed from department' };
  }
}