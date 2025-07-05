import { z } from "zod";
import { GENDERS } from "../constants/gender.constants";

const genderValues = Object.values(GENDERS);

export const UserSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  name: z.string().min(1, { message: "Name is required" })
    .max(100, { message: "Name cannot exceed 100 characters" }),
  userName: z.string().min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username cannot exceed 30 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  role: z.string().min(1, { message: "Role is required" }), 
  gender: z.enum([...(genderValues as [string, ...string[]])], {
    errorMap: () => ({ message: `Gender must be one of: ${genderValues.join(", ")}` })
  }).optional(),
  slmcNo: z.string()
    .regex(/^[0-9]+$/, { message: "SLMC number must contain only digits" })
    .optional(),
  specialization: z.string()
    .max(100, { message: "Specialization cannot exceed 100 characters" })
    .optional(),
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  contactNo: z.string()
    .min(10, { message: "Contact number must be at least 10 digits" })
    .max(15, { message: "Contact number cannot exceed 15 digits" })
    .regex(/^[0-9+]+$/, { message: "Contact number can only contain digits and +" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(50, { message: "Password cannot exceed 50 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  remarks: z.string()
    .max(500, { message: "Remarks cannot exceed 500 characters" })
    .optional(),
}).strict(); 


export const UpdateUserSchema = UserSchema.partial()
  .extend({
    userId: z.string().min(1, { message: "User ID is required" }).optional(),
    password: z.string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(50, { message: "Password cannot exceed 50 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" })
      .optional(),
  })
  .strict();

// Types
export type IUserInput = z.infer<typeof UserSchema>;
export type IUpdateUserInput = z.infer<typeof UpdateUserSchema>;