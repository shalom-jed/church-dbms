import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export class AttendanceService {
  // ==========================================
  // SUNDAY SERVICE ATTENDANCE
  // ==========================================
  static async createSundayService(data: any) {
    const serviceDate = new Date(data.serviceDate);

    const existing = await prisma.sundayService.findUnique({
      where: { serviceDate },
    });

    if (existing) {
      throw new AppError('Service already exists for this date', 400);
    }

    const service = await prisma.sundayService.create({
      data: {
        serviceDate,
        notes: data.notes || null,
      },
    });

    return service;
  }

  static async recordSundayAttendance(serviceId: string, attendees: any[]) {
    // Delete existing records for this service first
    await prisma.sundayServiceAttendance.deleteMany({
      where: { serviceId },
    });

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

  static async getSundayServices(limit: number = 20) {
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

  static async getSundayServiceById(id: string) {
    const service = await prisma.sundayService.findUnique({
      where: { id },
      include: {
        attendanceRecords: {
          include: { member: true },
        },
      },
    });

    if (!service) {
      throw new AppError('Sunday service not found', 404);
    }

    return service;
  }

  static async updateSundayService(id: string, data: any) {
    const service = await prisma.sundayService.update({
      where: { id },
      data: {
        notes: data.notes,
        ...(data.serviceDate && { serviceDate: new Date(data.serviceDate) }),
      },
    });

    return service;
  }

  static async deleteSundayService(id: string) {
    await prisma.sundayService.delete({
      where: { id },
    });

    return { message: 'Sunday service deleted successfully' };
  }

  // ==========================================
  // SMALL GROUP ATTENDANCE
  // ==========================================
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

  static async deleteSmallGroupAttendance(id: string) {
    await prisma.smallGroupAttendance.delete({
      where: { id },
    });

    return { message: 'Attendance record deleted successfully' };
  }

  // ==========================================
  // DEPARTMENT ATTENDANCE
  // ==========================================
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

  static async deleteDepartmentAttendance(id: string) {
    await prisma.departmentAttendance.delete({
      where: { id },
    });

    return { message: 'Department attendance deleted successfully' };
  }
}