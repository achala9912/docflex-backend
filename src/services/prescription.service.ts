import Prescription from "../models/prescription.model";
import Appointment from "../models/appointment.model";
import { ACTIONS } from "../constants/modification-history.constant";
import { Types } from "mongoose";


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
}) => {
  const { date, page = 1, limit = 10, search, centerId, productId } = filters;

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

export const getPrescriptionByIdService = async (id: string) => {
  return Prescription.findById(id)
    .populate("patientId")
    .populate("centerId")
    .populate("appointmentId");
};

export const updatePrescriptionService = async (
  id: string,
  data: any,
  userId: string
) => {
  return Prescription.findByIdAndUpdate(
    id,
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

export const cancelPrescriptionService = async (id: string, userId: string) => {
  return Prescription.findByIdAndUpdate(
    id,
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
