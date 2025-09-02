import { z } from "zod";

export const PatientSchema = z.object({
  title: z.string(),
  patientName: z.string().min(3, "Patient name must be at least 3 characters"),
  dob: z.coerce.date().refine((date) => date <= new Date(), {
    message: "Date of birth cannot be in the future",
  }),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  centerId: z.string().min(1, "Center ID is required"),
  contactNo: z.string().min(10, "Contact number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  nic: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  remark: z.string().optional(),
});

export const UpdatePatientSchema = PatientSchema.partial();
