import { Document } from 'mongoose';

export interface IRole extends Document {
  roleId: string; // R001, R002, etc.
  roleName: string; // Admin Doctor, Doctor, Assistant, etc.
  permissions: string[]; // Array of permission strings
  createdAt: Date;
  updatedAt: Date;
}