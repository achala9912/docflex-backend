import { Document } from "mongoose";

export interface IModification {
  action?: string | null;
  modifiedBy?: string | null;
  date: Date;
}

export interface IGenericName extends Document {
  genericId: string;
  genericName: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  modificationHistory: IModification[];
}
