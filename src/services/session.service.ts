import Session from "../models/session.model";
import MedicalCenter from "../models/medicalCenter.model";
import { ISession } from "../interfaces/session.interface";
import { ACTIONS } from "../constants/modification-history.constant";
import Appointment from "../models/appointment.model";
import Patient from "../models/patient.model";
import twilio from "twilio";
import nodemailer from "nodemailer";
import { sessionActivationTemplate, sessionDeactivationTemplate } from "../utils/otpEmailTemplates";

// Initialize Twilio client (if not already done)
const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);

// Initialize nodemailer transporter (if not already done)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const createSession = async (
  sessionData: any,
  createdBy: string
): Promise<ISession> => {
  const center = await MedicalCenter.findById(sessionData.centerId)
    .select("centerId")
    .lean();

  if (!center) throw new Error("Medical center not found");

  // Check if session name already exists for this center
  const existingSession = await Session.findOne({
    centerId: sessionData.centerId,
    sessionName: sessionData.sessionName,
    isDeleted: { $ne: true },
  });

  if (existingSession) {
    throw new Error(
      `Session name "${sessionData.sessionName}" already exists for this center. Please choose a different name.`
    );
  }

  // Generate sessionId
  const lastSession = await Session.findOne({ centerId: sessionData.centerId })
    .sort({ sessionId: -1 })
    .limit(1);

  const centerCode = center.centerId;
  const lastNumber = lastSession
    ? parseInt(lastSession.sessionId.split("-S")[1])
    : 0;

  const sessionId = `${centerCode}-S${(lastNumber + 1)
    .toString()
    .padStart(3, "0")}`;

  const session = new Session({
    ...sessionData,
    sessionId,
    modificationHistory: [
      { action: ACTIONS.CREATE, modifiedBy: createdBy, date: new Date() },
    ],
  });

  return await session.save();
};

export const getSessionById = async (
  sessionId: string
): Promise<ISession | null> => {
  return Session.findOne({ sessionId })
    .populate("centerId", "centerId centerName")
    .lean();
};

export const getAllSessions = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  centerId?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    centerId,
    isActive,
    includeDeleted = false,
  } = params;

  const skip = (page - 1) * limit;
  const query: any = {};

  if (!includeDeleted) {
    query.isDeleted = { $ne: true };
  }

  if (centerId) {
    query.centerId = centerId;
  }

  if (typeof isActive === "boolean") {
    query.isSessionActive = isActive;
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [{ sessionId: searchRegex }, { sessionName: searchRegex }];
  }

  const [sessions, total] = await Promise.all([
    Session.find(query)
      .populate("centerId", "centerId centerName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Session.countDocuments(query),
  ]);

  return {
    data: sessions,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
  };
};

export const updateSession = async (
  sessionId: string,
  updateData: Partial<ISession>,
  modifiedBy: string
): Promise<ISession | null> => {
  const session = await Session.findOne({ sessionId });
  if (!session) return null;

  const changes: Record<string, { from: any; to: any }> = {};
  const original = session.toObject();

  Object.keys(updateData).forEach((key) => {
    if (updateData[key as keyof ISession] !== original[key as keyof ISession]) {
      changes[key] = {
        from: original[key as keyof ISession],
        to: updateData[key as keyof ISession],
      };
      session.set(key, updateData[key as keyof ISession]);
    }
  });

  if (Object.keys(changes).length > 0) {
    session.modificationHistory.push({
      action: ACTIONS.UPDATE,
      modifiedBy,
      date: new Date(),
    });
  }

  return await session.save();
};

