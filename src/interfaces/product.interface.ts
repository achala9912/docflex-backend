import { Document, Types } from "mongoose";
import { IMedicalCenter } from "./medicalCenter.interface";
import { IGenericName } from "./generic-name.interface";

export interface IModification {
  action?: string | null;
  modifiedBy?: string | null;
  date: Date;
}

export interface IProduct extends Document {
  productId: string;
  centerId: Types.ObjectId | IMedicalCenter;
  genericId: Types.ObjectId | IGenericName;
  productName: string;
  remark: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  modificationHistory: IModification[];
}
