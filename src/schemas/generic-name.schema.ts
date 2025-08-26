import { z } from "zod";

export const GenericNameSchema = z.object({
  centerId: z.string().min(1, "Center ID is required"),
  genericName: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(70, "Name cannot exceed 70 characters"),
});

export const UpdateGenericNameSchema = GenericNameSchema.partial();
