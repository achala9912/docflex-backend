import { Document, Types } from "mongoose";
import { IMedicalCenter } from "./medicalCenter.interface";
import { IPatient } from "./patient.interface";
import { IAppointment } from "./appointment.interface";

export interface IModification {
  action?: string | null;
  modifiedBy?: string | null;
  date: Date;
}

export interface IPrescription extends Document {
  prescriptionNo: string;
  centerId: Types.ObjectId | IMedicalCenter;
  prescriptionType: string;
  appointmentId: Types.ObjectId | IAppointment;
  patientId: Types.ObjectId | IPatient;
  reasonForVisit: string;
  symptoms?: string[];
  labTests?: string[];
  vitalSigns: Array<{
    weight: string;
    height: string;
    bmi: string;
    temperature: string;
    pulseRate: string;
  }>;
  clinicalDetails?: string;
  advice?: string;
  medications: Array<{
    route: string;
    productName: string;
    genericName: string;
    dose: string;
    doseUnit: string;
    frequency: string;
    duration: string;
    note?: string;
  }>;
  prescriberDetails: {
    digitalSignature: string;
    slmcNo: string;
    title: string;
    name: string;
    specialization: string;
    remarks: string;
  };
  remark?: string;
  status: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  modificationHistory: IModification[];
}
