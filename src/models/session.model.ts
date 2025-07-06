import mongoose, { Schema } from "mongoose";
import { ISession } from "../interfaces/session.interface";
import { ACTIONS } from "../constants/modification-history.constant";

const SessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true },
    sessionName: { type: String, required: true },
    centerId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalCenter",
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isSessionActive: { type: Boolean, default: false },
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

export default mongoose.model<ISession>("Session", SessionSchema);
