import Product from "../models/product.model";
import MedicalCenter from "../models/medicalCenter.model";
import { IProduct } from "../interfaces/product.interface";
import { ACTIONS } from "../constants/modification-history.constant";
import { IGenericName } from "../interfaces/generic-name.interface";

export const createProduct = async (
  productName: string,
  remark: string,
  centerId: string,
  genericId: string,
  createdBy: string
): Promise<IProduct> => {
  const center = await MedicalCenter.findById(centerId).lean();
  if (!center) {
    throw new Error("Medical center not found");
  }

  const centerCode = center.centerId;

  // find last product in this center
  const lastRecord = await Product.findOne({ centerId })
    .sort({ createdAt: -1 })
    .lean();

  let lastNumber = 0;
  if (lastRecord) {
    const match = lastRecord.productId.match(/PROD(\d+)$/);
    if (match) {
      lastNumber = parseInt(match[1], 10);
    }
  }

  const newNumber = lastNumber + 1;
  const productId = `${centerCode}-PROD${newNumber
    .toString()
    .padStart(3, "0")}`;

  const newProduct = new Product({
    productId,
    productName,
    remark,
    centerId,
    genericId,
    modificationHistory: [
      {
        action: ACTIONS.CREATE,
        modifiedBy: createdBy,
        date: new Date(),
      },
    ],
  });

  return await newProduct.save();
};

export const getAllProducts = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  centerId?: string;
  genericId?: string;
}) => {
  const { page = 1, limit = 10, search = "", centerId, genericId } = params;
  const skip = (page - 1) * limit;

  const query: any = { isDeleted: false };

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.productName = searchRegex;
  }

  if (centerId) {
    query.centerId = centerId;
  }

  if (genericId) {
    query.genericId = genericId;
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("centerId", "centerId centerName")
      .populate("genericId", "genericId genericName")
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    data: products,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
  };
};

export const updateProduct = async (
  productId: string,
  updateData: { productName?: string; remark?: string; genericId?: string },
  modifiedBy: string
) => {
  const updated = await Product.findOneAndUpdate(
    { productId, isDeleted: false },
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

  if (!updated) throw new Error("Product not found");
  return updated;
};

export const getProductById = async (productId: string) => {
  const product = await Product.findOne({ productId, isDeleted: false })
    .populate("centerId", "centerId centerName")
    .populate("genericId", "genericId genericName")
    .lean();

  if (!product) throw new Error("Product not found");
  return product;
};

export const deleteProduct = async (productId: string, deletedBy: string) => {
  const deleted = await Product.findOneAndUpdate(
    { productId, isDeleted: false },
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

  if (!deleted) throw new Error("Product not found");
  return deleted;
};

interface ProductSuggestion {
  id: string;
  productId: string;
  productName: string;
  genericName: string;
}

export const getProductSuggestion = async (
  centerId?: string
): Promise<ProductSuggestion[]> => {
  const query: any = { isDeleted: false };

  if (!centerId) {
    throw new Error("centerId is required");
  }

  const products = await Product.find(query)
    .limit(50)
    .select("productId productName genericId")
    .populate<{ genericId: IGenericName }>("genericId", "genericName")
    .lean();

  return products.map((p) => ({
    id: p._id.toString(),
    productId: p.productId,
    productName: p.productName,
    genericName: (p.genericId as IGenericName)?.genericName || "",
  }));
};
