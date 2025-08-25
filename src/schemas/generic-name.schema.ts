import { z } from "zod";

export const GenericNameSchema = z.object({
  centerId: z.string().min(1, "Center ID is required"),
  genericName: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),
});

export const UpdateGenericNameSchema = GenericNameSchema.partial();
