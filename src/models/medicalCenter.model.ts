import mongoose from "mongoose";
import { ACTIONS } from "../constants/modification-history.constant";

const medicalCenterSchema = new mongoose.Schema(
  {
    centerId: { type: String, unique: true, required: true },
    centerName: { type: String, required: true },
    contactNo: { type: String, required: true },
    address: { type: String, required: true },
    town: { type: String, required: true },
    logo: { type: String },
    email: { type: String, required: true },
    regNo: { type: String, required: true },
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

export default mongoose.model("MedicalCenter", medicalCenterSchema);
