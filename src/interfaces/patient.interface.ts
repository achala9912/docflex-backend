import { Document, Types } from "mongoose";
import { IMedicalCenter } from "./medicalCenter.interface";

export interface IModification {
  action?: string | null;
  modifiedBy?: string | null;
  date: Date;
}

export interface IPatient extends Document {
  patientId: string;
  patientName: string;
  dob: Date;
  age: number;
  centerId: Types.ObjectId | IMedicalCenter;
  contactNo: string;
  address: string;
  nic?: string;
  email?: string;
  modificationHistory: IModification[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
