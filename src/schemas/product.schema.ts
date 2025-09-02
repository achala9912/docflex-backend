import { z } from "zod";

export const ProductSchema = z.object({
  centerId: z.string().min(1, "Center ID is required"),
  genericId: z.string().min(1, "Generic ID is required"),
  productName: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),
  remark: z.string().optional(),
});

export const UpdateProductSchema = ProductSchema.partial();
