import Patient from "../models/patient.model";
import Appointment from "../models/appointment.model";
import Prescription from "../models/prescription.model";
import { Types } from "mongoose";


export const getTotalRegisteredPatients = async (centerId: string) => {
  const query: any = { isDeleted: false, centerId: new Types.ObjectId(centerId) };
  return await Patient.countDocuments(query);
};


export const getCurrentDateTotalAppointments = async (centerId: string) => {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  const query: any = { createdAt: { $gte: start, $lte: end }, centerId: new Types.ObjectId(centerId) };
  return await Appointment.countDocuments(query);
};


export const getCurrentDateTotalPrescriptions = async (centerId: string) => {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  const query: any = { createdAt: { $gte: start, $lte: end }, isDeleted: false, centerId: new Types.ObjectId(centerId) };
  return await Prescription.countDocuments(query);
};


export const getDashboardMetrics = async (centerId: string) => {
  const [totalPatients, totalAppointments, totalPrescriptions] = await Promise.all([
    getTotalRegisteredPatients(centerId),
    getCurrentDateTotalAppointments(centerId),
    getCurrentDateTotalPrescriptions(centerId),
  ]);

  return {
    totalPatients,
    currentDateTotalAppointments: totalAppointments,
    currentDateTotalPrescriptions: totalPrescriptions,
  };
};
