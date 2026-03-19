import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    memberId?: string;
    assignedGroupId?: string;
  };
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateMemberDTO {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender: 'MALE' | 'FEMALE';
  phonePrimary?: string;
  phoneAlternate?: string;
  email?: string;
  address?: string;
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'DIVORCED';
  anniversaryDate?: Date;
  baptismStatus?: 'BAPTIZED' | 'NOT_BAPTIZED';
  baptismDate?: Date;
  membershipStatus?: 'VISITOR' | 'NEW_BELIEVER' | 'MEMBER' | 'LEADER' | 'INACTIVE';
  joinDate?: Date;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  familyId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}