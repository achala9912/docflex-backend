import mongoose, { Schema } from "mongoose";
import { IPatient } from "../interfaces/patient.interface";
import { ACTIONS } from "../constants/modification-history.constant";
import { GENDERS } from "../constants/gender.constants";

const PatientSchema = new Schema<IPatient>(
  {
    patientId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    patientName: { type: String, required: true },
    gender: {
      type: String,
      enum: Object.values(GENDERS),
      default: GENDERS.MALE,
    },
    dob: { type: Date, required: true },
    age: { type: Number, required: true },
    centerId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalCenter",
      required: true,
    },
    contactNo: { type: String, required: true },
    address: { type: String, required: true },
    nic: { type: String },
    email: { type: String },
    remark: { type: String },
    isDeleted: { type: Boolean, default: false },
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

export default mongoose.model<IPatient>("Patient", PatientSchema);
