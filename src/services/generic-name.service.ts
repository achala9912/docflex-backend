import GenericName from "../models/generic-name.model";
import { IGenericName } from "../interfaces/generic-name.interface";
import { ACTIONS } from "../constants/modification-history.constant";

export const createGenericName = async (
  genericNameData: string,
  createdBy: string
): Promise<IGenericName> => {
  const lastRecord = await GenericName.findOne()
    .sort({ genericId: -1 })
    .limit(1);

  const lastNumber = lastRecord
    ? parseInt(lastRecord.genericId.replace("GEN", ""))
    : 0;

  const genericId = `GEN${(lastNumber + 1).toString().padStart(4, "0")}`;

  const newGenericName = new GenericName({
    genericName: genericNameData,
    genericId,
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
}) => {
  const { page = 1, limit = 10, search = "" } = params;
  const skip = (page - 1) * limit;

  const query: any = { isDeleted: false };

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.genericName = searchRegex;
  }

  const [genericNames, total] = await Promise.all([
    GenericName.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
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
  }).lean();
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
