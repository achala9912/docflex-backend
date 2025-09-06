import appointment from "../models/appointment.model";
import MedicalCenter from "../models/medicalCenter.model";
import session from "../models/session.model";
import { IAppointment } from "../interfaces/appointment.interface";
import { ISession } from "../interfaces/session.interface";
import { ACTIONS } from "../constants/modification-history.constant";
import twilio from "twilio";
import Patient from "../models/patient.model";
import nodemailer from "nodemailer";
import {
  appointmentCancellationTemplate,
  appointmentConfirmationTemplate,
} from "../utils/otpEmailTemplates";
import { Types } from "mongoose";

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
    .populate("centerId", "centerId centerName address contactNo town email logo")
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

  const match: any = {};
  if (centerId) match.centerId = new Types.ObjectId(centerId);
  if (typeof isPatientvisited === "boolean")
    match.isPatientvisited = isPatientvisited;
  if (!includeDeleted) match.isDeleted = { $ne: true };
  if (sessionId) match.sessionId = sessionId;

  // Handle date filter
  const queryDate = date || new Date().toISOString().split("T")[0]; 
  const startDate = new Date(`${queryDate}T00:00:00.000Z`);
  const endDate = new Date(`${queryDate}T23:59:59.999Z`);
  match.date = { $gte: startDate, $lte: endDate };

  const debugInfo = { startDate, endDate };

  const pipeline: any[] = [
    { $match: match },

    // Lookup patient
    {
      $lookup: {
        from: "patients",
        localField: "patientId",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: "$patient" },

    // Lookup center
    {
      $lookup: {
        from: "medicalcenters", 
        localField: "centerId",
        foreignField: "_id",
        as: "center",
      },
    },
    { $unwind: "$center" },
  ];

  // Search filter
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { appointmentId: { $regex: search, $options: "i" } },
          { "patient.patientName": { $regex: search, $options: "i" } },
          { "patient.contactNo": { $regex: search, $options: "i" } },
          { "patient.nic": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  // Count total
  const countPipeline = [...pipeline, { $count: "total" }];
  const totalResult = await appointment.aggregate(countPipeline);
  const total = totalResult[0]?.total || 0;

  // Sort + pagination
  pipeline.push(
    { $sort: { date: -1, tokenNo: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  // Fetch appointments
  const rawAppointments = await appointment.aggregate(pipeline);

  // Fetch session details
  const sessionIds = rawAppointments.map((a) => a.sessionId);
  const sessions = await session
    .find({ sessionId: { $in: sessionIds }, isDeleted: { $ne: true } })
    .select("sessionId sessionName startTime endTime isSessionActive")
    .lean();

  const sessionMap = new Map<string, ISession>();
  sessions.forEach((s) => sessionMap.set(String(s.sessionId), s));

  // Map final data with session and centerName
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

export const cancelAppointment = async (
  appointmentId: string,
  cancelledBy: string
): Promise<IAppointment | null> => {
  const appointmentToCancel = await appointment.findOne({ appointmentId });
  if (!appointmentToCancel) {
    throw new Error("Appointment not found");
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

  // =============================
  // 🔹 Send Cancellation Notifications (SMS & Email)
  // =============================
  if (updatedAppointment) {
    try {
      // Fetch patient details
      const patient = await Patient.findById(
        updatedAppointment.patientId
      ).lean();

      // Fetch center details
      const center = await MedicalCenter.findById(updatedAppointment.centerId)
        .select("centerId centerName address contactNo")
        .lean();

      // Fetch session details
      const currentSession = await session
        .findOne({
          sessionId: updatedAppointment.sessionId,
        })
        .select("sessionName")
        .lean();

      if (patient && center && currentSession) {
        const appointmentDate = new Date(updatedAppointment.date);

        // =============================
        // 🔹 SMS Notification
        // =============================
        if (patient.contactNo) {
          const smsMsg = `❌ Appointment Cancelled!

👤 Patient: ${patient.patientName}
🏥 Center: ${center.centerName}
📍 Address: ${center.address}
📞 Contact: ${center.contactNo}

🎫 Appointment ID: ${updatedAppointment.appointmentId}
🔢 Token No: ${updatedAppointment.tokenNo}
📅 Date: ${appointmentDate.toDateString()}
⏰ Session: ${currentSession.sessionName}

Your appointment has been cancelled. Please contact the center for rescheduling.`;

          try {
            const message = await client.messages.create({
              body: smsMsg,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: patient.contactNo,
            });
            console.log(`📲 Cancellation SMS sent to: ${patient.contactNo}`);
          } catch (error: any) {
            console.error(
              "❌ Cancellation SMS failed:",
              error.message || error
            );
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
              subject: "Appointment Cancellation Notification",
              html: appointmentCancellationTemplate(
                patient.patientName || "Patient",
                center.centerName || "Medical Center",
                center.address || "",
                center.contactNo || "",
                updatedAppointment.appointmentId,
                updatedAppointment.tokenNo,
                appointmentDate.toDateString(),
                currentSession.sessionName
              ),
            });
            console.log(`📧 Cancellation email sent to: ${patient.email}`);
          } catch (error) {
            console.error("❌ Cancellation email failed:", error);
          }
        }
      }
    } catch (notificationError) {
      console.error(
        "❌ Error sending cancellation notifications:",
        notificationError
      );
    }
  }

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

    // ✅ auto-change status if patient visited
    if (status.isPatientvisited) {
      updatePayload.$set.status = "completed";
    } else {
      // if un-marking patient visited, revert to scheduled (optional)
      updatePayload.$set.status = "scheduled";
    }
  }

  if (typeof status.isCancelled === "boolean") {
    updatePayload.$set.isCancelled = status.isCancelled;

    if (status.isCancelled) {
      updatePayload.$set.status = "cancelled";
    }
  }

  updatePayload.$push = {
    modificationHistory: {
      action: ACTIONS.UPDATE,
      modifiedBy: updatedBy,
      date: new Date(),
    },
  };

  const updatedAppointment = await appointment.findOneAndUpdate(
    { appointmentId },
    updatePayload,
    { new: true }
  );

  // =============================
  // 🔹 Send Cancellation Notifications if appointment was cancelled
  // =============================
  if (updatedAppointment && status.isCancelled === true) {
    try {
      // Fetch patient details
      const patient = await Patient.findById(
        updatedAppointment.patientId
      ).lean();

      // Fetch center details
      const center = await MedicalCenter.findById(updatedAppointment.centerId)
        .select("centerId centerName address contactNo")
        .lean();

      // Fetch session details
      const currentSession = await session
        .findOne({
          sessionId: updatedAppointment.sessionId,
        })
        .select("sessionName")
        .lean();

      if (patient && center && currentSession) {
        const appointmentDate = new Date(updatedAppointment.date);

        // SMS Notification
        if (patient.contactNo) {
          const smsMsg = `❌ Appointment Cancelled!

👤 Patient: ${patient.patientName}
🏥 Center: ${center.centerName}
🎫 Appointment ID: ${updatedAppointment.appointmentId}
📅 Date: ${appointmentDate.toDateString()}

Your appointment has been cancelled. Please contact the center for rescheduling.`;

          try {
            await client.messages.create({
              body: smsMsg,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: patient.contactNo,
            });
          } catch (error) {
            console.error("❌ Cancellation SMS failed:", error);
          }
        }

        // Email Notification
        if (patient.email) {
          try {
            const emailHtml = `...`; // Same email template as above
            await transporter.sendMail({
              from: '"DocFlex Pro" <no-reply@docflexpro.com>',
              to: patient.email,
              subject: "Appointment Cancellation Notification",
              html: emailHtml,
            });
          } catch (error) {
            console.error("❌ Cancellation email failed:", error);
          }
        }
      }
    } catch (notificationError) {
      console.error(
        "❌ Error sending cancellation notifications:",
        notificationError
      );
    }
  }

  return updatedAppointment;
};

export const getActiveSessionPatientVisitedAppointment = async (params: {
  date?: string;
  centerId: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: IAppointment[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}> => {
  const { date, centerId, search, page = 1, limit = 10 } = params;

  const query: any = {
    centerId,
    isPatientvisited: true,
    isDeleted: { $ne: true },
  };

  // ✅ Handle date filter
  if (date) {
    const [year, month, day] = date.split("-").map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    startDate.setMinutes(startDate.getMinutes() - 330); // adjust to IST

    const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    endDate.setMinutes(endDate.getMinutes() - 330);

    query.date = { $gte: startDate, $lte: endDate };
  }

  if (search) {
    query.$or = [
      { appointmentId: { $regex: search, $options: "i" } },
      { sessionId: { $regex: search, $options: "i" } },
      { patientName: { $regex: search, $options: "i" } },
    ];
  }

  // ✅ Get active session
  const activeSession = await session
    .findOne({
      centerId,
      isSessionActive: true,
      endTime: { $gt: new Date() },
      isDeleted: { $ne: true },
    })
    .lean();

  if (!activeSession) {
    return {
      data: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
      limit,
    };
  }

  query.sessionId = activeSession.sessionId;

  // ✅ Count total
  const total = await appointment.countDocuments(query);

  // ✅ Fetch with pagination
  const rawAppointments = await appointment
    .find(query)
    .populate("centerId", "centerId centerName")
    .populate(
      "patientId",
      "patientId patientName age email contactNo address nic remark gender title"
    )
    .sort({ tokenNo: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    data: rawAppointments,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
  };
};
