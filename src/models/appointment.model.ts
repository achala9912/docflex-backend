import mongoose, { Schema } from "mongoose";
import { IAppointment } from "../interfaces/appointment.interface";
import { ACTIONS } from "../constants/modification-history.constant";

const AppointmentSchema = new Schema<IAppointment>(
  {
    date: { type: Date, required: true },
    appointmentId: { type: String, required: true, unique: true },
    tokenNo: { type: Number, required: true },
    status: { type: String, required: true },
    sessionId: { type: String, required: true,  index: true,   },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    centerId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalCenter",
      required: true,
    },
    isPatientvisited: { type: Boolean, default: false },
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

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema);
