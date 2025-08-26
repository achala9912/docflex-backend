import { z } from "zod";

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
  clinicalDetails: z.string().optional(),
  advice: z.string().optional(),
  remark: z.string().optional(),

  // ✅ Medications array
  medications: z.array(
    z.object({
      route: z.string({
        required_error: "Route is required",
      }),
      productName: z.string({
        required_error: "Product name is required",
      }),
      genericName: z.string({
        required_error: "Generic name is required",
      }),
      dose: z.string({
        required_error: "Dose is required",
      }),
      frequency: z.string({
        required_error: "Frequency is required",
      }),
      duration: z.string({
        required_error: "Duration is required",
      }),
      note: z.string().optional(),
    })
  ),
});

export const UpdatePrescriptionSchema = PrescriptionSchema.partial();
