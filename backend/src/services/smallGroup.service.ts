import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class SmallGroupService {
  static async getAll() {
    const groups = await prisma.smallGroup.findMany({
      include: {
        leaderMember: true,
        members: {
          include: { member: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { groupName: 'asc' },
    });

    return groups;
  }

  static async getById(id: string) {
    const group = await prisma.smallGroup.findUnique({
      where: { id },
      include: {
        leaderMember: true,
        members: {
          include: { member: true },
        },
        attendance: {
          orderBy: { meetingDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!group) {
      throw new AppError('Small group not found', 404);
    }

    return group;
  }

  static async create(data: any) {
    const group = await prisma.smallGroup.create({
      data,
      include: {
        leaderMember: true,
      },
    });

    return group;
  }

  static async update(id: string, data: any) {
    const group = await prisma.smallGroup.update({
      where: { id },
      data,
      include: {
        leaderMember: true,
      },
    });

    return group;
  }

  static async delete(id: string) {
    await prisma.smallGroup.delete({
      where: { id },
    });

    return { message: 'Small group deleted successfully' };
  }

  static async addMember(groupId: string, memberId: string, role: string = 'MEMBER') {
    const existing = await prisma.smallGroupMember.findUnique({
      where: {
        groupId_memberId: { groupId, memberId },
      },
    });

    if (existing) {
      throw new AppError('Member already in this group', 400);
    }

    const membership = await prisma.smallGroupMember.create({
      data: {
        groupId,
        memberId,
        role: role as any,
      },
      include: {
        member: true,
      },
    });

    return membership;
  }

  static async removeMember(groupId: string, memberId: string) {
    await prisma.smallGroupMember.delete({
      where: {
        groupId_memberId: { groupId, memberId },
      },
    });

    return { message: 'Member removed from group' };
  }

  static async getAttendanceStats(groupId: string) {
    const attendances = await prisma.smallGroupAttendance.findMany({
      where: { groupId },
      orderBy: { meetingDate: 'desc' },
      take: 10,
    });

    const totalMeetings = attendances.length;
    const totalAttendance = attendances.reduce((sum, a) => sum + a.totalAttendance, 0);
    const averageAttendance = totalMeetings > 0 ? Math.round(totalAttendance / totalMeetings) : 0;

    return {
      totalMeetings,
      averageAttendance,
      recentAttendances: attendances,
    };
  }
}