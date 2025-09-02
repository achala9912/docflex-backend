import mongoose, { Schema } from "mongoose";
import { ACTIONS } from "../constants/modification-history.constant";
import { IProduct } from "../interfaces/product.interface";

const ProductSchema = new Schema<IProduct>(
  {
    productId: { type: String, required: true, unique: true },
    productName: { type: String, required: true, unique: true },
    centerId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalCenter",
      required: true,
    },
    genericId: {
      type: Schema.Types.ObjectId,
      ref: "GenericName",
      required: true,
    },
    remark: { type: String },
    isDeleted: { type: Boolean, default: false },
    modificationHistory: [
      {
        action: { type: String, enum: Object.values(ACTIONS) },
        modifiedBy: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
