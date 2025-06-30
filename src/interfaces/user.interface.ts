// interfaces/user.interface.ts
import { Document } from 'mongoose';

export interface IUser {
  userId: string;
  title: string;
  name: string;
  userName: string;
  role: string;
  slmcNo?: string;
  specialization?: string;
  email: string;
  contactNo: string;
  password: string;
  remarks?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserInput {
  title: string;
  name: string;
  userName: string;
  role: string;
  slmcNo?: string;
  specialization?: string;
  email: string;
  contactNo: string;
  password: string;
  remarks?: string;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}