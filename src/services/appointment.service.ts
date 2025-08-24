import appointment from "../models/appointment.model";
import MedicalCenter from "../models/medicalCenter.model";
import session from "../models/session.model";
import { IAppointment } from "../interfaces/appointment.interface";
import { ISession } from "../interfaces/session.interface";
import { ACTIONS } from "../constants/modification-history.constant";
import twilio from "twilio";
import Patient from "../models/patient.model";
import nodemailer from "nodemailer";
import { appointmentConfirmationTemplate } from "../utils/otpEmailTemplates";

const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const createAppointment = async (
  appointmentData: any,
  createdBy: string
): Promise<IAppointment> => {
  // 1. Validate medical center
  const center = await MedicalCenter.findById(appointmentData.centerId)
    .select("centerId centerName address contactNo")
    .lean();

  if (!center) {
    throw new Error("Medical center not found");
  }

  // Alias for template consistency
  const centerAddress = center?.address || "";

  // 2. Get session
  const currentSession = await session
    .findOne({
      sessionId: appointmentData.sessionId,
      centerId: appointmentData.centerId,
      isDeleted: { $ne: true },
    })
    .lean();

  if (!currentSession) {
    throw new Error("Session not found for this center");
  }

  // 3. Check if session end time has passed (for the given date)
  const appointmentDate = new Date(appointmentData.date);
  const sessionEnd = new Date(appointmentDate);
  sessionEnd.setHours(
    new Date(currentSession.endTime).getHours(),
    new Date(currentSession.endTime).getMinutes(),
    0,
    0
  );

  if (new Date() > sessionEnd) {
    throw new Error("Cannot create appointment after session end time");
  }

  // 4. Prevent duplicate appointment for same patient on same date/session/center
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await appointment.findOne({
    patientId: appointmentData.patientId,
    centerId: appointmentData.centerId,
    sessionId: appointmentData.sessionId,
    date: { $gte: startOfDay, $lte: endOfDay },
    isCancelled: { $ne: true },
  });

  if (existing) {
    throw new Error(
      "Patient already has an appointment for this session on this date"
    );
  }

  // 5. Find last token for this session on the same date
  const lastAppointment = await appointment
    .findOne({
      sessionId: appointmentData.sessionId,
      centerId: appointmentData.centerId,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
    .sort({ tokenNo: -1 })
    .lean();

  const tokenNo = lastAppointment ? lastAppointment.tokenNo + 1 : 1;

  // 6. Generate appointmentId (include date so it's unique per day)
  const sessionCode = currentSession.sessionId
    .replace(/\s+/g, "")
    .toUpperCase();

  const dateCode = appointmentDate
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "");

  const lastNumber = lastAppointment
    ? parseInt(lastAppointment.appointmentId.split("-A")[1])
    : 0;

  const appointmentId = `${sessionCode}-${dateCode}-A${(lastNumber + 1)
    .toString()
    .padStart(3, "0")}`;

  // 7. Save appointment
  const now = new Date();
  const newAppointment = new appointment({
    ...appointmentData,
    appointmentId,
    tokenNo,
    status: "scheduled",
    modificationHistory: [
      {
        action: ACTIONS.CREATE,
        modifiedBy: createdBy,
        date: now,
      },
    ],
  });

  const savedAppointment = await newAppointment.save();

  // 8. Fetch patient
  const patient = await Patient.findById(savedAppointment.patientId).lean();

  if (patient) {
    // =============================
    // 🔹 SMS Notification
    // =============================
    if (patient.contactNo) {
      const smsMsg = `✅ Appointment Confirmed!

👤 Patient: ${patient.patientName}
🏥 Center: ${center.centerName}
📍 Address: ${center.address}
📞 Contact: ${center.contactNo}

🎫 Appointment ID: ${savedAppointment.appointmentId}
🔢 Token No: ${savedAppointment.tokenNo}
📅 Date: ${appointmentDate.toDateString()}
⏰ Session: ${currentSession.sessionName}

Please arrive 10 minutes before your session.`;

      try {
        // Send SMS
        const message = await client.messages.create({
          body: smsMsg,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: patient.contactNo,
        });

        console.log(`📲 Sending SMS to patient: ${patient.contactNo}`);
        console.log(`📄 SMS content: ${smsMsg}`);
        console.log(`✅ SMS sent! Message SID: ${message.sid}`);

        // Fetch message status
        const messageDetails = await client.messages(message.sid).fetch();
        console.log(`ℹ️ Message Status: ${messageDetails.status}`);
        if (messageDetails.errorCode) {
          console.error(
            `❌ SMS Error: ${messageDetails.errorMessage} (Code: ${messageDetails.errorCode})`
          );
        }
      } catch (error: any) {
        console.error("❌ SMS failed:", error.message || error);
      }
    }

    // =============================
    // 🔹 Email Notification
    // =============================
    if (patient.email) {
      try {
        await transporter.sendMail({
          from: '"DocFlex Pro" <no-reply@docflexpro.com>',
          to: patient.email,
          subject: "Appointment Confirmation",
          html: appointmentConfirmationTemplate(
            patient.patientName || "Patient",
            center.centerName || "Medical Center",
            centerAddress,
            center.contactNo,
            savedAppointment.appointmentId,
            savedAppointment.tokenNo,
            appointmentDate.toDateString(),
            currentSession.sessionName
          ),
        });
      } catch (error) {
        console.error("❌ Email failed:", error);
      }
    }
  }

  return savedAppointment;
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
  const appt = await appointment
    .findOne({ appointmentId })
    .populate("centerId", "centerId centerName")
    .populate(
      "patientId",
      "patientId patientName age email contactNo address nic remark"
    )
    .lean();

  if (!appt) return null;

  const sess = await session
    .findOne({ sessionId: appt.sessionId, isDeleted: { $ne: true } })
    .select("sessionId sessionName startTime endTime isSessionActive")
    .lean();

  return {
    ...appt,
    sessionId: sess,
  };
};

export const getAllAppointments = async (params: {
  date?: string;
  sessionId?: string;
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
  debug?: any;
}> => {
  const {
    date,
    sessionId,
    page = 1,
    limit = 10,
    search = "",
    centerId,
    isPatientvisited,
    includeDeleted = false,
  } = params;

  const query: any = {};
  let debugInfo: any = {};

  // 🔹 Search filter
  if (search) {
    query.$or = [
      { appointmentId: { $regex: search, $options: "i" } },
      { patientName: { $regex: search, $options: "i" } },
    ];
  }

  if (centerId) query.centerId = centerId;
  if (typeof isPatientvisited === "boolean")
    query.isPatientvisited = isPatientvisited;
  if (!includeDeleted) query.isDeleted = { $ne: true };
  if (sessionId) query.sessionId = sessionId;

  if (date) {
    // Add debug info
    debugInfo.inputDate = date;

    // date filtering (with UTC conversion)
    const [year, month, day] = date.split("-").map(Number);
    debugInfo.parsedDate = { year, month, day };

    const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    startDate.setMinutes(startDate.getMinutes() - 330); // Sri Lanka UTC offset

    const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    endDate.setMinutes(endDate.getMinutes() - 330);

    debugInfo.dateRange = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startDateLocal: startDate.toString(),
      endDateLocal: endDate.toString(),
    };

    query.date = { $gte: startDate, $lte: endDate };
  }

  debugInfo.finalQuery = JSON.stringify(query, null, 2);

  // 🔹 Count total documents
  const total = await appointment.countDocuments(query);

  // 🔹 Fetch appointments with center and patient info
  const rawAppointments = await appointment
    .find(query)
    .populate("centerId", "centerId centerName")
    .populate(
      "patientId",
      "patientId patientName age email contactNo address nic remark gender"
    )
    .sort({ date: -1, tokenNo: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Add debug info about found appointments
  debugInfo.foundAppointments = rawAppointments.map((a) => ({
    appointmentId: a.appointmentId,
    date: a.date,
    dateString: new Date(a.date).toISOString(),
  }));

  // 🔹 Fetch all session details in bulk
  const sessionIds = rawAppointments.map((a) => a.sessionId);
  const sessions = await session
    .find({ sessionId: { $in: sessionIds }, isDeleted: { $ne: true } })
    .select("sessionId sessionName startTime endTime isSessionActive")
    .lean();

  // 🔹 Map sessionId → session object
  const sessionMap = new Map<string, ISession>();
  sessions.forEach((s) => {
    sessionMap.set(String(s.sessionId), s);
  });

  // 🔹 Merge session details into appointments
  const data = rawAppointments.map((a) => ({
    ...a,
    sessionId: sessionMap.get(String(a.sessionId)) || null,
  }));

  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
    debug: debugInfo,
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
  const currentSession = await session.findOne({
    sessionId: appointmentToCancel.sessionId,
  });
  if (!currentSession?.isSessionActive) {
    throw new Error("Cannot cancel appointment for inactive session");
  }

  const updatedAppointment = await appointment.findOneAndUpdate(
    { appointmentId },
    {
      $set: { status: "cancelled" },
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
