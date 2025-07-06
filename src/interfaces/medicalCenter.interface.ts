export interface IModification {
  action?: string | null;
  modifiedBy?: string | null;
  date: Date;
}

export interface IMedicalCenter {
  centerId: string;
  centerName: string;
  contactNo: string;
  address: string;
  town: string;
  email: string;
  regNo: string;
  logo?: string | null;
  isDeleted: boolean;
  modificationHistory: IModification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedicalCenterDocument extends IMedicalCenter, Document {}
