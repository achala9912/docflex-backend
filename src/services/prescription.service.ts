import Prescription from "../models/prescription.model";
import Appointment from "../models/appointment.model";
import { ACTIONS } from "../constants/modification-history.constant";
import { Types } from "mongoose";
import { generatePrescriptionPDF } from "../utils/pdfGenerator";
import { sendPrescriptionEmail } from "../external-services/emailService";
import { PrescriptionData } from "../types/prescriptionTypes";
import Patient from "../models/patient.model";

const generatePrescriptionNo = async (
  appointmentObjectId: string
): Promise<string> => {
  const appointment = await Appointment.findById(appointmentObjectId);

  if (!appointment) throw new Error("Appointment not found");

  const appointmentCode = appointment.appointmentId;
  if (!appointmentCode) throw new Error("Appointment code missing");

  const count = await Prescription.countDocuments({
    appointmentId: appointmentObjectId,
  });

  return `${appointmentCode}-P${count + 1}`;
};

export const createPrescriptionService = async (data: any, userId: string) => {
  const appointment = await Appointment.findById(data.appointmentId);
  if (!appointment) throw new Error("Appointment not found");
  if (!appointment.isPatientvisited)
    throw new Error("Patient has not visited yet");

  const prescriptionNo = await generatePrescriptionNo(data.appointmentId);

  // Get patient name
  const patient = await Patient.findById(data.patientId);
  if (!patient) throw new Error("Patient not found");

  return Prescription.create({
    ...data,
    prescriptionNo,
    createdBy: userId,
    patientName: patient.patientName,
    modificationHistory: [
      { action: ACTIONS.CREATE, modifiedBy: userId, date: new Date() },
    ],
  });
};

export const getAllPrescriptionsService = async (filters: {
  date?: string;
  page?: number;
  limit?: number;
  search?: string;
  centerId?: string;
  productId?: string;
  status?: string;
}) => {
  const {
    date,
    page = 1,
    limit = 10,
    search,
    centerId,
    productId,
    status,
  } = filters;

  const query: any = { isDeleted: false };

  if (date) {
    query.createdAt = {
      $gte: new Date(date + "T00:00:00Z"),
      $lte: new Date(date + "T23:59:59Z"),
    };
  }

  if (centerId) query.centerId = new Types.ObjectId(centerId);

  if (search) {
    query.$or = [
      { prescriptionNo: { $regex: search, $options: "i" } },
      { patientName: { $regex: search, $options: "i" } },
    ];
  }

  if (productId) {
    query["medications.productId"] = new Types.ObjectId(productId);
  }

  if (status) {
    query.status = status;
  }

  const prescriptions = await Prescription.find(query)
    .populate("patientId")
    .populate("centerId")
    .populate("appointmentId")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Prescription.countDocuments(query);

  return { data: prescriptions, total, page, limit };
};

export const getPrescriptionByIdService = async (prescriptionNo: string) => {
  return Prescription.findOne({ prescriptionNo, isDeleted: false })
    .populate("patientId")
    .populate("centerId")
    .populate("appointmentId");
};

export const updatePrescriptionService = async (
  prescriptionNo: string,
  data: any,
  userId: string
) => {
  const prescription = await Prescription.findOne({
    prescriptionNo,
    isDeleted: false,
  });

  if (!prescription) throw new Error("Prescription not found");


  prescription.centerId = data.centerId;
  prescription.prescriptionType = data.prescriptionType;
  prescription.appointmentId = data.appointmentId;
  prescription.patientId = data.patientId;
  prescription.reasonForVisit = data.reasonForVisit;
  prescription.symptoms = data.symptoms;
  prescription.labTests = data.labTests;
  prescription.clinicalDetails = data.clinicalDetails;
  prescription.advice = data.advice;
  prescription.remark = data.remark;
  prescription.vitalSigns = data.vitalSigns;
  prescription.medications = data.medications;
  prescription.prescriberDetails = data.prescriberDetails;


  prescription.modificationHistory.push({
    action: ACTIONS.UPDATE,
    modifiedBy: userId,
    date: new Date(),
  });

  return prescription.save(); 
};

export const cancelPrescriptionService = async (
  prescriptionNo: string,
  userId: string
) => {
  return Prescription.findOneAndUpdate(
    { prescriptionNo, isDeleted: false },
    {
      status: "cancelled",
      $push: {
        modificationHistory: {
          action: ACTIONS.CANCEL,
          modifiedBy: userId,
          date: new Date(),
        },
      },
    },
    { new: true }
  );
};

export const sendPrescriptionEmailService = async (
  prescriptionNo: string,
  userId: string
): Promise<any> => {
  const prescription = await Prescription.findOne({
    prescriptionNo,
    isDeleted: false,
  })
    .populate("patientId")
    .populate("centerId")
    .populate("appointmentId");

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  // Check if patient has email
  const patientEmail = (prescription.patientId as any).email;
  if (!patientEmail) {
    throw new Error("Patient does not have an email address");
  }

  // Prepare the data for PDF generation with safe defaults
  const prescriptionData: PrescriptionData = {
    centerId: {
      centerName: (prescription.centerId as any).centerName || "",
      contactNo: (prescription.centerId as any).contactNo || "",
      address: (prescription.centerId as any).address || "",
      town: (prescription.centerId as any).town,
      email: (prescription.centerId as any).email,
    },
    prescriptionNo: prescription.prescriptionNo,
    createdAt: prescription.createdAt.toISOString(),
    patientId: {
      patientName: (prescription.patientId as any).patientName || "",
      age: (prescription.patientId as any).age || "",
      contactNo: (prescription.patientId as any).contactNo || "",
      email: (prescription.patientId as any).email || "",
      gender: (prescription.patientId as any).gender,
      title: (prescription.patientId as any).title,
    },
    reasonForVisit: prescription.reasonForVisit || "",
    symptoms: prescription.symptoms || [],
    labTests: prescription.labTests || [],
    vitalSigns: prescription.vitalSigns || [],
    clinicalDetails: prescription.clinicalDetails || "",
    advice: prescription.advice || "",
    remark: prescription.remark,
    medications: prescription.medications || [],
    prescriberDetails: {
      name: prescription.prescriberDetails.name || "",
      specialization: prescription.prescriberDetails.specialization || "",
      slmcNo: prescription.prescriberDetails.slmcNo || "",
      title: prescription.prescriberDetails.title,
      digitalSignature: prescription.prescriberDetails.digitalSignature,
    },
  };

  // Generate PDF
  const pdfBuffer = await generatePrescriptionPDF(prescriptionData);

  // Send email
  await sendPrescriptionEmail(patientEmail, prescriptionData, pdfBuffer);

  // Update modification history
  return Prescription.findOneAndUpdate(
    { prescriptionNo, isDeleted: false },
    {
      $push: {
        modificationHistory: {
          action: "EMAIL_SENT",
          modifiedBy: userId,
          date: new Date(),
          details: `Prescription sent to ${patientEmail}`,
        },
      },
    },
    { new: true }
  );
};
