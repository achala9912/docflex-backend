import { Document, Types } from 'mongoose';
import { GENDERS } from '../constants/gender.constants';
import { ACTIONS } from '../constants/modification-history.constant';
import { Permission } from '../constants/permissions.constants';

// Base user interface (raw properties)
export interface IUser {
  userId: string;
  title: string;
  name: string;
  userName: string;
  role: Types.ObjectId; // Reference to Role document
  gender?: typeof GENDERS[keyof typeof GENDERS];
  slmcNo?: string;
  specialization?: string;
  email: string;
  contactNo: string;
  password: string;
  remarks?: string;
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

// Input type for creating/updating users (excludes auto-generated fields)
export interface IUserInput {
  title: string;
  name: string;
  userName: string;
  role: string | Types.ObjectId; // Accepts both string ID or ObjectId
  gender?: typeof GENDERS[keyof typeof GENDERS];
  slmcNo?: string;
  specialization?: string;
  email: string;
  contactNo: string;
  password: string;
  remarks?: string;
}

// Mongoose document with methods
export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  // Add other methods here if needed
}

// Type for populated user documents (e.g., with role details)
export interface IUserPopulated extends Omit<IUserDocument, 'role'> {
  role: {
    _id: Types.ObjectId;
    roleId: string;
    roleName: string;
    permissions: Permission[];
  };
}

// Type for safe user output (excludes password and other sensitive fields)
export interface IUserPublic {
  userId: string;
  title: string;
  name: string;
  userName: string;
  role: Types.ObjectId | IUserPopulated['role'];
  gender?: typeof GENDERS[keyof typeof GENDERS];
  slmcNo?: string;
  specialization?: string;
  email: string;
  contactNo: string;
  remarks?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}