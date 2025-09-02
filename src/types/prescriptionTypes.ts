export interface PrescriptionData {
  centerId: {
    centerName?: string;
    contactNo?: string;
    address?: string;
    town?: string;
    logo?: string;
    email?: string;
  };
  prescriptionNo?: string;
  createdAt: string;
  patientId: {
    patientName: string;
    age: string;
    contactNo: string;
    email: string;
    gender?: string;
    dob?: string;
    title?: string;
  };
  reasonForVisit: string;
  symptoms: string[];
  labTests: string[];
  vitalSigns: {
    weight?: string;
    height?: string;
    bmi?: string;
    pulseRate?: string;
    temperature?: string;
  }[];
  clinicalDetails: string;
  advice: string;
  remark?: string;
  medications: {
    productName: string;
    dose: string;
    frequency: string;
    doseUnit: string;
    duration: string;
    note?: string;
    route: string;
    genericName: string;
  }[];
  prescriberDetails: {
    name: string;
    specialization: string;
    slmcNo: string;
    title?: string;
    digitalSignature?: string;
  };
}
