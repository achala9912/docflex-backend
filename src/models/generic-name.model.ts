import mongoose, { Schema } from "mongoose";
import { IGenericName } from "../interfaces/generic-name.interface";
import { ACTIONS } from "../constants/modification-history.constant";

const GenericNameSchema = new Schema<IGenericName>(
  {
    genericId: { type: String, required: true, unique: true },
    genericName: { type: String, required: true, unique: true },
    centerId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalCenter",
      required: true,
    },
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

export default mongoose.model<IGenericName>("GenericName", GenericNameSchema);
