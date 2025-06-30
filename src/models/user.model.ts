// models/user.model.ts
import { Schema, model, Document } from 'mongoose';
import { IUser } from '../interfaces/user.interface';
import bcrypt from 'bcryptjs';

// Extend the IUser interface with document methods
export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    userId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    role: { type: String, required: true, ref: 'Role' },
    slmcNo: { type: String },
    specialization: { type: String },
    email: { type: String, required: true, unique: true },
    contactNo: { type: String, required: true },
    password: { type: String, required: true },
    remarks: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default model<IUserDocument>('User', userSchema);