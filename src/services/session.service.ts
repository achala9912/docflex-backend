import Session from "../models/session.model";
import MedicalCenter from "../models/medicalCenter.model";
import { ISession } from "../interfaces/session.interface";
import { ACTIONS } from "../constants/modification-history.constant";

// export const createSession = async (
//   sessionData: any,
//   createdBy: string
// ): Promise<ISession> => {
//   const center = await MedicalCenter.findById(sessionData.centerId)
//     .select("centerId")
//     .lean();

//   if (!center) {
//     throw new Error("Medical center not found");
//   }

//   const lastSession = await Session.findOne({ centerId: sessionData.centerId })
//     .sort({ sessionId: -1 })
//     .limit(1);

//   const centerCode = center.centerId;
//   const lastNumber = lastSession
//     ? parseInt(lastSession.sessionId.split("-S")[1])
//     : 0;
//   const sessionId = `${centerCode}-S${(lastNumber + 1)
//     .toString()
//     .padStart(3, "0")}`;

//   const session = new Session({
//     ...sessionData,
//     sessionId,
//     modificationHistory: [
//       {
//         action: ACTIONS.CREATE,
//         modifiedBy: createdBy,
//         date: new Date(),
//       },
//     ],
//   });

//   return await session.save();
// };
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
//   return Session.findOneAndUpdate(
//     { sessionId },
//     {
//       $set: { isSessionActive: isActive },
//       $push: {
//         modificationHistory: {
//           action: isActive ? ACTIONS.ACTIVATE : ACTIONS.DEACTIVATE,
//           modifiedBy,
//           date: new Date(),
//         },
//       },
//     },
//     { new: true }
//   );
// };

export const toggleSessionActive = async (
  sessionId: string,
  isActive: boolean,
  modifiedBy: string
): Promise<ISession | null> => {
  const session = await Session.findOne({ sessionId });
  if (!session) {
    throw new Error("Session not found");
  }

  const now = new Date();

  if (isActive) {
    if (session.startTime && session.startTime > now) {
      throw new Error(
        `Session "${
          session.sessionName || session.sessionId
        }" cannot be activated yet. It starts at ${session.startTime.toLocaleString()}.`
      );
    }
    if (session.endTime && session.endTime < now) {
      throw new Error(
        `Session "${
          session.sessionName || session.sessionId
        }" has already ended at ${session.endTime.toLocaleString()} and cannot be activated.`
      );
    }
  }

  session.isSessionActive = isActive;
  session.modificationHistory.push({
    action: isActive ? ACTIONS.ACTIVATE : ACTIONS.DEACTIVATE,
    modifiedBy,
    date: new Date(),
  });

  return await session.save();
};

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
