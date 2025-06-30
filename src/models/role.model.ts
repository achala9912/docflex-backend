import { Schema, model } from 'mongoose';
import { IRole } from '../interfaces/role.interface';

const roleSchema = new Schema<IRole>(
  {
    roleId: { type: String, required: true, unique: true },
    roleName: { type: String, required: true, unique: true },
    permissions: [{ type: String, required: true }],
  },
  { timestamps: true }
);

export default model<IRole>('Role', roleSchema);