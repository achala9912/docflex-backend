import { Document, Types } from 'mongoose';
import { GENDERS } from '../constants/gender.constants';
import { ACTIONS } from '../constants/modification-history.constant';
import { Permission } from '../constants/permissions.constants';

export interface IUser {
  userId: string;
  title: string;
  name: string;
  userName: string;
  role: Types.ObjectId;
  centerId?: Types.ObjectId; // ✅ Now explicitly typed as ObjectId
  gender?: typeof GENDERS[keyof typeof GENDERS];
  slmcNo?: string;
  specialization?: string;
  email: string;
  contactNo: string;
  password: string;
  remarks?: string;
  digitalSignature?: string;
  isActive?: boolean;
  isNewUser?: boolean;
  isDeleted?: boolean;
  isAdminUser?: boolean;
  modificationHistory?: {
    action: typeof ACTIONS[keyof typeof ACTIONS];
    modifiedBy: string;
    date: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserInput {
  title: string;
  name: string;
  userName: string;
  role: string | Types.ObjectId;
  centerId?: string | Types.ObjectId; // ✅ Accept both for input
  gender?: typeof GENDERS[keyof typeof GENDERS];
  slmcNo?: string;
  specialization?: string;
  email: string;
  contactNo: string;
  password: string;
  remarks?: string;
  digitalSignature?: string; // 👈 Optional
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserPopulated extends Omit<IUserDocument, 'role' | 'centerId'> {
  role: {
    _id: Types.ObjectId;
    roleId: string;
    roleName: string;
    permissions: Permission[];
  };
  centerId?: {
    _id: Types.ObjectId;
    centerId: string;
    centerName: string;
  };
}

export interface IUserPublic {
  userId: string;
  title: string;
  name: string;
  userName: string;
  role: Types.ObjectId | IUserPopulated['role'];
  centerId?: Types.ObjectId | IUserPopulated['centerId'];
  gender?: typeof GENDERS[keyof typeof GENDERS];
  slmcNo?: string;
  specialization?: string;
  email: string;
  contactNo: string;
  remarks?: string;
  digitalSignature?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
