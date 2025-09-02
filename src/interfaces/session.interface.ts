import { Document, Types } from "mongoose";
import { IMedicalCenter } from "./medicalCenter.interface";

export interface IModification {
  action?: string | null;
  modifiedBy?: string | null;
  date: Date;
}
export interface ISession extends Document {
  sessionId: string;
  sessionName: string;
  centerId: Types.ObjectId | IMedicalCenter;
  startTime: Date;
  endTime: Date;
  isSessionActive: boolean;
  isDeleted: { type: Boolean; default: false };
  modificationHistory: IModification[];
  createdAt: Date;
  updatedAt: Date;
}
