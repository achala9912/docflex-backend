import { Document, Types } from "mongoose";
import { IMedicalCenter } from "./medicalCenter.interface";
import { IPatient } from "./patient.interface";
import { ISession } from "./session.interface";

export interface IModification {
  action?: string | null;
  modifiedBy?: string | null;
  date: Date;
}
export interface IAppointment extends Document {
  date: Date;
  appointmentId: string;
  tokenNo: number;
  // sessionId: string;
  sessionId: Types.ObjectId | string | ISession | null;

  status: string;
  patientId: Types.ObjectId | IPatient;
  centerId: Types.ObjectId | IMedicalCenter;
  isPatientvisited: boolean;
  modificationHistory: IModification[];
  createdAt: Date;
  updatedAt: Date;
}
