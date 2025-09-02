import { z } from "zod";

// Helper: accept string or number, always return string, with field-specific errors
const StringOrNumber = (field: string) =>
  z.union([
    z
      .string({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a string`,
      })
      .min(1, `${field} cannot be empty`),
    z
      .number({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a number`,
      })
      .transform((val) => String(val)),
  ]);

export const PrescriptionSchema = z.object({
  centerId: z.string({
    required_error: "Center ID is required",
    invalid_type_error: "Center ID must be a string",
  }),
  prescriptionType: z.string({
    required_error: "Prescription type is required",
    invalid_type_error: "Prescription type must be a string",
  }),
  appointmentId: z.string({
    required_error: "Appointment ID is required",
    invalid_type_error: "Appointment ID must be a string",
  }),
  patientId: z.string({
    required_error: "Patient ID is required",
    invalid_type_error: "Patient ID must be a string",
  }),
  reasonForVisit: z.string({
    required_error: "Reason for visit is required",
    invalid_type_error: "Reason for visit must be a string",
  }),

  symptoms: z.array(z.string()).optional(),
  labTests: z.array(z.string()).optional(),
  clinicalDetails: z.string().optional(),
  advice: z.string().optional(),
  remark: z.string().optional(),

  // ✅ single object, required
  vitalSigns: z.object({
    weight: StringOrNumber("Weight"),
    height: StringOrNumber("Height"),
    bmi: StringOrNumber("BMI"),
    temperature: StringOrNumber("Temperature"),
    pulseRate: StringOrNumber("Pulse Rate"),
  }),

  // ✅ must have at least one medication
  medications: z
    .array(
      z.object({
        route: z
          .string({
            required_error: "Route is required",
          })
          .min(1, "Route cannot be empty"),
        productName: z
          .string({
            required_error: "Product name is required",
          })
          .min(1, "Product name cannot be empty"),
        genericName: z
          .string({
            required_error: "Generic name is required",
          })
          .min(1, "Generic name cannot be empty"),
        dose: StringOrNumber("Dose"),
        doseUnit: StringOrNumber("Dose Unit"),
        frequency: z
          .string({
            required_error: "Frequency is required",
          })
          .min(1, "Frequency cannot be empty"),
        duration: StringOrNumber("Duration"),
        note: z.string().optional(),
      })
    )
    .min(1, "At least one medication is required"),
});

export const UpdatePrescriptionSchema = PrescriptionSchema.partial();
