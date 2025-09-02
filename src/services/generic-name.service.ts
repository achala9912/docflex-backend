import GenericName from "../models/generic-name.model";
import MedicalCenter from "../models/medicalCenter.model";
import { IGenericName } from "../interfaces/generic-name.interface";
import { ACTIONS } from "../constants/modification-history.constant";

export const createGenericName = async (
  genericNameData: string,
  centerId: string,
  createdBy: string
): Promise<IGenericName> => {

  const center = await MedicalCenter.findById(centerId).lean();
  if (!center) {
    throw new Error("Medical center not found");
  }

  const centerCode = center.centerId;


  const lastRecord = await GenericName.findOne({ centerId })
    .sort({ createdAt: -1 })
    .lean();

  let lastNumber = 0;
  if (lastRecord) {
    const match = lastRecord.genericId.match(/GEN(\d+)$/);
    if (match) {
      lastNumber = parseInt(match[1], 10);
    }
  }


  const newNumber = lastNumber + 1;
  const genericId = `${centerCode}-GEN${newNumber.toString().padStart(3, "0")}`;


  const newGenericName = new GenericName({
    genericName: genericNameData,
    genericId,
    centerId, 
    modificationHistory: [
      {
        action: ACTIONS.CREATE,
        modifiedBy: createdBy,
        date: new Date(),
      },
    ],
  });

  return await newGenericName.save();
};


export const getAllGenericNames = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  centerId?: string;
}) => {
  const { page = 1, limit = 10, search = "", centerId } = params;
  const skip = (page - 1) * limit;

  const query: any = { isDeleted: false };

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.genericName = searchRegex;
  }

  if (centerId) {
    query.centerId = centerId;
  }

  const [genericNames, total] = await Promise.all([
    GenericName.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("centerId", "centerId centerName")
      .lean(),
    GenericName.countDocuments(query),
  ]);

  return {
    data: genericNames,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
  };
};


export const getGenericById = async (genericId: string) => {
  const generic = await GenericName.findOne({
    genericId,
    isDeleted: false,
  })
    .populate("centerId", "centerId centerName")
    .lean();

  if (!generic) throw new Error("Generic name not found");
  return generic;
};


export const deleteGenericById = async (
  genericId: string,
  deletedBy: string
) => {
  const deleted = await GenericName.findOneAndUpdate(
    { genericId },
    {
      isDeleted: true,
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

  if (!deleted) throw new Error("Generic name not found");
  return deleted;
};


export const updateGenericById = async (
  genericId: string,
  updateData: { genericName?: string },
  modifiedBy: string
) => {
  const updated = await GenericName.findOneAndUpdate(
    { genericId },
    {
      ...updateData,
      $push: {
        modificationHistory: {
          action: ACTIONS.UPDATE,
          modifiedBy,
          date: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!updated) throw new Error("Generic name not found");
  return updated;
};
