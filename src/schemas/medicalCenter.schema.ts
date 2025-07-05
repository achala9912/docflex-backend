import { z } from "zod";

export const MedicalCenterSchema = z.object({
  centerName: z.string().nonempty("Required"),
  contactNo: z.string().nonempty("Required"),
  address: z.string().nonempty("Required"),
  town: z.string().nonempty("Required"),
  email: z.string().email("Invalid email").nonempty("Required"),
  regNo: z.string().nonempty("Required"),
  logo: z.string().url("Invalid URL").optional(),
});

export const UpdateMedicalCenterSchema = MedicalCenterSchema.partial();
