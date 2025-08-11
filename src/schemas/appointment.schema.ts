// import { z } from "zod";

// export const AppointmentSchema = z.object({
//   date: z.date({ required_error: "Date is required" }),
//   appointmentId: z.string({ required_error: "Appointment ID is required" }),
//   tokenNo: z.number({ required_error: "Token number is required" }),
//   sessionId: z.string({ required_error: "Session ID is required" }),
//   patientId: z.string({ required_error: "Patient ID is required" }),
//   centerId: z.string({ required_error: "Center ID is required" }),
// });

// export const UpdateAppointmentSchema = AppointmentSchema.partial();
import { z } from "zod";

export const AppointmentSchema = z.object({
  date: z.preprocess(
    (arg) => {
      if (typeof arg === "string" || arg instanceof Date) {
        const date = new Date(arg);
        if (!isNaN(date.getTime())) return date;
      }
      return undefined;
    },
    z.date({
      required_error: "Date is required",
      invalid_type_error:
        "Date must be a valid date format (ISO or Date object)",
    })
  ),
  sessionId: z.string({
    required_error: "Session ID is required",
    invalid_type_error: "Session ID must be a string",
  }),
  patientId: z.string({
    required_error: "Patient ID is required",
    invalid_type_error: "Patient ID must be a string",
  }),
  centerId: z.string({
    required_error: "Center ID is required",
    invalid_type_error: "Center ID must be a string",
  }),
});

export const UpdateAppointmentSchema = AppointmentSchema.partial();
