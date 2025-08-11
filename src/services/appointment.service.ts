import appointment from "../models/appointment.model";
import MedicalCenter from "../models/medicalCenter.model";
import session from "../models/session.model";
import { IAppointment } from "../interfaces/appointment.interface";
import { ISession } from "../interfaces/session.interface";
import { ACTIONS } from "../constants/modification-history.constant";

export const createAppointment = async (
  appointmentData: any,
  createdBy: string
): Promise<IAppointment> => {
  const center = await MedicalCenter.findById(appointmentData.centerId)
    .select("centerId")
    .lean();
  if (!center) {
    throw new Error("Medical center not found");
  }

  const currentSession = await session
    .findOne({
      sessionId: appointmentData.sessionId,
      centerId: appointmentData.centerId,
      isSessionActive: true,
    })
    .lean();

  if (!currentSession) {
    throw new Error("Active session not found for this center");
  }

  const appointmentDate = new Date(appointmentData.appointmentDate);
  if (
    appointmentDate < new Date(currentSession.startTime) ||
    appointmentDate > new Date(currentSession.endTime)
  ) {
    throw new Error("Cannot create appointment outside of session hours");
  }

  const lastAppointment = await appointment
    .findOne({
      sessionId: appointmentData.sessionId,
    })
    .sort({ tokenNo: -1 })
    .limit(1);

  const tokenNo = lastAppointment ? lastAppointment.tokenNo + 1 : 1;

  // const centerCode = center.centerId;
  const sessionCode = currentSession.sessionId
    .replace(/\s+/g, "")
    .toUpperCase();
  const lastNumber = lastAppointment
    ? parseInt(lastAppointment.appointmentId.split("-A")[1])
    : 0;
  const appointmentId = `${sessionCode}-A${(lastNumber + 1)
    .toString()
    .padStart(3, "0")}`;

  const now = new Date();

  const newAppointment = new appointment({
    ...appointmentData,
    appointmentId,
    tokenNo,
    date: now, // creation timestamp
    modificationHistory: [
      {
        action: ACTIONS.CREATE,
        modifiedBy: createdBy,
        date: now,
      },
    ],
  });

  return await newAppointment.save();
};

export const getCurrentSessionAppointments = async (
  sessionId: string
): Promise<IAppointment[]> => {
  return appointment
    .find({ sessionId })
    .sort({ tokenNo: 1 })
    .populate("centerId", "centerId centerName")
    .lean();
};

export const getAppointmentById = async (
  appointmentId: string
): Promise<IAppointment | null> => {
  return appointment
    .findOne({ appointmentId })
    .populate("centerId", "centerId centerName")
    .populate({
      path: "sessionId",
      select: "sessionId sessionName startTime endTime isSessionActive",
      match: { isDeleted: { $ne: true } },
    })
    .lean();
};

export const getAllAppointments = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  centerId?: string;
  isPatientvisited?: boolean;
  includeDeleted?: boolean;
}): Promise<{
  data: IAppointment[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}> => {
  const {
    page = 1,
    limit = 10,
    search = "",
    centerId,
    isPatientvisited,
    includeDeleted = false,
  } = params;

  const query: any = {};

  if (search) {
    query.$or = [
      { appointmentId: { $regex: search, $options: "i" } },
      { patientId: { $regex: search, $options: "i" } },
    ];
  }

  if (centerId) {
    query.centerId = centerId;
  }

  if (typeof isPatientvisited === "boolean") {
    query.isPatientvisited = isPatientvisited;
  }

  if (!includeDeleted) {
    query.isDeleted = { $ne: true };
  }

  const total = await appointment.countDocuments(query);
  const data = await appointment
    .find(query)
    .populate("centerId", "centerId centerName")
    .populate("sessionId", "sessionName startTime endTime")
    .sort({ date: -1, tokenNo: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
  };
};

export const cancelAppointment = async (
  appointmentId: string,
  cancelledBy: string
): Promise<IAppointment | null> => {
  const appointmentToCancel = await appointment.findOne({ appointmentId });
  if (!appointmentToCancel) {
    throw new Error("Appointment not found");
  }

  // Check if the appointment session is still active
  const currentSession = await session.findById(appointmentToCancel.sessionId);
  if (!currentSession?.isSessionActive) {
    throw new Error("Cannot cancel appointment for inactive session");
  }

  const updatedAppointment = await appointment.findOneAndUpdate(
    { appointmentId },
    {
      $set: { isCancelled: true },
      $push: {
        modificationHistory: {
          action: ACTIONS.CANCEL,
          modifiedBy: cancelledBy,
          date: new Date(),
        },
      },
    },
    { new: true }
  );

  return updatedAppointment;
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: { isPatientvisited?: boolean; isCancelled?: boolean },
  updatedBy: string
): Promise<IAppointment | null> => {
  const updatePayload: any = { $set: {} };

  if (typeof status.isPatientvisited === "boolean") {
    updatePayload.$set.isPatientvisited = status.isPatientvisited;
  }

  if (typeof status.isCancelled === "boolean") {
    updatePayload.$set.isCancelled = status.isCancelled;
  }

  updatePayload.$push = {
    modificationHistory: {
      action: ACTIONS.UPDATE,
      modifiedBy: updatedBy,
      date: new Date(),
    },
  };

  return appointment.findOneAndUpdate({ appointmentId }, updatePayload, {
    new: true,
  });
};

export const getActiveSessionAppointments = async (
  centerId: string
): Promise<{ session: ISession; appointments: IAppointment[] } | null> => {
  // Find active session for the center
  const activeSession = (await session
    .findOne({
      centerId,
      isSessionActive: true,
      endTime: { $gt: new Date() },
    })
    .lean()) as ISession;

  if (!activeSession) {
    return null;
  }

  // Get all appointments for this session
  const appointments = await appointment
    .find({
      sessionId: activeSession._id,
      isCancelled: { $ne: true },
    })
    .sort({ tokenNo: 1 })
    .lean();

  return {
    session: activeSession,
    appointments,
  };
};
