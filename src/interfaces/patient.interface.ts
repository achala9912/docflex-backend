import { Document, Types } from "mongoose";
import { IMedicalCenter } from "./medicalCenter.interface";
import { GENDERS } from "../constants/gender.constants";

export interface IModification {
  action?: string | null;
  modifiedBy?: string | null;
  date: Date;
}

export interface IPatient extends Document {
  patientId: string;
  title: string;
  patientName: string;
  gender?: (typeof GENDERS)[keyof typeof GENDERS];
  dob: Date;
  age: number;
  centerId: Types.ObjectId | IMedicalCenter;
  contactNo: string;
  address: string;
  nic?: string;
  remark?: string;
  email?: string;
  modificationHistory: IModification[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
