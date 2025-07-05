import { Schema, model } from "mongoose";
import { IRoleDocument } from "../interfaces/role.interface";
import { ACTIONS } from "../constants/modification-history.constant";
import PERMISSIONS from "../constants/permissions.constants";

const roleSchema = new Schema<IRoleDocument>(
  {
    roleId: { type: String, required: true, unique: true },
    roleName: { type: String, required: true, unique: true },
    permissions: [
      {
        type: String,
        required: true,
        enum: Object.values(PERMISSIONS),
      },
    ],
    isDeleted: { type: Boolean, default: false },
    modificationHistory: [
      {
        action: { type: String, enum: Object.values(ACTIONS) },
        modifiedBy: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default model<IRoleDocument>("Role", roleSchema);
