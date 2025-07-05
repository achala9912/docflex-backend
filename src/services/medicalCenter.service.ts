import MedicalCenter from "../models/medicalCenter.model";
import { IMedicalCenter } from "../interfaces/medicalCenter.interface";
import { ACTIONS } from "../constants/modification-history.constant";

class MedicalCenterService {
  async createCenter(
    data: Partial<IMedicalCenter>,
    createdBy: string
  ): Promise<IMedicalCenter> {
    const last = await MedicalCenter.findOne().sort({ centerId: -1 }).limit(1);
    const lastIdNum = last ? parseInt(last.centerId.replace("MC", "")) : 0;
    const centerId = `MC${String(lastIdNum + 1).padStart(4, "0")}`;

    const center = new MedicalCenter({
      ...data,
      centerId,
      isDeleted: false,
      modificationHistory: [
        {
          action: ACTIONS.CREATE,
          modifiedBy: createdBy,
        },
      ],
    });

    const saved = await center.save();
    return saved.toObject();
  }

  async getAllCenters(params: {
    page?: number;
    limit?: number;
    search?: string;
    tokenData?: { role: string; centerId?: string };
  }) {
    const { page = 1, limit = 10, search = "", tokenData } = params;
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };

    // 👮 Filter by centerId if not SystemAdmin
    if (tokenData?.role !== "SystemAdmin" && tokenData?.centerId) {
      query._id = tokenData.centerId; // _id instead of centerId if filtering by Mongo ID
    }

    // 🔍 Search across key fields
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { centerName: searchRegex },
        { email: searchRegex },
        { regNo: searchRegex },
        { contactNo: searchRegex },
      ];
    }

    // 📥 Fetch paginated data
    const centers = await MedicalCenter.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await MedicalCenter.countDocuments(query);

    return {
      data: centers,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }
  async getCenterById(centerId: string) {
    const center = await MedicalCenter.findOne({
      centerId,
      isDeleted: false,
    }).lean();
    return center;
  }

  async updateCenter(
    centerId: string,
    data: Partial<IMedicalCenter>,
    modifiedBy: string
  ): Promise<IMedicalCenter | null> {
    const center = await MedicalCenter.findOne({ centerId });
    if (!center) return null;

    const changes: Record<string, { from: any; to: any }> = {};
    const original = center.toObject() as IMedicalCenter;

    for (const key in data) {
      if ((data as any)[key] !== original[key as keyof IMedicalCenter]) {
        changes[key] = {
          from: original[key as keyof IMedicalCenter],
          to: (data as any)[key],
        };
        center.set(key, (data as any)[key]);
      }
    }

    center.modificationHistory.push({
      action: ACTIONS.UPDATE,
      modifiedBy,
      date: new Date(),
    });

    const updated = await center.save();
    return updated.toObject();
  }

  async deleteCenter(centerId: string, deletedBy: string): Promise<void> {
    const center = await MedicalCenter.findOne({ centerId });
    if (!center) return;

    center.isDeleted = true;
    center.modificationHistory.push({
      action: ACTIONS.DELETE,
      modifiedBy: deletedBy,
      date: new Date(),
    });

    await center.save();
  }
}

export default new MedicalCenterService();