export const deleteSession = async (
  sessionId: string,
  deletedBy: string
): Promise<ISession | null> => {
  return Session.findOneAndUpdate(
    { sessionId },
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
};

// export const toggleSessionActive = async (
//   sessionId: string,
//   isActive: boolean,
//   modifiedBy: string
// ): Promise<ISession | null> => {
//   const session = await Session.findOne({ sessionId });
//   if (!session) {
//     throw new Error("Session not found");
//   }

//   const now = new Date();

//   if (isActive) {
//     const timeOptions: Intl.DateTimeFormatOptions = {
//       hour: "numeric",
//       minute: "numeric",
//       hour12: true,
//     };

//     if (session.startTime && session.startTime > now) {
//       throw new Error(
//         `Session "${
//           session.sessionName || session.sessionId
//         }" cannot be activated yet. It starts at ${session.startTime.toLocaleTimeString(
//           undefined,
//           timeOptions
//         )}.`
//       );
//     }

//     if (session.endTime && session.endTime < now) {
//       throw new Error(
//         `Session "${
//           session.sessionName || session.sessionId
//         }" has already ended at ${session.endTime.toLocaleTimeString(
//           undefined,
//           timeOptions
//         )} and cannot be activated.`
//       );
//     }
//   }

//   session.isSessionActive = isActive;
//   session.modificationHistory.push({
//     action: isActive ? ACTIONS.ACTIVATE : ACTIONS.DEACTIVATE,
//     modifiedBy,
//     date: new Date(),
//   });

//   return await session.save();
// };

export const getSessionSuggestions = async (params: {
  centerId?: string;
  search?: string;
  limit?: number;
}) => {
  const { centerId, search = "", limit = 10 } = params;

  const query: any = { isDeleted: { $ne: true } };

  if (centerId) query.centerId = centerId;
  if (search) query.sessionName = { $regex: search, $options: "i" };

  const sessions = await Session.find(query)
    .select("sessionId sessionName")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return sessions.map((s) => ({
    id: s._id,
    sessionId: s.sessionId,
    sessionName: s.sessionName,
  }));
};
export const toggleSessionActive = async (
  sessionId: string,
  isActive: boolean,
  modifiedBy: string
): Promise<ISession | null> => {
  const session = await Session.findOne({ sessionId });
  if (!session) {
    throw new Error("Session not found");
  }

  session.isSessionActive = isActive;
  session.modificationHistory.push({
    action: isActive ? ACTIONS.ACTIVATE : ACTIONS.DEACTIVATE,
    modifiedBy,
    date: new Date(),
  });

  const updatedSession = await session.save();

  // Send notifications based on session status change
  try {
    if (isActive) {
      await sendSessionActivationNotifications(sessionId);
    } else {
      await sendSessionDeactivationNotifications(sessionId);
    }
  } catch (error) {
    console.error("Error sending session notifications:", error);
    // Don't throw error here as we don't want to fail the session status change
    // just because notifications failed
  }

  return updatedSession;
};

// Helper function to send session activation notifications
const sendSessionActivationNotifications = async (sessionId: string) => {
  // Get session details
  const sessionDetails = await Session.findOne({ sessionId })
    .select("sessionName")
    .lean();

  if (!sessionDetails) {
    console.error("Session not found for notifications");
    return;
  }

  // Get today's date
  const today = new Date();

  // Find all appointments for this session today
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    sessionId,
    date: { $gte: startOfDay, $lte: endOfDay },
    isCancelled: { $ne: true },
    status: "scheduled",
  })
    .populate("patientId", "patientName email contactNo")
    .populate("centerId", "centerName address contactNo")
    .lean();

  // Send notifications for each appointment
  for (const appointment of appointments) {
    const patient = appointment.patientId as any;
    const center = appointment.centerId as any;

    if (!patient || !center) continue;

    const appointmentDate = new Date(appointment.date).toDateString();

    // Send SMS if patient has contact number
    if (patient.contactNo) {
      try {
        const smsMsg =
          `Session is started, doctor arrived now...\n\n` +
          `Patient: ${patient.patientName}\n` +
          `Center: ${center.centerName}\n` +
          `Session: ${sessionDetails.sessionName}\n` +
          `Date: ${appointmentDate}\n\n` +
          `Please proceed to the center.`;

        await client.messages.create({
          body: smsMsg,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: patient.contactNo,
        });

        console.log(`Session activation SMS sent to: ${patient.contactNo}`);
      } catch (error) {
        console.error(`Failed to send SMS to ${patient.contactNo}:`, error);
      }
    }

    // Send email if patient has email address
    if (patient.email) {
      try {
        await transporter.sendMail({
          from: '"DocFlex Pro" <no-reply@docflexpro.com>',
          to: patient.email,
          subject: "Session Started - Doctor Has Arrived",
          html: sessionActivationTemplate(
            patient.patientName,
            center.centerName,
            center.address,
            center.contactNo,
            sessionDetails.sessionName,
            appointmentDate
          ),
        });

        console.log(`Session activation email sent to: ${patient.email}`);
      } catch (error) {
        console.error(`Failed to send email to ${patient.email}:`, error);
      }
    }
  }
};

const sendSessionDeactivationNotifications = async (sessionId: string) => {
  // Get session details
  const sessionDetails = await Session.findOne({ sessionId })
    .select("sessionName")
    .lean();

  if (!sessionDetails) {
    console.error("Session not found for notifications");
    return;
  }

  // Get today's date
  const today = new Date();

  // Find all appointments for this session today
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    sessionId,
    date: { $gte: startOfDay, $lte: endOfDay },
    isCancelled: { $ne: true },
    status: "scheduled",
  })
    .populate("patientId", "patientName email contactNo")
    .populate("centerId", "centerName address contactNo")
    .lean();

  // Send notifications for each appointment
  for (const appointment of appointments) {
    const patient = appointment.patientId as any;
    const center = appointment.centerId as any;

    if (!patient || !center) continue;

    const appointmentDate = new Date(appointment.date).toDateString();

    // Send SMS if patient has contact number
    if (patient.contactNo) {
      try {
        const smsMsg =
          `Session has ended, doctor is no longer available...\n\n` +
          `Patient: ${patient.patientName}\n` +
          `Center: ${center.centerName}\n` +
          `Session: ${sessionDetails.sessionName}\n` +
          `Date: ${appointmentDate}\n\n` +
          `If you missed your appointment, please contact the center to reschedule.`;

        await client.messages.create({
          body: smsMsg,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: patient.contactNo,
        });

        console.log(`Session deactivation SMS sent to: ${patient.contactNo}`);
      } catch (error) {
        console.error(`Failed to send SMS to ${patient.contactNo}:`, error);
      }
    }

    // Send email if patient has email address
    if (patient.email) {
      try {
        await transporter.sendMail({
          from: '"DocFlex Pro" <no-reply@docflexpro.com>',
          to: patient.email,
          subject: "Session Ended - Doctor No Longer Available",
          html: sessionDeactivationTemplate(
            patient.patientName,
            center.centerName,
            center.address,
            center.contactNo,
            sessionDetails.sessionName,
            appointmentDate
          ),
        });

        console.log(`Session deactivation email sent to: ${patient.email}`);
      } catch (error) {
        console.error(`Failed to send email to ${patient.email}:`, error);
      }
    }
  }
};
