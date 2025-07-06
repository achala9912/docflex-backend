import MedicalCenter from "../models/medicalCenter.model";
import { IMedicalCenter } from "../interfaces/medicalCenter.interface";
import { ACTIONS } from "../constants/modification-history.constant";

// Helper function to generate center ID
const generateCenterId = async (): Promise<string> => {
  const lastCenter = await MedicalCenter.findOne().sort({ centerId: -1 }).limit(1);
  const lastIdNum = lastCenter ? parseInt(lastCenter.centerId.replace("MC", "")) : 0;
  return `MC${String(lastIdNum + 1).padStart(4, "0")}`;
};

// Create new medical center
export const createCenter = async (
  data: Partial<IMedicalCenter>,
  createdBy: string
): Promise<IMedicalCenter> => {
  const centerId = await generateCenterId();
  
  const center = new MedicalCenter({
    ...data,
    centerId,
    isDeleted: false,
    modificationHistory: [{
      action: ACTIONS.CREATE,
      modifiedBy: createdBy,
      date: new Date()
    }]
  });

  const savedCenter = await center.save();
  return savedCenter.toObject();
};

// Get all medical centers with pagination and search
export const getAllCenters = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  tokenData?: { role: string; centerId?: string };
}) => {
  const { page = 1, limit = 10, search = "", tokenData } = params;
  const skip = (page - 1) * limit;

  const query: any = { isDeleted: false };

  // Filter by centerId if not SystemAdmin
  if (tokenData?.role !== "SystemAdmin" && tokenData?.centerId) {
    query._id = tokenData.centerId;
  }

  // Search across multiple fields
  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { centerName: searchRegex },
      { email: searchRegex },
      { regNo: searchRegex },
      { contactNo: searchRegex },
    ];
  }

  const [centers, total] = await Promise.all([
    MedicalCenter.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MedicalCenter.countDocuments(query)
  ]);

  return {
    data: centers,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};

// Get single center by ID
export const getCenterById = async (centerId: string): Promise<IMedicalCenter | null> => {
  return MedicalCenter.findOne({ centerId, isDeleted: false }).lean();
};

// Update medical center
export const updateCenter = async (
  centerId: string,
  data: Partial<IMedicalCenter>,
  modifiedBy: string
): Promise<IMedicalCenter | null> => {
  const center = await MedicalCenter.findOne({ centerId });
  if (!center) return null;

  const changes: Record<string, { from: any; to: any }> = {};
  const original = center.toObject();

  // Track changes
  Object.keys(data).forEach(key => {
    if (data[key as keyof IMedicalCenter] !== original[key as keyof IMedicalCenter]) {
      changes[key] = {
        from: original[key as keyof IMedicalCenter],
        to: data[key as keyof IMedicalCenter]
      };
      center.set(key, data[key as keyof IMedicalCenter]);
    }
  });

  // Add to modification history if there were changes
  if (Object.keys(changes).length > 0) {
    center.modificationHistory.push({
      action: ACTIONS.UPDATE,
      modifiedBy,
      date: new Date(),
      changes
    });
  }

  const updatedCenter = await center.save();
  return updatedCenter.toObject();
};

// Soft delete medical center
export const deleteCenter = async (
  centerId: string,
  deletedBy: string
): Promise<IMedicalCenter | null> => {
  const center = await MedicalCenter.findOneAndUpdate(
    { centerId },
    {
      isDeleted: true,
      $push: {
        modificationHistory: {
          action: ACTIONS.DELETE,
          modifiedBy: deletedBy,
          date: new Date()
        }
      }
    },
    { new: true }
  ).lean();

  return center;
};