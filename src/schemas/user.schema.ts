import { z } from "zod";

export const UserSchema = z.object({
  title: z.string(),
  name: z.string(),
  userName: z.string(),
  role: z.string(),
  centerId: z.string().optional(), // ObjectId as string
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  slmcNo: z.string().optional(),
  specialization: z.string().optional(),
  email: z.string().email(),
  contactNo: z.string(),
  password: z.string().optional(),
  remarks: z.string().optional(),
  digitalSignature: z.string().optional(),
});

export const UpdateUserSchema = UserSchema.partial();
