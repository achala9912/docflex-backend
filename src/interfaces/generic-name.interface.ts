import { Document, Types } from "mongoose";
import { IMedicalCenter } from "./medicalCenter.interface";

export interface IModification {
  action?: string | null;
  modifiedBy?: string | null;
  date: Date;
}

export interface IGenericName extends Document {
  genericId: string;
  centerId: Types.ObjectId | IMedicalCenter;
  genericName: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  modificationHistory: IModification[];
}
