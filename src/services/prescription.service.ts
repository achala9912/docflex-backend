import Prescription from "../models/prescription.model";
import Appointment from "../models/appointment.model";
import { ACTIONS } from "../constants/modification-history.constant";
import { Types } from "mongoose";
import { generatePrescriptionPDF } from "../utils/pdfGenerator";
import { sendPrescriptionEmail } from "../external-services/emailService";
import { PrescriptionData } from "../types/prescriptionTypes"; // Make sure this import exists

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
  // Check if the appointment exists and patient has visited
  const appointment = await Appointment.findById(data.appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // Check if patient has visited (using both status and isPatientvisited field)
  const hasVisited = appointment.isPatientvisited === true;

  if (!hasVisited) {
    throw new Error("Cannot create prescription - patient has not visited yet");
  }

  const prescriptionNo = await generatePrescriptionNo(data.appointmentId);

  return Prescription.create({
    ...data,
    prescriptionNo,
    createdBy: userId,
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
      { "patientId.name": { $regex: search, $options: "i" } },
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
  return Prescription.findOneAndUpdate(
    { prescriptionNo, isDeleted: false },
    {
      ...data,
      $push: {
        modificationHistory: {
          action: ACTIONS.UPDATE,
          modifiedBy: userId,
          date: new Date(),
        },
      },
    },
    { new: true }
  );
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

  // Check if patient has email - add type assertion for TypeScript
  const patientEmail = (prescription.patientId as any).email;
  if (!patientEmail) {
    throw new Error("Patient does not have an email address");
  }

  // Generate PDF - you may need to cast the prescription to the correct type
  const pdfBuffer = await generatePrescriptionPDF(
    prescription as unknown as PrescriptionData
  );

  // Send email
  await sendPrescriptionEmail(
    patientEmail,
    prescription as unknown as PrescriptionData,
    pdfBuffer
  );

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
