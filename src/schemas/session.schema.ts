import { z } from "zod";

const BaseSessionSchema = z.object({
  sessionName: z.string().min(3, "Session name must be at least 3 characters"),
  centerId: z.string().min(1, "Center ID is required"),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  isSessionActive: z.boolean().optional().default(false),
});

export const SessionSchema = BaseSessionSchema.superRefine((data, ctx) => {
  if (data.endTime <= data.startTime) {
    ctx.addIssue({
      path: ["endTime"],
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
    });
  }
});

export const UpdateSessionSchema = BaseSessionSchema.partial(); 
