import Patient from "../models/patient.model";
import { IPatient } from "../interfaces/patient.interface";
import { ACTIONS } from "../constants/modification-history.constant";
import MedicalCenter from "../models/medicalCenter.model";


const calculateAge = (dob: Date): string => {
  const today = new Date();

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) {
    return `${years}Y`;
  } else if (months > 0) {
    return `${months}M`;
  } else {
    return `${days}D`;
  }
};

export const createPatient = async (
  patientData: any,
  createdBy: string
): Promise<IPatient> => {
  const center = await MedicalCenter.findById(patientData.centerId)
    .select("centerId")
    .lean();

  if (!center) {
    throw new Error("Medical center not found");
  }

  const lastPatient = await Patient.findOne({ centerId: patientData.centerId })
    .sort({ patientId: -1 })
    .limit(1);


  const centerCode = center.centerId;
  const lastNumber = lastPatient
    ? parseInt(lastPatient.patientId.split("-PAT")[1])
    : 0;
  const patientId = `${centerCode}-PAT${lastNumber + 1}`;


  const age = calculateAge(new Date(patientData.dob));


  const patient = new Patient({
    ...patientData,
    patientId,
    age, 
    modificationHistory: [
      {
        action: ACTIONS.CREATE,
        modifiedBy: createdBy,
        date: new Date(),
      },
    ],
  });

  const savedPatient = await patient.save();

  const populatedPatient = await Patient.findById(savedPatient._id)
    .populate("centerId", "centerId centerName")
    .orFail()
    .exec();

  return populatedPatient.toObject() as IPatient;
};

export const updatePatient = async (
  patientId: string,
  updateData: Partial<IPatient>,
  modifiedBy: string
): Promise<IPatient | null> => {
  const patient = await Patient.findOne({ patientId });
  if (!patient) return null;

  const changes: Record<string, { from: any; to: any }> = {};
  const original = patient.toObject();

  Object.keys(updateData).forEach((key) => {
    if (updateData[key as keyof IPatient] !== original[key as keyof IPatient]) {
      changes[key] = {
        from: original[key as keyof IPatient],
        to: updateData[key as keyof IPatient],
      };
      patient.set(key, updateData[key as keyof IPatient]);
    }
  });


  if (updateData.dob) {
    patient.age = calculateAge(new Date(updateData.dob));
    changes.age = {
      from: original.age,
      to: patient.age,
    };
  }

  if (Object.keys(changes).length > 0) {
    patient.modificationHistory.push({
      action: ACTIONS.UPDATE,
      modifiedBy,
      date: new Date(),
    });
  }

  return await patient.save();
};

export const deletePatient = async (
  patientId: string,
  deletedBy: string
): Promise<IPatient | null> => {
  const patient = await Patient.findOneAndUpdate(
    { patientId },
    {
      $set: { isDeleted: true },
      $push: {
        modificationHistory: {
          action: ACTIONS.DELETE,
          modifiedBy: deletedBy,
          date: new Date(),
        },
      },
    },
    { new: true }
  );
  return patient;
};

export const getAllPatients = async (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    centerId?: string;
  },
  includeDeleted: boolean = false
) => {
  const { page = 1, limit = 10, search = "", centerId } = params;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (!includeDeleted) {
    query.isDeleted = false;
  }

  if (centerId) {
    query.centerId = centerId;
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { patientName: searchRegex },
      { patientId: searchRegex },
      { contactNo: searchRegex },
      { email: searchRegex },
      { nic: searchRegex },
    ];
  }

  const [patients, total] = await Promise.all([
    Patient.find(query)
      .populate("centerId", "centerName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(query),
  ]);

  return {
    data: patients,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
  };
};

export const getPatientById = async (
  patientId: string
): Promise<IPatient | null> => {
  return Patient.findOne({ patientId })
    .populate("centerId", "centerId centerName")
    .lean()
    .exec();
};

export const getPatientSuggestions = async (
  contactNo: string,
  centerId?: string,
  includeDeleted: boolean = false
) => {
  const query: any = {};

  if (!includeDeleted) {
    query.isDeleted = false;
  }

  if (centerId) {
    query.centerId = centerId;
  }


  const cleaned = cleanContactNo(contactNo);

  // Normalize Sri Lankan numbers: 0XXXXXXXXX → +94XXXXXXXXX
  let normalized = cleaned;
  if (cleaned.startsWith("0")) {
    normalized = "+94" + cleaned.substring(1);
  }

  // Escape regex special chars
  const escapedContact = escapeRegex(cleaned);
  const escapedNormalized = escapeRegex(normalized);

  query.$or = [
    { contactNo: new RegExp(escapedContact, "i") },
    { contactNo: new RegExp(escapedNormalized, "i") },
  ];

  console.log("Patient suggestion query:", query);

  const patients = await Patient.find(query)
    .populate("centerId", "centerId centerName")
    .lean();

  return patients.map((p) => ({
    _id: p._id,
    patientId: p.patientId,
    title: p.title,
    patientName: p.patientName,
    gender: p.gender,
    dob: p.dob,
    age: p.age,
    centerId: p.centerId,
    contactNo: p.contactNo,
    address: p.address,
    nic: p.nic,
    email: p.email,
  }));
};

// helpers
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const cleanContactNo = (str: string) =>
  str
    .replace(/\s+/g, "")
    .replace(/[\r\n]+/g, "")
    .trim();
