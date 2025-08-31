import mongoose, { Schema } from "mongoose";
import { IPrescription } from "../interfaces/prescription.interface";
import { ACTIONS } from "../constants/modification-history.constant";

const PrescriptionSchema = new Schema<IPrescription>(
  {
    prescriptionNo: { type: String, required: true, unique: true },
    centerId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalCenter",
      required: true,
    },
    prescriptionType: { type: String, required: true },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    reasonForVisit: { type: String, required: true },
    symptoms: [{ type: String }],
    labTests: [{ type: String }],
    vitalSigns: [
      {
        weight: String,
        height: String,
        bmi: String,
        temperature: String,
        pulseRate: String,
      },
    ],
    clinicalDetails: String,
    advice: String,
    medications: [
      {
        route: String,
        productName: String,
        genericName: String,
        dose: String,
        doseUnit: String,
        frequency: String,
        duration: String,
        note: String,
      },
    ],
    remark: String,
    status: { type: String, default: "completed" },
    isDeleted: { type: Boolean, default: false },
    prescriberDetails: {
      digitalSignature: { type: String, required: true },
      slmcNo: { type: String, required: true },
      title: { type: String, required: true },
      name: { type: String, required: true },
      specialization: { type: String, required: true },
      remarks: { type: String },
    },
    modificationHistory: [
      {
        action: { type: String, enum: Object.values(ACTIONS) },
        modifiedBy: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Prescription = mongoose.model<IPrescription>(
  "Prescription",
  PrescriptionSchema
);
export default Prescription;
