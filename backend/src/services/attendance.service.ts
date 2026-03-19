import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class AttendanceService {
  // SUNDAY SERVICE ATTENDANCE
  static async createSundayService(data: any) {
    const existing = await prisma.sundayService.findUnique({
      where: { serviceDate: new Date(data.serviceDate) },
    });

    if (existing) {
      throw new AppError('Service already exists for this date', 400);
    }

    const service = await prisma.sundayService.create({
      data: {
        serviceDate: new Date(data.serviceDate),
        notes: data.notes,
      },
    });

    return service;
  }

  static async recordSundayAttendance(serviceId: string, attendees: any[]) {
    const records = await prisma.$transaction(
      attendees.map((attendee) =>
        prisma.sundayServiceAttendance.create({
          data: {
            serviceId,
            ...attendee,
          },
        })
      )
    );

    // Update counts
    const membersCount = records.filter((r) => r.memberId).length;
    const visitorsCount = records.filter((r) => !r.memberId).length;
    const firstTimersCount = records.filter((r) => r.isFirstTimer).length;

    await prisma.sundayService.update({
      where: { id: serviceId },
      data: {
        totalAttendance: records.length,
        membersCount,
        visitorsCount,
        firstTimersCount,
      },
    });

    return records;
  }

  static async getSundayServices(limit: number = 10) {
    const services = await prisma.sundayService.findMany({
      include: {
        attendanceRecords: {
          include: { member: true },
        },
      },
      orderBy: { serviceDate: 'desc' },
      take: limit,
    });

    return services;
  }

  // SMALL GROUP ATTENDANCE
  static async recordSmallGroupAttendance(data: any, createdById: string) {
    const { groupId, meetingDate, meetingTopic, notes, attendees } = data;

    const attendance = await prisma.smallGroupAttendance.create({
      data: {
        groupId,
        meetingDate: new Date(meetingDate),
        meetingTopic,
        notes,
        totalAttendance: attendees.filter((a: any) => a.present).length,
        createdById,
      },
    });

    // Create attendance records
    await prisma.$transaction(
      attendees.map((attendee: any) =>
        prisma.smallGroupAttendanceRecord.create({
          data: {
            attendanceId: attendance.id,
            memberId: attendee.memberId,
            present: attendee.present,
            remarks: attendee.remarks,
          },
        })
      )
    );

    return attendance;
  }

  static async getSmallGroupAttendance(groupId: string, limit: number = 20) {
    const attendances = await prisma.smallGroupAttendance.findMany({
      where: { groupId },
      include: {
        records: {
          include: { member: true },
        },
      },
      orderBy: { meetingDate: 'desc' },
      take: limit,
    });

    return attendances;
  }

  // DEPARTMENT ATTENDANCE
  static async recordDepartmentAttendance(data: any) {
    const { departmentId, meetingDate, meetingPurpose, notes, attendees } = data;

    const attendance = await prisma.departmentAttendance.create({
      data: {
        departmentId,
        meetingDate: new Date(meetingDate),
        meetingPurpose,
        notes,
        totalAttendance: attendees.filter((a: any) => a.present).length,
      },
    });

    await prisma.$transaction(
      attendees.map((attendee: any) =>
        prisma.departmentAttendanceRecord.create({
          data: {
            attendanceId: attendance.id,
            memberId: attendee.memberId,
            present: attendee.present,
            remarks: attendee.remarks,
          },
        })
      )
    );

    return attendance;
  }

  static async getDepartmentAttendance(departmentId: string, limit: number = 20) {
    const attendances = await prisma.departmentAttendance.findMany({
      where: { departmentId },
      include: {
        records: {
          include: { member: true },
        },
      },
      orderBy: { meetingDate: 'desc' },
      take: limit,
    });

    return attendances;
  }
}