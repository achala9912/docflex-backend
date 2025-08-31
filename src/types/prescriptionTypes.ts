export interface PatientDetails {
  title: string;
  patientName: string;
  age: string;
  contactNo: string;
  email: string;
  [key: string]: any;
}

export interface VitalSigns {
  weight: string;
  height: string;
  bmi: string;
  pulseRate: string;
  [key: string]: any;
}

export interface Medication {
  productName: string;
  genericName: string;
  dose: string;
  frequency: string;
  duration: string;
  note?: string;
  [key: string]: any;
}

export interface PrescriberDetails {
  name: string;
  specialization: string;
  slmcNo: string;
  [key: string]: any;
}

export interface MedicalCenter {
  centerName: string;
  address: string;
  town?: string;
  email: string;
  contactNo: string;
  [key: string]: any;
}

export interface PrescriptionData {
  prescriptionNo: string;
  createdAt: string | Date;
  patientId: PatientDetails;
  vitalSigns?: VitalSigns[];
  symptoms?: string;
  reasonForVisit: string;
  clinicalDetails: string;
  advice: string;
  medications: Medication[];
  prescriberDetails: PrescriberDetails;
  centerId: MedicalCenter;
  [key: string]: any;
}
